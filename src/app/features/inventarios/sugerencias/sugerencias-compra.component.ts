import { Component, computed, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { SugerenciaCompra } from '../../../core/models';
import { NumeroCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';
import {
  GenerarOrdenCompraDialogComponent,
  GenerarOrdenCompraDialogData,
} from '../../proveedores/ordenes/generar-orden-compra.dialog';

@Component({
  selector: 'app-sugerencias-compra',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    RouterLink,
    PageHeaderComponent,
    NumeroCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Sugerencias de compra"
      subtitle="Considera stock mínimo y demanda de pedidos pendientes por fabricar"
      icon="lightbulb"
    />

    @if (sugerencias().length === 0) {
      <mat-card class="empty">
        <mat-icon>inventory</mat-icon>
        <p>No hay sugerencias de compra en este momento.</p>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="sugerencias()" class="full-width">
          <ng-container matColumnDef="materia">
            <th mat-header-cell *matHeaderCellDef>Materia prima</th>
            <td mat-cell *matCellDef="let row">{{ row.materiaPrimaNombre }}</td>
          </ng-container>

          <ng-container matColumnDef="stock">
            <th mat-header-cell *matHeaderCellDef>Stock actual</th>
            <td mat-cell *matCellDef="let row">
              {{ row.stockActual | numeroCo:2 }} {{ row.unidadMedida }}
            </td>
          </ng-container>

          <ng-container matColumnDef="pedidos">
            <th mat-header-cell *matHeaderCellDef>Demanda pedidos</th>
            <td mat-cell *matCellDef="let row">
              {{ row.cantidadPorPedidos | numeroCo:2 }} {{ row.unidadMedida }}
            </td>
          </ng-container>

          <ng-container matColumnDef="sugerida">
            <th mat-header-cell *matHeaderCellDef>Cantidad sugerida</th>
            <td mat-cell *matCellDef="let row">
              <strong>{{ row.cantidadSugerida | numeroCo:2 }} {{ row.unidadMedida }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="proveedor">
            <th mat-header-cell *matHeaderCellDef>Proveedor sugerido</th>
            <td mat-cell *matCellDef="let row">{{ row.proveedorSugeridoNombre ?? '—' }}</td>
          </ng-container>

          <ng-container matColumnDef="costo">
            <th mat-header-cell *matHeaderCellDef>Costo estimado</th>
            <td mat-cell *matCellDef="let row">
              {{ row.cantidadSugerida * row.costoPromedio | monedaCo }}
            </td>
          </ng-container>

          <ng-container matColumnDef="acciones">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let row">
              <button mat-stroked-button color="primary" (click)="generarOrden(row)">
                Generar orden
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="footer">
          <a mat-stroked-button routerLink="/proveedores/ordenes">
            <mat-icon>receipt_long</mat-icon>
            Ver órdenes de compra
          </a>
          <a mat-stroked-button routerLink="/inventarios/compras">
            <mat-icon>add_shopping_cart</mat-icon>
            Registrar compra manual
          </a>
        </div>
      </mat-card>
    }
  `,
  styles: `
    .full-width { width: 100%; }
    .empty {
      text-align: center;
      padding: 48px;
      color: #78909c;
    }
    .empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }
    .footer {
      padding: 24px;
      border-top: 1px solid #eceff1;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
  `,
})
export class SugerenciasCompraComponent {
  private readonly inventario = inject(InventarioService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly refresh = signal(0);

  readonly sugerencias = computed(() => {
    this.refresh();
    this.inventario.version();
    return this.inventario.getSugerenciasCompra();
  });

  readonly columns = ['materia', 'stock', 'pedidos', 'sugerida', 'proveedor', 'costo', 'acciones'];

  generarOrden(row: SugerenciaCompra): void {
    const data: GenerarOrdenCompraDialogData = {
      materiaPrimaId: row.materiaPrimaId,
      materiaPrimaNombre: row.materiaPrimaNombre,
      cantidadSugerida: row.cantidadSugerida,
      unidadMedida: row.unidadMedida,
    };

    this.dialog
      .open(GenerarOrdenCompraDialogComponent, { width: '420px', data })
      .afterClosed()
      .subscribe((orden) => {
        if (!orden) return;
        this.snackBar.open(
          `Orden #${orden.id.slice(0, 8)} creada correctamente.`,
          'Ver órdenes',
          { duration: 5000 }
        ).onAction().subscribe(() => this.router.navigate(['/proveedores/ordenes']));
        this.refresh.update((v) => v + 1);
      });
  }
}
