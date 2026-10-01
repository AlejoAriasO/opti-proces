import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { FechaCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-historial-compras',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    PageHeaderComponent,
    FechaCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Historial de compras"
      subtitle="Registro de compras realizadas a proveedores e ingresos a inventario"
      icon="history"
    />

    <mat-card>
      <table mat-table [dataSource]="compras()" class="full-width">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let row">{{ row.fecha | fechaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="proveedor">
          <th mat-header-cell *matHeaderCellDef>Proveedor</th>
          <td mat-cell *matCellDef="let row">{{ row.proveedorNombre }}</td>
        </ng-container>
        <ng-container matColumnDef="items">
          <th mat-header-cell *matHeaderCellDef>Ítems</th>
          <td mat-cell *matCellDef="let row">{{ row.detalles.length }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let row">{{ totalCompra(row) | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="origen">
          <th mat-header-cell *matHeaderCellDef>Origen</th>
          <td mat-cell *matCellDef="let row">
            @if (row.ordenCompraId) {
              <mat-chip-set><mat-chip highlighted>Orden de compra</mat-chip></mat-chip-set>
            } @else {
              Registro manual
            }
          </td>
        </ng-container>
        <ng-container matColumnDef="detalle">
          <th mat-header-cell *matHeaderCellDef>Detalle</th>
          <td mat-cell *matCellDef="let row">{{ detalleLabel(row) }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      @if (compras().length === 0) {
        <p class="empty">Aún no hay compras registradas.</p>
      }
    </mat-card>
  `,
  styles: `
    .full-width { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
  `,
})
export class HistorialComprasComponent {
  private readonly inventario = inject(InventarioService);
  private readonly proveedoresSvc = inject(ProveedorService);

  readonly compras = computed(() => {
    this.inventario.version();
    this.proveedoresSvc.version();
    return this.inventario.getCompras();
  });

  readonly columns = ['fecha', 'proveedor', 'items', 'total', 'origen', 'detalle'];

  totalCompra(compra: { detalles: { cantidad: number; precioUnitario: number }[] }): number {
    return compra.detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0);
  }

  detalleLabel(compra: { detalles: { materiaPrimaId: string; cantidad: number }[] }): string {
    return compra.detalles
      .map((d) => {
        const m = this.inventario.getMateriaPrimaById(d.materiaPrimaId);
        return `${m?.nombre ?? '?'}: ${d.cantidad} ${m?.unidadMedida ?? ''}`;
      })
      .join('; ');
  }
}
