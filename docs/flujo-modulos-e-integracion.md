# Opti-Proces — Flujo de módulos e integración

**Empresa:** Industrias Arias JF SAS  
**Sistema:** Opti-Proces — Gestión administrativa  
**Versión del documento:** Agosto 2026

---

## 1. Resumen general

Opti-Proces centraliza tres procesos que antes se manejaban de forma manual o en archivos Excel:

| Módulo | Propósito principal |
|--------|---------------------|
| **Inventarios** | Control de materias primas, productos terminados, producción y alertas de stock |
| **Proveedores** | Gestión de proveedores, órdenes de compra e historial de abastecimiento |
| **Ventas** | Pedidos de clientes, facturación manual y control de cartera |

Los tres módulos comparten la misma base de datos local (localStorage del navegador), de modo que cualquier cambio en un módulo se refleja en los demás en tiempo real.

---

## 2. Módulo de Inventarios

### 2.1 Funcionalidades

- Registrar y administrar **materias primas** (nombre, unidad, stock mínimo, costo).
- Registrar **productos terminados** y sus existencias.
- Definir **recetas** (fórmulas fijas por producto).
- **Registrar compras** (entrada de materias primas).
- **Registrar salidas** manuales de materias primas.
- **Registrar producción** (descuenta materias según receta y aumenta productos terminados).
- **Alertas** cuando una materia prima está bajo el stock mínimo.
- **Sugerencias de compra** considerando stock mínimo y demanda de pedidos pendientes.
- **Historial de movimientos** (solo lectura).

### 2.2 Pantallas

| Ruta | Pantalla |
|------|----------|
| `/inventarios` | Resumen / dashboard |
| `/inventarios/materias-primas` | Lista y CRUD de materias primas |
| `/inventarios/productos` | Productos terminados |
| `/inventarios/recetas` | Recetas por producto |
| `/inventarios/compras` | Registrar compra manual |
| `/inventarios/salidas` | Salida manual de materias |
| `/inventarios/produccion` | Producción por receta |
| `/inventarios/alertas` | Alertas de bajo stock |
| `/inventarios/sugerencias` | Sugerencias de compra |
| `/inventarios/historial` | Historial de movimientos |

### 2.3 Tipos de movimiento en inventario

| Tipo | Descripción |
|------|-------------|
| Entrada por compra | Ingreso de materia prima desde una compra u orden recibida |
| Salida manual | Retiro manual de materia prima |
| Consumo en producción | Materia prima usada al producir un producto |
| Entrada por producción | Producto terminado generado en producción |
| Salida por venta | Producto terminado despachado al entregar un pedido |

---

## 3. Módulo de Proveedores

### 3.1 Funcionalidades

- **Registrar y actualizar proveedores** (nombre, NIT, contacto, dirección, tiempo de entrega).
- **Asociar materias primas** a cada proveedor con precio de compra.
- **Generar órdenes de compra** manualmente o cargando las sugerencias del módulo de inventarios.
- **Seguimiento de órdenes:** pendiente → enviada → recibida / cancelada.
- **Recibir orden:** al confirmar recepción, se registra automáticamente la compra en inventario.
- **Historial de compras** por proveedor y global.

### 3.2 Pantallas

| Ruta | Pantalla |
|------|----------|
| `/proveedores` | Resumen / dashboard |
| `/proveedores/lista` | Lista de proveedores |
| `/proveedores/ordenes` | Órdenes de compra |
| `/proveedores/historial` | Historial de compras |

### 3.3 Estados de una orden de compra

```
Pendiente  →  Enviada  →  Recibida  (actualiza inventario)
                ↓
            Cancelada
```

---

## 4. Módulo de Ventas

### 4.1 Funcionalidades

**Gestión de pedidos**
- Registrar pedidos de clientes con productos y cantidades.
- Identificar canal de recepción: WhatsApp, correo electrónico o llamada telefónica.
- Consultar pedidos pendientes, en producción, listos, entregados o cancelados.
- Consolidar varios pedidos para enviarlos a producción.
- Historial de pedidos por cliente.

**Facturación**
- Asociar manualmente número de factura (emitida en software externo).
- Registrar fecha de emisión y fecha de vencimiento.
- Verificar si un pedido ya fue facturado.

**Cartera**
- Consultar cuentas por cobrar pendientes.
- Registrar pagos parciales o totales.
- Alertas por facturas próximas a vencer (7 días) o vencidas.
- Resumen de cartera por cliente.

