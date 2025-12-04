import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="controls">
      <div class="difficulty-selector">
        <span class="label">Difficulty:</span>
        <button class="btn active">Easy</button>
        <!-- Future: Add Medium/Hard buttons here -->
      </div>
      
      <div class="actions">
        <button class="btn primary" (click)="newGame()">New Game</button>
        <button class="btn secondary" (click)="resetGame()">Reset</button>
      </div>

      <div class="numpad">
        <button *ngFor="let num of [1,2,3,4,5,6,7,8,9]" class="num-btn" (click)="fillNumber(num)">
          {{ num }}
          <span class="count" *ngIf="sudokuService.remainingCounts().get(num) as count">
            {{ count }}
          </span>
        </button>
        <button class="num-btn delete" (click)="deleteNumber()">⌫</button>
      </div>
    </div>
  `,
  styles: [`
    .controls {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-top: 20px;
      width: 100%;
      max-width: 450px;
    }

    .difficulty-selector {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      color: var(--text-secondary);
    }

    .actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: inherit;
    }

    .btn.primary {
      background-color: var(--primary-color);
      color: white;
    }

    .btn.primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-1px);
    }

    .btn.secondary {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
    }

    .btn.secondary:hover {
      background-color: var(--hover-color);
    }

    .btn.active {
      background-color: var(--accent-color);
      color: white;
    }

    .numpad {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      margin-top: 10px;
    }

    .num-btn {
      aspect-ratio: 1;
      border: none;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.1s;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .count {
      font-size: 0.7rem;
      font-weight: 400;
      margin-top: 2px;
      opacity: 0.8;

    .num-btn:hover {
      background-color: var(--primary-color);
      color: white;
      transform: translateY(-2px);
    }

    .num-btn:active {
      transform: translateY(0);
    }

    .delete {
      color: var(--error-color);
      font-size: 1.5rem;
    }

    @media (min-width: 600px) {
      .numpad {
        display: none; /* Hide numpad on desktop if preferred, or keep it */
      }
    }
  `]
})
export class ControlsComponent {
  sudokuService = inject(SudokuService);

  newGame() {
    this.sudokuService.startNewGame('easy');
  }

  resetGame() {
    // For now, reset just starts a new game or we could implement board reset.
    // Let's just start new game for simplicity as per plan.
    if (confirm('Start a new game?')) {
      this.sudokuService.startNewGame('easy');
    }
  }

  fillNumber(num: number) {
    this.sudokuService.setCellValue(num);
  }

  deleteNumber() {
    this.sudokuService.clearCell();
  }
}
