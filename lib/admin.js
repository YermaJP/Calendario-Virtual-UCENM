// ============================================================
// UCENM — Panel de Administración (Maestro)
// ============================================================
(function () {
  "use strict";
  var DB = window.UCENM_DB;
  var FEC = window.UCENM_FECHA;
  var TOAST = window.UCENM_TOAST;
  var ID = window.UCENM_ID;

  function esc(s) { return window.UCENM_APP ? window.UCENM_APP.escHtml(s) : String(s || ""); }

  var tabActivo = "clase";
  var editandoClaseId = null;

  function render() {
    var sec = document.getElementById("sec-admin");
    if (!sec) return;
    if (window.UCENM_APP.getRol() !== "maestro") {
      sec.innerHTML = '<div class="empty-state"><div class="emoji">🔒</div><p>Solo el maestro puede acceder a esta sección.</p></div>';
      return;
    }

    sec.innerHTML =
      '<h2 style="font-size:1.3rem;font-weight:700;color:var(--azul-inst);margin-bottom:1.25rem">⚙️ Panel de administración</h2>' +
      '<div class="admin-tabs">' +
        '<button class="admin-tab activo" data-tab="clase">📅 Nueva clase</button>' +
        '<button class="admin-tab" data-tab="tarea">📋 Nueva tarea</button>' +
        '<button class="admin-tab" data-tab="anuncio">📢 Nuevo anuncio</button>' +
        '<button class="admin-tab" data-tab="clases-lista">📋 Mis clases</button>' +
      '</div>' +
      '<div class="admin-panel activo" id="admin-panel-clase">' + htmlFormClase() + '</div>' +
      '<div class="admin-panel" id="admin-panel-tarea">' + htmlFormTareaAdmin() + '</div>' +
      '<div class="admin-panel" id="admin-panel-anuncio">' + htmlFormAnuncioAdmin() + '</div>' +
      '<div class="admin-panel" id="admin-panel-clases-lista">' + htmlListaClases() + '</div>' +

      // Backup
      '<div class="admin-backup">' +
        '<h3>💾 Respaldo de datos</h3>' +
        '<p>Exporte todos los datos (clases, tareas, anuncios) a un archivo JSON para hacer respaldo o compartirlo entre dispositivos. También puede importar un respaldo previo o restaurar los datos de ejemplo.</p>' +
        '<div class="acciones">' +
          '<button class="btn btn-secondary" id="btn-exportar">⬇️ Exportar respaldo</button>' +
          '<button class="btn btn-ghost" id="btn-importar-trigger">⬆️ Importar respaldo</button>' +
          '<input type="file" id="input-importar" accept=".json" class="hidden">' +
          '<button class="btn btn-ghost" id="btn-restaurar-ejemplo">🔄 Restaurar datos de ejemplo</button>' +
        '</div>' +
      '</div>';

    // Tabs
    sec.querySelectorAll(".admin-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        abrirTab(this.getAttribute("data-tab"));
      });
    });

    // Forms
    adjuntarListenersClase();
    adjuntarListenersTareaAdmin();
    adjuntarListenersAnuncioAdmin();

    // Backup
    document.getElementById("btn-exportar").addEventListener("click", function () {
      window.UCENM_BACKUP.exportar();
    });
    document.getElementById("btn-importar-trigger").addEventListener("click", function () {
      document.getElementById("input-importar").click();
    });
    document.getElementById("input-importar").addEventListener("change", function () {
      if (!this.files || !this.files[0]) return;
      window.UCENM_BACKUP.importar(this.files[0], function () {
        render();
      });
    });
    document.getElementById("btn-restaurar-ejemplo").addEventListener("click", function () {
      window.UCENM_BACKUP.restaurarEjemplo();
      render();
    });

    abrirTab(tabActivo);
  }

  function abrirTab(tab, fechaPreset) {
    tabActivo = tab;
    document.querySelectorAll(".admin-tab").forEach(function (t) {
      t.classList.toggle("activo", t.getAttribute("data-tab") === tab);
    });
    document.querySelectorAll(".admin-panel").forEach(function (p) {
      p.classList.toggle("activo", p.id === "admin-panel-" + tab);
    });
    if (tab === "clase" && fechaPreset) {
      var inp = document.querySelector("#admin-panel-clase input[name='fecha']");
      if (inp) inp.value = fechaPreset;
    }
    if (tab === "clases-lista") {
      var panel = document.getElementById("admin-panel-clases-lista");
      if (panel) panel.innerHTML = htmlListaClases();
      adjuntarListenersListaClases();
    }
  }

  // ---- FORM CLASE ----
  function htmlFormClase(clase) {
    var CFG = window.UCENM_CONFIG;
    return '<form id="form-nueva-clase" class="form-grid">' +
      '<div class="form-grid form-grid-2">' +
        '<div class="form-group">' +
          '<label>Fecha de la clase *</label>' +
          '<input class="form-control" name="fecha" type="date" required value="' + esc(clase ? clase.fecha : FEC.hoy()) + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Tipo de clase</label>' +
          '<select class="form-control" name="tipo">' +
            opcionTipo("regular", clase) +
            opcionTipo("extraordinaria", clase) +
            opcionTipo("cancelada", clase) +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="form-grid form-grid-2">' +
        '<div class="form-group">' +
          '<label>Hora de inicio</label>' +
          '<input class="form-control" name="horaInicio" type="time" value="' + esc(clase ? clase.horaInicio : "08:00") + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Hora de fin</label>' +
          '<input class="form-control" name="horaFin" type="time" value="' + esc(clase ? clase.horaFin : "10:00") + '">' +
        '</div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Tema de la clase *</label>' +
        '<input class="form-control" name="tema" required placeholder="Ej: Estructuras condicionales" value="' + esc(clase ? clase.tema : "") + '">' +
      '</div>' +
      '<div class="form-group">' +
        '<label>Descripción (opcional)</label>' +
        '<textarea class="form-control" name="descripcion" rows="3" placeholder="Detalle lo que se verá en la clase...">' + esc(clase ? clase.descripcion : "") + '</textarea>' +
      '</div>' +
      (clase ? '<input type="hidden" name="id" value="' + esc(clase.id) + '">' : '') +
      '<div class="form-acciones">' +
        '<button type="submit" class="btn btn-primary">' + (clase ? '💾 Guardar cambios' : '✓ Agregar al calendario') + '</button>' +
        (clase ? '<button type="button" class="btn btn-ghost" id="btn-cancelar-editar-clase">Cancelar</button>' : '') +
      '</div>' +
    '</form>';
  }

  function opcionTipo(val, clase) {
    var sel = clase && clase.tipo === val ? ' selected' : (!clase && val === "regular" ? ' selected' : '');
    var labels = { regular: "Regular", extraordinaria: "Extraordinaria / tutoría", cancelada: "Cancelada" };
    return '<option value="' + val + '"' + sel + '>' + labels[val] + '</option>';
  }

  function adjuntarListenersClase() {
    var form = document.getElementById("form-nueva-clase");
    if (!form) return;
    form.addEventListener("submit", function (e) { e.preventDefault(); guardarClase(); });
    var btnCancelar = document.getElementById("btn-cancelar-editar-clase");
    if (btnCancelar) btnCancelar.addEventListener("click", function () {
      editandoClaseId = null;
      var panel = document.getElementById("admin-panel-clase");
      if (panel) { panel.innerHTML = htmlFormClase(); adjuntarListenersClase(); }
    });
  }

  function guardarClase() {
    var form = document.getElementById("form-nueva-clase");
    if (!form) return;
    var datos = {};
    new FormData(form).forEach(function (v, k) { datos[k] = v; });
    if (!datos.fecha || !datos.tema) { TOAST.error("Fecha y tema son obligatorios"); return; }

    var clases = DB.getClases();
    if (datos.id) {
      clases = clases.map(function (c) {
        if (c.id !== datos.id) return c;
        return { id: c.id, fecha: datos.fecha, horaInicio: datos.horaInicio, horaFin: datos.horaFin, tema: datos.tema, descripcion: datos.descripcion, tipo: datos.tipo, color: datos.tipo === "extraordinaria" ? "verde" : "azul" };
      });
      TOAST.exito("Clase actualizada ✓");
    } else {
      clases.push({
        id: ID("cls"),
        fecha: datos.fecha,
        horaInicio: datos.horaInicio,
        horaFin: datos.horaFin,
        tema: datos.tema,
        descripcion: datos.descripcion,
        tipo: datos.tipo,
        color: datos.tipo === "extraordinaria" ? "verde" : "azul",
      });
      TOAST.exito("Clase agregada al calendario ✓");
    }
    DB.setClases(clases);
    editandoClaseId = null;
    var panel = document.getElementById("admin-panel-clase");
    if (panel) { panel.innerHTML = htmlFormClase(); adjuntarListenersClase(); }
  }

  function editarClase(id) {
    var clase = DB.getClases().find(function (c) { return c.id === id; });
    if (!clase) return;
    abrirTab("clase");
    editandoClaseId = id;
    var panel = document.getElementById("admin-panel-clase");
    if (panel) { panel.innerHTML = htmlFormClase(clase); adjuntarListenersClase(); }
  }

  // ---- LISTA DE CLASES ----
  function htmlListaClases() {
    var clases = DB.getClases().sort(function (a, b) { return a.fecha.localeCompare(b.fecha); });
    if (clases.length === 0) return '<div class="empty-state"><div class="emoji">📅</div><p>No hay clases. Agrégue la primera en la pestaña "Nueva clase".</p></div>';
    var html = '<div style="margin-bottom:1rem"><strong>' + clases.length + '</strong> clase(s) registradas.</div>';
    clases.forEach(function (c) {
      var colorBorde = c.tipo === "extraordinaria" ? "var(--verde)" : c.tipo === "cancelada" ? "var(--dorado)" : "var(--azul-inst)";
      html +=
        '<div style="background:var(--blanco);border:1px solid var(--gris-borde);border-left:4px solid ' + colorBorde + ';border-radius:var(--radio);padding:1rem 1.2rem;margin-bottom:.75rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem;flex-wrap:wrap;">' +
          '<div>' +
            '<div style="font-family:\'Space Mono\',monospace;font-size:.8rem;color:var(--gris-texto);margin-bottom:.15rem">' + FEC.formatoCorto(c.fecha) + ' · ' + esc(c.horaInicio) + ' – ' + esc(c.horaFin) + '</div>' +
            '<div style="font-weight:700;color:var(--gris-oscuro)">' + esc(c.tema) + '</div>' +
            '<div style="font-size:.8rem;color:var(--gris-texto)">' + esc(c.tipo) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:.5rem">' +
            '<button class="btn btn-ghost btn-sm btn-edit-cl" data-id="' + c.id + '">✏️ Editar</button>' +
            '<button class="btn btn-peligro btn-sm btn-del-cl" data-id="' + c.id + '">🗑️</button>' +
          '</div>' +
        '</div>';
    });
    return html;
  }

  function adjuntarListenersListaClases() {
    var panel = document.getElementById("admin-panel-clases-lista");
    if (!panel) return;
    panel.querySelectorAll(".btn-del-cl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        if (!confirm("¿Eliminar esta clase?")) return;
        DB.setClases(DB.getClases().filter(function (c) { return c.id !== id; }));
        TOAST.exito("Clase eliminada");
        panel.innerHTML = htmlListaClases();
        adjuntarListenersListaClases();
      });
    });
    panel.querySelectorAll(".btn-edit-cl").forEach(function (btn) {
      btn.addEventListener("click", function () {
        editarClase(this.getAttribute("data-id"));
      });
    });
  }

  // ---- FORM TAREA (ADMIN) ----
  function htmlFormTareaAdmin(tarea) {
    var CFG = window.UCENM_CONFIG;
    return '<form id="form-admin-tarea" class="form-grid">' +
      '<div class="form-grid form-grid-2">' +
        '<div class="form-group"><label>Título *</label>' +
          '<input class="form-control" name="titulo" required placeholder="Ej: Diagrama de flujo" value="' + esc(tarea ? tarea.titulo : "") + '"></div>' +
        '<div class="form-group"><label>Materia / unidad</label>' +
          '<input class="form-control" name="materia" placeholder="Ej: Unidad 1" value="' + esc(tarea ? tarea.materia : (CFG ? CFG.nombreMateria : "")) + '"></div>' +
      '</div>' +
      '<div class="form-grid form-grid-2">' +
        '<div class="form-group"><label>Fecha de entrega *</label>' +
          '<input class="form-control" name="fechaEntrega" type="date" required value="' + esc(tarea ? tarea.fechaEntrega : "") + '"></div>' +
        '<div class="form-group"><label>Link de material</label>' +
          '<input class="form-control" name="linkMaterial" type="url" placeholder="https://drive.google.com/..." value="' + esc(tarea ? tarea.linkMaterial : "") + '"></div>' +
      '</div>' +
      '<div class="form-group"><label>Descripción / instrucciones</label>' +
        '<textarea class="form-control" name="descripcion" rows="3" placeholder="Explique la tarea...">' + esc(tarea ? tarea.descripcion : "") + '</textarea></div>' +
      (tarea ? '<input type="hidden" name="id" value="' + esc(tarea.id) + '">' : '') +
      '<div class="form-acciones"><button type="submit" class="btn btn-primary">' + (tarea ? '💾 Guardar' : '✓ Crear tarea') + '</button></div>' +
    '</form>';
  }

  function adjuntarListenersTareaAdmin() {
    var form = document.getElementById("form-admin-tarea");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var datos = {}; new FormData(form).forEach(function (v, k) { datos[k] = v; });
      if (!datos.titulo || !datos.fechaEntrega) { TOAST.error("Complete los campos obligatorios"); return; }
      var tareas = DB.getTareas();
      if (datos.id) {
        tareas = tareas.map(function (t) {
          if (t.id !== datos.id) return t;
          return { id: t.id, titulo: datos.titulo, materia: datos.materia, fechaEntrega: datos.fechaEntrega, descripcion: datos.descripcion, linkMaterial: datos.linkMaterial };
        });
        TOAST.exito("Tarea actualizada ✓");
      } else {
        tareas.push({ id: ID("tar"), titulo: datos.titulo, materia: datos.materia, fechaEntrega: datos.fechaEntrega, descripcion: datos.descripcion, linkMaterial: datos.linkMaterial });
        TOAST.exito("Tarea creada ✓");
      }
      DB.setTareas(tareas);
      var panel = document.getElementById("admin-panel-tarea");
      if (panel) { panel.innerHTML = htmlFormTareaAdmin(); adjuntarListenersTareaAdmin(); }
    });
  }

  // ---- FORM ANUNCIO (ADMIN) ----
  function htmlFormAnuncioAdmin(ann) {
    return '<form id="form-admin-anuncio" class="form-grid">' +
      '<div class="form-group"><label>Título *</label>' +
        '<input class="form-control" name="titulo" required placeholder="Ej: Cambio de horario" value="' + esc(ann ? ann.titulo : "") + '"></div>' +
      '<div class="form-group"><label>Mensaje *</label>' +
        '<textarea class="form-control" name="cuerpo" rows="4" required placeholder="Texto del anuncio...">' + esc(ann ? ann.cuerpo : "") + '</textarea></div>' +
      '<div class="form-group"><label>Enlace externo (opcional)</label>' +
        '<input class="form-control" name="link" type="url" placeholder="https://..." value="' + esc(ann ? ann.link : "") + '"></div>' +
      (ann ? '<input type="hidden" name="id" value="' + esc(ann.id) + '">' : '') +
      '<div class="form-acciones"><button type="submit" class="btn btn-primary">' + (ann ? '💾 Guardar' : '✓ Publicar') + '</button></div>' +
    '</form>';
  }

  function adjuntarListenersAnuncioAdmin() {
    var form = document.getElementById("form-admin-anuncio");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var datos = {}; new FormData(form).forEach(function (v, k) { datos[k] = v; });
      if (!datos.titulo || !datos.cuerpo) { TOAST.error("Complete los campos obligatorios"); return; }
      var anuncios = DB.getAnuncios();
      if (datos.id) {
        anuncios = anuncios.map(function (a) {
          if (a.id !== datos.id) return a;
          return { id: a.id, titulo: datos.titulo, cuerpo: datos.cuerpo, link: datos.link, fecha: a.fecha };
        });
        TOAST.exito("Anuncio actualizado ✓");
      } else {
        anuncios.push({ id: ID("ann"), titulo: datos.titulo, cuerpo: datos.cuerpo, link: datos.link || "", fecha: FEC.hoy() });
        TOAST.exito("Anuncio publicado ✓");
      }
      DB.setAnuncios(anuncios);
      var panel = document.getElementById("admin-panel-anuncio");
      if (panel) { panel.innerHTML = htmlFormAnuncioAdmin(); adjuntarListenersAnuncioAdmin(); }
    });
  }

  window.UCENM_ADMIN = {
    render: render,
    abrirTab: abrirTab,
    editarClase: editarClase,
  };

})();
