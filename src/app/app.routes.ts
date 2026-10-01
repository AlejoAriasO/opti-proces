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
          import('./features/proveedores/dashboard/proveedores-dashboard.component').then(
            (m) => m.ProveedoresDashboardComponent
          ),
      },
      {
        path: 'proveedores/lista',
        loadComponent: () =>
          import('./features/proveedores/lista/proveedores-list.component').then(
            (m) => m.ProveedoresListComponent
          ),
      },
      {
        path: 'proveedores/ordenes',
        loadComponent: () =>
          import('./features/proveedores/ordenes/ordenes-compra.component').then(
            (m) => m.OrdenesCompraComponent
          ),
      },
      {
        path: 'proveedores/historial',
        loadComponent: () =>
          import('./features/proveedores/historial/historial-compras.component').then(
            (m) => m.HistorialComprasComponent
          ),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/ventas/dashboard/ventas-dashboard.component').then(
            (m) => m.VentasDashboardComponent
          ),
      },
      {
        path: 'ventas/clientes',
        loadComponent: () =>
          import('./features/ventas/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'ventas/pedidos',
        loadComponent: () =>
          import('./features/ventas/pedidos/pedidos.component').then((m) => m.PedidosComponent),
      },
      {
        path: 'ventas/consolidar',
        loadComponent: () =>
          import('./features/ventas/consolidar/consolidar-produccion.component').then(
            (m) => m.ConsolidarProduccionComponent
          ),
      },
      {
        path: 'ventas/facturacion',
        loadComponent: () =>
          import('./features/ventas/facturacion/facturacion.component').then(
            (m) => m.FacturacionComponent
          ),
      },
      {
        path: 'ventas/cartera',
        loadComponent: () =>
          import('./features/ventas/cartera/cartera.component').then((m) => m.CarteraComponent),
      },
      {
        path: 'ventas/alertas-cartera',
        loadComponent: () =>
          import('./features/ventas/alertas-cartera/alertas-cartera.component').then(
            (m) => m.AlertasCarteraComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'inventarios' },
];
