import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder-module',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="placeholder">
      <mat-icon>{{ icon() }}</mat-icon>
      <h2>{{ title() }}</h2>
      <p>{{ description() }}</p>
      <mat-card appearance="outlined" class="info-card">
        <mat-icon>schedule</mat-icon>
        <span>Este módulo se implementará en una fase posterior del proyecto.</span>
      </mat-card>
    </div>
  `,
  styles: `
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      min-height: 400px;
    }
    mat-icon:first-child {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #90a4ae;
      margin-bottom: 16px;
    }
    h2 {
      margin: 0 0 8px;
      color: #37474f;
    }
    p {
      margin: 0 0 24px;
      color: #78909c;
      max-width: 480px;
    }
    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      background: #e8eaf6;
      color: #3949ab;
    }
    .info-card mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
  `,
})
export class PlaceholderModuleComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input<string>('construction');
}
