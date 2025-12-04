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
      
      <app-board></app-board>
      <app-controls></app-controls>

      <div class="win-overlay" *ngIf="sudokuService.isComplete()">
        <div class="win-message">
          <h2>🎉 You Won! 🎉</h2>
          <p>Congratulations on completing the puzzle!</p>
          <button class="btn primary" (click)="newGame()">Play Again</button>
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

    .win-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    }

    .win-message {
      background-color: var(--bg-primary);
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      border: 2px solid var(--accent-color);
      animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .win-message h2 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    .win-message p {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-bottom: 25px;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn.primary {
      background-color: var(--primary-color);
      color: white;
    }

    .btn.primary:hover {
      background-color: var(--primary-hover);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(233, 69, 96, 0.4);
    }

    @keyframes popIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `]
})
export class App {
  title = 'sudoku-app';
  sudokuService = inject(SudokuService);

  newGame() {
    this.sudokuService.startNewGame('easy');
  }
}
