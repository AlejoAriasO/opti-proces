import { Component } from '@angular/core';
import { PlaceholderModuleComponent } from '../../shared/components/placeholder-module.component';

@Component({
  selector: 'app-proveedores-placeholder',
  standalone: true,
  imports: [PlaceholderModuleComponent],
  template: `
    <app-placeholder-module
      title="Gestión de Proveedores"
      description="Administre proveedores, asocie materias primas y genere órdenes de compra a partir de las sugerencias de inventario."
      icon="store"
    />
  `,
})
export class ProveedoresPlaceholderComponent {}
