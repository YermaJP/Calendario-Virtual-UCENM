# UCENM — Plataforma de Gestión Académica (versión Firebase)
### Guía rápida para el maestro

---

## ¿Qué cambió respecto a la versión anterior?

| Antes | Ahora |
|---|---|
| Datos guardados solo en el navegador (localStorage) | Datos en **Firestore**, visibles desde cualquier dispositivo |
| Maestro entraba con un PIN fijo | Maestro entra con **correo y contraseña** (Firebase Authentication) |
| Alumno entraba sin cuenta | Alumno sigue sin necesitar registro — internamente usa una sesión anónima para poder marcar tareas |
| Hosting en Hostinger | **Firebase Hosting** (gratis, con SSL) |
| "Tarea completada" era por dispositivo | Ahora es **compartido**: si un alumno la marca, todos la ven marcada |

---

## Configuración inicial (una sola vez)

### 1. Crear el proyecto en Firebase

1. Vaya a [console.firebase.google.com](https://console.firebase.google.com/) e inicie sesión con una cuenta de Google.
2. **Agregar proyecto** → póngale un nombre (ej. `ucenm-calendario`) → siga los pasos (puede desactivar Google Analytics, no es necesario).

### 2. Registrar la app web

1. En la página principal del proyecto, haga clic en el ícono **`</>`** (Web).
2. Póngale un apodo (ej. "UCENM Web") y **NO** marque "Firebase Hosting" todavía (lo haremos por línea de comandos).
3. Copie el objeto `firebaseConfig` que le muestra.
4. Abra `lib/firebase-config.js` y reemplace los valores de ejemplo con los suyos.

### 3. Activar Authentication

1. En el menú lateral: **Compilación → Authentication → Comenzar**.
2. Pestaña **Sign-in method** → active dos proveedores:
   - **Correo electrónico/contraseña**
   - **Anónimo**
3. Pestaña **Users** → **Agregar usuario** → cree la cuenta del maestro (correo + contraseña). Esa será la cuenta con la que usted inicia sesión en la app.

### 4. Activar Firestore

1. Menú lateral: **Compilación → Firestore Database → Crear base de datos**.
2. Elija **modo de producción** (las reglas de seguridad ya vienen incluidas en `firestore.rules`).
3. Seleccione la región más cercana (ej. `us-central` o `us-east4`).

### 5. Subir las reglas de seguridad y desplegar

Necesita [Node.js](https://nodejs.org) instalado. Desde la carpeta del proyecto:

```bash
npm install -g firebase-tools
firebase login
```

Edite `.firebaserc` y reemplace `TU_PROYECTO_ID` con el ID real de su proyecto (lo ve en Configuración del proyecto → General).

Luego:

```bash
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

Al terminar, Firebase le da una URL pública (algo como `https://su-proyecto.web.app`). Esa es la que comparte con sus alumnos.

> **Alternativa sin línea de comandos:** puede subir manualmente las reglas copiando el contenido de `firestore.rules` dentro de Firestore Database → Reglas → pegar → Publicar. Para el hosting sin CLI necesitaría otro proveedor de hosting estático (Netlify, Vercel, GitHub Pages), pero perdería la integración automática de "un clic" que da `firebase deploy`.

---

## Uso diario

**Como maestro:**
1. Abra la URL de su app (o `index.html` localmente).
2. Clic en **"Soy maestro"** → ingrese el correo y contraseña que creó en el paso 3.
3. Cree clases, tareas y anuncios normalmente — se guardan en la nube y todos los alumnos los ven al instante.

**Como alumno:**
1. Clic en **"Soy alumno"** — entra directo, sin registro.
2. Puede ver el calendario, tareas, anuncios, y marcar tareas como completadas (visible para todos).

---

## Cómo cambiar el nombre de la materia, el maestro y el ciclo

Abra `lib/config.js` y edite:

```js
nombreMateria: "Introducción a la Programación",
nombreMaestro: "Prof. Carlos Medina",
cicloAcademico: "I Período 2026",
carrera: "Ingeniería en Sistemas",
```

Guarde y vuelva a desplegar con `firebase deploy --only hosting`.

---

## Botón Exportar / Importar / Restaurar ejemplo

Funcionan igual que antes, pero ahora leen y escriben directo en Firestore (requieren estar logueado como maestro):

- **Exportar respaldo**: descarga un `.json` con todo lo que hay en la nube.
- **Importar respaldo**: reemplaza los datos de Firestore con los del archivo (para todos los usuarios).
- **Restaurar datos de ejemplo**: vuelve al contenido de muestra inicial (para todos).

---

## Preguntas frecuentes

**¿Los datos se guardan en internet?**
Sí, en Firestore (Google Cloud). Cualquier dispositivo con la URL ve los mismos datos en tiempo real.

**¿Pueden los alumnos editar las clases o tareas?**
No. Solo quien inicia sesión con el correo/contraseña del maestro puede crear, editar o eliminar clases, tareas y anuncios. Los alumnos sí pueden marcar tareas como completadas (ese estado es compartido).

**¿Mis alumnos necesitan cuenta o contraseña?**
No. Entran con "Soy alumno" sin registro.

**¿Puedo usarla para varias materias?**
Sí, pero necesitaría un proyecto de Firebase separado por materia (o adaptar las rutas de Firestore), cada uno con su propio `lib/config.js` y `lib/firebase-config.js`.

**¿Cuánto cuesta Firebase?**
El plan gratuito (Spark) de Firestore, Auth y Hosting cubre sin costo el uso típico de un salón de clases.

---

## Estructura de archivos

```
ucenm/
├── index.html              ← Archivo principal
├── firebase.json           ← Configuración de Hosting/Firestore para el CLI
├── firestore.rules         ← Reglas de seguridad de la base de datos
├── .firebaserc              ← ID de su proyecto Firebase
├── css/
│   └── estilos.css         ← Diseño visual (no modificar)
└── lib/
    ├── firebase-config.js  ← ✏️ EDITAR: llaves de su proyecto Firebase
    ├── config.js            ← ✏️ EDITAR: materia, maestro, ciclo
    ├── datos-ejemplo.js     ← Datos de muestra (para "Restaurar ejemplo")
    ├── almacenamiento.js    ← Conexión a Firestore/Auth (no modificar)
    ├── calendario.js        ← Módulo de calendario (no modificar)
    ├── tareas.js             ← Módulo de tareas (no modificar)
    ├── anuncios.js           ← Módulo de anuncios (no modificar)
    ├── admin.js               ← Panel de administración (no modificar)
    └── app.js                ← Lógica principal, login (no modificar)
```

---

## Información institucional

**Universidad Cristiana Evangélica Nuevo Milenio (UCENM)**
San Pedro Sula, Cortés, Honduras

- Sitio web: [web.ucenm.net](https://web.ucenm.net/)
- PTA (Tareas): [pta.ucenm.net](https://pta.ucenm.net/)
- PVA (Virtual): [pva.ucenm.net](https://pva.ucenm.net/)
- Correo: info@ucenm.net
- Call Center: 2557-0607

---

*© UCENM 2026 — Universidad Cristiana Evangélica Nuevo Milenio*
