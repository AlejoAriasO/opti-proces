import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AlertaCartera,
  CanalRecepcion,
  Cartera,
  Cliente,
  ConsolidadoProduccion,
  DetallePedido,
  EstadoPedido,
  Factura,
  Pedido,
} from '../models';
import { InventarioService } from './inventario.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private readonly storage = inject(StorageService);
  private readonly inventario = inject(InventarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly _version = signal(0);
  readonly version = this._version.asReadonly();

  private notifyChange(): void {
    this._version.update((v) => v + 1);
    this.inventario.touch();
  }

  // --- Clientes ---

  getClientes(): Cliente[] {
    return this.storage.load().clientes.filter((c) => c.estado === 'activo');
  }

  getTodosClientes(): Cliente[] {
    return this.storage.load().clientes;
  }

  getClienteById(id: string): Cliente | undefined {
    return this.storage.load().clientes.find((c) => c.id === id);
  }

  crearCliente(data: Omit<Cliente, 'id' | 'estado'>): Cliente {
    const cliente: Cliente = {
      id: crypto.randomUUID(),
      ...data,
      nombre: data.nombre.trim(),
      estado: 'activo',
    };
    this.storage.update((d) => d.clientes.push(cliente));
    this.notifyChange();
    return cliente;
  }

  actualizarCliente(id: string, changes: Partial<Omit<Cliente, 'id'>>): Cliente | null {
    let updated: Cliente | null = null;
    this.storage.update((d) => {
      const idx = d.clientes.findIndex((c) => c.id === id);
      if (idx === -1) return;
      d.clientes[idx] = { ...d.clientes[idx], ...changes, id };
      updated = d.clientes[idx];
    });
    if (updated) this.notifyChange();
    return updated;
  }

  desactivarCliente(id: string): void {
    this.actualizarCliente(id, { estado: 'inactivo' });
  }

  // --- Pedidos ---

  getPedidos(): Pedido[] {
    return [...this.storage.load().pedidos].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  getPedidoById(id: string): Pedido | undefined {
    return this.storage.load().pedidos.find((p) => p.id === id);
  }

  getPedidosPorCliente(clienteId: string): Pedido[] {
    return this.getPedidos().filter((p) => p.clienteId === clienteId);
  }

  getPedidosPendientesProduccion(): Pedido[] {
    return this.getPedidos().filter((p) => p.estado === 'pendiente' || p.estado === 'en_produccion');
  }

  crearPedido(data: {
    clienteId: string;
    fecha: string;
    fechaEntrega?: string;
    canalRecepcion: CanalRecepcion;
    observaciones: string;
    detalles: DetallePedido[];
  }): Pedido {
    const detalles = data.detalles.filter((d) => d.cantidad > 0);
    const pedido: Pedido = {
      id: crypto.randomUUID(),
      clienteId: data.clienteId,
      fecha: data.fecha,
      fechaEntrega: data.fechaEntrega,
      estado: 'pendiente',
      canalRecepcion: data.canalRecepcion,
      observaciones: data.observaciones,
      detalles,
    };

    this.storage.update((d) => d.pedidos.push(pedido));
    this.notifyChange();
    return pedido;
  }

  actualizarEstadoPedido(id: string, estado: EstadoPedido): { ok: boolean; error?: string } {
    const pedido = this.getPedidoById(id);
    if (!pedido) return { ok: false, error: 'Pedido no encontrado' };

    if (estado === 'entregado') {
      const result = this.inventario.registrarDespachoPedido(id, pedido.detalles);
      if (!result.ok) return result;
    }

    this.storage.update((d) => {
      const p = d.pedidos.find((x) => x.id === id);
      if (p) p.estado = estado;
    });
    this.notifyChange();
    return { ok: true };
  }

  getValorPedido(pedido: Pedido): number {
    return pedido.detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
  }

  getCanalLabel(canal: CanalRecepcion): string {
    const labels: Record<CanalRecepcion, string> = {
      whatsapp: 'WhatsApp',
      correo: 'Correo electrónico',
      telefono: 'Llamada telefónica',
    };
    return labels[canal];
  }

  getEstadoPedidoLabel(estado: EstadoPedido): string {
    const labels: Record<EstadoPedido, string> = {
      pendiente: 'Pendiente',
      en_produccion: 'En producción',
      listo: 'Listo para entrega',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return labels[estado];
  }

  // --- Consolidación producción ---

  getConsolidados(): ConsolidadoProduccion[] {
    return [...this.storage.load().consolidadosProduccion].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  consolidarPedidos(pedidoIds: string[]): { ok: boolean; error?: string; consolidado?: ConsolidadoProduccion } {
    const pedidos = pedidoIds
      .map((id) => this.getPedidoById(id))
      .filter((p): p is Pedido => !!p && p.estado === 'pendiente');

    if (pedidos.length === 0) {
      return { ok: false, error: 'Seleccione al menos un pedido pendiente' };
    }

    const productoMap = new Map<string, number>();
    for (const pedido of pedidos) {
      for (const det of pedido.detalles) {
        productoMap.set(det.productoId, (productoMap.get(det.productoId) ?? 0) + det.cantidad);
      }
    }

    const consolidado: ConsolidadoProduccion = {
      id: crypto.randomUUID(),
      fecha: new Date().toISOString(),
      pedidoIds: pedidos.map((p) => p.id),
      productos: [...productoMap.entries()].map(([productoId, cantidadTotal]) => ({
        productoId,
        cantidadTotal,
      })),
      estado: 'pendiente',
    };

    this.storage.update((d) => {
      d.consolidadosProduccion.push(consolidado);
      for (const pedido of pedidos) {
        const p = d.pedidos.find((x) => x.id === pedido.id);
        if (p) {
          p.estado = 'en_produccion';
          p.consolidadoProduccionId = consolidado.id;
        }
      }
    });

    this.notifyChange();
    return { ok: true, consolidado };
  }

  ejecutarProduccionConsolidado(consolidadoId: string): { ok: boolean; error?: string } {
    const consolidado = this.storage.load().consolidadosProduccion.find((c) => c.id === consolidadoId);
    if (!consolidado) return { ok: false, error: 'Consolidado no encontrado' };
    if (consolidado.estado === 'producido') return { ok: false, error: 'Ya fue producido' };

    const errores: string[] = [];
    for (const prod of consolidado.productos) {
      const result = this.inventario.registrarProduccion({
        productoId: prod.productoId,
        cantidad: prod.cantidadTotal,
        observaciones: `Producción consolidada #${consolidado.id.slice(0, 8)}`,
      });
      if (!result.ok) {
        const producto = this.inventario.getProductoById(prod.productoId);
        errores.push(`${producto?.nombre ?? 'Producto'}: ${result.error}`);
      }
    }

    if (errores.length > 0) {
      return { ok: false, error: errores.join('\n') };
    }

    this.storage.update((d) => {
      const c = d.consolidadosProduccion.find((x) => x.id === consolidadoId);
      if (c) c.estado = 'producido';

      for (const pedidoId of consolidado.pedidoIds) {
        const p = d.pedidos.find((x) => x.id === pedidoId);
        if (p && p.estado === 'en_produccion') p.estado = 'listo';
      }
    });

    this.notifyChange();
    this.snackBar.open('Producción consolidada registrada en inventario.', 'Cerrar', { duration: 4000 });
    return { ok: true };
  }

  // --- Facturación ---

  getFacturas(): Factura[] {
    return [...this.storage.load().facturas].sort(
      (a, b) => new Date(b.fechaFactura).getTime() - new Date(a.fechaFactura).getTime()
    );
  }

  getFacturaByPedido(pedidoId: string): Factura | undefined {
    return this.storage.load().facturas.find((f) => f.pedidoId === pedidoId);
  }

  registrarFactura(data: {
    pedidoId: string;
    numeroFactura: string;
    fechaFactura: string;
    fechaVencimiento: string;
  }): { ok: boolean; error?: string } {
    const pedido = this.getPedidoById(data.pedidoId);
    if (!pedido) return { ok: false, error: 'Pedido no encontrado' };
    if (this.getFacturaByPedido(data.pedidoId)) {
      return { ok: false, error: 'Este pedido ya tiene factura registrada' };
    }

    const valor = this.getValorPedido(pedido);
    const factura: Factura = {
      id: crypto.randomUUID(),
      pedidoId: data.pedidoId,
      numeroFactura: data.numeroFactura.trim(),
      fechaFactura: data.fechaFactura,
    };

    const cartera: Cartera = {
      id: crypto.randomUUID(),
      facturaId: factura.id,
      pedidoId: pedido.id,
      clienteId: pedido.clienteId,
      fechaVencimiento: data.fechaVencimiento,
      valor,
      saldoPendiente: valor,
      estadoPago: 'pendiente',
      pagos: [],
    };

    this.storage.update((d) => {
      d.facturas.push(factura);
      d.cartera.push(cartera);
    });

    this.notifyChange();
    return { ok: true };
  }

  pedidoEstaFacturado(pedidoId: string): boolean {
    return !!this.getFacturaByPedido(pedidoId);
  }

  // --- Cartera ---

  getCartera(): Cartera[] {
    return [...this.storage.load().cartera].sort(
      (a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
    );
  }

  getCarteraPendiente(): Cartera[] {
    return this.getCartera().filter((c) => c.saldoPendiente > 0);
  }

  getCarteraPorCliente(clienteId: string): Cartera[] {
    return this.getCartera().filter((c) => c.clienteId === clienteId);
  }

  getResumenCarteraCliente(clienteId: string) {
    const items = this.getCarteraPorCliente(clienteId);
    return {
      totalFacturado: items.reduce((s, c) => s + c.valor, 0),
      saldoPendiente: items.reduce((s, c) => s + c.saldoPendiente, 0),
      facturasPendientes: items.filter((c) => c.saldoPendiente > 0).length,
    };
  }

  registrarPago(carteraId: string, monto: number, observaciones = ''): { ok: boolean; error?: string } {
    if (monto <= 0) return { ok: false, error: 'El monto debe ser mayor a cero' };

    const cartera = this.storage.load().cartera.find((c) => c.id === carteraId);
    if (!cartera) return { ok: false, error: 'Registro de cartera no encontrado' };
    if (monto > cartera.saldoPendiente) {
      return { ok: false, error: `El monto excede el saldo pendiente (${cartera.saldoPendiente})` };
    }

    this.storage.update((d) => {
      const c = d.cartera.find((x) => x.id === carteraId)!;
      c.pagos.push({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        monto,
        observaciones,
      });
      c.saldoPendiente -= monto;
      c.estadoPago = c.saldoPendiente === 0 ? 'pagado' : 'parcial';
    });

    this.notifyChange();
    return { ok: true };
  }

  getAlertasCartera(): AlertaCartera[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const alertas: AlertaCartera[] = [];

    for (const c of this.getCarteraPendiente()) {
      const vencimiento = new Date(c.fechaVencimiento);
      vencimiento.setHours(0, 0, 0, 0);
      const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      const factura = this.storage.load().facturas.find((f) => f.id === c.facturaId);
      const cliente = this.getClienteById(c.clienteId);

      if (diasRestantes < 0) {
        alertas.push({
          carteraId: c.id,
          clienteNombre: cliente?.nombre ?? '—',
          numeroFactura: factura?.numeroFactura ?? '—',
          fechaVencimiento: c.fechaVencimiento,
          saldoPendiente: c.saldoPendiente,
          diasRestantes,
          tipo: 'vencida',
        });
      } else if (diasRestantes <= 7) {
        alertas.push({
          carteraId: c.id,
          clienteNombre: cliente?.nombre ?? '—',
          numeroFactura: factura?.numeroFactura ?? '—',
          fechaVencimiento: c.fechaVencimiento,
          saldoPendiente: c.saldoPendiente,
          diasRestantes,
          tipo: 'proxima_vencer',
        });
      }
    }

    return alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }

  getEstadoPagoLabel(estado: Cartera['estadoPago']): string {
    const labels: Record<Cartera['estadoPago'], string> = {
      pendiente: 'Pendiente',
      parcial: 'Pago parcial',
      pagado: 'Pagado',
      vencido: 'Vencido',
    };
    return labels[estado];
  }

  /** Demanda de materias primas por pedidos pendientes/en producción */
  getDemandaMateriasPrimas(): Map<string, number> {
    const demanda = new Map<string, number>();
    const pedidos = this.getPedidosPendientesProduccion();

    for (const pedido of pedidos) {
      for (const det of pedido.detalles) {
        const receta = this.inventario.getRecetaByProductoId(det.productoId);
        if (!receta) continue;

        for (const ing of receta.ingredientes) {
          const necesario = ing.cantidad * det.cantidad;
          demanda.set(ing.materiaPrimaId, (demanda.get(ing.materiaPrimaId) ?? 0) + necesario);
        }
      }
    }

    return demanda;
  }
}
