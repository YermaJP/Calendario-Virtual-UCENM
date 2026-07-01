// ============================================================
// UCENM — Almacenamiento (Firebase: Firestore + Auth) y utilidades
// ============================================================
// Mantiene la MISMA interfaz que la versión localStorage
// (UCENM_DB.getClases/setClases/etc.) para que calendario.js,
// tareas.js, anuncios.js y admin.js no necesiten cambios.
//
// Reglas de escritura (ver firestore.rules):
//  - clases / tareas / anuncios   -> solo maestro (login con email+contraseña)
//  - tareasCompletadas            -> maestro o alumno (sesión anónima)
// ============================================================
(function () {
  "use strict";

  var CFG = window.UCENM_CONFIG;
  var FB = window.UCENM_FIREBASE;

  if (!FB) {
    console.error("UCENM: Firebase no está inicializado. Revise lib/firebase-config.js.");
    return;
  }

  var db = FB.db;
  var COL = "ucenm"; // colección con un documento por tipo de dato

  // ---- CACHÉ LOCAL (para lectura síncrona, igual que antes) ----
  var cache = {
    clases: [],
    tareas: [],
    anuncios: [],
    tareasCompletadas: {},
  };
  var listo = { clases: false, tareas: false, anuncios: false, tareasCompletadas: false };

  function todoListo() {
    return listo.clases && listo.tareas && listo.anuncios && listo.tareasCompletadas;
  }

  function refrescarUI() {
    if (window.UCENM_APP && window.UCENM_APP.refrescar) window.UCENM_APP.refrescar();
  }

  function escucharDoc(nombre, esObjeto) {
    db.collection(COL).doc(nombre).onSnapshot(
      function (snap) {
        var datos = snap.exists ? snap.data() : null;
        cache[nombre] = datos ? datos.items : (esObjeto ? {} : []);
        listo[nombre] = true;
        refrescarUI();
      },
      function (err) {
        console.error("UCENM: error leyendo " + nombre, err);
        listo[nombre] = true; // no bloquear la UI aunque falle
      }
    );
  }

  escucharDoc("clases", false);
  escucharDoc("tareas", false);
  escucharDoc("anuncios", false);
  escucharDoc("tareasCompletadas", true);

  function escribirDoc(nombre, valor) {
    if (!FB.auth.currentUser) {
      window.UCENM_TOAST && window.UCENM_TOAST.error("Debe iniciar sesión para guardar cambios.");
      return false;
    }
    cache[nombre] = valor; // actualización optimista, la UI no espera al servidor
    db.collection(COL).doc(nombre).set({
      items: valor,
      actualizado: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(function (err) {
      console.error("UCENM: error guardando " + nombre, err);
      window.UCENM_TOAST && window.UCENM_TOAST.error("No se pudo guardar (permiso denegado o sin conexión).");
    });
    return true;
  }

  window.UCENM_DB = {
    getClases: function () { return cache.clases; },
    getTareas: function () { return cache.tareas; },
    getAnuncios: function () { return cache.anuncios; },
    getTareasCompletadas: function () { return cache.tareasCompletadas; },
    setClases: function (v) { return escribirDoc("clases", v); },
    setTareas: function (v) { return escribirDoc("tareas", v); },
    setAnuncios: function (v) { return escribirDoc("anuncios", v); },
    setTareasCompletadas: function (v) { return escribirDoc("tareasCompletadas", v); },
    listo: todoListo,
  };

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

  // ---- EXPORTAR / IMPORTAR / RESTAURAR EJEMPLO ----
  window.UCENM_BACKUP = {
    exportar: function () {
      var datos = {
        version: "2.0-firebase",
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
      if (!FB.auth.currentUser) { window.UCENM_TOAST.error("Debe iniciar sesión como maestro para importar."); return; }
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
      if (!FB.auth.currentUser) { window.UCENM_TOAST.error("Debe iniciar sesión como maestro."); return; }
      if (!window.UCENM_DATOS_EJEMPLO) { window.UCENM_TOAST.error("Datos de ejemplo no disponibles"); return; }
      if (!confirm("¿Restaurar los datos de ejemplo? Esto reemplazará todos los datos actuales para TODOS los usuarios.")) return;
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
