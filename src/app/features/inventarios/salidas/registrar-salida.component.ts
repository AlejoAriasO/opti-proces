import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-registrar-salida',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    PageHeaderComponent,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Registrar salida manual"
      subtitle="Registre consumos o salidas de materias primas no asociadas a producción por receta"
      icon="output"
    />

    <mat-card class="form-card">
      <form [formGroup]="form" (ngSubmit)="registrar()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Materia prima</mat-label>
          <mat-select formControlName="materiaPrimaId" (selectionChange)="actualizarStock()">
            @for (m of materias; track m.id) {
              <mat-option [value]="m.id">
                {{ m.nombre }} — Disponible: {{ m.stockActual | numeroCo:2 }} {{ m.unidadMedida }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (stockDisponible !== null) {
          <p class="stock-info">Stock disponible: <strong>{{ stockDisponible | numeroCo:2 }} {{ unidadActual }}</strong></p>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad a retirar</mat-label>
          <input matInput type="number" formControlName="cantidad" min="0.01" step="0.01" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="3" placeholder="Motivo de la salida"></textarea>
        </mat-form-field>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || materias.length === 0">
            Registrar salida
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: `
    .form-card { padding: 24px; max-width: 560px; }
    .full-width { width: 100%; }
    .stock-info { color: #546e7a; margin: 0 0 16px; }
    .error { color: #c62828; white-space: pre-line; }
    .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
  `,
})
export class RegistrarSalidaComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly materias = this.inventario.getMateriasPrimas();
  stockDisponible: number | null = null;
  unidadActual = '';
  error = '';

  readonly form = this.fb.nonNullable.group({
    materiaPrimaId: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(0.01)]],
    observaciones: [''],
  });

  actualizarStock(): void {
    const id = this.form.value.materiaPrimaId;
    const materia = id ? this.inventario.getMateriaPrimaById(id) : null;
    this.stockDisponible = materia?.stockActual ?? null;
    this.unidadActual = materia?.unidadMedida ?? '';
  }

  registrar(): void {
    if (this.form.invalid) return;
    this.error = '';

    const v = this.form.getRawValue();
    const result = this.inventario.registrarSalidaManual(v);

    if (result.ok) {
      this.snackBar.open('Salida registrada correctamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/inventarios/historial']);
    } else {
      this.error = result.error ?? 'Error al registrar salida';
    }
  }
}
