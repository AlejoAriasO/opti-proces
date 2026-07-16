import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { MateriaPrima } from '../../../core/models';
import { NumeroCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';
import { MateriaPrimaFormDialogComponent } from './materia-prima-form.dialog';

@Component({
  selector: 'app-materias-primas',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule,
    MatCardModule,
    PageHeaderComponent,
    NumeroCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Materias primas"
      subtitle="Registre y administre las materias primas utilizadas en producción"
      icon="science"
    />

    <div class="toolbar">
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon>
        Nueva materia prima
      </button>
    </div>

    <mat-card>
      <table mat-table [dataSource]="materias()" class="full-width">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let row">{{ row.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="unidad">
          <th mat-header-cell *matHeaderCellDef>Unidad</th>
          <td mat-cell *matCellDef="let row">{{ row.unidadMedida }}</td>
        </ng-container>

        <ng-container matColumnDef="stock">
          <th mat-header-cell *matHeaderCellDef>Stock actual</th>
          <td mat-cell *matCellDef="let row">
            <span [class.bajo]="row.stockActual < row.stockMinimo">
              {{ row.stockActual | numeroCo:2 }} {{ row.unidadMedida }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="minimo">
          <th mat-header-cell *matHeaderCellDef>Stock mínimo</th>
          <td mat-cell *matCellDef="let row">{{ row.stockMinimo | numeroCo:2 }}</td>
        </ng-container>

        <ng-container matColumnDef="costo">
          <th mat-header-cell *matHeaderCellDef>Costo promedio</th>
          <td mat-cell *matCellDef="let row">{{ row.costoPromedio | monedaCo }}</td>
        </ng-container>

        <ng-container matColumnDef="estado">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let row">
            @if (row.stockActual < row.stockMinimo) {
              <mat-chip-set><mat-chip highlighted color="warn">Bajo stock</mat-chip></mat-chip-set>
            } @else {
              <mat-chip-set><mat-chip highlighted color="primary">Normal</mat-chip></mat-chip-set>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="abrirFormulario(row)" title="Editar">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="desactivar(row)" title="Desactivar">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (materias().length === 0) {
        <p class="empty">No hay materias primas registradas. Agregue la primera para comenzar.</p>
      }
    </mat-card>
  `,
  styles: `
    .toolbar { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .bajo { color: #c62828; font-weight: 600; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
  `,
})
export class MateriasPrimasComponent {
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['nombre', 'unidad', 'stock', 'minimo', 'costo', 'estado', 'acciones'];
  readonly materias = signal<MateriaPrima[]>([]);

  constructor() {
    this.recargar();
  }

  abrirFormulario(materia?: MateriaPrima): void {
    const ref = this.dialog.open(MateriaPrimaFormDialogComponent, {
      width: '480px',
      data: materia ?? null,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.recargar();
    });
  }

  desactivar(materia: MateriaPrima): void {
    if (confirm(`¿Desactivar "${materia.nombre}"?`)) {
      this.inventario.desactivarMateriaPrima(materia.id);
      this.recargar();
    }
  }

  private recargar(): void {
    this.materias.set(this.inventario.getMateriasPrimas());
  }
}
