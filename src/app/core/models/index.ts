export type EstadoRegistro = 'activo' | 'inactivo';

export type TipoMovimiento =
  | 'entrada_compra'
  | 'salida_manual'
  | 'produccion_materia'
  | 'produccion_producto';

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
  proveedorNombre: string;
  proveedorNit: string;
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
  unidadMedida: string;
  costoPromedio: number;
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

export const STORAGE_KEY = 'opti-proces-data';
export const SESSION_KEY = 'opti-proces-session';
