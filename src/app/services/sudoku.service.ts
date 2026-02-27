import { Injectable, signal, computed } from '@angular/core';
import { SudokuGenerator } from '../utils/sudoku-generator';

export interface Cell {
    row: number;
    col: number;
    value: number | null;
    isFixed: boolean;
    isValid: boolean;
    isSelected: boolean;
    isRelated: boolean; // Same row, col, or box as selected
    isSameValue: boolean; // Same value as selected
    isCorrect: boolean;
    isWrong: boolean;
    notes: number[];
}

@Injectable({
    providedIn: 'root',
})
export class SudokuService {
    // State signals
    private board = signal<Cell[][]>([]);
    private solution = signal<number[][]>([]);
    private selectedCell = signal<{ row: number; col: number } | null>(null);
    private difficulty = signal<'easy' | 'medium' | 'hard'>('easy');
    private gameStatus = signal<'not-started' | 'playing' | 'completed' | 'lost'>('not-started');
    private mistakeCount = signal<number>(0);
    private elapsedTime = signal<number>(0);
    private timerInterval: any = null;
    private noteMode = signal<boolean>(false);
    private highScores = signal<{ easy: number | null; medium: number | null; hard: number | null }>({
        easy: null,
        medium: null,
        hard: null
    });

    // Computed
    readonly boardState = computed(() => this.board());
    readonly currentDifficulty = computed(() => this.difficulty());
    readonly status = computed(() => this.gameStatus());
    readonly mistakes = computed(() => this.mistakeCount());
    readonly time = computed(() => this.elapsedTime());
    readonly isNoteMode = computed(() => this.noteMode());
    readonly formattedTime = computed(() => {
        const seconds = this.elapsedTime();
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    });
    readonly bestScores = computed(() => this.highScores());

    readonly isComplete = computed(() => {
        const currentBoard = this.board();
        if (currentBoard.length === 0 || this.gameStatus() === 'not-started') return false;
        const complete = currentBoard.every(row => row.every(cell => cell.value !== null && cell.isValid && cell.isCorrect));
        if (complete && this.gameStatus() === 'playing') {
            // We can't set signals in computed, but we can return the state
            return true;
        }
        return complete;
    });

    readonly remainingCounts = computed(() => {
        const currentBoard = this.board();
        const counts = new Map<number, number>();

        // Initialize counts to 9
        for (let i = 1; i <= 9; i++) {
            counts.set(i, 9);
        }

        // Subtract placed numbers
        currentBoard.forEach(row => {
            row.forEach(cell => {
                if (cell.value !== null && cell.value >= 1 && cell.value <= 9) {
                    const currentCount = counts.get(cell.value) || 0;
                    counts.set(cell.value, currentCount - 1);
                }
            });
        });

        return counts;
    });

    constructor() {
        this.loadHighScores();
    }

