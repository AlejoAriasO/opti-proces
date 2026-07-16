import { Component, computed, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { InventarioService } from '../../../core/services/inventario.service';
import { NumeroCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-sugerencias-compra',
  standalone: true,
  imports: [
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    PageHeaderComponent,
    NumeroCoPipe,
    MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Sugerencias de compra"
      subtitle="Cantidades sugeridas para reponer materias primas bajo el nivel mínimo"
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

          <ng-container matColumnDef="minimo">
            <th mat-header-cell *matHeaderCellDef>Stock mínimo</th>
            <td mat-cell *matCellDef="let row">
              {{ row.stockMinimo | numeroCo:2 }} {{ row.unidadMedida }}
            </td>
          </ng-container>

          <ng-container matColumnDef="sugerida">
            <th mat-header-cell *matHeaderCellDef>Cantidad sugerida</th>
            <td mat-cell *matCellDef="let row">
              <strong>{{ row.cantidadSugerida | numeroCo:2 }} {{ row.unidadMedida }}</strong>
            </td>
          </ng-container>

          <ng-container matColumnDef="costo">
            <th mat-header-cell *matHeaderCellDef>Costo estimado</th>
            <td mat-cell *matCellDef="let row">
              {{ row.cantidadSugerida * row.costoPromedio | monedaCo }}
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>

        <div class="footer">
          <a mat-flat-button color="primary" routerLink="/inventarios/compras">
            <mat-icon>add_shopping_cart</mat-icon>
            Registrar compra
          </a>
          <p class="note">
            En una fase posterior, el módulo de proveedores generará órdenes de compra a partir de estas sugerencias.
          </p>
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
    }
    .note {
      margin: 12px 0 0;
      font-size: 0.85rem;
      color: #90a4ae;
    }
  `,
})
export class SugerenciasCompraComponent {
  private readonly inventario = inject(InventarioService);
  readonly sugerencias = computed(() => {
    this.inventario.version();
    return this.inventario.getSugerenciasCompra();
  });
  readonly columns = ['materia', 'stock', 'minimo', 'sugerida', 'costo'];
}