### 4.2 Pantallas

| Ruta | Pantalla |
|------|----------|
| `/ventas` | Resumen / dashboard |
| `/ventas/clientes` | Clientes |
| `/ventas/pedidos` | Pedidos |
| `/ventas/consolidar` | Consolidar para producción |
| `/ventas/facturacion` | Facturación |
| `/ventas/cartera` | Cartera |
| `/ventas/alertas-cartera` | Alertas de vencimiento |

### 4.3 Estados de un pedido

```
Pendiente  →  En producción  →  Listo  →  Entregado  (descuenta inventario de productos)
     ↓
 Cancelado
```

---

## 5. Integración entre módulos

### 5.1 Diagrama general

```
                    ┌─────────────────┐
                    │     VENTAS      │
                    │  Pedidos        │
                    │  Facturación    │
                    │  Cartera        │
                    └────────┬────────┘
                             │
         Demanda materias    │    Despacho productos
         (pedidos pendientes)│    (pedido entregado)
                             ▼
                    ┌─────────────────┐
                    │   INVENTARIOS   │
                    │  Stock MP/PT    │
                    │  Producción     │
                    │  Sugerencias    │
                    │  Alertas stock  │
                    └────────┬────────┘
                             │
         Sugerencias compra  │    Recepción compra
                             ▼
                    ┌─────────────────┐
                    │  PROVEEDORES    │
                    │  Proveedores    │
                    │  Órdenes compra │
                    │  Historial      │
                    └─────────────────┘
```

### 5.2 Flujos integrados detallados

#### Flujo A — Pedido → Demanda de materias → Sugerencia de compra

1. En **Ventas**, se registra un pedido con productos y cantidades (estado: *Pendiente*).
2. El sistema consulta las **recetas** de esos productos en Inventarios.
3. Calcula cuánta materia prima se necesitaría para fabricar esos pedidos.
4. En **Inventarios → Sugerencias de compra**, aparece la columna *Demanda pedidos* y la cantidad sugerida considera tanto el stock mínimo como esa demanda.
5. Si hay un proveedor asociado a la materia prima, se muestra como *Proveedor sugerido*.

#### Flujo B — Sugerencia → Orden de compra → Inventario

1. En **Inventarios → Sugerencias**, el usuario va a **Proveedores → Órdenes de compra**.
2. Pulsa *Cargar desde sugerencias de inventario* (pre-llena materias, cantidades y precios).
3. Se crea la orden (estado: *Pendiente*).
4. Opcionalmente se marca como *Enviada* al contactar al proveedor.
5. Al pulsar **Recibir**, el sistema:
   - Registra la compra en el historial.
   - Aumenta el stock de cada materia prima.
   - Genera movimientos de tipo *Entrada por compra*.
   - Marca la orden como *Recibida*.

#### Flujo C — Pedidos → Consolidación → Producción

1. En **Ventas → Consolidar producción**, se seleccionan pedidos en estado *Pendiente*.
2. Al consolidar, los pedidos pasan a *En producción* y se agrupan las cantidades totales por producto.
3. Al pulsar **Registrar producción** en el consolidado:
   - Se descuentan materias primas según las recetas.
   - Se incrementa el stock de productos terminados.
   - Los pedidos pasan a estado *Listo para entrega*.

#### Flujo D — Entrega → Salida de inventario

1. En **Ventas → Pedidos**, un pedido en estado *Listo* puede marcarse como **Entregar**.
2. El sistema verifica stock suficiente de productos terminados.
3. Descuenta las cantidades del inventario.
4. Registra movimiento de tipo *Salida por venta*.
5. El pedido queda en estado *Entregado*.

#### Flujo E — Facturación → Cartera → Pagos

1. Tras entregar (o en cualquier momento posterior), en **Ventas → Facturación** se selecciona el pedido.
2. Se ingresa número de factura, fecha de factura y **fecha de vencimiento**.
3. Se crea automáticamente un registro en **Cartera** con el valor total del pedido.
4. En **Cartera**, se pueden registrar pagos parciales o totales.
5. El saldo pendiente se actualiza; al llegar a cero, el estado pasa a *Pagado*.
6. **Alertas cartera** avisa facturas vencidas o que vencen en los próximos 7 días.

---

## 6. Alertas del sistema

