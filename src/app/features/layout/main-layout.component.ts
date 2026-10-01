import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { InventarioService } from '../../core/services/inventario.service';
import { VentasService } from '../../core/services/ventas.service';

interface NavChild {
  label: string;
  icon: string;
  route: string;
  soon?: boolean;
}

interface NavModule {
  id: string;
  label: string;
  icon: string;
  soon?: boolean;
  children: NavChild[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidenav"
      >
        <div class="sidenav-header">
          <mat-icon>inventory_2</mat-icon>
          <div>
            <strong>Opti-Proces</strong>
            <small>Gestión administrativa</small>
          </div>
        </div>

        <mat-nav-list class="nav-list">
          @for (module of navModules; track module.id) {
            <button
              mat-list-item
              type="button"
              class="module-header"
              (click)="toggleModule(module.id)"
            >
              <mat-icon matListItemIcon>{{ module.icon }}</mat-icon>
              <span matListItemTitle>{{ module.label }}</span>
              @if (module.soon) {
                <span matListItemMeta class="soon">Próximamente</span>
              }
            </button>

            @if (isExpanded(module.id)) {
              <div class="sub-items-group">
                @for (child of module.children; track child.route) {
                  <a
                    mat-list-item
                    class="sub-item"
                    [routerLink]="child.route"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: child.route === '/inventarios' || child.route === '/proveedores' || child.route === '/ventas' }"
                  >
                    <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                    <span matListItemTitle>{{ child.label }}</span>
                    @if (child.soon) {
                      <span matListItemMeta class="soon">Próximamente</span>
                    }
                  </a>
                }
              </div>
            }
          }

          <div class="nav-divider"></div>

          <a
            mat-list-item
            class="alertas-item"
            routerLink="/inventarios/alertas"
            routerLinkActive="active"
          >
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Alertas inventario</span>
            @if (alertasInventarioCount() > 0) {
              <span matListItemMeta class="badge-count">{{ alertasInventarioCount() }}</span>
            }
          </a>

