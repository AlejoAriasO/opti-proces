import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DetalleOrdenCompra,
  OrdenCompra,
  PrecioProveedor,
  Proveedor,
  SugerenciaCompra,
} from '../models';
import { InventarioService } from './inventario.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ProveedorService {
  private readonly storage = inject(StorageService);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly _version = signal(0);
  readonly version = this._version.asReadonly();

  private notifyChange(): void {
    this._version.update((v) => v + 1);
    this.inventario.touch();
  }

  getProveedores(): Proveedor[] {
    return this.storage.load().proveedores.filter((p) => p.estado === 'activo');
  }

  getTodosProveedores(): Proveedor[] {
    return this.storage.load().proveedores;
  }

  getProveedorById(id: string): Proveedor | undefined {
    return this.storage.load().proveedores.find((p) => p.id === id);
  }

  getProveedoresPorMateria(materiaPrimaId: string): Proveedor[] {
    return this.getProveedores().filter((p) => p.materiasPrimasIds.includes(materiaPrimaId));
  }

  getPrecioProveedor(proveedorId: string, materiaPrimaId: string): number | undefined {
    const proveedor = this.getProveedorById(proveedorId);
    return proveedor?.precios.find((p) => p.materiaPrimaId === materiaPrimaId)?.precio;
  }

  crearProveedor(data: {
    nombre: string;
    nit: string;
    telefono: string;
    correo: string;
    direccion: string;
    tiempoEntregaDias: number;
    observaciones: string;
    materiasPrimasIds?: string[];
    precios?: PrecioProveedor[];
  }): Proveedor {
    const proveedor: Proveedor = {
      id: crypto.randomUUID(),
      nombre: data.nombre.trim(),
      nit: data.nit.trim(),
      telefono: data.telefono.trim(),
      correo: data.correo.trim(),
      direccion: data.direccion.trim(),
      tiempoEntregaDias: data.tiempoEntregaDias,
      observaciones: data.observaciones.trim(),
      estado: 'activo',
      materiasPrimasIds: data.materiasPrimasIds ?? [],
      precios: data.precios ?? [],
    };

    this.storage.update((d) => d.proveedores.push(proveedor));
    this.notifyChange();
    return proveedor;
  }

  actualizarProveedor(id: string, changes: Partial<Omit<Proveedor, 'id'>>): Proveedor | null {
    let updated: Proveedor | null = null;
    this.storage.update((d) => {
      const idx = d.proveedores.findIndex((p) => p.id === id);
      if (idx === -1) return;
      d.proveedores[idx] = { ...d.proveedores[idx], ...changes, id };
      updated = d.proveedores[idx];
    });
    if (updated) this.notifyChange();
    return updated;
  }

  desactivarProveedor(id: string): void {
    this.actualizarProveedor(id, { estado: 'inactivo' });
  }

  asociarMateriaPrima(proveedorId: string, materiaPrimaId: string, precio?: number): void {
    this.storage.update((d) => {
      const proveedor = d.proveedores.find((p) => p.id === proveedorId);
      if (!proveedor) return;

      if (!proveedor.materiasPrimasIds.includes(materiaPrimaId)) {
        proveedor.materiasPrimasIds.push(materiaPrimaId);
      }

      if (precio != null && precio >= 0) {
        const idx = proveedor.precios.findIndex((p) => p.materiaPrimaId === materiaPrimaId);
        if (idx >= 0) {
          proveedor.precios[idx].precio = precio;
        } else {
          proveedor.precios.push({ materiaPrimaId, precio });
        }
      }
    });
    this.notifyChange();
  }

  getOrdenesCompra(): OrdenCompra[] {
    return [...this.storage.load().ordenesCompra].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  getOrdenCompraById(id: string): OrdenCompra | undefined {
    return this.storage.load().ordenesCompra.find((o) => o.id === id);
  }

  getOrdenesPorProveedor(proveedorId: string): OrdenCompra[] {
    return this.getOrdenesCompra().filter((o) => o.proveedorId === proveedorId);
  }

  getHistorialComprasPorProveedor(proveedorId: string) {
    return this.inventario
      .getCompras()
      .filter((c) => c.proveedorId === proveedorId);
  }

  crearOrdenCompra(data: {
    proveedorId: string;
    observaciones: string;
    detalles: DetalleOrdenCompra[];
  }): OrdenCompra {
    const detalles = data.detalles.filter((d) => d.cantidad > 0);
    const orden: OrdenCompra = {
      id: crypto.randomUUID(),
      proveedorId: data.proveedorId,
      fecha: new Date().toISOString(),
      estado: 'pendiente',
      observaciones: data.observaciones,
      detalles,
    };

    this.storage.update((d) => d.ordenesCompra.push(orden));
    this.notifyChange();
    return orden;
  }

  crearOrdenDesdeMateria(
    proveedorId: string,
    materiaPrimaId: string,
    cantidad: number,
    observaciones = ''
  ): OrdenCompra | null {
    const proveedor = this.getProveedorById(proveedorId);
    const materia = this.inventario.getMateriaPrimaById(materiaPrimaId);
    if (!proveedor || !materia || cantidad <= 0) return null;

    if (!proveedor.materiasPrimasIds.includes(materiaPrimaId)) return null;

    const precioUnitario =
      this.getPrecioProveedor(proveedorId, materiaPrimaId) ?? materia.costoPromedio;

    return this.crearOrdenCompra({
      proveedorId,
      observaciones:
        observaciones || `Orden automática por bajo stock: ${materia.nombre}`,
      detalles: [{ materiaPrimaId, cantidad, precioUnitario }],
    });
  }

  crearOrdenDesdeSugerencias(
    proveedorId: string,
    sugerencias: SugerenciaCompra[],
    observaciones = ''
  ): OrdenCompra | null {
    const proveedor = this.getProveedorById(proveedorId);
    if (!proveedor) return null;

    const detalles: DetalleOrdenCompra[] = sugerencias
      .filter((s) => s.cantidadSugerida > 0)
      .map((s) => ({
        materiaPrimaId: s.materiaPrimaId,
        cantidad: s.cantidadSugerida,
        precioUnitario:
          this.getPrecioProveedor(proveedorId, s.materiaPrimaId) ?? s.costoPromedio,
      }));

    if (detalles.length === 0) return null;

    return this.crearOrdenCompra({ proveedorId, observaciones, detalles });
  }

  marcarOrdenEnviada(ordenId: string): void {
    this.actualizarEstadoOrden(ordenId, 'enviada');
  }

  cancelarOrden(ordenId: string): void {
    this.actualizarEstadoOrden(ordenId, 'cancelada');
  }

  recibirOrdenCompra(ordenId: string): { ok: boolean; error?: string } {
    const orden = this.getOrdenCompraById(ordenId);
    if (!orden) return { ok: false, error: 'Orden no encontrada' };
    if (orden.estado === 'recibida') return { ok: false, error: 'La orden ya fue recibida' };
    if (orden.estado === 'cancelada') return { ok: false, error: 'La orden está cancelada' };

    const proveedor = this.getProveedorById(orden.proveedorId);
    if (!proveedor) return { ok: false, error: 'Proveedor no encontrado' };

    const compraId = this.inventario.registrarCompra({
      fecha: new Date().toISOString(),
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
      proveedorNit: proveedor.nit,
      ordenCompraId: orden.id,
      observaciones: orden.observaciones || `Recepción orden #${orden.id.slice(0, 8)}`,
      detalles: orden.detalles.map((d) => ({
        materiaPrimaId: d.materiaPrimaId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
      })),
    });

    this.storage.update((d) => {
      const idx = d.ordenesCompra.findIndex((o) => o.id === ordenId);
      if (idx >= 0) {
        d.ordenesCompra[idx].estado = 'recibida';
        d.ordenesCompra[idx].compraId = compraId;
      }
    });

    this.notifyChange();
    this.snackBar.open('Orden recibida. Inventario actualizado.', 'Cerrar', { duration: 4000 });
    return { ok: true };
  }

  getEstadoOrdenLabel(estado: OrdenCompra['estado']): string {
    const labels: Record<OrdenCompra['estado'], string> = {
      pendiente: 'Pendiente',
      enviada: 'Enviada',
      recibida: 'Recibida',
      cancelada: 'Cancelada',
    };
    return labels[estado];
  }

  private actualizarEstadoOrden(ordenId: string, estado: OrdenCompra['estado']): void {
    this.storage.update((d) => {
      const orden = d.ordenesCompra.find((o) => o.id === ordenId);
      if (orden) orden.estado = estado;
    });
    this.notifyChange();
  }
}
