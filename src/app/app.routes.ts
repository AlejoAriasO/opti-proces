import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'inventarios', pathMatch: 'full' },
      {
        path: 'inventarios',
        loadComponent: () =>
          import('./features/inventarios/dashboard/inventario-dashboard.component').then(
            (m) => m.InventarioDashboardComponent
          ),
      },
      {
        path: 'inventarios/materias-primas',
        loadComponent: () =>
          import('./features/inventarios/materias-primas/materias-primas.component').then(
            (m) => m.MateriasPrimasComponent
          ),
      },
      {
        path: 'inventarios/productos',
        loadComponent: () =>
          import('./features/inventarios/productos/productos-terminados.component').then(
            (m) => m.ProductosTerminadosComponent
          ),
      },
      {
        path: 'inventarios/recetas',
        loadComponent: () =>
          import('./features/inventarios/recetas/recetas.component').then((m) => m.RecetasComponent),
      },
      {
        path: 'inventarios/compras',
        loadComponent: () =>
          import('./features/inventarios/compras/registrar-compra.component').then(
            (m) => m.RegistrarCompraComponent
          ),
      },
      {
        path: 'inventarios/salidas',
        loadComponent: () =>
          import('./features/inventarios/salidas/registrar-salida.component').then(
            (m) => m.RegistrarSalidaComponent
          ),
      },
      {
        path: 'inventarios/produccion',
        loadComponent: () =>
          import('./features/inventarios/produccion/registrar-produccion.component').then(
            (m) => m.RegistrarProduccionComponent
          ),
      },
      {
        path: 'inventarios/alertas',
        loadComponent: () =>
          import('./features/inventarios/alertas/alertas-inventario.component').then(
            (m) => m.AlertasInventarioComponent
          ),
      },
      {
        path: 'inventarios/sugerencias',
        loadComponent: () =>
          import('./features/inventarios/sugerencias/sugerencias-compra.component').then(
            (m) => m.SugerenciasCompraComponent
          ),
      },
      {
        path: 'inventarios/historial',
        loadComponent: () =>
          import('./features/inventarios/historial/historial-movimientos.component').then(
            (m) => m.HistorialMovimientosComponent
          ),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/proveedores/proveedores-placeholder.component').then(
            (m) => m.ProveedoresPlaceholderComponent
          ),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/ventas-placeholder.component').then(
            (m) => m.VentasPlaceholderComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'inventarios' },
];
