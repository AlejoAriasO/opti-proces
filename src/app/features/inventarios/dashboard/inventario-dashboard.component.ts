import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-inventario-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    PageHeaderComponent,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Inventarios"
      subtitle="Resumen general del módulo de gestión de inventarios"
      icon="dashboard"
    />

    <div class="stats-grid">
      <mat-card class="stat-card">
        <mat-icon>science</mat-icon>
        <span class="stat-value">{{ materias().length }}</span>
        <span class="stat-label">Materias primas activas</span>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>local_shipping</mat-icon>
        <span class="stat-value">{{ productos().length }}</span>
        <span class="stat-label">Productos terminados</span>
      </mat-card>
      <mat-card class="stat-card warn" [class.has-alert]="alertas().length > 0">
        <mat-icon>warning</mat-icon>
        <span class="stat-value">{{ alertas().length }}</span>
        <span class="stat-label">Alertas de bajo stock</span>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>history</mat-icon>
        <span class="stat-value">{{ movimientos().length }}</span>
        <span class="stat-label">Movimientos registrados</span>
      </mat-card>
    </div>

    <div class="panels">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Acciones rápidas</mat-card-title>
        </mat-card-header>
        <mat-card-content class="actions">
          <a mat-stroked-button routerLink="/inventarios/materias-primas">
            <mat-icon>add</mat-icon> Nueva materia prima
          </a>
          <a mat-stroked-button routerLink="/inventarios/compras">
            <mat-icon>add_shopping_cart</mat-icon> Registrar compra
          </a>
          <a mat-stroked-button routerLink="/inventarios/produccion">
            <mat-icon>precision_manufacturing</mat-icon> Registrar producción
          </a>
          <a mat-stroked-button routerLink="/inventarios/sugerencias">
            <mat-icon>lightbulb</mat-icon> Ver sugerencias
          </a>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Materias primas con bajo stock</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (alertas().length === 0) {
            <p class="empty">No hay alertas activas. Todas las existencias están por encima del mínimo.</p>
          } @else {
            @for (alerta of alertas(); track alerta.materiaPrimaId) {
              <div class="alert-row">
                <span>{{ alerta.materiaPrimaNombre }}</span>
                <mat-chip-set>
                  <mat-chip highlighted color="warn">
                    {{ alerta.stockActual | numeroCo:2 }} / {{ alerta.stockMinimo | numeroCo:2 }}
                    {{ alerta.unidadMedida }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px 20px;
      min-height: 140px;
    }
    .stat-card mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #3949ab;
      margin-bottom: 8px;
    }
    .stat-card.warn mat-icon { color: #ef6c00; }
    .stat-card.has-alert { border-left: 4px solid #c62828; }
    .stat-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #263238;
      margin: 4px 0;
      width: 100%;
      text-align: center;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #78909c;
      line-height: 1.3;
      width: 100%;
      text-align: center;
    }
    .panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .empty {
      color: #78909c;
      margin: 0;
    }
    .alert-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eceff1;
    }
    .alert-row:last-child { border-bottom: none; }
  `,
})
export class InventarioDashboardComponent {
  private readonly inventario = inject(InventarioService);

  readonly materias = computed(() => {
    this.inventario.version();
    return this.inventario.getMateriasPrimas();
  });

  readonly productos = computed(() => {
    this.inventario.version();
    return this.inventario.getProductosTerminados();
  });

  readonly alertas = computed(() => {
    this.inventario.version();
    return this.inventario.getAlertas();
  });

  readonly movimientos = computed(() => {
    this.inventario.version();
    return this.inventario.getMovimientos();
  });
}
