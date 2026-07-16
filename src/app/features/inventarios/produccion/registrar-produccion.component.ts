import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-registrar-produccion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatListModule,
    PageHeaderComponent,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Registrar producción"
      subtitle="Produzca productos terminados descontando automáticamente las materias primas según la receta"
      icon="precision_manufacturing"
    />

    <mat-card class="form-card">
      <form [formGroup]="form" (ngSubmit)="registrar()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Producto a producir</mat-label>
          <mat-select formControlName="productoId" (selectionChange)="mostrarReceta()">
            @for (p of productosConReceta; track p.id) {
              <mat-option [value]="p.id">
                {{ p.nombre }} — {{ p.presentacion }} (Stock: {{ p.stockActual | numeroCo:0 }})
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (productosConReceta.length === 0) {
          <p class="warn">No hay productos con receta configurada. Configure una receta primero.</p>
        }

        @if (recetaPreview.length > 0) {
          <div class="preview">
            <h4>Consumo estimado por unidad</h4>
            <mat-list>
              @for (item of recetaPreview; track item.nombre) {
                <mat-list-item>
                  <span matListItemTitle>{{ item.nombre }}</span>
                  <span matListItemLine>{{ item.cantidad | numeroCo:3 }} {{ item.unidad }} por unidad</span>
                </mat-list-item>
              }
            </mat-list>
          </div>
        }

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Cantidad a producir (unidades)</mat-label>
          <input matInput type="number" formControlName="cantidad" min="1" step="1" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <div class="actions">
          <button
            mat-flat-button
            color="primary"
            type="submit"
            [disabled]="form.invalid || productosConReceta.length === 0"
          >
            Registrar producción
          </button>
        </div>
      </form>
    </mat-card>
  `,
  styles: `
    .form-card { padding: 24px; max-width: 600px; }
    .full-width { width: 100%; }
    .preview {
      background: #e8eaf6;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .preview h4 { margin: 0 0 8px; color: #3949ab; }
    .warn { color: #ef6c00; }
    .error { color: #c62828; white-space: pre-line; }
    .actions { display: flex; justify-content: flex-end; margin-top: 16px; }
  `,
})
export class RegistrarProduccionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly productosConReceta = this.inventario
    .getProductosTerminados()
    .filter((p) => !!this.inventario.getRecetaByProductoId(p.id));

  recetaPreview: { nombre: string; cantidad: number; unidad: string }[] = [];
  error = '';

  readonly form = this.fb.nonNullable.group({
    productoId: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    observaciones: [''],
  });

  mostrarReceta(): void {
    const id = this.form.value.productoId;
    const receta = id ? this.inventario.getRecetaByProductoId(id) : null;
    this.recetaPreview =
      receta?.ingredientes.map((ing) => {
        const m = this.inventario.getMateriaPrimaById(ing.materiaPrimaId)!;
        return { nombre: m.nombre, cantidad: ing.cantidad, unidad: m.unidadMedida };
      }) ?? [];
  }

  registrar(): void {
    if (this.form.invalid) return;
    this.error = '';

    const result = this.inventario.registrarProduccion(this.form.getRawValue());

    if (result.ok) {
      this.snackBar.open('Producción registrada. Inventarios actualizados.', 'Cerrar', { duration: 4000 });
      this.router.navigate(['/inventarios/historial']);
    } else {
      this.error = result.error ?? 'Error al registrar producción';
    }
  }
}
