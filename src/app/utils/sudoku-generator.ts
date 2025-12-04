export class SudokuGenerator {
  private static readonly SIZE = 9;
  private static readonly BOX_SIZE = 3;

  static generate(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): {
    solution: number[][];
    puzzle: (number | null)[][];
  } {
    const solution = this.createEmptyGrid();
    this.fillGrid(solution);
    const puzzle = this.createPuzzle(solution, difficulty);
    return { solution, puzzle };
  }

  private static createEmptyGrid(): number[][] {
    return Array.from({ length: this.SIZE }, () => Array(this.SIZE).fill(0));
  }

  private static fillGrid(grid: number[][]): boolean {
    for (let row = 0; row < this.SIZE; row++) {
      for (let col = 0; col < this.SIZE; col++) {
        if (grid[row][col] === 0) {
          const numbers = this.shuffle(Array.from({ length: 9 }, (_, i) => i + 1));
          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private static isValid(grid: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < this.SIZE; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check col
    for (let x = 0; x < this.SIZE; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check box
    const startRow = row - (row % this.BOX_SIZE);
    const startCol = col - (col % this.BOX_SIZE);
    for (let i = 0; i < this.BOX_SIZE; i++) {
      for (let j = 0; j < this.BOX_SIZE; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  private static createPuzzle(solution: number[][], difficulty: string): (number | null)[][] {
    // Work with a number grid first (0 for empty)
    const puzzle: number[][] = solution.map((row) => [...row]);

    // Target empty cells
    let attempts = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 50 : 55;

    // Create a list of all positions
    const positions: number[] = Array.from({ length: 81 }, (_, i) => i);
    this.shuffle(positions);

    for (const pos of positions) {
      if (attempts <= 0) break;

      const row = Math.floor(pos / this.SIZE);
      const col = pos % this.SIZE;

      const backup = puzzle[row][col];
      puzzle[row][col] = 0; // Remove number

      // Check if unique
      const solutions = this.countSolutions(puzzle);
      if (solutions !== 1) {
        puzzle[row][col] = backup; // Put it back if not unique
      } else {
        attempts--;
      }
    }

    // Convert to (number | null)[][]
    return puzzle.map(row => row.map(cell => cell === 0 ? null : cell));
  }

  private static countSolutions(grid: number[][]): number {
    let count = 0;

    // Create a copy to work on
    const workGrid = grid.map(row => [...row]);

    const solve = (): void => {
      if (count > 1) return;

      let row = -1;
      let col = -1;
      let isEmpty = false;

      for (let i = 0; i < this.SIZE; i++) {
        for (let j = 0; j < this.SIZE; j++) {
          if (workGrid[i][j] === 0) {
            row = i;
            col = j;
            isEmpty = true;
            break;
          }
        }
        if (isEmpty) break;
      }

      if (!isEmpty) {
        count++;
        return;
      }

      for (let num = 1; num <= 9; num++) {
        if (this.isValid(workGrid, row, col, num)) {
          workGrid[row][col] = num;
          solve();
          if (count > 1) return;
          workGrid[row][col] = 0;
        }
      }
    };

    solve();
    return count;
  }

  private static shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
