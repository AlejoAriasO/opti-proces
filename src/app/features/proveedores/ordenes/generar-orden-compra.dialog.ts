import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

export interface GenerarOrdenCompraDialogData {
  materiaPrimaId: string;
  materiaPrimaNombre: string;
  cantidadSugerida: number;
  unidadMedida: string;
}

@Component({
  selector: 'app-generar-orden-compra-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    NumeroCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <h2 mat-dialog-title>Generar orden de compra</h2>
    <mat-dialog-content>
      <p class="materia-info">
        <strong>{{ data.materiaPrimaNombre }}</strong>
      </p>

      @if (proveedores.length === 0) {
        <p class="warn">
          No hay proveedores registrados que suministren esta materia prima.
          Asóciela a un proveedor en la lista de proveedores.
        </p>
      } @else {
        <form [formGroup]="form" class="form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Proveedor</mat-label>
            <mat-select formControlName="proveedorId">
              @for (p of proveedores; track p.id) {
                <mat-option [value]="p.id">
                  {{ p.nombre }}
                  @if (precioProveedor(p.id); as precio) {
                    — {{ precio | monedaCo }}/{{ data.unidadMedida }}
                  }
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Cantidad a pedir ({{ data.unidadMedida }})</mat-label>
            <input matInput type="number" formControlName="cantidad" min="0.01" step="0.01" />
            <mat-hint>Sugerida por el sistema: {{ data.cantidadSugerida | numeroCo:2 }} {{ data.unidadMedida }}</mat-hint>
          </mat-form-field>

          @if (precioSeleccionado() != null) {
            <p class="total-est">
              Total estimado: {{ totalEstimado() | monedaCo }}
            </p>
          }

          @if (proveedores.length === 1) {
            <p class="hint">Solo hay un proveedor disponible para esta materia prima.</p>
          }
        </form>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      @if (proveedores.length === 0) {
        <a mat-flat-button color="primary" routerLink="/proveedores/lista" mat-dialog-close>
          Ir a proveedores
        </a>
      } @else {
        <button mat-flat-button color="primary" (click)="generar()" [disabled]="form.invalid">
          Generar orden
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: `
    .materia-info { margin: 0 0 16px; color: #37474f; }
    .form { min-width: 340px; padding-top: 4px; }
    .full-width { width: 100%; }
    .warn { color: #ef6c00; font-size: 0.9rem; }
    .hint { color: #78909c; font-size: 0.85rem; margin: 0; }
    .total-est { font-weight: 600; color: #3949ab; margin: 0 0 8px; }
  `,
})
export class GenerarOrdenCompraDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);
  private readonly dialogRef = inject(MatDialogRef<GenerarOrdenCompraDialogComponent>);
  readonly data = inject<GenerarOrdenCompraDialogData>(MAT_DIALOG_DATA);

  readonly proveedores = this.proveedoresSvc.getProveedoresPorMateria(this.data.materiaPrimaId);

  readonly form = this.fb.group({
    proveedorId: [
      this.proveedores.length === 1 ? this.proveedores[0].id : '',
      Validators.required,
    ],
    cantidad: [
      this.data.cantidadSugerida,
      [Validators.required, Validators.min(0.01)],
    ],
  });

  precioProveedor(proveedorId: string): number | undefined {
    return this.proveedoresSvc.getPrecioProveedor(proveedorId, this.data.materiaPrimaId);
  }

  precioSeleccionado(): number | null {
    const proveedorId = this.form.value.proveedorId;
    if (!proveedorId) return null;
    const precioProveedor = this.precioProveedor(proveedorId);
    if (precioProveedor != null) return precioProveedor;
    return this.inventario.getMateriaPrimaById(this.data.materiaPrimaId)?.costoPromedio ?? null;
  }

  totalEstimado(): number {
    const cantidad = this.form.value.cantidad ?? 0;
    const precio = this.precioSeleccionado();
    if (precio == null) return 0;
    return cantidad * precio;
  }

  generar(): void {
    if (this.form.invalid) return;

    const orden = this.proveedoresSvc.crearOrdenDesdeMateria(
      this.form.value.proveedorId!,
      this.data.materiaPrimaId,
      this.form.value.cantidad!
    );

    if (!orden) return;

    this.dialogRef.close(orden);
  }
}