    private loadHighScores() {
        const saved = localStorage.getItem('sudoku-high-scores');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Sanitize: convert 0 or null to null to fix the "0:00" bug
                const sanitized = {
                    easy: (parsed.easy && parsed.easy > 0) ? parsed.easy : null,
                    medium: (parsed.medium && parsed.medium > 0) ? parsed.medium : null,
                    hard: (parsed.hard && parsed.hard > 0) ? parsed.hard : null,
                };
                this.highScores.set(sanitized);
            } catch (e) {
                console.error('Failed to parse high scores', e);
            }
        }
    }

    private saveHighScores() {
        localStorage.setItem('sudoku-high-scores', JSON.stringify(this.highScores()));
    }

    private startTimer() {
        this.stopTimer();
        this.elapsedTime.set(0);
        this.timerInterval = setInterval(() => {
            this.elapsedTime.update(t => t + 1);
        }, 1000);
    }

    private stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    startNewGame(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
        this.difficulty.set(difficulty);
        this.gameStatus.set('playing');
        this.mistakeCount.set(0);
        this.startTimer();
        const { solution, puzzle } = SudokuGenerator.generate(difficulty);
        this.solution.set(solution);

        const newBoard: Cell[][] = puzzle.map((row, rIndex) =>
            row.map((val, cIndex) => ({
                row: rIndex,
                col: cIndex,
                value: val,
                isFixed: val !== null,
                isValid: true,
                isSelected: false,
                isRelated: false,
                isSameValue: false,
                isCorrect: val !== null, // Fixed cells are always correct
                isWrong: false,
                notes: [],
            }))
        );

        this.board.set(newBoard);
        this.selectedCell.set(null);
    }

    selectCell(row: number, col: number) {
        this.selectedCell.set({ row, col });
        this.updateHighlights(row, col);
    }

    toggleNoteMode() {
        this.noteMode.update(mode => !mode);
    }

    setCellValue(value: number) {
        if (this.gameStatus() !== 'playing') return;
        const selected = this.selectedCell();
        if (!selected) return;

        this.board.update((currentBoard) => {
            const cell = currentBoard[selected.row][selected.col];
            if (cell.isFixed) return currentBoard;

            const newBoard = currentBoard.map(row => row.map(c => ({ ...c })));
            const targetCell = newBoard[selected.row][selected.col];

            if (this.noteMode()) {
                // Note taking logic
                if (targetCell.value !== null) return currentBoard; // Can't take notes on filled cell

                if (targetCell.notes.includes(value)) {
                    targetCell.notes = targetCell.notes.filter(n => n !== value);
                } else {
                    targetCell.notes = [...targetCell.notes, value].sort();
                }
            } else {
                // Normal value entry
                targetCell.value = value;
                targetCell.notes = []; // Clear notes when value is set

                // Check against solution
                const correctValue = this.solution()[selected.row][selected.col];
                const isCorrect = value === correctValue;
                targetCell.isCorrect = isCorrect;
                targetCell.isWrong = !isCorrect;

                if (!isCorrect) {
                    this.mistakeCount.update(m => m + 1);
                    if (this.mistakeCount() >= 3) {
                        this.gameStatus.set('lost');
                        this.stopTimer();
                    }
                }
            }

            this.validateBoard(newBoard);

            // Check completion
            const complete = newBoard.every(row => row.every(cell => cell.value !== null && cell.isValid && cell.isCorrect));
            if (complete) {
                this.gameStatus.set('completed');
                this.stopTimer();
                this.updateHighScore();
            }

            return newBoard;
        });

        // Re-trigger highlights for the new value
        this.updateHighlights(selected.row, selected.col);
    }

    private updateHighScore() {
        const diff = this.difficulty();
        const currentTime = this.elapsedTime();
        const currentBest = this.highScores()[diff];

        if (currentBest === null || currentTime < currentBest) {
            this.highScores.update(scores => ({
                ...scores,
                [diff]: currentTime
            }));
            this.saveHighScores();
        }
    }

    clearCell() {
        if (this.gameStatus() !== 'playing') return;
        const selected = this.selectedCell();
        if (!selected) return;

        this.board.update((currentBoard) => {
            const cell = currentBoard[selected.row][selected.col];
            if (cell.isFixed) return currentBoard;

            const newBoard = currentBoard.map(row => row.map(c => ({ ...c })));
            const targetCell = newBoard[selected.row][selected.col];
            targetCell.value = null;
            targetCell.isValid = true;
            targetCell.isCorrect = false;
            targetCell.isWrong = false;
            targetCell.notes = [];

            this.validateBoard(newBoard);
            return newBoard;
        });
        this.updateHighlights(selected.row, selected.col);
    }

    resetGame() {
        this.board.update(currentBoard => {
            const newBoard = currentBoard.map(row =>
                row.map(cell => ({
                    ...cell,
                    value: cell.isFixed ? cell.value : null,
                    isValid: true,
                    isSelected: false,
                    isRelated: false,
                    isSameValue: false,
                    isCorrect: cell.isFixed,
                    isWrong: false,
                    notes: [],
                }))
            );
            return newBoard;
        });
        this.selectedCell.set(null);
        this.mistakeCount.set(0);
        this.startTimer();
        this.gameStatus.set('playing');
    }

    showStartScreen() {
        this.stopTimer();
        this.gameStatus.set('not-started');
        this.board.set([]);
    }

    formatTimeValue(seconds: number | null): string {
        if (seconds === null) return 'No score yet';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    private updateHighlights(selectedRow: number, selectedCol: number) {
        const currentBoard = this.board();
        const selectedValue = currentBoard[selectedRow][selectedCol].value;

        this.board.update(board =>
            board.map(row =>
                row.map(cell => {
                    const isSelected = cell.row === selectedRow && cell.col === selectedCol;
                    const isRelated = !isSelected && (
                        cell.row === selectedRow ||
                        cell.col === selectedCol ||
                        (Math.floor(cell.row / 3) === Math.floor(selectedRow / 3) &&
                            Math.floor(cell.col / 3) === Math.floor(selectedCol / 3))
                    );
                    const isSameValue = selectedValue !== null && cell.value === selectedValue;

                    return { ...cell, isSelected, isRelated, isSameValue };
                })
            )
        );
    }

    private validateBoard(board: Cell[][]) {
        // Reset validity
        board.forEach(row => row.forEach(cell => cell.isValid = true));

        // Check rows, cols, boxes for duplicates
        // This is a naive check, can be optimized
        const checkGroup = (cells: Cell[]) => {
            const values = new Map<number, Cell[]>();
            cells.forEach(cell => {
                if (cell.value !== null) {
                    if (!values.has(cell.value)) values.set(cell.value, []);
                    values.get(cell.value)!.push(cell);
                }
            });

            values.forEach((group, val) => {
                if (group.length > 1) {
                    group.forEach(cell => cell.isValid = false);
                }
            });
        };

        // Rows
        board.forEach(row => checkGroup(row));

        // Cols
        for (let c = 0; c < 9; c++) {
            checkGroup(board.map(r => r[c]));
        }

        // Boxes
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                const cells: Cell[] = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        cells.push(board[br * 3 + r][bc * 3 + c]);
                    }
                }
                checkGroup(cells);
            }
        }
    }
}
