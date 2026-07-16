import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MateriaPrima, UNIDADES_MEDIDA } from '../../../core/models';
import { InventarioService } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-materia-prima-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar' : 'Nueva' }} materia prima</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" placeholder="Ej: Surfactante aniónico" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Unidad de medida</mat-label>
          <mat-select formControlName="unidadMedida">
            @for (u of unidades; track u) {
              <mat-option [value]="u">{{ u }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Stock mínimo</mat-label>
          <input matInput type="number" formControlName="stockMinimo" min="0" step="0.01" />
        </mat-form-field>

        @if (!esEdicion) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Stock inicial (opcional)</mat-label>
            <input matInput type="number" formControlName="stockInicial" min="0" step="0.01" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Costo promedio inicial (opcional)</mat-label>
            <input matInput type="number" formControlName="costoPromedio" min="0" step="1" />
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form { display: flex; flex-direction: column; gap: 4px; min-width: 320px; padding-top: 8px; }
    .full-width { width: 100%; }
  `,
})
export class MateriaPrimaFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly dialogRef = inject(MatDialogRef<MateriaPrimaFormDialogComponent>);
  readonly data = inject<MateriaPrima | null>(MAT_DIALOG_DATA);

  readonly unidades = UNIDADES_MEDIDA;
  readonly esEdicion = !!this.data;

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    unidadMedida: [this.data?.unidadMedida ?? 'kg', Validators.required],
    stockMinimo: [this.data?.stockMinimo ?? 0, [Validators.required, Validators.min(0)]],
    stockInicial: [0],
    costoPromedio: [0],
  });

  guardar(): void {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();

    if (this.esEdicion && this.data) {
      this.inventario.actualizarMateriaPrima(this.data.id, {
        nombre: v.nombre,
        unidadMedida: v.unidadMedida,
        stockMinimo: v.stockMinimo,
      });
    } else {
      this.inventario.crearMateriaPrima({
        nombre: v.nombre,
        unidadMedida: v.unidadMedida,
        stockMinimo: v.stockMinimo,
        stockInicial: v.stockInicial,
        costoPromedio: v.costoPromedio,
      });
    }

    this.dialogRef.close(true);
  }
}
