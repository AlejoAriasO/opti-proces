import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { Cliente } from '../../../core/models';
import { MonedaCoPipe } from '../../../shared/pipes/locale.pipes';
import { ClienteFormDialogComponent } from './cliente-form.dialog';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule, MatDialogModule, MatCardModule,
    PageHeaderComponent, MonedaCoPipe,
  ],
  template: `
    <app-page-header title="Clientes" subtitle="Registre y administre la información de sus clientes" icon="people" />

    <div class="toolbar">
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon> Nuevo cliente
      </button>
    </div>

    <mat-card>
      <table mat-table [dataSource]="clientes()" class="full-width">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let row">{{ row.nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="contacto">
          <th mat-header-cell *matHeaderCellDef>Contacto</th>
          <td mat-cell *matCellDef="let row">{{ row.telefono || row.correo || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="ciudad">
          <th mat-header-cell *matHeaderCellDef>Ciudad</th>
          <td mat-cell *matCellDef="let row">{{ row.ciudad || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="pedidos">
          <th mat-header-cell *matHeaderCellDef>Pedidos</th>
          <td mat-cell *matCellDef="let row">{{ pedidosCount(row.id) }}</td>
        </ng-container>
        <ng-container matColumnDef="cartera">
          <th mat-header-cell *matHeaderCellDef>Saldo cartera</th>
          <td mat-cell *matCellDef="let row">{{ resumenCartera(row.id).saldoPendiente | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="abrirFormulario(row)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="desactivar(row)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      @if (clientes().length === 0) {
        <p class="empty">No hay clientes registrados.</p>
      }
    </mat-card>
  `,
  styles: `.toolbar { margin-bottom: 16px; } .full-width { width: 100%; } .empty { padding: 32px; text-align: center; color: #78909c; }`,
})
export class ClientesComponent {
  private readonly ventas = inject(VentasService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh = signal(0);

  readonly clientes = computed(() => { this.refresh(); this.ventas.version(); return this.ventas.getClientes(); });
  readonly columns = ['nombre', 'contacto', 'ciudad', 'pedidos', 'cartera', 'acciones'];

  abrirFormulario(cliente?: Cliente): void {
    this.dialog.open(ClienteFormDialogComponent, { width: '440px', data: cliente ?? null })
      .afterClosed().subscribe((ok) => ok && this.refresh.update((v) => v + 1));
  }

  desactivar(cliente: Cliente): void {
    if (confirm(`¿Desactivar al cliente "${cliente.nombre}"?`)) {
      this.ventas.desactivarCliente(cliente.id);
      this.refresh.update((v) => v + 1);
    }
  }

  pedidosCount(clienteId: string): number {
    return this.ventas.getPedidosPorCliente(clienteId).length;
  }

  resumenCartera(clienteId: string) {
    return this.ventas.getResumenCarteraCliente(clienteId);
  }
}
