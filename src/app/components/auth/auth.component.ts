import { Component, inject, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <ng-container *ngIf="supabaseService.session() as session; else loginForm">
        <div class="user-info">
          <span class="email">{{ session.user.email }}</span>
          <button class="btn-text" (click)="signOut()">Sign Out</button>
        </div>
      </ng-container>

      <ng-template #loginForm>
        <div class="login-trigger" *ngIf="!showForm()">
          <button class="btn-text" (click)="showForm.set(true)">Sign in to sync scores</button>
        </div>

        <div class="login-form" *ngIf="showForm()">
          <ng-container *ngIf="!success(); else successMsg">
            <input 
              type="email" 
              [(ngModel)]="email" 
              placeholder="Enter your email" 
              [disabled]="loading()"
              class="auth-input"
            />
            <div class="auth-actions">
              <button class="btn-primary" (click)="signIn()" [disabled]="loading() || !email">
                {{ loading() ? 'Sending...' : 'Send Magic Link' }}
              </button>
              <button class="btn-text" (click)="showForm.set(false)" [disabled]="loading()">Cancel</button>
            </div>
          </ng-container>
          
          <ng-template #successMsg>
            <p class="auth-msg success">✉️ {{ message() }}</p>
            <button class="btn-text" (click)="resetForm()">Back</button>
          </ng-template>

          <p class="auth-msg error" *ngIf="error()">{{ error() }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .auth-container {
      margin-top: 10px;
      padding: 10px;
      font-size: 0.9rem;
    }
    .user-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      color: var(--text-secondary);
    }
    .email {
      font-weight: 500;
      color: var(--text-primary);
    }
    .btn-text {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      font-family: inherit;
      padding: 5px 10px;
      text-decoration: underline;
      transition: opacity 0.2s;
    }
    .btn-text:hover {
      opacity: 0.8;
    }
    .btn-text:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 300px;
      margin: 0 auto;
      padding: 15px;
      background: var(--bg-secondary);
      border-radius: 12px;
      border: 1px solid var(--border-color);
    }
    .auth-input {
      padding: 10px 15px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
    }
    .auth-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .btn-primary {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .auth-msg {
      margin-top: 5px;
      font-size: 0.85rem;
      padding: 8px;
      border-radius: 4px;
    }
    .auth-msg.success {
      color: #2ecc71;
      background: rgba(46, 204, 113, 0.1);
    }
    .auth-msg.error {
      color: #e74c3c;
      background: rgba(231, 76, 60, 0.1);
    }
  `]
})
export class AuthComponent {
  supabaseService = inject(SupabaseService);
  ngZone = inject(NgZone);

  email = '';
  loading = signal(false);
  showForm = signal(false);
  success = signal(false);
  message = signal('');
  error = signal('');

  async signIn() {
    try {
      this.loading.set(true);
      this.error.set('');
      
      await this.supabaseService.signInWithEmail(this.email);
      
      this.ngZone.run(() => {
        this.success.set(true);
        this.message.set('Check your email for the magic link!');
        this.loading.set(false);
      });
    } catch (err: any) {
      this.ngZone.run(() => {
        this.error.set(err.message || 'Error sending magic link');
        this.loading.set(false);
      });
    }
  }

  resetForm() {
    this.success.set(false);
    this.message.set('');
    this.error.set('');
    this.loading.set(false);
  }

  async signOut() {
    await this.supabaseService.signOut();
  }
}
