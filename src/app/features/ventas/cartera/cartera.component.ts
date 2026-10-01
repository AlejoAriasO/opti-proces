import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { Cartera } from '../../../core/models';
import { FechaCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-cartera',
  standalone: true,
  imports: [
    MatCardModule, MatTableModule, MatButtonModule,
    MatFormFieldModule, MatSelectModule, MatChipsModule,
    MatSnackBarModule, PageHeaderComponent, FechaCoPipe, MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Cartera"
      subtitle="Cuentas por cobrar, pagos parciales y estado por cliente"
      icon="payments"
    />

    <mat-card class="filter-card">
      <mat-form-field appearance="outline">
        <mat-label>Filtrar por cliente</mat-label>
        <mat-select [value]="clienteFiltro()" (selectionChange)="clienteFiltro.set($event.value)">
          <mat-option value="">Todos los clientes</mat-option>
          @for (c of clientes(); track c.id) {
            <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </mat-card>

    <mat-card>
      <table mat-table [dataSource]="carteraFiltrada()" class="full-width">
        <ng-container matColumnDef="cliente">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let row">{{ nombreCliente(row.clienteId) }}</td>
        </ng-container>
        <ng-container matColumnDef="factura">
          <th mat-header-cell *matHeaderCellDef>Factura</th>
          <td mat-cell *matCellDef="let row">{{ numeroFactura(row.facturaId) }}</td>
        </ng-container>
        <ng-container matColumnDef="vencimiento">
          <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
          <td mat-cell *matCellDef="let row">{{ row.fechaVencimiento | fechaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="valor">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let row">{{ row.valor | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="saldo">
          <th mat-header-cell *matHeaderCellDef>Saldo pendiente</th>
          <td mat-cell *matCellDef="let row">{{ row.saldoPendiente | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip-set>
              <mat-chip [highlighted]="true" [color]="chipColor(row)">
                {{ ventas.getEstadoPagoLabel(row.estadoPago) }}
              </mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            @if (row.saldoPendiente > 0) {
              <button mat-button color="primary" (click)="abrirPago(row)">Registrar pago</button>
            }
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      @if (carteraFiltrada().length === 0) {
        <p class="empty">No hay registros de cartera.</p>
      }
    </mat-card>

    @if (clienteFiltro()) {
      <mat-card class="resumen-card">
        <h3>Resumen — {{ nombreCliente(clienteFiltro()) }}</h3>
        <p>Total facturado: {{ resumen().totalFacturado | monedaCo }}</p>
        <p>Saldo pendiente: <strong>{{ resumen().saldoPendiente | monedaCo }}</strong></p>
        <p>Facturas pendientes: {{ resumen().facturasPendientes }}</p>
      </mat-card>
    }
  `,
  styles: `
    .filter-card { padding: 16px 24px; margin-bottom: 16px; }
    .full-width { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
    .resumen-card { padding: 24px; margin-top: 16px; }
    h3 { margin: 0 0 12px; color: #37474f; }
  `,
})
export class CarteraComponent {
  readonly ventas = inject(VentasService);
  private readonly snackBar = inject(MatSnackBar);
  readonly refresh = signal(0);
  readonly clienteFiltro = signal('');

  readonly columns = ['cliente', 'factura', 'vencimiento', 'valor', 'saldo', 'estado', 'acciones'];

  readonly clientes = computed(() => {
    this.refresh();
    this.ventas.version();
    return this.ventas.getClientes();
  });

  readonly carteraFiltrada = computed(() => {
    this.refresh();
    this.ventas.version();
    this.clienteFiltro();
    const items = this.ventas.getCartera();
    const filtro = this.clienteFiltro();
    if (!filtro) return items;
    return items.filter((c) => c.clienteId === filtro);
  });

  readonly resumen = computed(() => {
    const filtro = this.clienteFiltro();
    if (!filtro) return { totalFacturado: 0, saldoPendiente: 0, facturasPendientes: 0 };
    return this.ventas.getResumenCarteraCliente(filtro);
  });

  nombreCliente(id: string): string {
    return this.ventas.getClienteById(id)?.nombre ?? '—';
  }

  numeroFactura(facturaId: string): string {
    return this.ventas.getFacturas().find((f) => f.id === facturaId)?.numeroFactura ?? '—';
  }

  chipColor(row: Cartera): 'warn' | 'primary' | undefined {
    if (row.estadoPago === 'pagado') return 'primary';
    if (row.saldoPendiente > 0 && new Date(row.fechaVencimiento) < new Date()) return 'warn';
    return undefined;
  }

  abrirPago(cartera: Cartera): void {
    const montoStr = prompt(
      `Registrar pago para factura ${this.numeroFactura(cartera.facturaId)}.\nSaldo pendiente: ${cartera.saldoPendiente}\n\nMonto a pagar:`,
      String(cartera.saldoPendiente)
    );
    if (!montoStr) return;

    const monto = Number(montoStr);
    const result = this.ventas.registrarPago(cartera.id, monto);
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error', 'Cerrar', { duration: 5000 });
    } else {
      this.snackBar.open('Pago registrado.', 'Cerrar', { duration: 3000 });
      this.refresh.update((v) => v + 1);
    }
  }
}
