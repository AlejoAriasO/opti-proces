import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { MonedaCoPipe, FechaCoPipe } from '../../../shared/pipes/locale.pipes';
import { OrdenCompra } from '../../../core/models';
import { OrdenCompraDetalleDialogComponent } from './orden-compra-detalle.dialog';

@Component({
  selector: 'app-ordenes-compra',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    PageHeaderComponent,
    MonedaCoPipe,
    FechaCoPipe,
  ],
  template: `
    <app-page-header
      title="Órdenes de compra"
      subtitle="Genere órdenes desde sugerencias de inventario y registre su recepción"
      icon="receipt_long"
    />

    <mat-card class="form-card">
      <h3>Nueva orden de compra</h3>
      <form [formGroup]="form" (ngSubmit)="crearOrden()">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Proveedor</mat-label>
            <mat-select formControlName="proveedorId">
              @for (p of proveedores(); track p.id) {
                <mat-option [value]="p.id">{{ p.nombre }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="flex-grow">
            <mat-label>Observaciones</mat-label>
            <input matInput formControlName="observaciones" />
          </mat-form-field>
        </div>

        @if (sugerencias().length > 0) {
          <button mat-stroked-button type="button" (click)="cargarDesdeSugerencias()">
            <mat-icon>lightbulb</mat-icon> Cargar desde sugerencias de inventario
          </button>
        }

        <div formArrayName="detalles">
          @for (ctrl of detalles.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="detalle-row">
              <mat-form-field appearance="outline">
                <mat-label>Materia prima</mat-label>
                <mat-select formControlName="materiaPrimaId">
                  @for (m of materias; track m.id) {
                    <mat-option [value]="m.id">{{ m.nombre }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" formControlName="cantidad" min="0.01" step="0.01" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Precio unit.</mat-label>
                <input matInput type="number" formControlName="precioUnitario" min="0" />
              </mat-form-field>
              <button mat-icon-button type="button" color="warn" (click)="quitarDetalle(i)">
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          }
        </div>
        <button mat-stroked-button type="button" (click)="agregarDetalle()">
          <mat-icon>add</mat-icon> Agregar línea
        </button>
        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            Crear orden
          </button>
        </div>
      </form>
    </mat-card>

    <mat-card class="table-card">
      <h3>Órdenes registradas</h3>
      <table mat-table [dataSource]="ordenes()" class="full-width">
        <ng-container matColumnDef="fecha">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let row">{{ row.fecha | fechaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="proveedor">
          <th mat-header-cell *matHeaderCellDef>Proveedor</th>
          <td mat-cell *matCellDef="let row">{{ nombreProveedor(row.proveedorId) }}</td>
        </ng-container>
        <ng-container matColumnDef="items">
          <th mat-header-cell *matHeaderCellDef>Ítems</th>
          <td mat-cell *matCellDef="let row">{{ row.detalles.length }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total est.</th>
          <td mat-cell *matCellDef="let row">{{ totalOrden(row) | monedaCo }}</td>
        </ng-container>
        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            <mat-chip-set>
              <mat-chip [highlighted]="true">{{ estadoLabel(row.estado) }}</mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>
        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="verDetalle(row)" matTooltip="Ver detalle">
              <mat-icon>visibility</mat-icon>
            </button>
            @if (row.estado === 'pendiente') {
              <button mat-button (click)="marcarEnviada(row)">Marcar enviada</button>
            }
            @if (row.estado === 'pendiente' || row.estado === 'enviada') {
              <button mat-flat-button color="primary" (click)="recibir(row)">Recibir</button>
              <button mat-button color="warn" (click)="cancelar(row)">Cancelar</button>
            }
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
      @if (ordenes().length === 0) {
        <p class="empty">No hay órdenes de compra.</p>
      }
    </mat-card>
  `,
  styles: `
    .form-card, .table-card { padding: 24px; margin-bottom: 24px; }
    h3 { margin: 0 0 16px; color: #37474f; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .flex-grow { flex: 1; min-width: 200px; }
    .detalle-row {
      display: grid;
      grid-template-columns: 1fr 120px 120px 48px;
      gap: 12px;
      align-items: center;
      margin: 8px 0;
    }
    .actions { margin-top: 16px; display: flex; justify-content: flex-end; }
    .full-width { width: 100%; }
    .empty { padding: 24px; text-align: center; color: #78909c; }
  `,
})
export class OrdenesCompraComponent {
  private readonly fb = inject(FormBuilder);
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly refresh = signal(0);

