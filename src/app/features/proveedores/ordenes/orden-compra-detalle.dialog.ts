import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { OrdenCompra } from '../../../core/models';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { FechaCoPipe, MonedaCoPipe, NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

export interface OrdenCompraDetalleDialogData {
  orden: OrdenCompra;
}

@Component({
  selector: 'app-orden-compra-detalle-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    FechaCoPipe,
    MonedaCoPipe,
    NumeroCoPipe,
  ],
  template: `
    <h2 mat-dialog-title>Orden #{{ data.orden.id.slice(0, 8) }}</h2>
    <mat-dialog-content>
      <div class="meta">
        <div class="meta-row">
          <span class="label">Fecha</span>
          <span>{{ data.orden.fecha | fechaCo }}</span>
        </div>
        <div class="meta-row">
          <span class="label">Proveedor</span>
          <span>{{ nombreProveedor() }}</span>
        </div>
        <div class="meta-row">
          <span class="label">Estado</span>
          <mat-chip-set>
            <mat-chip [highlighted]="true" [color]="chipColor()">
              {{ estadoLabel() }}
            </mat-chip>
          </mat-chip-set>
        </div>
        @if (data.orden.observaciones) {
          <div class="meta-row">
            <span class="label">Observaciones</span>
            <span>{{ data.orden.observaciones }}</span>
          </div>
        }
      </div>

      <mat-divider />

      <h3>Detalle de la orden</h3>
      <table mat-table [dataSource]="data.orden.detalles" class="full-width">
        <ng-container matColumnDef="materia">
          <th mat-header-cell *matHeaderCellDef>Materia prima</th>
          <td mat-cell *matCellDef="let row">{{ nombreMateria(row.materiaPrimaId) }}</td>
        </ng-container>
        <ng-container matColumnDef="cantidad">
          <th mat-header-cell *matHeaderCellDef>Cantidad</th>
          <td mat-cell *matCellDef="let row">
            {{ row.cantidad | numeroCo:2 }} {{ unidadMateria(row.materiaPrimaId) }}
          </td>
        </ng-container>
        <ng-container matColumnDef="precio">
          <th mat-header-cell *matHeaderCellDef>Precio unit.</th>
          <td mat-cell *matCellDef="let row">{{ row.precioUnitario | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="subtotal">
          <th mat-header-cell *matHeaderCellDef>Subtotal</th>
          <td mat-cell *matCellDef="let row">{{ row.cantidad * row.precioUnitario | monedaCo }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      <div class="total">
        <span>Total de la orden</span>
        <strong>{{ totalOrden() | monedaCo }}</strong>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content { min-width: 480px; max-width: 560px; }
    .meta { margin-bottom: 16px; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 6px 0;
      font-size: 0.9rem;
    }
    .label { color: #78909c; flex-shrink: 0; }
    h3 { margin: 16px 0 12px; font-size: 0.95rem; color: #37474f; }
    .full-width { width: 100%; }
    .total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #eceff1;
      font-size: 1rem;
    }
    .total strong { color: #3949ab; font-size: 1.1rem; }
  `,
})
export class OrdenCompraDetalleDialogComponent {
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);
  readonly data = inject<OrdenCompraDetalleDialogData>(MAT_DIALOG_DATA);

  readonly columns = ['materia', 'cantidad', 'precio', 'subtotal'];

  nombreProveedor(): string {
    return this.proveedoresSvc.getProveedorById(this.data.orden.proveedorId)?.nombre ?? '—';
  }

  estadoLabel(): string {
    return this.proveedoresSvc.getEstadoOrdenLabel(this.data.orden.estado);
  }

  chipColor(): 'primary' | 'accent' | 'warn' | undefined {
    switch (this.data.orden.estado) {
      case 'recibida':
        return 'primary';
      case 'enviada':
        return 'accent';
      case 'cancelada':
        return 'warn';
      default:
        return undefined;
    }
  }

  nombreMateria(id: string): string {
    return this.inventario.getMateriaPrimaById(id)?.nombre ?? '—';
  }

  unidadMateria(id: string): string {
    return this.inventario.getMateriaPrimaById(id)?.unidadMedida ?? '';
  }

  totalOrden(): number {
    return this.data.orden.detalles.reduce(
      (s, d) => s + d.cantidad * d.precioUnitario,
      0
    );
  }
}
