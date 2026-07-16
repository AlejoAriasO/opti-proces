import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductoTerminado } from '../../../core/models';
import { InventarioService } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-producto-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar' : 'Nuevo' }} producto terminado</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Detergente líquido" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Presentación</mat-label>
          <input matInput formControlName="presentacion" placeholder="Ej: Botella 1 L" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Precio de venta</mat-label>
          <input matInput type="number" formControlName="precio" min="0" step="1" />
        </mat-form-field>

        @if (!esEdicion) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Stock inicial (opcional)</mat-label>
            <input matInput type="number" formControlName="stockInicial" min="0" step="1" />
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .form { display: flex; flex-direction: column; min-width: 320px; padding-top: 8px; }
    .full-width { width: 100%; }
  `,
})
export class ProductoFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly dialogRef = inject(MatDialogRef<ProductoFormDialogComponent>);
  readonly data = inject<ProductoTerminado | null>(MAT_DIALOG_DATA);

  readonly esEdicion = !!this.data;

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    presentacion: [this.data?.presentacion ?? '', Validators.required],
    precio: [this.data?.precio ?? 0, [Validators.required, Validators.min(0)]],
    stockInicial: [0],
  });

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    if (this.esEdicion && this.data) {
      this.inventario.actualizarProductoTerminado(this.data.id, {
        nombre: v.nombre,
        presentacion: v.presentacion,
        precio: v.precio,
      });
    } else {
      this.inventario.crearProductoTerminado(v);
    }

    this.dialogRef.close(true);
  }
}
