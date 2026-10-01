# Cómo conectar Opti-Proces a Firebase Firestore

Esta es la guía si es tu primera vez con Firebase. La aplicación ya está preparada: cuando pegues tus claves, los datos se guardarán en la nube (y también una copia local por si no hay internet).

---

## 1. Crear una cuenta y un proyecto

1. Entra a [https://console.firebase.google.com](https://console.firebase.google.com) con tu cuenta de Google.
2. Pulsa **Crear un proyecto** (o *Add project*).
3. Nombre sugerido: `opti-proces`.
4. Puedes **desactivar Google Analytics** (no es necesario para este proyecto).
5. Espera a que termine de crear el proyecto y pulsa **Continuar**.

---

## 2. Crear la aplicación web

1. En la pantalla del proyecto, pulsa el ícono **`</>`** (Web).
2. Apodo de la app: `opti-proces-web`.
3. **No** marques Firebase Hosting por ahora.
4. Pulsa **Registrar app**.
5. Copia el objeto `firebaseConfig`. Se ve así:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "opti-proces-xxxxx.firebaseapp.com",
  projectId: "opti-proces-xxxxx",
  storageBucket: "opti-proces-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 3. Activar Firestore

1. En el menú izquierdo: **Build** → **Firestore Database**.
2. Pulsa **Crear base de datos**.
3. Elige modo de producción o de prueba. Para practicar, elige **Empezar en modo de prueba** (permite leer y escribir 30 días).
4. Ubicación: elige la más cercana, por ejemplo **`southamerica-east1` (São Paulo)** o `us-central`.
5. Pulsa **Habilitar** y espera a que se cree.

### Reglas de seguridad (modo prueba)

En **Firestore → Reglas**, para desarrollo puedes dejar:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Esto deja la base abierta. Está bien para la práctica. **No lo uses en un sistema real con datos sensibles.**

---

## 4. Pegar las claves en el proyecto

Abre el archivo:

`src/environments/environment.ts`

Reemplaza los textos `PEGA_AQUI_...` por los valores de tu `firebaseConfig`.

Haz lo mismo en `src/environments/environment.prod.ts` si vas a generar la versión de producción.

Guarda los archivos y **reinicia** la app (`Ctrl+C` en la terminal y luego `npm start`).

---

## 5. Comprobar que funcionó

1. Entra a la app: `http://localhost:4200`
2. Inicia sesión: `admin@opti-proces.local` / `admin123`
3. En el menú izquierdo, debajo de *Opti-Proces*, debe decir **Firestore: conectado**
4. Crea una materia prima de prueba.
5. En Firebase Console → **Firestore Database** debes ver:
   - Colección: `opti-proces`
   - Documento: `app-data`
   - Dentro, los arreglos (`materiasPrimas`, `proveedores`, `pedidos`, etc.)

Si ya tenías datos en el navegador (localStorage), la primera vez se **suben solos** a Firestore.

---

## 6. Qué significa cada estado

| Texto en el menú | Significado |
|---|---|
| Firestore: conectado | Los datos se guardan en la nube |
| Firestore: falta configurar | Aún no pegaste las claves reales |
| Firestore: error | Hay claves, pero falló la conexión (revisa internet, reglas o projectId) |
| Datos locales | Usa solo el navegador |

---

## 7. Vercel (producción)

El build de producción usa `src/environments/environment.prod.ts`. Esa config queda compilada en el JavaScript: **no hace falta** pegar claves de Firebase en el panel de Vercel.

Tras el push a `main`, Vercel vuelve a desplegar solo. Si es el primer deploy o ves 404:

- Output Directory: `dist/opti-proces/browser` (ya está en `vercel.json`)
- En Firebase Console → **Authentication** → **Settings** → **Authorized domains**, agrega tu dominio de Vercel (por ejemplo `opti-proces.vercel.app` y el dominio custom si lo tienes). Firestore funciona sin eso; sirve si más adelante usas Auth de Firebase.

Las reglas de `firestore.rules` hay que publicarlas en **Firestore → Reglas** (Vercel no las sube).

---

## Si algo falla

- **“Missing or insufficient permissions”**: las reglas de Firestore no permiten escribir. Usa las reglas de prueba del paso 3.
- **Sigue diciendo “falta configurar”**: no reemplazaste `PEGA_AQUI` o no reiniciaste `npm start`.
- **La app no abre**: instala dependencias con `npm install firebase @angular/fire@19` y vuelve a `npm start`.
