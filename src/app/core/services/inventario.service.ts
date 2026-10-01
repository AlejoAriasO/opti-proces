import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AlertaInventario,
  MateriaPrima,
  MovimientoInventario,
  ProductoTerminado,
  SugerenciaCompra,
  TipoMovimiento,
} from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly storage = inject(StorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly _version = signal(0);
  readonly version = this._version.asReadonly();

  private notifyChange(): void {
    this._version.update((v) => v + 1);
  }

  touch(): void {
    this.notifyChange();
  }

  // --- Consultas ---

  getMateriasPrimas(): MateriaPrima[] {
    return this.storage.load().materiasPrimas.filter((m) => m.estado === 'activo');
  }

  getTodasMateriasPrimas(): MateriaPrima[] {
    return this.storage.load().materiasPrimas;
  }

  getMateriaPrimaById(id: string): MateriaPrima | undefined {
    return this.storage.load().materiasPrimas.find((m) => m.id === id);
  }

  getProductosTerminados() {
    return this.storage.load().productosTerminados.filter((p) => p.estado === 'activo');
  }

  getTodosProductosTerminados() {
    return this.storage.load().productosTerminados;
  }

  getProductoById(id: string) {
    return this.storage.load().productosTerminados.find((p) => p.id === id);
  }

  getRecetas() {
    return this.storage.load().recetas;
  }

  getRecetaByProductoId(productoId: string) {
    return this.storage.load().recetas.find((r) => r.productoId === productoId);
  }

  getCompras() {
    return [...this.storage.load().compras].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  getMovimientos() {
    return [...this.storage.load().movimientos].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }

  getAlertas(): AlertaInventario[] {
    return this.getMateriasPrimas()
      .filter((m) => m.stockActual < m.stockMinimo)
      .map((m) => ({
        materiaPrimaId: m.id,
        materiaPrimaNombre: m.nombre,
        stockActual: m.stockActual,
        stockMinimo: m.stockMinimo,
        unidadMedida: m.unidadMedida,
      }));
  }

  getSugerenciasCompra(): SugerenciaCompra[] {
    const demanda = this.calcularDemandaMateriasPrimas();
    const materiasBajoMinimo = this.getMateriasPrimas().filter(
      (m) => m.stockActual < m.stockMinimo || (demanda.get(m.id) ?? 0) > m.stockActual
    );

    return materiasBajoMinimo.map((m) => {
      const demandaPedidos = demanda.get(m.id) ?? 0;
      const deficitMinimo = Math.max(m.stockMinimo - m.stockActual, 0);
      const deficitPedidos = Math.max(demandaPedidos - m.stockActual, 0);
      const cantidadSugerida = Math.max(deficitMinimo, deficitPedidos);

      const proveedor = this.storage
        .load()
        .proveedores.filter((p) => p.estado === 'activo')
        .find((p) => p.materiasPrimasIds.includes(m.id));

      return {
        materiaPrimaId: m.id,
        materiaPrimaNombre: m.nombre,
        stockActual: m.stockActual,
        stockMinimo: m.stockMinimo,
        cantidadSugerida,
        cantidadPorPedidos: demandaPedidos,
        unidadMedida: m.unidadMedida,
        costoPromedio: m.costoPromedio,
        proveedorSugeridoId: proveedor?.id,
        proveedorSugeridoNombre: proveedor?.nombre,
      };
    });
  }

  private calcularDemandaMateriasPrimas(): Map<string, number> {
    const demanda = new Map<string, number>();
    const data = this.storage.load();

    const pedidosActivos = data.pedidos.filter(
      (p) => p.estado === 'pendiente' || p.estado === 'en_produccion'
    );

    for (const pedido of pedidosActivos) {
      for (const det of pedido.detalles) {
        const receta = data.recetas.find((r) => r.productoId === det.productoId);
        if (!receta) continue;

        for (const ing of receta.ingredientes) {
          const necesario = ing.cantidad * det.cantidad;
          demanda.set(ing.materiaPrimaId, (demanda.get(ing.materiaPrimaId) ?? 0) + necesario);
        }
      }
    }

    return demanda;
  }

  // --- Materias primas CRUD ---

  crearMateriaPrima(
    data: Omit<MateriaPrima, 'id' | 'stockActual' | 'costoPromedio' | 'estado'> & {
      stockInicial?: number;
      costoPromedio?: number;
    }
  ): MateriaPrima {
    const materia: MateriaPrima = {
      id: crypto.randomUUID(),
      nombre: data.nombre.trim(),
      unidadMedida: data.unidadMedida,
      stockActual: data.stockInicial ?? 0,
      stockMinimo: data.stockMinimo,
      costoPromedio: data.costoPromedio ?? 0,
      estado: 'activo',
    };

    this.storage.update((d) => d.materiasPrimas.push(materia));
    this.notifyChange();
    return materia;
  }

  actualizarMateriaPrima(id: string, changes: Partial<MateriaPrima>): MateriaPrima | null {
    let updated: MateriaPrima | null = null;
    this.storage.update((d) => {
      const idx = d.materiasPrimas.findIndex((m) => m.id === id);
      if (idx === -1) return;
      d.materiasPrimas[idx] = { ...d.materiasPrimas[idx], ...changes, id };
      updated = d.materiasPrimas[idx];
    });
    if (updated) this.notifyChange();
    return updated;
  }

  desactivarMateriaPrima(id: string): void {
    this.actualizarMateriaPrima(id, { estado: 'inactivo' });
  }

  // --- Productos terminados CRUD ---

  crearProductoTerminado(data: {
    nombre: string;
    presentacion: string;
    precio: number;
    stockInicial?: number;
  }) {
    const producto = {
      id: crypto.randomUUID(),
      nombre: data.nombre.trim(),
      presentacion: data.presentacion.trim(),
      stockActual: data.stockInicial ?? 0,
      precio: data.precio,
      estado: 'activo' as const,
    };
    this.storage.update((d) => d.productosTerminados.push(producto));
    this.notifyChange();
    return producto;
  }

  actualizarProductoTerminado(id: string, changes: Partial<Omit<ProductoTerminado, 'id'>>) {
    let updated: ProductoTerminado | null = null;
    this.storage.update((d) => {
      const idx = d.productosTerminados.findIndex((p) => p.id === id);
      if (idx === -1) return;
      d.productosTerminados[idx] = { ...d.productosTerminados[idx], ...changes, id };
      updated = d.productosTerminados[idx];
    });
    if (updated) this.notifyChange();
    return updated;
  }

  desactivarProductoTerminado(id: string): void {
    this.storage.update((d) => {
      const p = d.productosTerminados.find((x) => x.id === id);
      if (p) p.estado = 'inactivo';
    });
    this.notifyChange();
  }

  // --- Recetas ---

  guardarReceta(productoId: string, ingredientes: { materiaPrimaId: string; cantidad: number }[]) {
    const receta = {
      id: crypto.randomUUID(),
      productoId,
      ingredientes: ingredientes.filter((i) => i.cantidad > 0),
    };

    this.storage.update((d) => {
      const idx = d.recetas.findIndex((r) => r.productoId === productoId);
      if (idx >= 0) {
        d.recetas[idx] = { ...receta, id: d.recetas[idx].id };
      } else {
        d.recetas.push(receta);
      }
    });

    this.notifyChange();
    return receta;
  }

  // --- Compra simulada ---

  registrarCompra(compra: {
    fecha: string;
    proveedorId?: string;
    proveedorNombre: string;
    proveedorNit: string;
    ordenCompraId?: string;
    observaciones: string;
    detalles: { materiaPrimaId: string; cantidad: number; precioUnitario: number }[];
  }) {
    const id = crypto.randomUUID();
    const detallesValidos = compra.detalles.filter((d) => d.cantidad > 0);

    this.storage.update((d) => {
      d.compras.push({ id, ...compra, detalles: detallesValidos });

      for (const det of detallesValidos) {
        const materia = d.materiasPrimas.find((m) => m.id === det.materiaPrimaId);
        if (!materia) continue;

        const stockAnterior = materia.stockActual;
        const stockNuevo = stockAnterior + det.cantidad;
        const costoTotalAnterior = materia.costoPromedio * stockAnterior;
        const costoEntrada = det.precioUnitario * det.cantidad;

        materia.stockActual = stockNuevo;
        materia.costoPromedio =
          stockNuevo > 0 ? (costoTotalAnterior + costoEntrada) / stockNuevo : det.precioUnitario;

        d.movimientos.push(
          this.crearMovimiento({
            tipo: 'entrada_compra',
            materiaPrimaId: materia.id,
            cantidad: det.cantidad,
            stockAnterior,
            stockNuevo,
            referencia: `Compra #${id.slice(0, 8)}`,
            observaciones: compra.observaciones || `Proveedor: ${compra.proveedorNombre}`,
          })
        );
      }
    });

    this.verificarAlertas(detallesValidos.map((d) => d.materiaPrimaId));
    this.notifyChange();
    return id;
  }

  // --- Salida manual ---

  registrarSalidaManual(data: {
    materiaPrimaId: string;
    cantidad: number;
    observaciones: string;
  }): { ok: boolean; error?: string } {
    const materia = this.getMateriaPrimaById(data.materiaPrimaId);
    if (!materia) return { ok: false, error: 'Materia prima no encontrada' };
    if (data.cantidad <= 0) return { ok: false, error: 'La cantidad debe ser mayor a cero' };
    if (materia.stockActual < data.cantidad) {
      return { ok: false, error: `Stock insuficiente. Disponible: ${materia.stockActual} ${materia.unidadMedida}` };
    }

    this.storage.update((d) => {
      const m = d.materiasPrimas.find((x) => x.id === data.materiaPrimaId)!;
      const stockAnterior = m.stockActual;
      m.stockActual -= data.cantidad;

      d.movimientos.push(
        this.crearMovimiento({
          tipo: 'salida_manual',
          materiaPrimaId: m.id,
          cantidad: data.cantidad,
          stockAnterior,
          stockNuevo: m.stockActual,
          referencia: 'Salida manual',
          observaciones: data.observaciones,
        })
      );
    });

    this.verificarAlertas([data.materiaPrimaId]);
    this.notifyChange();
    return { ok: true };
  }

  // --- Producción por receta ---

  registrarProduccion(data: {
    productoId: string;
    cantidad: number;
    observaciones: string;
  }): { ok: boolean; error?: string } {
    const producto = this.getProductoById(data.productoId);
    const receta = this.getRecetaByProductoId(data.productoId);

    if (!producto) return { ok: false, error: 'Producto no encontrado' };
    if (!receta || receta.ingredientes.length === 0) {
      return { ok: false, error: 'El producto no tiene una receta configurada' };
    }
    if (data.cantidad <= 0) return { ok: false, error: 'La cantidad debe ser mayor a cero' };

    const faltantes: string[] = [];
    for (const ing of receta.ingredientes) {
      const materia = this.getMateriaPrimaById(ing.materiaPrimaId);
      const necesario = ing.cantidad * data.cantidad;
      if (!materia || materia.stockActual < necesario) {
        faltantes.push(
          `${materia?.nombre ?? 'Desconocida'}: necesita ${necesario} ${materia?.unidadMedida ?? ''}, disponible ${materia?.stockActual ?? 0}`
        );
      }
    }

    if (faltantes.length > 0) {
      return { ok: false, error: `Stock insuficiente:\n${faltantes.join('\n')}` };
    }

    const materiasAfectadas: string[] = [];

    this.storage.update((d) => {
      for (const ing of receta.ingredientes) {
        const m = d.materiasPrimas.find((x) => x.id === ing.materiaPrimaId)!;
        const consumo = ing.cantidad * data.cantidad;
        const stockAnterior = m.stockActual;
        m.stockActual -= consumo;
        materiasAfectadas.push(m.id);

        d.movimientos.push(
          this.crearMovimiento({
            tipo: 'produccion_materia',
            materiaPrimaId: m.id,
            productoId: producto.id,
            cantidad: consumo,
            stockAnterior,
            stockNuevo: m.stockActual,
            referencia: `Producción: ${producto.nombre}`,
            observaciones: data.observaciones,
          })
        );
      }

      const p = d.productosTerminados.find((x) => x.id === producto.id)!;
      const stockAnteriorProd = p.stockActual;
      p.stockActual += data.cantidad;

      d.movimientos.push(
        this.crearMovimiento({
          tipo: 'produccion_producto',
          productoId: p.id,
          cantidad: data.cantidad,
          stockAnterior: stockAnteriorProd,
          stockNuevo: p.stockActual,
          referencia: `Producción: ${p.nombre}`,
          observaciones: data.observaciones,
        })
      );
    });

    this.verificarAlertas(materiasAfectadas);
    this.notifyChange();
    return { ok: true };
  }

  registrarDespachoPedido(
    pedidoId: string,
    detalles: { productoId: string; cantidad: number }[]
  ): { ok: boolean; error?: string } {
    const faltantes: string[] = [];

    for (const det of detalles) {
      const producto = this.getProductoById(det.productoId);
      if (!producto || producto.stockActual < det.cantidad) {
        faltantes.push(
          `${producto?.nombre ?? 'Producto'}: disponible ${producto?.stockActual ?? 0}, requerido ${det.cantidad}`
        );
      }
    }

    if (faltantes.length > 0) {
      return { ok: false, error: `Stock insuficiente:\n${faltantes.join('\n')}` };
    }

    this.storage.update((d) => {
      for (const det of detalles) {
        const p = d.productosTerminados.find((x) => x.id === det.productoId)!;
        const stockAnterior = p.stockActual;
        p.stockActual -= det.cantidad;

        d.movimientos.push(
          this.crearMovimiento({
            tipo: 'salida_venta',
            productoId: p.id,
            cantidad: det.cantidad,
            stockAnterior,
            stockNuevo: p.stockActual,
            referencia: `Pedido #${pedidoId.slice(0, 8)}`,
            observaciones: 'Despacho a cliente',
          })
        );
      }
    });

    this.notifyChange();
    return { ok: true };
  }

  // --- Helpers ---

  private crearMovimiento(
    partial: Omit<MovimientoInventario, 'id' | 'fecha'> & { fecha?: string }
  ): MovimientoInventario {
    return {
      id: crypto.randomUUID(),
      fecha: partial.fecha ?? new Date().toISOString(),
      tipo: partial.tipo,
      materiaPrimaId: partial.materiaPrimaId,
      productoId: partial.productoId,
      cantidad: partial.cantidad,
      stockAnterior: partial.stockAnterior,
      stockNuevo: partial.stockNuevo,
      referencia: partial.referencia,
      observaciones: partial.observaciones ?? '',
    };
  }

  private verificarAlertas(materiaIds: string[]): void {
    const uniqueIds = [...new Set(materiaIds)];
    for (const id of uniqueIds) {
      const materia = this.getMateriaPrimaById(id);
      if (materia && materia.stockActual < materia.stockMinimo) {
        this.snackBar.open(
          `Alerta: ${materia.nombre} bajo stock (${materia.stockActual} ${materia.unidadMedida} / mínimo ${materia.stockMinimo})`,
          'Cerrar',
          { duration: 8000, panelClass: ['alerta-snackbar'] }
        );
      }
    }
  }

  getTipoMovimientoLabel(tipo: TipoMovimiento): string {
    const labels: Record<TipoMovimiento, string> = {
      entrada_compra: 'Entrada por compra',
      salida_manual: 'Salida manual',
      produccion_materia: 'Consumo en producción',
      produccion_producto: 'Entrada por producción',
      salida_venta: 'Salida por venta',
    };
    return labels[tipo];
  }
}
