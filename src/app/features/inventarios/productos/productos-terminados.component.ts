import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { ProductoTerminado } from '../../../core/models';
import { NumeroCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';
import { ProductoFormDialogComponent } from './producto-form.dialog';

@Component({
  selector: 'app-productos-terminados',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    PageHeaderComponent,
    NumeroCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Productos terminados"
      subtitle="Consulte existencias y registre productos para asociar recetas de producción"
      icon="local_shipping"
    />

    <div class="toolbar">
      <button mat-flat-button color="primary" (click)="abrirFormulario()">
        <mat-icon>add</mat-icon>
        Nuevo producto
      </button>
    </div>

    <mat-card>
      <table mat-table [dataSource]="productos()" class="full-width">
        <ng-container matColumnDef="nombre">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let row">{{ row.nombre }}</td>
        </ng-container>

        <ng-container matColumnDef="presentacion">
          <th mat-header-cell *matHeaderCellDef>Presentación</th>
          <td mat-cell *matCellDef="let row">{{ row.presentacion }}</td>
        </ng-container>

        <ng-container matColumnDef="stock">
          <th mat-header-cell *matHeaderCellDef>Stock actual</th>
          <td mat-cell *matCellDef="let row">{{ row.stockActual | numeroCo:0 }} unidades</td>
        </ng-container>

        <ng-container matColumnDef="precio">
          <th mat-header-cell *matHeaderCellDef>Precio</th>
          <td mat-cell *matCellDef="let row">{{ row.precio | monedaCo }}</td>
        </ng-container>

        <ng-container matColumnDef="receta">
          <th mat-header-cell *matHeaderCellDef>Receta</th>
          <td mat-cell *matCellDef="let row">
            @if (tieneReceta(row.id)) {
              <mat-chip-set><mat-chip highlighted color="primary">Configurada</mat-chip></mat-chip-set>
            } @else {
              <mat-chip-set><mat-chip>Sin receta</mat-chip></mat-chip-set>
            }
          </td>
        </ng-container>

        <ng-container matColumnDef="acciones">
          <th mat-header-cell *matHeaderCellDef>Acciones</th>
          <td mat-cell *matCellDef="let row">
            <button mat-icon-button (click)="abrirFormulario(row)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button color="warn" (click)="desactivar(row)"><mat-icon>delete</mat-icon></button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>

      @if (productos().length === 0) {
        <p class="empty">No hay productos terminados registrados.</p>
      }
    </mat-card>
  `,
  styles: `
    .toolbar { margin-bottom: 16px; }
    .full-width { width: 100%; }
    .empty { padding: 32px; text-align: center; color: #78909c; }
  `,
})
export class ProductosTerminadosComponent {
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);

  readonly columns = ['nombre', 'presentacion', 'stock', 'precio', 'receta', 'acciones'];
  readonly productos = signal<ProductoTerminado[]>([]);

  constructor() {
    this.recargar();
  }

  tieneReceta(productoId: string): boolean {
    return !!this.inventario.getRecetaByProductoId(productoId);
  }

  abrirFormulario(producto?: ProductoTerminado): void {
    const ref = this.dialog.open(ProductoFormDialogComponent, {
      width: '480px',
      data: producto ?? null,
    });
    ref.afterClosed().subscribe((r) => r && this.recargar());
  }

  desactivar(producto: ProductoTerminado): void {
    if (confirm(`¿Desactivar "${producto.nombre}"?`)) {
      this.inventario.desactivarProductoTerminado(producto.id);
      this.recargar();
    }
  }

  private recargar(): void {
    this.productos.set(this.inventario.getProductosTerminados());
  }
}
