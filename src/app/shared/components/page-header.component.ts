import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </div>
      @if (icon()) {
        <mat-icon class="header-icon">{{ icon() }}</mat-icon>
      }
    </div>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 24px;
      gap: 16px;
    }
    h1 {
      margin: 0 0 4px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a237e;
    }
    p {
      margin: 0;
      color: #546e7a;
      font-size: 0.95rem;
    }
    .header-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #3949ab;
      opacity: 0.7;
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
}