  readonly materias = this.inventario.getMateriasPrimas();
  readonly columns = ['fecha', 'proveedor', 'items', 'total', 'estado', 'acciones'];

  readonly proveedores = computed(() => {
    this.refresh();
    this.proveedoresSvc.version();
    return this.proveedoresSvc.getProveedores();
  });

  readonly sugerencias = computed(() => {
    this.inventario.version();
    return this.inventario.getSugerenciasCompra();
  });

  readonly ordenes = computed(() => {
    this.refresh();
    this.proveedoresSvc.version();
    return this.proveedoresSvc.getOrdenesCompra();
  });

  readonly form = this.fb.group({
    proveedorId: ['', Validators.required],
    observaciones: [''],
    detalles: this.fb.array([this.crearDetalle()]),
  });

  get detalles() {
    return this.form.get('detalles') as import('@angular/forms').FormArray;
  }

  crearDetalle() {
    return this.fb.group({
      materiaPrimaId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalle());
  }

  quitarDetalle(i: number): void {
    if (this.detalles.length > 1) this.detalles.removeAt(i);
  }

  cargarDesdeSugerencias(): void {
    const sugs = this.sugerencias();
    if (sugs.length === 0) return;

    const proveedorSugerido = sugs.find((s) => s.proveedorSugeridoId)?.proveedorSugeridoId;
    if (proveedorSugerido) this.form.patchValue({ proveedorId: proveedorSugerido });

    this.detalles.clear();
    for (const s of sugs) {
      this.detalles.push(
        this.fb.group({
          materiaPrimaId: [s.materiaPrimaId, Validators.required],
          cantidad: [s.cantidadSugerida, [Validators.required, Validators.min(0.01)]],
          precioUnitario: [
            s.proveedorSugeridoId
              ? (this.proveedoresSvc.getPrecioProveedor(s.proveedorSugeridoId, s.materiaPrimaId) ?? s.costoPromedio)
              : s.costoPromedio,
            [Validators.required, Validators.min(0)],
          ],
        })
      );
    }
  }

  crearOrden(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.proveedoresSvc.crearOrdenCompra({
      proveedorId: v.proveedorId!,
      observaciones: v.observaciones ?? '',
      detalles: v.detalles!.map((d) => ({
        materiaPrimaId: d.materiaPrimaId!,
        cantidad: d.cantidad!,
        precioUnitario: d.precioUnitario!,
      })),
    });
    this.snackBar.open('Orden de compra creada.', 'Cerrar', { duration: 3000 });
    this.form.reset({ proveedorId: '', observaciones: '' });
    this.detalles.clear();
    this.detalles.push(this.crearDetalle());
    this.refresh.update((n) => n + 1);
  }

  marcarEnviada(orden: OrdenCompra): void {
    this.proveedoresSvc.marcarOrdenEnviada(orden.id);
    this.refresh.update((n) => n + 1);
  }

  verDetalle(orden: OrdenCompra): void {
    this.dialog.open(OrdenCompraDetalleDialogComponent, {
      width: '560px',
      data: { orden },
    });
  }

  recibir(orden: OrdenCompra): void {
    const result = this.proveedoresSvc.recibirOrdenCompra(orden.id);
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error', 'Cerrar', { duration: 5000 });
    }
    this.refresh.update((n) => n + 1);
  }

  cancelar(orden: OrdenCompra): void {
    if (confirm('¿Cancelar esta orden?')) {
      this.proveedoresSvc.cancelarOrden(orden.id);
      this.refresh.update((n) => n + 1);
    }
  }

  nombreProveedor(id: string): string {
    return this.proveedoresSvc.getProveedorById(id)?.nombre ?? '—';
  }

  estadoLabel(estado: OrdenCompra['estado']): string {
    return this.proveedoresSvc.getEstadoOrdenLabel(estado);
  }

  totalOrden(orden: OrdenCompra): number {
    return orden.detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0);
  }
}
