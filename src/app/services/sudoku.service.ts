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

    // Computed
    readonly boardState = computed(() => this.board());
    readonly isComplete = computed(() => {
        const currentBoard = this.board();
        if (currentBoard.length === 0) return false;
        return currentBoard.every(row => row.every(cell => cell.value !== null && cell.isValid && cell.isCorrect));
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
        this.startNewGame();
    }

    startNewGame(difficulty: 'easy' | 'medium' | 'hard' = 'easy') {
        this.difficulty.set(difficulty);
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
            }))
        );

        this.board.set(newBoard);
        this.selectedCell.set(null);
    }

    selectCell(row: number, col: number) {
        this.selectedCell.set({ row, col });
        this.updateHighlights(row, col);
    }

    setCellValue(value: number) {
        const selected = this.selectedCell();
        if (!selected) return;

        this.board.update((currentBoard) => {
            const cell = currentBoard[selected.row][selected.col];
            if (cell.isFixed) return currentBoard;

            const newBoard = currentBoard.map(row => row.map(c => ({ ...c })));
            newBoard[selected.row][selected.col].value = value;

            // Check against solution
            const correctValue = this.solution()[selected.row][selected.col];
            newBoard[selected.row][selected.col].isCorrect = value === correctValue;
            newBoard[selected.row][selected.col].isWrong = value !== correctValue;

            this.validateBoard(newBoard);
            return newBoard;
        });

        // Re-trigger highlights for the new value
        this.updateHighlights(selected.row, selected.col);
    }

    clearCell() {
        const selected = this.selectedCell();
        if (!selected) return;

        this.board.update((currentBoard) => {
            const cell = currentBoard[selected.row][selected.col];
            if (cell.isFixed) return currentBoard;

            const newBoard = currentBoard.map(row => row.map(c => ({ ...c })));
            newBoard[selected.row][selected.col].value = null;
            newBoard[selected.row][selected.col].isValid = true;
            newBoard[selected.row][selected.col].isCorrect = false;
            newBoard[selected.row][selected.col].isWrong = false;

            this.validateBoard(newBoard);
            return newBoard;
        });
        this.updateHighlights(selected.row, selected.col);
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
