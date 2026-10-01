export type EstadoRegistro = 'activo' | 'inactivo';

export type TipoMovimiento =
  | 'entrada_compra'
  | 'salida_manual'
  | 'produccion_materia'
  | 'produccion_producto'
  | 'salida_venta';

export interface MateriaPrima {
  id: string;
  nombre: string;
  unidadMedida: string;
  stockActual: number;
  stockMinimo: number;
  costoPromedio: number;
  estado: EstadoRegistro;
}

export interface ProductoTerminado {
  id: string;
  nombre: string;
  presentacion: string;
  stockActual: number;
  precio: number;
  estado: EstadoRegistro;
}

export interface RecetaIngrediente {
  materiaPrimaId: string;
  cantidad: number;
}

export interface Receta {
  id: string;
  productoId: string;
  ingredientes: RecetaIngrediente[];
}

export interface DetalleCompra {
  materiaPrimaId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Compra {
  id: string;
  fecha: string;
  proveedorId?: string;
  proveedorNombre: string;
  proveedorNit: string;
  ordenCompraId?: string;
  observaciones: string;
  detalles: DetalleCompra[];
}

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: TipoMovimiento;
  materiaPrimaId?: string;
  productoId?: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  referencia: string;
  observaciones: string;
}

export interface AlertaInventario {
  materiaPrimaId: string;
  materiaPrimaNombre: string;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string;
}

export interface SugerenciaCompra {
  materiaPrimaId: string;
  materiaPrimaNombre: string;
  stockActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  cantidadPorPedidos: number;
  unidadMedida: string;
  costoPromedio: number;
  proveedorSugeridoId?: string;
  proveedorSugeridoNombre?: string;
}

export interface PrecioProveedor {
  materiaPrimaId: string;
  precio: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  nit: string;
  telefono: string;
  correo: string;
  direccion: string;
  tiempoEntregaDias: number;
  observaciones: string;
  estado: EstadoRegistro;
  materiasPrimasIds: string[];
  precios: PrecioProveedor[];
}

export type EstadoOrdenCompra = 'pendiente' | 'enviada' | 'recibida' | 'cancelada';

export interface DetalleOrdenCompra {
  materiaPrimaId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface OrdenCompra {
  id: string;
  proveedorId: string;
  fecha: string;
  estado: EstadoOrdenCompra;
  observaciones: string;
  detalles: DetalleOrdenCompra[];
  compraId?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  direccion: string;
  ciudad: string;
  observaciones: string;
  estado: EstadoRegistro;
}

export type CanalRecepcion = 'whatsapp' | 'correo' | 'telefono';

export type EstadoPedido =
  | 'pendiente'
  | 'en_produccion'
  | 'listo'
  | 'entregado'
  | 'cancelado';

export interface DetallePedido {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  fecha: string;
  fechaEntrega?: string;
  estado: EstadoPedido;
  canalRecepcion: CanalRecepcion;
  observaciones: string;
  detalles: DetallePedido[];
  consolidadoProduccionId?: string;
}

export type EstadoConsolidado = 'pendiente' | 'producido';

export interface ConsolidadoProduccion {
  id: string;
  fecha: string;
  pedidoIds: string[];
  productos: { productoId: string; cantidadTotal: number }[];
  estado: EstadoConsolidado;
}

export interface Factura {
  id: string;
  pedidoId: string;
  numeroFactura: string;
  fechaFactura: string;
}

export type EstadoPago = 'pendiente' | 'parcial' | 'pagado' | 'vencido';

export interface PagoCartera {
  id: string;
  fecha: string;
  monto: number;
  observaciones: string;
}

export interface Cartera {
  id: string;
  facturaId: string;
  pedidoId: string;
  clienteId: string;
  fechaVencimiento: string;
  valor: number;
  saldoPendiente: number;
  estadoPago: EstadoPago;
  pagos: PagoCartera[];
}

export interface AlertaCartera {
  carteraId: string;
  clienteNombre: string;
  numeroFactura: string;
  fechaVencimiento: string;
  saldoPendiente: number;
  diasRestantes: number;
  tipo: 'proxima_vencer' | 'vencida';
}

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  password: string;
}

export interface AppData {
  materiasPrimas: MateriaPrima[];
  productosTerminados: ProductoTerminado[];
  recetas: Receta[];
  compras: Compra[];
  movimientos: MovimientoInventario[];
  proveedores: Proveedor[];
  ordenesCompra: OrdenCompra[];
  clientes: Cliente[];
  pedidos: Pedido[];
  consolidadosProduccion: ConsolidadoProduccion[];
  facturas: Factura[];
  cartera: Cartera[];
  usuarios: Usuario[];
}

export interface SesionUsuario {
  id: string;
  nombre: string;
  correo: string;
}

export const UNIDADES_MEDIDA = [
  'kg',
  'g',
  'L',
  'mL',
  'unidad',
  'galón',
  'lb',
] as const;

export const CANALES_RECEPCION: { value: CanalRecepcion; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'correo', label: 'Correo electrónico' },
  { value: 'telefono', label: 'Llamada telefónica' },
];

export const STORAGE_KEY = 'opti-proces-data';
export const SESSION_KEY = 'opti-proces-session';
