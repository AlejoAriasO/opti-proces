import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CANALES_RECEPCION } from '../../../core/models';
import { InventarioService } from '../../../core/services/inventario.service';
import { VentasService } from '../../../core/services/ventas.service';

@Component({
  selector: 'app-pedido-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Nuevo pedido</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="clienteId">
            @for (c of clientes; track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Canal de recepción</mat-label>
          <mat-select formControlName="canalRecepcion">
            @for (canal of canales; track canal.value) {
              <mat-option [value]="canal.value">{{ canal.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha del pedido</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="fecha" />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Fecha de entrega (opcional)</mat-label>
          <input matInput [matDatepicker]="pickerEntrega" formControlName="fechaEntrega" />
          <mat-datepicker-toggle matIconSuffix [for]="pickerEntrega" />
          <mat-datepicker #pickerEntrega />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        <h4>Productos solicitados</h4>
        <div formArrayName="detalles">
          @for (ctrl of detalles.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="detalle-row">
              <mat-form-field appearance="outline">
                <mat-label>Producto</mat-label>
                <mat-select formControlName="productoId" (selectionChange)="setPrecio(i)">
                  @for (p of productos; track p.id) {
                    <mat-option [value]="p.id">{{ p.nombre }} — {{ p.presentacion }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" formControlName="cantidad" min="1" />
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
          <mat-icon>add</mat-icon> Agregar producto
        </button>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">Registrar pedido</button>
    </mat-dialog-actions>
  `,
  styles: `
    .form { min-width: 480px; padding-top: 8px; }
    .full-width { width: 100%; }
    h4 { margin: 16px 0 8px; color: #455a64; }
    .detalle-row { display: grid; grid-template-columns: 1fr 100px 120px 48px; gap: 8px; align-items: center; margin-bottom: 4px; }
  `,
})
export class PedidoFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ventas = inject(VentasService);
  private readonly inventario = inject(InventarioService);
  private readonly dialogRef = inject(MatDialogRef<PedidoFormDialogComponent>);
  readonly data = inject<{ clienteId?: string } | null>(MAT_DIALOG_DATA, { optional: true });

  readonly clientes = this.ventas.getClientes();
  readonly productos = this.inventario.getProductosTerminados();
  readonly canales = CANALES_RECEPCION;

  readonly form = this.fb.group({
    clienteId: [this.data?.clienteId ?? '', Validators.required],
    canalRecepcion: ['whatsapp' as const, Validators.required],
    fecha: [new Date(), Validators.required],
    fechaEntrega: [null as Date | null],
    observaciones: [''],
    detalles: this.fb.array([this.crearDetalle()]),
  });

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  crearDetalle() {
    return this.fb.group({
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarDetalle(): void { this.detalles.push(this.crearDetalle()); }
  quitarDetalle(i: number): void { if (this.detalles.length > 1) this.detalles.removeAt(i); }

  setPrecio(i: number): void {
    const productoId = this.detalles.at(i).get('productoId')?.value;
    const producto = this.inventario.getProductoById(productoId);
    if (producto) this.detalles.at(i).patchValue({ precioUnitario: producto.precio });
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const fecha = v.fecha instanceof Date ? v.fecha.toISOString() : new Date().toISOString();
    const fechaEntrega = v.fechaEntrega instanceof Date ? v.fechaEntrega.toISOString() : undefined;

    this.ventas.crearPedido({
      clienteId: v.clienteId!,
      fecha,
      fechaEntrega,
      canalRecepcion: v.canalRecepcion!,
      observaciones: v.observaciones ?? '',
      detalles: v.detalles!.map((d) => ({
        productoId: d.productoId!,
        cantidad: d.cantidad!,
        precioUnitario: d.precioUnitario!,
      })),
    });

    this.dialogRef.close(true);
  }
}
