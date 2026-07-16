import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { InventarioService } from '../../core/services/inventario.service';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  soon?: boolean;
  children?: NavItem[];
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

        <mat-nav-list>
          @for (item of navItems; track item.label) {
            @if (item.children) {
              <div mat-subheader>{{ item.label }}</div>
              @for (child of item.children; track child.label) {
                <a
                  mat-list-item
                  [routerLink]="child.route"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: child.route === '/inventarios' }"
                >
                  <mat-icon matListItemIcon>{{ child.icon }}</mat-icon>
                  <span matListItemTitle>{{ child.label }}</span>
                  @if (child.route === '/inventarios/alertas' && alertasCount() > 0) {
                    <span matListItemMeta class="badge-count">{{ alertasCount() }}</span>
                  }
                </a>
              }
            } @else {
              <a
                mat-list-item
                [routerLink]="item.route"
                routerLinkActive="active"
              >
                <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
                <span matListItemTitle>{{ item.label }}</span>
                @if (item.soon) {
                  <span matListItemMeta class="soon">Próximamente</span>
                }
              </a>
            }
          }
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

          @if (alertasCount() > 0) {
            <a mat-icon-button routerLink="/inventarios/alertas">
              <mat-icon [matBadge]="alertasCount()" matBadgeColor="warn">notifications</mat-icon>
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
      width: 280px;
      border-right: 1px solid #e0e0e0;
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
    .active {
      background: rgba(57, 73, 171, 0.08) !important;
      color: #3949ab;
    }
    .soon {
      font-size: 0.7rem;
      color: #90a4ae;
    }
    .badge-count {
      background: #c62828;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
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
    mat-nav-list a mat-icon {
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
  private readonly breakpoint = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpoint.observe([Breakpoints.Handset]).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly alertasCount = computed(() => {
    this.inventario.version();
    return this.inventario.getAlertas().length;
  });

  readonly navItems: NavItem[] = [
    {
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
        {
          label: 'Alertas',
          icon: 'warning',
          route: '/inventarios/alertas',
        },
        { label: 'Sugerencias de compra', icon: 'lightbulb', route: '/inventarios/sugerencias' },
        { label: 'Historial', icon: 'history', route: '/inventarios/historial' },
      ],
    },
    {
      label: 'Proveedores',
      icon: 'store',
      route: '/proveedores',
      soon: true,
    },
    {
      label: 'Ventas',
      icon: 'point_of_sale',
      route: '/ventas',
      soon: true,
    },
  ];
}
