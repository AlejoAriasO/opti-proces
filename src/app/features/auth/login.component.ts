import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../core/services/auth.service';
import { isFirebaseConfigured } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="login-page">
      <mat-card class="login-card">
        <div class="brand">
          <mat-icon>inventory_2</mat-icon>
          <h1>Opti-Proces</h1>
          <p>Gestión administrativa — Industrias Arias JF</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="correo" autocomplete="username" />
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Contraseña</mat-label>
            <input
              matInput
              [type]="hidePassword() ? 'password' : 'text'"
              formControlName="password"
              autocomplete="current-password"
            />
            <mat-icon matPrefix>lock</mat-icon>
            <button
              mat-icon-button
              matSuffix
              type="button"
              (click)="hidePassword.set(!hidePassword())"
            >
              <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (error()) {
            <p class="error">{{ error() }}</p>
          }

          <button mat-flat-button color="primary" class="full-width submit-btn" type="submit">
            Iniciar sesión
          </button>
        </form>

        <p class="hint">Usuario demo: admin&#64;opti-proces.local / admin123</p>

        @if (!firebaseListo) {
          <p class="firebase-hint">
            Firestore aún no está configurado. Sigue <strong>docs/firebase-setup.md</strong>
            y pega tus claves en <code>src/environments/environment.ts</code>.
          </p>
        }
      </mat-card>
    </div>
  `,
  styles: `
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5c6bc0 100%);
      padding: 24px;
    }
    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 32px;
    }
    .brand {
      text-align: center;
      margin-bottom: 32px;
    }
    .brand mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #3949ab;
    }
    .brand h1 {
      margin: 8px 0 4px;
      color: #1a237e;
    }
    .brand p {
      margin: 0;
      color: #78909c;
      font-size: 0.9rem;
    }
    .full-width {
      width: 100%;
    }
    .submit-btn {
      height: 48px;
      margin-top: 8px;
    }
    .error {
      color: #c62828;
      font-size: 0.875rem;
      margin: 0 0 12px;
    }
    .hint {
      margin: 24px 0 0;
      text-align: center;
      font-size: 0.8rem;
      color: #90a4ae;
    }
    .firebase-hint {
      margin: 16px 0 0;
      padding: 12px;
      background: #fff8e1;
      border-radius: 8px;
      font-size: 0.8rem;
      color: #795548;
      line-height: 1.4;
    }
    code { font-size: 0.75rem; }
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly error = signal('');
  readonly firebaseListo = isFirebaseConfigured();

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { correo, password } = this.form.getRawValue();
    const result = this.auth.login(correo, password);

    if (result.ok) {
      this.router.navigate(['/inventarios']);
    } else {
      this.error.set(result.error ?? 'Error al iniciar sesión');
    }
  }
}
