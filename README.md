# Opti-Proces

Software de gestión administrativa para **Industrias Arias JF SAS**. Proyecto de práctica empresarial — UdeA 2026-1.

## Módulos

| Módulo | Estado |
|---|---|
| Inventarios | Implementado |
| Proveedores | Implementado |
| Ventas / Cartera | Implementado |

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
npm install
npm start
```

La aplicación estará disponible en `http://localhost:4200`.

## Credenciales demo

- **Correo:** admin@opti-proces.local
- **Contraseña:** admin123

## Módulo de inventarios

- CRUD de materias primas (registro manual)
- Consulta de productos terminados
- Recetas de producción (fórmula por unidad)
- Registro de compras simuladas (entrada de inventario)
- Salidas manuales de materias primas
- Producción por receta (descuenta materias primas, incrementa producto terminado)
- Alertas de bajo stock (badge + panel + notificación instantánea)
- Sugerencias de compra (basadas en stock mínimo)
- Historial de movimientos (solo lectura)

## Almacenamiento

Los datos se guardan en **Firebase Firestore** (colección `opti-proces`, documento `app-data`) y se mantiene una copia local en el navegador.

Guía paso a paso para tu primera vez: [docs/firebase-setup.md](docs/firebase-setup.md)

## Stack

- Angular 19 (standalone components)
- Angular Material
- TypeScript
- Firebase Firestore
- Locale: es-CO
