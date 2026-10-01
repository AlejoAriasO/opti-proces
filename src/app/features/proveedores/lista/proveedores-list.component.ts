import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { Proveedor } from '../../../core/models';
import { ProveedorFormDialogComponent } from './proveedor-form.dialog';

@Component({
  selector: 'app-proveedores-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatChipsModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Lista de proveedores"
      subtitle="Registre proveedores y asocie las materias primas que suministran"
      icon="store"
    />

    <div class="toolbar">
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon> Nuevo proveedor
      </button>
    </div>

    <mat-card>
      <table mat-table [dataSource]="proveedores()" class="full-width">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let row">{{ row.nombre }}</td>
        </ng-container>
        <ng-container matColumnDef="nit">
          <th mat-header-cell *matHeaderCellDef>NIT</th>
          <td mat-cell *matCellDef="let row">{{ row.nit || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="contacto">
          <th mat-header-cell *matHeaderCellDef>Contacto</th>
          <td mat-cell *matCellDef="let row">{{ row.telefono || row.correo || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="entrega">
          <th mat-header-cell *matHeaderCellDef>Entrega</th>
          <td mat-cell *matCellDef="let row">{{ row.tiempoEntregaDias }} días</td>
        </ng-container>
        <ng-container matColumnDef="materias">
          <th mat-header-cell *matHeaderCellDef>Materias primas</th>
          <td mat-cell *matCellDef="let row">{{ materiasLabel(row) }}</td>
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
      @if (proveedores().length === 0) {
        <p class="empty">No hay proveedores registrados.</p>
      }
    </mat-card>
  `,
  styles: `
    .toolbar { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
  `,
})
export class ProveedoresListComponent {
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);
  private readonly refresh = signal(0);

  readonly proveedores = computed(() => {
    this.refresh();
    this.proveedoresSvc.version();
    return this.proveedoresSvc.getProveedores();
  });

  readonly columns = ['nombre', 'nit', 'contacto', 'entrega', 'materias', 'acciones'];

  abrirFormulario(proveedor?: Proveedor): void {
    this.dialog
      .open(ProveedorFormDialogComponent, { width: '480px', data: proveedor ?? null })
      .afterClosed()
      .subscribe((ok) => ok && this.refresh.update((v) => v + 1));
  }

  desactivar(proveedor: Proveedor): void {
    if (confirm(`¿Desactivar al proveedor "${proveedor.nombre}"?`)) {
      this.proveedoresSvc.desactivarProveedor(proveedor.id);
      this.refresh.update((v) => v + 1);
    }
  }

  materiasLabel(proveedor: Proveedor): string {
    if (proveedor.materiasPrimasIds.length === 0) return '—';
    return proveedor.materiasPrimasIds
      .map((id) => this.inventario.getMateriaPrimaById(id)?.nombre ?? '?')
      .join(', ');
  }
}
