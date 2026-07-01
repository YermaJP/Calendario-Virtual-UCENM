# UCENM — Plataforma de Gestión Académica
### Guía rápida para el maestro

---

## ¿Qué es esta aplicación?

Esta herramienta le permite publicar su **calendario de clases**, **tareas** y **anuncios** para que sus alumnos puedan consultarlos fácilmente desde cualquier dispositivo. Funciona directamente en el navegador, sin instalar nada ni necesitar internet una vez descargada.

---

## Cómo abrir la aplicación

**Opción A — En su computadora (sin internet):**
1. Haga **doble clic** en el archivo `index.html`.
2. Se abre en su navegador (Chrome, Firefox, Edge).
3. Elija su rol y comience a usarla.

**Opción B — Subida a un hosting (con internet, recomendada para compartir con alumnos):**
Vea la sección "Cómo subir a Hostinger" más abajo.

---

## Cómo cambiar el PIN del maestro

Abra el archivo `lib/config.js` con el Bloc de notas (Windows) o TextEdit (Mac).

Busque esta línea:
```
pinMaestro: "ucenm2024",
```

Cámbiela por el PIN que desee, por ejemplo:
```
pinMaestro: "MiClave2026",
```

Guarde el archivo. La próxima vez que abra la app, el nuevo PIN será el correcto.

> ⚠️ **Importante:** No comparta este archivo con los alumnos; solo usted debe tener acceso a él.

---

## Cómo cambiar el nombre de la materia, el maestro y el ciclo

En el mismo archivo `lib/config.js`, encontrará estas líneas:

```
nombreMateria: "Introducción a la Programación",
nombreMaestro: "Prof. Carlos Medina",
cicloAcademico: "I Período 2026",
carrera: "Ingeniería en Sistemas",
```

Cámbielas por los datos de su clase. Por ejemplo:

```
nombreMateria: "Cálculo Diferencial",
nombreMaestro: "Lic. Ana Torres",
cicloAcademico: "II Período 2026",
carrera: "Ingeniería Industrial",
```

Guarde el archivo. Al recargar la aplicación, los nuevos datos aparecerán en la cabecera y en el dashboard.

---

## Cómo subir la aplicación a Hostinger

1. Inicie sesión en su cuenta de Hostinger.
2. Vaya al **Administrador de archivos** de su dominio o subdominio.
3. Dentro de la carpeta `public_html`, suba **todos** los archivos y carpetas:
   - `index.html`
   - `css/` (carpeta completa)
   - `lib/` (carpeta completa)
   - `.htaccess`
4. Abra su dominio en el navegador. La app debe funcionar inmediatamente.
5. Comparta el enlace con sus alumnos.

> **Tip:** Si usa un subdominio (por ejemplo `clases.sudominio.com`), suba los archivos dentro de la carpeta correspondiente a ese subdominio.

---

## Botón Exportar — ¿Para qué sirve?

El botón **"Exportar respaldo"** (en el panel de administración, sección "Respaldo de datos") descarga un archivo llamado `ucenm-backup-YYYYMMDD.json` con todas sus clases, tareas y anuncios.

Úselo para:
- **Hacer una copia de seguridad** antes de limpiar el navegador.
- **Compartir su contenido** con otro dispositivo (por ejemplo, pasar de su laptop a la computadora de la oficina).
- **Guardar el avance** al terminar cada semana.

---

## Botón Importar — ¿Cómo restaurar un respaldo?

1. En el panel de administración, haga clic en **"Importar respaldo"**.
2. Seleccione el archivo `.json` que exportó anteriormente.
3. Los datos se restaurarán automáticamente.

> Nota: la importación **reemplaza** los datos actuales con los del archivo. Si desea conservar los datos actuales, exporte primero.

---

## Cómo restaurar los datos de ejemplo

Si algo salió mal y desea volver al estado inicial con datos de muestra:

1. Vaya al panel de administración (necesita el PIN de maestro).
2. Haga clic en **"Restaurar datos de ejemplo"**.
3. Confirme la acción.

Esto borrará todo lo que haya creado y cargará los datos de muestra originales.

> También puede borrar los datos del navegador manualmente: en Chrome, vaya a Configuración → Privacidad → Borrar datos de navegación → Datos de sitios web almacenados.

---

## Preguntas frecuentes

**¿Los datos se guardan en internet?**
No. Todo se guarda en el navegador de su dispositivo (localStorage). Si borra los datos del navegador, se pierden los datos. Por eso recomendamos exportar un respaldo periódicamente.

**¿Pueden los alumnos editar las clases o tareas?**
No. Los alumnos solo pueden ver. Solo quien conoce el PIN puede agregar, editar o eliminar contenido.

**¿Funciona en celular?**
Sí, la aplicación está diseñada para verse bien en pantallas pequeñas.

**¿Mis alumnos necesitan cuenta o contraseña?**
No. Los alumnos eligen "Soy alumno" y entran directamente, sin registro ni contraseña.

**¿Puedo usarla para varias materias?**
Sí, pero necesitaría copias separadas de la carpeta, cada una con su propio `lib/config.js` configurado.

---

## Estructura de archivos

```
ucenm/
├── index.html          ← Archivo principal (abrir este)
├── .htaccess           ← Configuración para Hostinger
├── css/
│   └── estilos.css     ← Diseño visual (no modificar)
└── lib/
    ├── config.js       ← ✏️ EDITAR: PIN, materia, maestro, ciclo
    ├── datos-ejemplo.js ← Datos de muestra iniciales
    ├── almacenamiento.js ← Lógica de guardado (no modificar)
    ├── calendario.js   ← Módulo de calendario (no modificar)
    ├── tareas.js       ← Módulo de tareas (no modificar)
    ├── anuncios.js     ← Módulo de anuncios (no modificar)
    ├── admin.js        ← Panel de administración (no modificar)
    └── app.js          ← Lógica principal (no modificar)
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
