import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cell } from '../../services/sudoku.service';

@Component({
  selector: 'app-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="cell"
      [class.fixed]="cell.isFixed"
      [class.selected]="cell.isSelected"
      [class.related]="cell.isRelated"
      [class.same-value]="cell.isSameValue"
      [class.correct]="cell.isCorrect && !cell.isFixed"
      [class.wrong]="cell.isWrong"
      [class.invalid]="!cell.isValid"
      (click)="select.emit()"
    >
      {{ cell.value }}
    </div>
  `,
  styles: [`
    .cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 500;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      color: var(--text-primary);
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
    }

    .cell:hover {
      background-color: var(--hover-color);
    }

    .fixed {
      font-weight: 700;
      color: var(--text-fixed);
    }

    .correct {
      color: var(--correct-color);
      background-color: var(--correct-bg);
    }

    .wrong {
      color: var(--wrong-color);
      background-color: var(--wrong-bg);
    }

    .selected {
      background-color: var(--selected-bg) !important;
      color: var(--selected-text);
    }

    .related {
      background-color: var(--related-bg);
    }

    .same-value {
      background-color: var(--same-value-bg);
    }

    .invalid {
      color: var(--error-color);
      background-color: var(--error-bg);
    }
  `]
})
export class CellComponent {
  @Input({ required: true }) cell!: Cell;
  @Output() select = new EventEmitter<void>();
}
