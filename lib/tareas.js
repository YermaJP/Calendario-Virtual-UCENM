// ============================================================
// UCENM — Módulo de Tareas
// ============================================================
(function () {
  "use strict";
  var DB = window.UCENM_DB;
  var FEC = window.UCENM_FECHA;
  var TOAST = window.UCENM_TOAST;
  var ID = window.UCENM_ID;

  function getRol() { return window.UCENM_APP ? window.UCENM_APP.getRol() : "alumno"; }
  function esc(s) { return window.UCENM_APP ? window.UCENM_APP.escHtml(s) : String(s || ""); }

  function render() {
    var sec = document.getElementById("sec-tareas");
    if (!sec) return;
    var esMaestro = getRol() === "maestro";

    sec.innerHTML =
      '<div class="tareas-header">' +
        '<h2>📋 Tareas</h2>' +
        (esMaestro ? '<button class="btn btn-primary" id="btn-nueva-tarea">+ Nueva tarea</button>' : '') +
      '</div>' +
      (esMaestro ? '<div class="form-tarea-container" id="form-tarea-container">' + htmlFormTarea() + '</div>' : '') +
      '<div id="lista-tareas"></div>';

    renderLista();

    if (esMaestro) {
      var btnNueva = document.getElementById("btn-nueva-tarea");
      if (btnNueva) btnNueva.addEventListener("click", function () {
        var cont = document.getElementById("form-tarea-container");
        if (cont) { cont.classList.toggle("visible"); limpiarFormTarea(); }
      });
      document.getElementById("form-nueva-tarea").addEventListener("submit", function (e) {
        e.preventDefault();
        guardarTarea();
      });
      var btnCancelar = document.getElementById("btn-cancelar-tarea");
      if (btnCancelar) btnCancelar.addEventListener("click", function () {
        var cont = document.getElementById("form-tarea-container");
        if (cont) cont.classList.remove("visible");
      });
    }
  }

  function htmlFormTarea(tarea) {
    return '<h3 style="font-size:1rem;font-weight:700;color:var(--azul-inst);margin-bottom:1rem">' +
        (tarea ? '✏️ Editar tarea' : '➕ Nueva tarea') + '</h3>' +
      '<form id="form-nueva-tarea" class="form-grid">' +
        '<div class="form-grid form-grid-2">' +
          '<div class="form-group">' +
            '<label>Título de la tarea *</label>' +
            '<input class="form-control" name="titulo" required placeholder="Ej: Diagrama de flujo" value="' + esc(tarea ? tarea.titulo : "") + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>Materia / unidad</label>' +
            '<input class="form-control" name="materia" placeholder="Ej: Unidad 1 – Algoritmos" value="' + esc(tarea ? tarea.materia : (window.UCENM_CONFIG ? window.UCENM_CONFIG.nombreMateria : "")) + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-grid form-grid-2">' +
          '<div class="form-group">' +
            '<label>Fecha de entrega *</label>' +
            '<input class="form-control" name="fechaEntrega" type="date" required value="' + esc(tarea ? tarea.fechaEntrega : "") + '">' +
          '</div>' +
          '<div class="form-group">' +
            '<label>Link de material (opcional)</label>' +
            '<input class="form-control" name="linkMaterial" type="url" placeholder="https://drive.google.com/..." value="' + esc(tarea ? tarea.linkMaterial : "") + '">' +
          '</div>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Descripción / instrucciones</label>' +
          '<textarea class="form-control" name="descripcion" rows="3" placeholder="Explique qué deben entregar los alumnos...">' + esc(tarea ? tarea.descripcion : "") + '</textarea>' +
        '</div>' +
        (tarea ? '<input type="hidden" name="id" value="' + esc(tarea.id) + '">' : '') +
        '<div class="form-acciones">' +
          '<button type="submit" class="btn btn-primary">' + (tarea ? '💾 Guardar cambios' : '✓ Crear tarea') + '</button>' +
          '<button type="button" class="btn btn-ghost" id="btn-cancelar-tarea">Cancelar</button>' +
        '</div>' +
      '</form>';
  }

  function limpiarFormTarea() {
    var cont = document.getElementById("form-tarea-container");
    if (cont) {
      cont.innerHTML = htmlFormTarea();
      document.getElementById("form-nueva-tarea").addEventListener("submit", function (e) {
        e.preventDefault(); guardarTarea();
      });
      var btnCancelar = document.getElementById("btn-cancelar-tarea");
      if (btnCancelar) btnCancelar.addEventListener("click", function () {
        cont.classList.remove("visible");
      });
    }
  }

  function guardarTarea() {
    var form = document.getElementById("form-nueva-tarea");
    if (!form) return;
    var datos = {};
    new FormData(form).forEach(function (v, k) { datos[k] = v; });
    if (!datos.titulo || !datos.fechaEntrega) { TOAST.error("Complete los campos obligatorios"); return; }

    var tareas = DB.getTareas();
    if (datos.id) {
      tareas = tareas.map(function (t) {
        if (t.id !== datos.id) return t;
        return { id: t.id, titulo: datos.titulo, materia: datos.materia, fechaEntrega: datos.fechaEntrega, descripcion: datos.descripcion, linkMaterial: datos.linkMaterial };
      });
      TOAST.exito("Tarea actualizada ✓");
    } else {
      tareas.push({
        id: ID("tar"),
        titulo: datos.titulo,
        materia: datos.materia,
        fechaEntrega: datos.fechaEntrega,
        descripcion: datos.descripcion,
        linkMaterial: datos.linkMaterial,
      });
      TOAST.exito("Tarea creada ✓");
    }
    DB.setTareas(tareas);
    var cont = document.getElementById("form-tarea-container");
    if (cont) cont.classList.remove("visible");
    limpiarFormTarea();
    renderLista();
  }

  function renderLista() {
    var lista = document.getElementById("lista-tareas");
    if (!lista) return;
    var esMaestro = getRol() === "maestro";
    var tareas = DB.getTareas().sort(function (a, b) { return a.fechaEntrega.localeCompare(b.fechaEntrega); });
    var completadas = DB.getTareasCompletadas();

    if (tareas.length === 0) {
      lista.innerHTML = '<div class="empty-state"><div class="emoji">📭</div><p>No hay tareas publicadas aún.' + (esMaestro ? ' Cree la primera con el botón de arriba.' : '') + '</p></div>';
      return;
    }

    var html = "";
    tareas.forEach(function (t) {
      var diasHasta = FEC.diasHasta(t.fechaEntrega);
      var clBadge = FEC.badgeClase(t.fechaEntrega);
      var estaCompletada = !esMaestro && completadas[t.id];
      var etiquetaDias = diasHasta < 0 ? "Vencida" : diasHasta === 0 ? "Hoy" : diasHasta === 1 ? "Mañana" : "en " + diasHasta + " días";

      html +=
        '<div class="tarea-card' + (estaCompletada ? " completada" : "") + '">' +
          '<div>' +
            '<div class="tarea-titulo">' + esc(t.titulo) + '</div>' +
            '<div class="tarea-materia">📚 ' + esc(t.materia) + '</div>' +
            '<div class="tarea-desc">' + esc(t.descripcion || "") + '</div>' +
            '<div class="tarea-meta">' +
              '<span class="badge-fecha badge-' + clBadge + '">📅 ' + FEC.formatoCorto(t.fechaEntrega) + ' · ' + etiquetaDias + '</span>' +
              (t.linkMaterial ? '<a class="tarea-link" href="' + esc(t.linkMaterial) + '" target="_blank" rel="noopener">🔗 Material</a>' : '') +
            '</div>' +
          '</div>' +
          '<div class="tarea-acciones">' +
            (esMaestro ?
              '<button class="btn btn-ghost btn-sm btn-edit-tar" data-id="' + t.id + '">✏️ Editar</button>' +
              '<button class="btn btn-peligro btn-sm btn-del-tar" data-id="' + t.id + '">🗑️</button>'
              :
              '<button class="btn btn-sm ' + (estaCompletada ? "btn-ghost" : "btn-secondary") + ' btn-toggle-tar" data-id="' + t.id + '">' +
                (estaCompletada ? "↩ Reabrir" : "✓ Marcar entregada") +
              '</button>'
            ) +
          '</div>' +
        '</div>';
    });
    lista.innerHTML = html;

    if (esMaestro) {
      lista.querySelectorAll(".btn-del-tar").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          if (!confirm("¿Eliminar esta tarea?")) return;
          DB.setTareas(DB.getTareas().filter(function (t) { return t.id !== id; }));
          TOAST.exito("Tarea eliminada");
          renderLista();
        });
      });
      lista.querySelectorAll(".btn-edit-tar").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          var tarea = DB.getTareas().find(function (t) { return t.id === id; });
          if (!tarea) return;
          var cont = document.getElementById("form-tarea-container");
          if (cont) {
            cont.innerHTML = htmlFormTarea(tarea);
            cont.classList.add("visible");
            document.getElementById("form-nueva-tarea").addEventListener("submit", function (e) {
              e.preventDefault(); guardarTarea();
            });
            document.getElementById("btn-cancelar-tarea").addEventListener("click", function () {
              cont.classList.remove("visible"); limpiarFormTarea();
            });
            cont.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    } else {
      lista.querySelectorAll(".btn-toggle-tar").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          var comp = DB.getTareasCompletadas();
          if (comp[id]) delete comp[id]; else comp[id] = true;
          DB.setTareasCompletadas(comp);
          TOAST.exito(comp[id] ? "Tarea marcada como entregada ✓" : "Tarea reabierta");
          renderLista();
        });
      });
    }
  }

  window.UCENM_TAREAS = { render: render };

})();
