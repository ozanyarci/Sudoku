import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SudokuService } from '../../services/sudoku.service';
import { CellComponent } from '../cell/cell.component';

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [CommonModule, CellComponent],
    template: `
    <div class="board-container">
      <div class="board">
        <div *ngFor="let row of sudokuService.boardState(); let r = index" class="row">
          <app-cell
            *ngFor="let cell of row; let c = index"
            [cell]="cell"
            [class.border-right]="(c + 1) % 3 === 0 && c !== 8"
            [class.border-bottom]="(r + 1) % 3 === 0 && r !== 8"
            (select)="onSelect(r, c)"
          ></app-cell>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .board-container {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .board {
      display: flex;
      flex-direction: column;
      border: 2px solid var(--border-strong);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      background-color: var(--bg-primary);
    }

    .row {
      display: flex;
    }

    app-cell {
      width: 50px;
      height: 50px;
    }

    /* Thicker borders for 3x3 grids */
    .border-right {
      border-right: 2px solid var(--border-strong) !important;
    }

    .border-bottom {
      border-bottom: 2px solid var(--border-strong) !important;
    }

    @media (max-width: 600px) {
      app-cell {
        width: 35px;
        height: 35px;
        font-size: 1.2rem;
      }
    }
  `]
})
export class BoardComponent {
    sudokuService = inject(SudokuService);

    onSelect(row: number, col: number) {
        this.sudokuService.selectCell(row, col);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        const key = event.key;
        if (key >= '1' && key <= '9') {
            this.sudokuService.setCellValue(parseInt(key, 10));
        } else if (key === 'Backspace' || key === 'Delete') {
            this.sudokuService.clearCell();
        }
    }
}