| Tipo | Origen | Dónde se ve |
|------|--------|-------------|
| Bajo stock | Materia prima bajo stock mínimo | Inventarios → Alertas; badge en menú lateral |
| Snackbar instantáneo | Tras movimiento que deja stock bajo mínimo | Notificación emergente al registrar movimiento |
| Cartera vencida | Factura con saldo y fecha de vencimiento pasada | Ventas → Alertas cartera |
| Cartera próxima | Factura con saldo que vence en ≤ 7 días | Ventas → Alertas cartera |

El icono de campana en la barra superior muestra el total combinado de alertas de inventario y cartera.

---

## 7. Flujo de prueba recomendado (paso a paso)

Use este escenario para validar que los tres módulos trabajan en conjunto.

### Paso 1 — Configuración inicial (Inventarios)

1. Crear materia prima: **Surfactante** — unidad: kg — stock mínimo: 50 — stock inicial: 30.
2. Crear materia prima: **Esencia** — unidad: L — stock mínimo: 10 — stock inicial: 8.
3. Crear producto terminado: **Detergente líquido 1L** — precio: $8.000 — stock inicial: 0.
4. Crear receta del detergente: 0,5 kg Surfactante + 0,1 L Esencia por unidad.

> Resultado esperado: aparece alerta de bajo stock en Surfactante y Esencia.

### Paso 2 — Proveedor (Proveedores)

1. Crear proveedor: **Químicos del Valle** — NIT, teléfono, tiempo entrega: 3 días.
2. Asociar Surfactante (precio: $5.000/kg) y Esencia (precio: $12.000/L).

### Paso 3 — Pedido de cliente (Ventas)

1. Crear cliente: **Distribuidora La 14**.
2. Registrar pedido: 100 unidades de Detergente líquido 1L — canal: WhatsApp.

> Resultado esperado: en Sugerencias de compra aumenta la *Demanda pedidos* según la receta (50 kg Surfactante, 10 L Esencia).

### Paso 4 — Compra a proveedor (Proveedores + Inventarios)

1. Ir a **Órdenes de compra** → *Cargar desde sugerencias*.
2. Crear la orden → **Recibir**.
3. Verificar en **Inventarios → Materias primas** que subió el stock.
4. Verificar en **Historial de movimientos** las entradas por compra.

### Paso 5 — Producción (Ventas + Inventarios)

1. Ir a **Consolidar producción** → seleccionar el pedido → Consolidar.
2. Pulsar **Registrar producción**.
3. Verificar: materias primas descontadas, productos terminados en 100 unidades, pedido en estado *Listo*.

### Paso 6 — Entrega y facturación (Ventas + Inventarios)

1. En **Pedidos** → **Entregar** el pedido.
2. Verificar: stock de producto terminado en 0, movimiento *Salida por venta*.
3. En **Facturación**: registrar factura FE-001, vencimiento a 30 días.
4. Verificar registro en **Cartera** con saldo $800.000 (100 × $8.000).

### Paso 7 — Pago (Ventas)

1. En **Cartera** → **Registrar pago** (total o parcial).
2. Verificar actualización de saldo y estado de pago.

---

## 8. Datos técnicos

| Aspecto | Detalle |
|---------|---------|
| Almacenamiento | localStorage del navegador (`opti-proces-data`) |
| Sesión | Login simple; usuario demo: `admin@opti-proces.local` / `admin123` |
| Framework | Angular 19 + Angular Material |
| Idioma / formato | Español (Colombia), fechas y moneda locale `es-CO` |

> **Nota:** Los datos persisten en el navegador donde se usa la aplicación. Si se limpia el almacenamiento del navegador o se cambia de equipo, los datos no se transfieren automáticamente.

---

## 9. Relación con los requerimientos del proyecto

| Requerimiento (documento de prácticas) | Implementación |
|----------------------------------------|----------------|
| Registrar proveedores y asociar materias primas | Módulo Proveedores → Lista |
| Generar órdenes desde sugerencias de inventario | Sugerencias → Órdenes de compra |
| Historial de compras por proveedor | Proveedores → Historial |
| Registrar pedidos con canal de recepción | Ventas → Pedidos |
| Consolidar pedidos para producción | Ventas → Consolidar |
| Sugerencias según inventario y pedidos pendientes | Inventarios → Sugerencias |
| Registrar factura y vencimiento | Ventas → Facturación |
| Cartera, pagos parciales/totales | Ventas → Cartera |
| Alertas de vencimiento | Ventas → Alertas cartera |
| Alertas de bajo stock | Inventarios → Alertas |

---

*Documento generado para el proyecto Opti-Proces — Industrias Arias JF SAS.*