          <a
            mat-list-item
            class="alertas-item"
            routerLink="/ventas/alertas-cartera"
            routerLinkActive="active"
          >
            <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
            <span matListItemTitle>Alertas cartera</span>
            @if (alertasCarteraCount() > 0) {
              <span matListItemMeta class="badge-count">{{ alertasCarteraCount() }}</span>
            }
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="toolbar">
          @if (isMobile()) {
            <button mat-icon-button (click)="sidenav.toggle()">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <span class="toolbar-title">Industrias Arias JF SAS</span>
          <span class="spacer"></span>

          @if (totalAlertas() > 0) {
            <a mat-icon-button routerLink="/inventarios/alertas">
              <mat-icon [matBadge]="totalAlertas()" matBadgeColor="warn">notifications</mat-icon>
            </a>
          }

          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ auth.sesion?.nombre }}
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item (click)="auth.logout()">
              <mat-icon>logout</mat-icon>
              Cerrar sesión
            </button>
          </mat-menu>
        </mat-toolbar>

        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .layout-container {
      height: 100vh;
    }
    .sidenav {
      width: 252px;
      border-right: 1px solid #e8eaf0;
      overflow-x: hidden;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      background: #1a237e;
      color: white;
    }
    .sidenav-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }
    .sidenav-header strong {
      display: block;
      font-size: 1.1rem;
    }
    .sidenav-header small {
      opacity: 0.8;
      font-size: 0.75rem;
    }
    .nav-list {
      padding: 4px 10px 8px;
      overflow-x: hidden;
    }
    .nav-list .mat-mdc-list-item {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      --mdc-list-list-item-one-line-container-height: 32px;
      --mdc-list-list-item-label-text-size: 0.8125rem;
      --mdc-list-list-item-hover-state-layer-opacity: 0.04;
      padding-inline: 8px !important;
    }
    .nav-list .mat-mdc-list-item [matListItemTitle] {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .module-header {
      font-weight: 500;
      font-size: 0.8125rem;
      color: #455a64;
      height: 32px !important;
      min-height: 32px !important;
      margin-bottom: 2px;
      border-radius: 6px;
    }
    .module-header mat-icon[matListItemIcon] {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .module-header:hover {
      background: rgba(0, 0, 0, 0.03);
    }
    .sub-items-group {
      margin: 0 0 4px 10px;
      padding-left: 6px;
      border-left: 1px solid #eceff1;
      overflow: hidden;
    }
    .sub-item {
      --mdc-list-list-item-leading-icon-size: 16px;
      --mdc-list-list-item-one-line-container-height: 30px;
      height: 30px !important;
      min-height: 30px !important;
      font-size: 0.78rem;
      border-radius: 5px;
      margin-bottom: 1px;
      padding-inline: 6px !important;
    }
    .sub-item mat-icon[matListItemIcon] {
      font-size: 16px;
      width: 16px;
      height: 16px;
      opacity: 0.7;
    }
    .nav-divider {
      height: 1px;
      background: #eceff1;
      margin: 6px 4px;
    }
    .alertas-item {
      height: 32px !important;
      min-height: 32px !important;
      font-size: 0.8125rem;
      border-radius: 6px;
    }
    .alertas-item mat-icon[matListItemIcon] {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #ef6c00;
      opacity: 0.85;
    }
    .active {
      background: rgba(57, 73, 171, 0.06) !important;
      color: #3949ab;
    }
    .sub-item.active {
      box-shadow: inset 2px 0 0 #7986cb;
    }
    .soon {
      font-size: 0.6rem;
      color: #90a4ae;
      white-space: nowrap;
    }
    .badge-count {
      background: #c62828;
      color: white;
      border-radius: 10px;
      padding: 1px 6px;
      font-size: 0.68rem;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .toolbar-title {
      font-size: 1rem;
    }
    .spacer {
      flex: 1;
    }
    .content {
      padding: 24px;
      background: #f5f7fa;
      min-height: calc(100vh - 64px);
    }
    mat-nav-list a mat-icon,
    mat-nav-list button mat-icon {
      color: #546e7a;
    }
    .active mat-icon {
      color: #3949ab;
    }
  `,
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly inventario = inject(InventarioService);
  private readonly ventas = inject(VentasService);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly router = inject(Router);

  readonly isMobile = toSignal(
    this.breakpoint.observe([Breakpoints.Handset]).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly alertasInventarioCount = computed(() => {
    this.inventario.version();
    return this.inventario.getAlertas().length;
  });

  readonly alertasCarteraCount = computed(() => {
    this.ventas.version();
    return this.ventas.getAlertasCartera().length;
  });

  readonly totalAlertas = computed(
    () => this.alertasInventarioCount() + this.alertasCarteraCount()
  );

  readonly expandedModules = signal<Set<string>>(new Set(['inventarios']));

  readonly navModules: NavModule[] = [
    {
      id: 'inventarios',
      label: 'Inventarios',
      icon: 'inventory_2',
      children: [
        { label: 'Resumen', icon: 'dashboard', route: '/inventarios' },
        { label: 'Materias primas', icon: 'science', route: '/inventarios/materias-primas' },
        { label: 'Productos terminados', icon: 'local_shipping', route: '/inventarios/productos' },
        { label: 'Recetas', icon: 'receipt_long', route: '/inventarios/recetas' },
        { label: 'Registrar compra', icon: 'add_shopping_cart', route: '/inventarios/compras' },
        { label: 'Registrar salida', icon: 'output', route: '/inventarios/salidas' },
        { label: 'Producción', icon: 'precision_manufacturing', route: '/inventarios/produccion' },
        { label: 'Sugerencias de compra', icon: 'lightbulb', route: '/inventarios/sugerencias' },
        { label: 'Historial', icon: 'history', route: '/inventarios/historial' },
      ],
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: 'store',
      children: [
        { label: 'Resumen', icon: 'dashboard', route: '/proveedores' },
        { label: 'Lista de proveedores', icon: 'list', route: '/proveedores/lista' },
        { label: 'Órdenes de compra', icon: 'receipt_long', route: '/proveedores/ordenes' },
        { label: 'Historial de compras', icon: 'history', route: '/proveedores/historial' },
      ],
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: 'point_of_sale',
      children: [
        { label: 'Resumen', icon: 'dashboard', route: '/ventas' },
        { label: 'Clientes', icon: 'people', route: '/ventas/clientes' },
        { label: 'Pedidos', icon: 'shopping_bag', route: '/ventas/pedidos' },
        { label: 'Consolidar producción', icon: 'precision_manufacturing', route: '/ventas/consolidar' },
        { label: 'Facturación', icon: 'receipt', route: '/ventas/facturacion' },
        { label: 'Cartera', icon: 'payments', route: '/ventas/cartera' },
      ],
    },
  ];

  constructor() {
    this.syncExpandedFromRoute(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.syncExpandedFromRoute(nav.urlAfterRedirects);
      });
  }

  toggleModule(moduleId: string): void {
    const next = new Set(this.expandedModules());
    if (next.has(moduleId)) {
      next.delete(moduleId);
    } else {
      next.add(moduleId);
    }
    this.expandedModules.set(next);
  }

  isExpanded(moduleId: string): boolean {
    return this.expandedModules().has(moduleId);
  }

  private syncExpandedFromRoute(url: string): void {
    const next = new Set(this.expandedModules());

    if (url.startsWith('/inventarios')) next.add('inventarios');
    if (url.startsWith('/proveedores')) next.add('proveedores');
    if (url.startsWith('/ventas')) next.add('ventas');

    if (next.size === 0) next.add('inventarios');

    this.expandedModules.set(next);
  }
}
