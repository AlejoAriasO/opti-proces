import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { FechaCoPipe, NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-historial-movimientos',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    PageHeaderComponent,
    FechaCoPipe,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Historial de movimientos"
      subtitle="Registro de solo lectura de todas las entradas y salidas de inventario"
      icon="history"
    />

    <mat-card>
      <table mat-table [dataSource]="movimientos()" class="full-width">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let row">{{ row.fecha | fechaCo }}</td>
        </ng-container>

        <ng-container matColumnDef="tipo">
          <th mat-header-cell *matHeaderCellDef>Tipo</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip-set>
              <mat-chip [highlighted]="true">{{ tipoLabel(row.tipo) }}</mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>

        <ng-container matColumnDef="item">
          <th mat-header-cell *matHeaderCellDef>Ítem</th>
          <td mat-cell *matCellDef="let row">{{ nombreItem(row) }}</td>
        </ng-container>

        <ng-container matColumnDef="cantidad">
          <th mat-header-cell *matHeaderCellDef>Cantidad</th>
          <td mat-cell *matCellDef="let row">{{ row.cantidad | numeroCo:2 }}</td>
        </ng-container>

        <ng-container matColumnDef="stock">
          <th mat-header-cell *matHeaderCellDef>Stock anterior → nuevo</th>
          <td mat-cell *matCellDef="let row">
            {{ row.stockAnterior | numeroCo:2 }} → {{ row.stockNuevo | numeroCo:2 }}
          </td>
        </ng-container>

        <ng-container matColumnDef="referencia">
          <th mat-header-cell *matHeaderCellDef>Referencia</th>
          <td mat-cell *matCellDef="let row">{{ row.referencia }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (movimientos().length === 0) {
        <p class="empty">Aún no hay movimientos registrados.</p>
      }
    </mat-card>
  `,
  styles: `
    .full-width { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
  `,
})
export class HistorialMovimientosComponent {
  private readonly inventario = inject(InventarioService);

  readonly movimientos = computed(() => {
    this.inventario.version();
    return this.inventario.getMovimientos();
  });
  readonly columns = ['fecha', 'tipo', 'item', 'cantidad', 'stock', 'referencia'];

  tipoLabel(tipo: string): string {
    return this.inventario.getTipoMovimientoLabel(tipo as never);
  }

  nombreItem(row: {
    materiaPrimaId?: string;
    productoId?: string;
  }): string {
    if (row.materiaPrimaId) {
      return this.inventario.getMateriaPrimaById(row.materiaPrimaId)?.nombre ?? '—';
    }
    if (row.productoId) {
      return this.inventario.getProductoById(row.productoId)?.nombre ?? '—';
    }
    return '—';
  }
}
