import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-registrar-compra',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    PageHeaderComponent,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Registrar compra"
      subtitle="Simule el ingreso de materias primas provenientes de un proveedor"
      icon="add_shopping_cart"
    />

    <mat-card class="form-card">
      <form [formGroup]="form" (ngSubmit)="registrar()">
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha de compra</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="fecha" />
            <mat-datepicker-toggle matIconSuffix [for]="picker" />
            <mat-datepicker #picker />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Proveedor</mat-label>
            <input matInput formControlName="proveedorNombre" placeholder="Nombre del proveedor" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>NIT (opcional)</mat-label>
            <input matInput formControlName="proveedorNit" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        <h3>Detalle de la compra</h3>
        <div formArrayName="detalles">
          @for (ctrl of detalles.controls; track $index; let i = $index) {
            <div [formGroupName]="i" class="detalle-row">
              <mat-form-field appearance="outline">
                <mat-label>Materia prima</mat-label>
                <mat-select formControlName="materiaPrimaId">
                  @for (m of materias; track m.id) {
                    <mat-option [value]="m.id">{{ m.nombre }} ({{ m.unidadMedida }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Cantidad</mat-label>
                <input matInput type="number" formControlName="cantidad" min="0.01" step="0.01" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Precio unitario</mat-label>
                <input matInput type="number" formControlName="precioUnitario" min="0" step="1" />
              </mat-form-field>

              <span class="subtotal">
                {{ subtotal(i) | monedaCo }}
              </span>

              <button mat-icon-button type="button" color="warn" (click)="quitarDetalle(i)">
                <mat-icon>remove_circle</mat-icon>
              </button>
            </div>
          }
        </div>

        <button mat-stroked-button type="button" (click)="agregarDetalle()">
          <mat-icon>add</mat-icon> Agregar línea
        </button>

        <div class="total">
          <strong>Total compra:</strong> {{ totalCompra() | monedaCo }}
        </div>

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || materias.length === 0">
            Registrar compra
          </button>
        </div>

        @if (materias.length === 0) {
          <p class="warn-text">Primero debe registrar materias primas antes de registrar compras.</p>
        }
      </form>
    </mat-card>
  `,
  styles: `
    .form-card { padding: 24px; }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .full-width { width: 100%; }
    h3 { margin: 24px 0 12px; color: #37474f; }
    .detalle-row {
      display: grid;
      grid-template-columns: 1fr 120px 140px 120px 48px;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
    }
    .subtotal { font-weight: 600; color: #3949ab; }
    .total { margin: 24px 0; font-size: 1.1rem; text-align: right; }
    .actions { display: flex; justify-content: flex-end; }
    .warn-text { color: #ef6c00; margin-top: 16px; }
    @media (max-width: 768px) {
      .detalle-row { grid-template-columns: 1fr; }
    }
  `,
})
export class RegistrarCompraComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly materias = this.inventario.getMateriasPrimas();

  readonly form = this.fb.group({
    fecha: [new Date(), Validators.required],
    proveedorNombre: ['', Validators.required],
    proveedorNit: [''],
    observaciones: [''],
    detalles: this.fb.array([this.crearDetalleGroup()]),
  });

  get detalles(): FormArray {
    return this.form.get('detalles') as FormArray;
  }

  crearDetalleGroup() {
    return this.fb.group({
      materiaPrimaId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.01)]],
      precioUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalleGroup());
  }

  quitarDetalle(index: number): void {
    if (this.detalles.length > 1) this.detalles.removeAt(index);
  }

  subtotal(index: number): number {
    const d = this.detalles.at(index).value;
    return (d.cantidad ?? 0) * (d.precioUnitario ?? 0);
  }

  totalCompra(): number {
    return this.detalles.controls.reduce((sum, _, i) => sum + this.subtotal(i), 0);
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const fecha = v.fecha instanceof Date ? v.fecha.toISOString() : new Date().toISOString();

    this.inventario.registrarCompra({
      fecha,
      proveedorNombre: v.proveedorNombre!,
      proveedorNit: v.proveedorNit ?? '',
      observaciones: v.observaciones ?? '',
      detalles: v.detalles!.map((d) => ({
        materiaPrimaId: d.materiaPrimaId!,
        cantidad: d.cantidad!,
        precioUnitario: d.precioUnitario!,
      })),
    });

    this.snackBar.open('Compra registrada. Inventario actualizado.', 'Cerrar', { duration: 4000 });
    this.router.navigate(['/inventarios/historial']);
  }
}
