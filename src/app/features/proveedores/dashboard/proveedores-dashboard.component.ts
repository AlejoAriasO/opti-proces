import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { ProveedorService } from '../../../core/services/proveedor.service';
import { InventarioService } from '../../../core/services/inventario.service';

@Component({
  selector: 'app-proveedores-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, PageHeaderComponent],
  template: `
    <app-page-header
      title="Proveedores"
      subtitle="Gestión de proveedores, órdenes de compra e historial de abastecimiento"
      icon="store"
    />

    <div class="stats">
      <mat-card class="stat-card">
        <mat-icon>store</mat-icon>
        <div class="stat-value">{{ proveedores().length }}</div>
        <div class="stat-label">Proveedores activos</div>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>pending_actions</mat-icon>
        <div class="stat-value">{{ ordenesPendientes() }}</div>
        <div class="stat-label">Órdenes pendientes</div>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>shopping_cart</mat-icon>
        <div class="stat-value">{{ comprasRecientes() }}</div>
        <div class="stat-label">Compras registradas</div>
      </mat-card>
    </div>

    <div class="links">
      <a mat-stroked-button routerLink="/proveedores/lista">
        <mat-icon>list</mat-icon> Ver proveedores
      </a>
      <a mat-stroked-button routerLink="/proveedores/ordenes">
        <mat-icon>receipt_long</mat-icon> Órdenes de compra
      </a>
      <a mat-stroked-button routerLink="/proveedores/historial">
        <mat-icon>history</mat-icon> Historial de compras
      </a>
      <a mat-flat-button color="primary" routerLink="/inventarios/sugerencias">
        <mat-icon>lightbulb</mat-icon> Ver sugerencias de inventario
      </a>
    </div>
  `,
  styles: `
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      text-align: center;
      padding: 20px 16px;
    }
    .stat-card mat-icon {
      color: #3949ab;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      color: #263238;
      margin: 8px 0 4px;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #78909c;
    }
    .links {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ProveedoresDashboardComponent {
  private readonly proveedoresSvc = inject(ProveedorService);
  private readonly inventario = inject(InventarioService);

  readonly proveedores = computed(() => {
    this.proveedoresSvc.version();
    return this.proveedoresSvc.getProveedores();
  });

  readonly ordenesPendientes = computed(() => {
    this.proveedoresSvc.version();
    return this.proveedoresSvc
      .getOrdenesCompra()
      .filter((o) => o.estado === 'pendiente' || o.estado === 'enviada').length;
  });

  readonly comprasRecientes = computed(() => {
    this.inventario.version();
    return this.inventario.getCompras().length;
  });
}
