import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-ventas-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatButtonModule, RouterLink, PageHeaderComponent, MonedaCoPipe],
  template: `
    <app-page-header
      title="Ventas"
      subtitle="Pedidos de clientes, facturación y control de cartera"
      icon="point_of_sale"
    />

    <div class="stats">
      <mat-card class="stat-card">
        <mat-icon>people</mat-icon>
        <div class="stat-value">{{ clientes().length }}</div>
        <div class="stat-label">Clientes activos</div>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>pending</mat-icon>
        <div class="stat-value">{{ pedidosPendientes().length }}</div>
        <div class="stat-label">Pedidos pendientes</div>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>account_balance_wallet</mat-icon>
        <div class="stat-value">{{ saldoCartera() | monedaCo }}</div>
        <div class="stat-label">Cartera pendiente</div>
      </mat-card>
      <mat-card class="stat-card">
        <mat-icon>warning</mat-icon>
        <div class="stat-value">{{ alertasCartera().length }}</div>
        <div class="stat-label">Alertas de vencimiento</div>
      </mat-card>
    </div>

    <div class="links">
      <a mat-stroked-button routerLink="/ventas/clientes"><mat-icon>people</mat-icon> Clientes</a>
      <a mat-stroked-button routerLink="/ventas/pedidos"><mat-icon>shopping_bag</mat-icon> Pedidos</a>
      <a mat-stroked-button routerLink="/ventas/consolidar"><mat-icon>precision_manufacturing</mat-icon> Consolidar producción</a>
      <a mat-stroked-button routerLink="/ventas/facturacion"><mat-icon>receipt</mat-icon> Facturación</a>
      <a mat-stroked-button routerLink="/ventas/cartera"><mat-icon>payments</mat-icon> Cartera</a>
      <a mat-flat-button color="primary" routerLink="/ventas/alertas-cartera">
        <mat-icon>notifications</mat-icon> Alertas cartera
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
    .stat-card { text-align: center; padding: 20px 16px; }
    .stat-card mat-icon { color: #3949ab; font-size: 28px; width: 28px; height: 28px; }
    .stat-value { font-size: 1.75rem; font-weight: 600; color: #263238; margin: 8px 0 4px; }
    .stat-label { font-size: 0.85rem; color: #78909c; }
    .links { display: flex; flex-wrap: wrap; gap: 12px; }
  `,
})
export class VentasDashboardComponent {
  private readonly ventas = inject(VentasService);

  readonly clientes = computed(() => { this.ventas.version(); return this.ventas.getClientes(); });
  readonly pedidosPendientes = computed(() => { this.ventas.version(); return this.ventas.getPedidosPendientesProduccion(); });
  readonly saldoCartera = computed(() => {
    this.ventas.version();
    return this.ventas.getCarteraPendiente().reduce((s, c) => s + c.saldoPendiente, 0);
  });
  readonly alertasCartera = computed(() => { this.ventas.version(); return this.ventas.getAlertasCartera(); });
}
