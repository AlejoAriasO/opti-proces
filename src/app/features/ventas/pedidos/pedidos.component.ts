import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Pedido, EstadoPedido } from '../../../core/models';
import { FechaCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';
import { PedidoFormDialogComponent } from './pedido-form.dialog';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule,
    MatChipsModule, MatSelectModule, MatSnackBarModule, PageHeaderComponent,
    FechaCoPipe, MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Pedidos"
      subtitle="Registre pedidos de clientes y consulte su historial"
      icon="shopping_bag"
    />

    <div class="toolbar">
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon> Nuevo pedido
      </button>
    </div>

    <mat-card>
      <table mat-table [dataSource]="pedidos()" class="full-width">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let row">{{ row.fecha | fechaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let row">{{ nombreCliente(row.clienteId) }}</td>
        </ng-container>
        <ng-container matColumnDef="canal">
          <th mat-header-cell *matHeaderCellDef>Canal</th>
          <td mat-cell *matCellDef="let row">{{ ventas.getCanalLabel(row.canalRecepcion) }}</td>
        </ng-container>
        <ng-container matColumnDef="productos">
          <th mat-header-cell *matHeaderCellDef>Productos</th>
          <td mat-cell *matCellDef="let row">{{ detalleLabel(row) }}</td>
        </ng-container>
        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let row">{{ ventas.getValorPedido(row) | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip-set>
              <mat-chip [highlighted]="true">{{ ventas.getEstadoPedidoLabel(row.estado) }}</mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>
        <ng-container matColumnDef="factura">
          <th mat-header-cell *matHeaderCellDef>Facturado</th>
          <td mat-cell *matCellDef="let row">
            {{ ventas.pedidoEstaFacturado(row.id) ? 'Sí' : 'No' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            @if (row.estado === 'listo') {
              <button mat-button color="primary" (click)="marcarEntregado(row)">Entregar</button>
            }
            @if (row.estado !== 'entregado' && row.estado !== 'cancelado') {
              <button mat-button color="warn" (click)="cancelar(row)">Cancelar</button>
            }
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      @if (pedidos().length === 0) {
        <p class="empty">No hay pedidos registrados.</p>
      }
    </mat-card>
  `,
  styles: `.toolbar { margin-bottom: 16px; } .full-width { width: 100%; } .empty { padding: 32px; text-align: center; color: #78909c; }`,
})
export class PedidosComponent {
  readonly ventas = inject(VentasService);
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly refresh = signal(0);

  readonly pedidos = computed(() => { this.refresh(); this.ventas.version(); return this.ventas.getPedidos(); });
  readonly columns = ['fecha', 'cliente', 'canal', 'productos', 'valor', 'estado', 'factura', 'acciones'];

  abrirFormulario(): void {
    this.dialog.open(PedidoFormDialogComponent, { width: '560px' })
      .afterClosed().subscribe((ok) => ok && this.refresh.update((v) => v + 1));
  }

  nombreCliente(id: string): string {
    return this.ventas.getClienteById(id)?.nombre ?? '—';
  }

  detalleLabel(pedido: Pedido): string {
    return pedido.detalles
      .map((d) => {
        const p = this.inventario.getProductoById(d.productoId);
        return `${p?.nombre ?? '?'} x${d.cantidad}`;
      })
      .join(', ');
  }

  marcarEntregado(pedido: Pedido): void {
    const result = this.ventas.actualizarEstadoPedido(pedido.id, 'entregado');
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error', 'Cerrar', { duration: 6000 });
    } else {
      this.snackBar.open('Pedido entregado. Inventario actualizado.', 'Cerrar', { duration: 4000 });
    }
    this.refresh.update((v) => v + 1);
  }

  cancelar(pedido: Pedido): void {
    if (confirm('¿Cancelar este pedido?')) {
      this.ventas.actualizarEstadoPedido(pedido.id, 'cancelado');
      this.refresh.update((v) => v + 1);
    }
  }
}
