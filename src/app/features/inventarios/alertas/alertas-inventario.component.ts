import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';
import {
  GenerarOrdenCompraDialogComponent,
  GenerarOrdenCompraDialogData,
} from '../../proveedores/ordenes/generar-orden-compra.dialog';

@Component({
  selector: 'app-alertas-inventario',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
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
            <div class="actions">
              <button mat-flat-button color="primary" (click)="generarOrden(alerta)">
                Generar orden de compra
              </button>
              <a mat-stroked-button routerLink="/inventarios/sugerencias">
                Ver sugerencias
              </a>
            </div>
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
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `,
})
export class AlertasInventarioComponent {
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly refresh = signal(0);

  readonly alertas = computed(() => {
    this.refresh();
    this.inventario.version();
    return this.inventario.getAlertas();
  });

  generarOrden(alerta: {
    materiaPrimaId: string;
    materiaPrimaNombre: string;
    stockActual: number;
    stockMinimo: number;
    unidadMedida: string;
  }): void {
    const sugerencia = this.inventario
      .getSugerenciasCompra()
      .find((s) => s.materiaPrimaId === alerta.materiaPrimaId);

    const data: GenerarOrdenCompraDialogData = {
      materiaPrimaId: alerta.materiaPrimaId,
      materiaPrimaNombre: alerta.materiaPrimaNombre,
      cantidadSugerida:
        sugerencia?.cantidadSugerida ??
        Math.max(alerta.stockMinimo - alerta.stockActual, 0),
      unidadMedida: alerta.unidadMedida,
    };

    this.dialog
      .open(GenerarOrdenCompraDialogComponent, { width: '420px', data })
      .afterClosed()
      .subscribe((orden) => {
        if (!orden) return;
        this.snackBar.open(
          `Orden #${orden.id.slice(0, 8)} creada correctamente.`,
          'Ver órdenes',
          { duration: 5000 }
        ).onAction().subscribe(() => this.router.navigate(['/proveedores/ordenes']));
        this.refresh.update((v) => v + 1);
      });
  }
}
