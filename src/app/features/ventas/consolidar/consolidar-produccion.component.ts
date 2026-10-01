import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-consolidar-produccion',
  standalone: true,
  imports: [
    MatCardModule, MatCheckboxModule, MatButtonModule, MatIconModule,
    MatSnackBarModule, PageHeaderComponent, MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Consolidar para producción"
      subtitle="Agrupe pedidos pendientes y envíelos al área de producción"
      icon="precision_manufacturing"
    />

    @if (pedidosPendientes().length === 0) {
      <mat-card class="empty">
        <mat-icon>check_circle</mat-icon>
        <p>No hay pedidos pendientes de producción.</p>
      </mat-card>
    } @else {
      <mat-card class="list-card">
        <p class="hint">Seleccione los pedidos a consolidar. Al confirmar, pasarán a estado "En producción".</p>
        @for (pedido of pedidosPendientes(); track pedido.id) {
          <div class="pedido-row">
            <mat-checkbox
              [checked]="seleccionados.has(pedido.id)"
              (change)="toggle(pedido.id, $event.checked)"
            />
            <div class="info">
              <strong>{{ nombreCliente(pedido.clienteId) }}</strong>
              <span>{{ detalleLabel(pedido) }}</span>
              <span class="valor">{{ ventas.getValorPedido(pedido) | monedaCo }}</span>
            </div>
          </div>
        }
        <div class="actions">
          <button mat-flat-button color="primary" [disabled]="seleccionados.size === 0" (click)="consolidar()">
            <mat-icon>merge</mat-icon> Consolidar seleccionados ({{ seleccionados.size }})
          </button>
        </div>
      </mat-card>
    }

    @if (consolidados().length > 0) {
      <mat-card class="consolidados-card">
        <h3>Consolidados recientes</h3>
        @for (c of consolidados(); track c.id) {
          <div class="consolidado-row">
            <div>
              <strong>Consolidado #{{ c.id.slice(0, 8) }}</strong>
              <span>{{ c.pedidoIds.length }} pedido(s) — {{ c.estado === 'producido' ? 'Producido' : 'Pendiente' }}</span>
              <ul>
                @for (prod of c.productos; track prod.productoId) {
                  <li>{{ nombreProducto(prod.productoId) }}: {{ prod.cantidadTotal }} uds.</li>
                }
              </ul>
            </div>
            @if (c.estado === 'pendiente') {
              <button mat-flat-button color="accent" (click)="ejecutarProduccion(c.id)">
                <mat-icon>precision_manufacturing</mat-icon> Registrar producción
              </button>
            }
          </div>
        }
      </mat-card>
    }
  `,
  styles: `
    .empty { text-align: center; padding: 48px; color: #78909c; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .list-card, .consolidados-card { padding: 24px; margin-bottom: 24px; }
    .hint { color: #78909c; margin-bottom: 16px; }
    .pedido-row { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #eceff1; }
    .info { display: flex; flex-direction: column; gap: 4px; }
    .valor { color: #3949ab; font-weight: 600; }
    .actions { margin-top: 16px; }
    h3 { margin: 0 0 16px; color: #37474f; }
    .consolidado-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 0; border-bottom: 1px solid #eceff1; gap: 16px; }
    ul { margin: 8px 0 0; padding-left: 20px; color: #546e7a; font-size: 0.9rem; }
  `,
})
export class ConsolidarProduccionComponent {
  readonly ventas = inject(VentasService);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly refresh = signal(0);

  seleccionados = new Set<string>();

  readonly pedidosPendientes = computed(() => {
    this.refresh();
    this.ventas.version();
    return this.ventas.getPedidos().filter((p) => p.estado === 'pendiente');
  });

  readonly consolidados = computed(() => {
    this.refresh();
    this.ventas.version();
    return this.ventas.getConsolidados().slice(0, 5);
  });

  toggle(id: string, checked: boolean): void {
    if (checked) this.seleccionados.add(id);
    else this.seleccionados.delete(id);
  }

  consolidar(): void {
    const result = this.ventas.consolidarPedidos([...this.seleccionados]);
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error', 'Cerrar', { duration: 5000 });
      return;
    }
    this.snackBar.open('Pedidos consolidados para producción.', 'Cerrar', { duration: 4000 });
    this.seleccionados.clear();
    this.refresh.update((v) => v + 1);
  }

  ejecutarProduccion(consolidadoId: string): void {
    const result = this.ventas.ejecutarProduccionConsolidado(consolidadoId);
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error en producción', 'Cerrar', { duration: 8000 });
    }
    this.refresh.update((v) => v + 1);
  }

  nombreCliente(id: string): string {
    return this.ventas.getClienteById(id)?.nombre ?? '—';
  }

  nombreProducto(id: string): string {
    return this.inventario.getProductoById(id)?.nombre ?? '—';
  }

  detalleLabel(pedido: { detalles: { productoId: string; cantidad: number }[] }): string {
    return pedido.detalles
      .map((d) => `${this.nombreProducto(d.productoId)} x${d.cantidad}`)
      .join(', ');
  }
}
