import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './components/board/board.component';
import { ControlsComponent } from './components/controls/controls.component';
import { SudokuService } from './services/sudoku.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, BoardComponent, ControlsComponent],
  template: `
    <main class="app-container">
      <header>
        <h1>Sudoku</h1>
        <p class="subtitle">Premium Edition</p>
      </header>
      
      <ng-container *ngIf="sudokuService.status() === 'not-started'">
        <div class="difficulty-overlay">
          <div class="difficulty-card">
            <h2>Select Difficulty</h2>
            <p>Choose your challenge level to begin</p>
            <div class="difficulty-options">
              <button class="diff-btn easy" (click)="startGame('easy')">
                <span class="level">Easy</span>
                <span class="desc">A relaxed way to enjoy the game</span>
              </button>
              <button class="diff-btn medium" (click)="startGame('medium')">
                <span class="level">Medium</span>
                <span class="desc">A balanced challenge for starters</span>
              </button>
              <button class="diff-btn hard" (click)="startGame('hard')">
                <span class="level">Hard</span>
                <span class="desc">For the true Sudoku masters</span>
              </button>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-container *ngIf="sudokuService.status() !== 'not-started'">
        <app-board></app-board>
        <app-controls></app-controls>
      </ng-container>

      <div class="win-overlay" *ngIf="sudokuService.status() === 'completed'">
        <div class="win-message">
          <h2>🎉 You Won! 🎉</h2>
          <p>Congratulations on completing the puzzle!</p>
          <div class="win-actions">
            <button class="btn primary" (click)="showStartScreen()">Main Menu</button>
            <button class="btn secondary" (click)="startGame(sudokuService.currentDifficulty())">Play Again</button>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      width: 100%;
      max-width: 800px;
      position: relative;
      min-height: 100vh;
    }

    header {
      text-align: center;
      margin-bottom: 30px;
    }

    h1 {
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -2px;
      margin-bottom: 5px;
      background: linear-gradient(to right, #e94560, #ff6b81);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    /* Difficulty Selection */
    .difficulty-overlay {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      max-width: 500px;
      margin-top: 40px;
      animation: fadeIn 0.5s ease-out;
    }

    .difficulty-card {
      background-color: var(--bg-secondary);
      padding: 40px;
      border-radius: 24px;
      text-align: center;
      width: 100%;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
    }

    .difficulty-card h2 {
      font-size: 2rem;
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    .difficulty-card p {
      color: var(--text-secondary);
      margin-bottom: 30px;
    }

    .difficulty-options {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .diff-btn {
      padding: 20px;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      background-color: var(--bg-primary);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      font-family: inherit;
    }

    .diff-btn .level {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 4px;
      color: var(--text-primary);
    }

    .diff-btn .desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .diff-btn:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      border-color: var(--primary-color);
    }

    .diff-btn.easy:hover { border-color: #4cd137; background: rgba(76, 209, 55, 0.05); }
    .diff-btn.medium:hover { border-color: #fbc531; background: rgba(251, 197, 49, 0.05); }
    .diff-btn.hard:hover { border-color: #e84118; background: rgba(232, 65, 24, 0.05); }

    /* Win Message */
    .win-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }

    .win-message {
      background-color: var(--bg-secondary);
      padding: 50px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid var(--primary-color);
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      max-width: 90%;
    }

    .win-message h2 {
      font-size: 3rem;
      margin-bottom: 15px;
      background: linear-gradient(to right, #fbc531, #f1c40f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .win-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn.primary { background: var(--primary-color); color: white; }
    .btn.secondary { background: var(--bg-primary); color: var(--text-primary); border: 1px solid var(--border-color); }

    .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes popIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class App {
  title = 'sudoku-app';
  sudokuService = inject(SudokuService);

  startGame(difficulty: 'easy' | 'medium' | 'hard') {
    this.sudokuService.startNewGame(difficulty);
  }

  showStartScreen() {
    this.sudokuService.showStartScreen();
  }
}
