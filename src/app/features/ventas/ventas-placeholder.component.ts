import { Component } from '@angular/core';
import { PlaceholderModuleComponent } from '../../shared/components/placeholder-module.component';

@Component({
  selector: 'app-ventas-placeholder',
  standalone: true,
  imports: [PlaceholderModuleComponent],
  template: `
    <app-placeholder-module
      title="Gestión de Ventas"
      description="Registre pedidos de clientes, apoye el proceso de facturación y controle la cartera por cobrar."
      icon="point_of_sale"
    />
  `,
})
export class VentasPlaceholderComponent {}
