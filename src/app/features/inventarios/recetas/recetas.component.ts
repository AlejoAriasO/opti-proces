import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { Receta } from '../../../core/models';
import { NumeroCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    NumeroCoPipe,
  ],
  template: `
    <app-page-header
      title="Recetas de producción"
      subtitle="Defina la fórmula de materias primas por unidad de producto terminado"
      icon="receipt_long"
    />

    <mat-card class="form-card">
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Producto terminado</mat-label>
          <mat-select formControlName="productoId" (selectionChange)="cargarReceta()">
            @for (p of productos; track p.id) {
              <mat-option [value]="p.id">{{ p.nombre }} — {{ p.presentacion }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        @if (form.value.productoId) {
          <p class="hint">
            Cantidades por <strong>1 unidad</strong> de producto terminado.
          </p>

          <div formArrayName="ingredientes" class="ingredientes">
            @for (ctrl of ingredientes.controls; track $index; let i = $index) {
              <div [formGroupName]="i" class="ingrediente-row">
                <mat-form-field appearance="outline">
                  <mat-label>Materia prima</mat-label>
                  <mat-select formControlName="materiaPrimaId">
                    @for (m of materias; track m.id) {
                      <mat-option [value]="m.id">
                        {{ m.nombre }} ({{ m.unidadMedida }})
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cantidad</mat-label>
                  <input matInput type="number" formControlName="cantidad" min="0" step="0.001" />
                </mat-form-field>

                <button mat-icon-button type="button" color="warn" (click)="quitarIngrediente(i)">
                  <mat-icon>remove_circle</mat-icon>
                </button>
              </div>
            }
          </div>

          <button mat-stroked-button type="button" (click)="agregarIngrediente()">
            <mat-icon>add</mat-icon> Agregar ingrediente
          </button>

          <div class="actions">
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
              Guardar receta
            </button>
          </div>
        }
      </form>
    </mat-card>

    @if (recetas().length > 0) {
      <h3 class="section-title">Recetas configuradas</h3>
      @for (receta of recetas(); track receta.id) {
        <mat-card class="receta-card">
          <h4>{{ nombreProducto(receta.productoId) }}</h4>
          <ul>
            @for (ing of receta.ingredientes; track ing.materiaPrimaId) {
              <li>
                {{ nombreMateria(ing.materiaPrimaId) }}:
                {{ ing.cantidad | numeroCo:3 }}
                {{ unidadMateria(ing.materiaPrimaId) }}
              </li>
            }
          </ul>
        </mat-card>
      }
    }
  `,
  styles: `
    .form-card { padding: 24px; margin-bottom: 24px; }
    .full-width { width: 100%; }
    .hint { color: #546e7a; margin: 0 0 16px; }
    .ingredientes { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .ingrediente-row {
      display: grid;
      grid-template-columns: 1fr 140px 48px;
      gap: 12px;
      align-items: center;
    }
    .actions { margin-top: 24px; }
    .section-title { margin: 24px 0 12px; color: #37474f; }
    .receta-card { padding: 16px; margin-bottom: 12px; }
    .receta-card h4 { margin: 0 0 8px; color: #1a237e; }
    .receta-card ul { margin: 0; padding-left: 20px; color: #546e7a; }
  `,
})
export class RecetasComponent {
  private readonly fb = inject(FormBuilder);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);

  readonly productos = this.inventario.getProductosTerminados();
  readonly materias = this.inventario.getMateriasPrimas();
  readonly recetas = signal<Receta[]>([]);

  constructor() {
    this.recargarRecetas();
  }

  readonly form = this.fb.group({
    productoId: ['', Validators.required],
    ingredientes: this.fb.array([this.crearIngredienteGroup()]),
  });

  get ingredientes(): FormArray {
    return this.form.get('ingredientes') as FormArray;
  }

  crearIngredienteGroup() {
    return this.fb.group({
      materiaPrimaId: ['', Validators.required],
      cantidad: [0, [Validators.required, Validators.min(0.001)]],
    });
  }

  agregarIngrediente(): void {
    this.ingredientes.push(this.crearIngredienteGroup());
  }

  quitarIngrediente(index: number): void {
    if (this.ingredientes.length > 1) {
      this.ingredientes.removeAt(index);
    }
  }

  cargarReceta(): void {
    const productoId = this.form.value.productoId;
    if (!productoId) return;

    const receta = this.inventario.getRecetaByProductoId(productoId);
    this.ingredientes.clear();

    if (receta && receta.ingredientes.length > 0) {
      for (const ing of receta.ingredientes) {
        this.ingredientes.push(
          this.fb.group({
            materiaPrimaId: [ing.materiaPrimaId, Validators.required],
            cantidad: [ing.cantidad, [Validators.required, Validators.min(0.001)]],
          })
        );
      }
    } else {
      this.ingredientes.push(this.crearIngredienteGroup());
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.inventario.guardarReceta(
      v.productoId!,
      v.ingredientes!.map((i) => ({
        materiaPrimaId: i.materiaPrimaId!,
        cantidad: i.cantidad!,
      }))
    );

    this.snackBar.open('Receta guardada correctamente', 'Cerrar', { duration: 3000 });
    this.recargarRecetas();
  }

  private recargarRecetas(): void {
    this.recetas.set(this.inventario.getRecetas());
  }

  nombreProducto(id: string): string {
    return this.inventario.getProductoById(id)?.nombre ?? '—';
  }

  nombreMateria(id: string): string {
    return this.inventario.getMateriaPrimaById(id)?.nombre ?? '—';
  }

  unidadMateria(id: string): string {
    return this.inventario.getMateriaPrimaById(id)?.unidadMedida ?? '';
  }
}
