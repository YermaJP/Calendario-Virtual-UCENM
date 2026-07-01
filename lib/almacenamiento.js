// ============================================================
// UCENM — Almacenamiento y utilidades
// ============================================================
(function () {
  "use strict";

  // ---- ALMACENAMIENTO ----
  var CFG = window.UCENM_CONFIG;

  window.UCENM_DB = {
    get: function (key) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); return true; }
      catch (e) { return false; }
    },
    getClases: function () { return this.get(CFG.keys.clases) || []; },
    getTareas: function () { return this.get(CFG.keys.tareas) || []; },
    getAnuncios: function () { return this.get(CFG.keys.anuncios) || []; },
    getTareasCompletadas: function () { return this.get(CFG.keys.tareasCompletadas) || {}; },
    setClases: function (v) { return this.set(CFG.keys.clases, v); },
    setTareas: function (v) { return this.set(CFG.keys.tareas, v); },
    setAnuncios: function (v) { return this.set(CFG.keys.anuncios, v); },
    setTareasCompletadas: function (v) { return this.set(CFG.keys.tareasCompletadas, v); },
  };

  // ---- INICIALIZAR CON DATOS DE EJEMPLO ----
  (function inicializarDatos() {
    if (!localStorage.getItem(CFG.keys.inicializado) && window.UCENM_DATOS_EJEMPLO) {
      var ej = window.UCENM_DATOS_EJEMPLO;
      window.UCENM_DB.setClases(ej.clases || []);
      window.UCENM_DB.setTareas(ej.tareas || []);
      window.UCENM_DB.setAnuncios(ej.anuncios || []);
      localStorage.setItem(CFG.keys.inicializado, "1");
    }
  })();

  // ---- UTILIDADES DE FECHA ----
  window.UCENM_FECHA = {
    hoy: function () {
      var d = new Date();
      return d.toISOString().split("T")[0];
    },
    formatoCorto: function (fechaStr) {
      if (!fechaStr) return "";
      var partes = fechaStr.split("-");
      var meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
      return partes[2] + " " + meses[parseInt(partes[1], 10) - 1] + " " + partes[0];
    },
    formatoLargo: function (fechaStr) {
      if (!fechaStr) return "";
      var d = new Date(fechaStr + "T12:00:00");
      return d.toLocaleDateString("es-HN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    },
    diasHasta: function (fechaStr) {
      var hoy = new Date(); hoy.setHours(0,0,0,0);
      var meta = new Date(fechaStr + "T12:00:00"); meta.setHours(0,0,0,0);
      return Math.round((meta - hoy) / 86400000);
    },
    badgeClase: function (fechaStr) {
      var dias = this.diasHasta(fechaStr);
      if (dias < 0) return "rojo";
      if (dias <= 2) return "rojo";
      if (dias <= 5) return "amarillo";
      return "verde";
    },
  };

  // ---- TOAST ----
  window.UCENM_TOAST = {
    mostrar: function (msg, tipo) {
      var contenedor = document.getElementById("toast-container");
      if (!contenedor) return;
      var t = document.createElement("div");
      t.className = "toast " + (tipo || "");
      t.textContent = msg;
      contenedor.appendChild(t);
      setTimeout(function () {
        t.style.opacity = "0"; t.style.transition = "opacity .3s";
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 350);
      }, 2800);
    },
    exito: function (m) { this.mostrar(m, "exito"); },
    error: function (m) { this.mostrar(m, "error"); },
  };

  // ---- GENERAR ID ----
  window.UCENM_ID = function (prefijo) {
    return (prefijo || "id") + "_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
  };

  // ---- EXPORTAR / IMPORTAR ----
  window.UCENM_BACKUP = {
    exportar: function () {
      var datos = {
        version: "1.0",
        fecha: new Date().toISOString(),
        materia: CFG.nombreMateria,
        clases: window.UCENM_DB.getClases(),
        tareas: window.UCENM_DB.getTareas(),
        anuncios: window.UCENM_DB.getAnuncios(),
        tareasCompletadas: window.UCENM_DB.getTareasCompletadas(),
      };
      var json = JSON.stringify(datos, null, 2);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var hoy = new Date().toISOString().split("T")[0].replace(/-/g, "");
      a.download = "ucenm-backup-" + hoy + ".json";
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
      window.UCENM_TOAST.exito("Respaldo descargado correctamente ✓");
    },
    importar: function (archivo, callback) {
      var lector = new FileReader();
      lector.onload = function (e) {
        try {
          var datos = JSON.parse(e.target.result);
          if (!datos.clases || !datos.tareas || !datos.anuncios) throw new Error("Formato inválido");
          window.UCENM_DB.setClases(datos.clases);
          window.UCENM_DB.setTareas(datos.tareas);
          window.UCENM_DB.setAnuncios(datos.anuncios);
          if (datos.tareasCompletadas) window.UCENM_DB.setTareasCompletadas(datos.tareasCompletadas);
          window.UCENM_TOAST.exito("Datos importados correctamente ✓");
          if (callback) callback();
        } catch (err) {
          window.UCENM_TOAST.error("Error al importar: archivo no válido");
        }
      };
      lector.readAsText(archivo);
    },
    restaurarEjemplo: function () {
      if (!window.UCENM_DATOS_EJEMPLO) { window.UCENM_TOAST.error("Datos de ejemplo no disponibles"); return; }
      if (!confirm("¿Restaurar los datos de ejemplo? Esto reemplazará todos los datos actuales.")) return;
      var ej = window.UCENM_DATOS_EJEMPLO;
      window.UCENM_DB.setClases(ej.clases || []);
      window.UCENM_DB.setTareas(ej.tareas || []);
      window.UCENM_DB.setAnuncios(ej.anuncios || []);
      window.UCENM_DB.setTareasCompletadas({});
      window.UCENM_TOAST.exito("Datos de ejemplo restaurados ✓");
      if (window.UCENM_APP && window.UCENM_APP.renderTodo) window.UCENM_APP.renderTodo();
    },
  };

  // ---- IntersectionObserver de seguridad ----
  (function () {
    if (!("IntersectionObserver" in window)) return;
    var TIMEOUT = 6000;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          var el = entry.target;
          if (el._ucenmTimeout) { clearTimeout(el._ucenmTimeout); delete el._ucenmTimeout; }
          el._ucenmTimeout = setTimeout(function () {
            el.style.opacity = "1"; el.style.visibility = "visible";
            obs.unobserve(el);
          }, TIMEOUT);
        } else {
          if (el._ucenmTimeout) { clearTimeout(el._ucenmTimeout); delete el._ucenmTimeout; }
        }
      });
    });
    window.UCENM_OBS = obs;
  })();

})();
