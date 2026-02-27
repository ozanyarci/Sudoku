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
      <ng-container *ngIf="cell.value; else notesTemplate">
        {{ cell.value }}
      </ng-container>
      <ng-template #notesTemplate>
        <div class="notes-grid" *ngIf="cell.notes.length > 0">
          <div *ngFor="let n of [1,2,3,4,5,6,7,8,9]" class="note">
            {{ cell.notes.includes(n) ? n : '' }}
          </div>
        </div>
      </ng-template>
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
      position: relative;
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

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      width: 100%;
      height: 100%;
      padding: 2px;
    }

    .note {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      color: var(--text-secondary);
      line-height: 1;
    }

    .selected .note {
        color: var(--selected-text);
        opacity: 0.8;
    }
  `]
})
export class CellComponent {
  @Input({ required: true }) cell!: Cell;
  @Output() select = new EventEmitter<void>();
}
