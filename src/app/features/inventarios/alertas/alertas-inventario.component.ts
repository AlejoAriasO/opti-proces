import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-alertas-inventario',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    PageHeaderComponent,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Alertas de inventario"
      subtitle="Materias primas con existencias por debajo del nivel mínimo configurado"
      icon="warning"
    />

    @if (alertas().length === 0) {
      <mat-card class="empty-card">
        <mat-icon>check_circle</mat-icon>
        <h3>Sin alertas activas</h3>
        <p>Todas las materias primas están por encima de su stock mínimo.</p>
      </mat-card>
    } @else {
      <div class="alertas-grid">
        @for (alerta of alertas(); track alerta.materiaPrimaId) {
          <mat-card class="alerta-card">
            <div class="alerta-header">
              <mat-icon color="warn">warning</mat-icon>
              <h3>{{ alerta.materiaPrimaNombre }}</h3>
            </div>
            <div class="alerta-body">
              <div class="metric">
                <span class="label">Stock actual</span>
                <span class="value danger">{{ alerta.stockActual | numeroCo:2 }} {{ alerta.unidadMedida }}</span>
              </div>
              <div class="metric">
                <span class="label">Stock mínimo</span>
                <span class="value">{{ alerta.stockMinimo | numeroCo:2 }} {{ alerta.unidadMedida }}</span>
              </div>
              <div class="metric">
                <span class="label">Faltante</span>
                <span class="value">
                  {{ alerta.stockMinimo - alerta.stockActual | numeroCo:2 }} {{ alerta.unidadMedida }}
                </span>
              </div>
            </div>
            <a mat-stroked-button color="primary" routerLink="/inventarios/sugerencias">
              Ver sugerencia de compra
            </a>
          </mat-card>
        }
      </div>
    }
  `,
  styles: `
    .empty-card {
      text-align: center;
      padding: 48px;
      color: #78909c;
    }
    .empty-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #66bb6a;
    }
    .alertas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .alerta-card { padding: 20px; border-left: 4px solid #c62828; }
    .alerta-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .alerta-header h3 { margin: 0; font-size: 1rem; }
    .alerta-body { margin-bottom: 16px; }
    .metric {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }
    .label { color: #78909c; font-size: 0.875rem; }
    .value { font-weight: 600; }
    .danger { color: #c62828; }
  `,
})
export class AlertasInventarioComponent {
  private readonly inventario = inject(InventarioService);
  readonly alertas = computed(() => {
    this.inventario.version();
    return this.inventario.getAlertas();
  });
}
