import { Component, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { SudokuService } from '../../services/sudoku.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  template: `
    <div class="controls">
      <div class="game-info">
        <span class="difficulty-badge" [class]="sudokuService.currentDifficulty()">
          {{ sudokuService.currentDifficulty() | titlecase }}
        </span>
        <span class="mistakes-badge" [class.danger]="sudokuService.mistakes() >= 2">
          Mistakes: {{ sudokuService.mistakes() }}/3
        </span>
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
        <button class="num-btn pencil" [class.active]="sudokuService.isNoteMode()" (click)="sudokuService.toggleNoteMode()">
          ✏️
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
      margin: 20px auto 0;
      width: 100%;
      max-width: 450px;
    }

    .game-info {
      display: flex;
      justify-content: center;
      margin-bottom: 5px;
    }

    .difficulty-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
    }

    .difficulty-badge.easy { color: #4cd137; border-color: rgba(76, 209, 55, 0.3); background: rgba(76, 209, 55, 0.05); }
    .difficulty-badge.medium { color: #fbc531; border-color: rgba(251, 197, 49, 0.3); background: rgba(251, 197, 49, 0.05); }
    .difficulty-badge.hard { color: #e84118; border-color: rgba(232, 65, 24, 0.3); background: rgba(232, 65, 24, 0.05); }
    .difficulty-badge.very-hard { color: #8e44ad; border-color: rgba(142, 68, 173, 0.3); background: rgba(142, 68, 173, 0.05); }

    .mistakes-badge {
      margin-left: 10px;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }

    .mistakes-badge.danger {
      color: #e84118;
      border-color: rgba(232, 65, 24, 0.3);
      background: rgba(232, 65, 24, 0.05);
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

    .num-btn.active {
      background-color: var(--primary-color);
      color: white;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }

    .numpad {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
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
    }

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

    .pencil {
        font-size: 1.2rem;
    }
  `]
})
export class ControlsComponent {
  sudokuService = inject(SudokuService);

  newGame() {
    if (confirm('Go back to main menu? Your current progress will be lost.')) {
      this.sudokuService.showStartScreen();
    }
  }

  resetGame() {
    if (confirm('Are you sure you want to reset this puzzle? All your progress will be cleared.')) {
      this.sudokuService.resetGame();
    }
  }

  fillNumber(num: number) {
    this.sudokuService.setCellValue(num);
  }

  deleteNumber() {
    this.sudokuService.clearCell();
  }
}
