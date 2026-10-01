import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Proveedor } from '../../../core/models';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProveedorService } from '../../../core/services/proveedor.service';

@Component({
  selector: 'app-proveedor-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar' : 'Nuevo' }} proveedor</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>NIT</mat-label>
          <input matInput formControlName="nit" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo</mat-label>
          <input matInput type="email" formControlName="correo" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tiempo de entrega (días)</mat-label>
          <input matInput type="number" formControlName="tiempoEntregaDias" min="0" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        <h4>Materias primas que suministra</h4>
        @for (m of materias; track m.id) {
          <div class="materia-row">
            <mat-checkbox
              [checked]="materiasSeleccionadas.has(m.id)"
              (change)="toggleMateria(m.id, $event.checked)"
            >
              {{ m.nombre }} ({{ m.unidadMedida }})
            </mat-checkbox>
            @if (materiasSeleccionadas.has(m.id)) {
              <mat-form-field appearance="outline" class="precio-field">
                <mat-label>Precio</mat-label>
                <input
                  matInput
                  type="number"
                  [value]="precios.get(m.id) ?? 0"
                  (input)="setPrecio(m.id, $any($event.target).value)"
                  min="0"
                />
              </mat-form-field>
            }
          </div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `
    .form { min-width: 360px; padding-top: 8px; }
    .full-width { width: 100%; }
    h4 { margin: 16px 0 8px; color: #455a64; font-size: 0.9rem; }
    .materia-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .precio-field { width: 120px; }
  `,
})
export class ProveedorFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);
  private readonly dialogRef = inject(MatDialogRef<ProveedorFormDialogComponent>);
  readonly data = inject<Proveedor | null>(MAT_DIALOG_DATA);

  readonly materias = this.inventario.getMateriasPrimas();
  readonly esEdicion = !!this.data;
  materiasSeleccionadas = new Set(this.data?.materiasPrimasIds ?? []);
  precios = new Map(
    (this.data?.precios ?? []).map((p) => [p.materiaPrimaId, p.precio] as const)
  );

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    nit: [this.data?.nit ?? ''],
    telefono: [this.data?.telefono ?? ''],
    correo: [this.data?.correo ?? ''],
    direccion: [this.data?.direccion ?? ''],
    tiempoEntregaDias: [this.data?.tiempoEntregaDias ?? 3, [Validators.required, Validators.min(0)]],
    observaciones: [this.data?.observaciones ?? ''],
  });

  toggleMateria(id: string, checked: boolean): void {
    if (checked) {
      this.materiasSeleccionadas.add(id);
      if (!this.precios.has(id)) this.precios.set(id, 0);
    } else {
      this.materiasSeleccionadas.delete(id);
    }
  }

  setPrecio(materiaId: string, value: string): void {
    this.precios.set(materiaId, Number(value) || 0);
  }

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const materiasPrimasIds = [...this.materiasSeleccionadas];
    const precios = materiasPrimasIds.map((id) => ({
      materiaPrimaId: id,
      precio: this.precios.get(id) ?? 0,
    }));

    if (this.esEdicion && this.data) {
      this.proveedoresSvc.actualizarProveedor(this.data.id, {
        ...v,
        materiasPrimasIds,
        precios,
      });
    } else {
      this.proveedoresSvc.crearProveedor({ ...v, materiasPrimasIds, precios });
    }

    this.dialogRef.close(true);
  }
}
