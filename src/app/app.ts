import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardComponent } from './components/board/board.component';
import { ControlsComponent } from './components/controls/controls.component';

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
  `]
})
export class App {
  title = 'sudoku-app';
}
