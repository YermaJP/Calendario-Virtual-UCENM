// ============================================================
// UCENM — Módulo de Anuncios
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
    var sec = document.getElementById("sec-anuncios");
    if (!sec) return;
    var esMaestro = getRol() === "maestro";

    sec.innerHTML =
      '<div class="anuncios-header">' +
        '<h2>📢 Anuncios</h2>' +
        (esMaestro ? '<button class="btn btn-primary" id="btn-nuevo-anuncio">+ Nuevo anuncio</button>' : '') +
      '</div>' +
      (esMaestro ? '<div class="form-anuncio-container" id="form-anuncio-container">' + htmlFormAnuncio() + '</div>' : '') +
      '<div id="lista-anuncios"></div>';

    renderLista();

    if (esMaestro) {
      var btnNuevo = document.getElementById("btn-nuevo-anuncio");
      if (btnNuevo) btnNuevo.addEventListener("click", function () {
        var cont = document.getElementById("form-anuncio-container");
        if (cont) { cont.classList.toggle("visible"); limpiarForm(); }
      });
      adjuntarFormListeners();
    }
  }

  function htmlFormAnuncio(anuncio) {
    return '<h3 style="font-size:1rem;font-weight:700;color:var(--azul-inst);margin-bottom:1rem">' +
        (anuncio ? '✏️ Editar anuncio' : '📢 Nuevo anuncio') + '</h3>' +
      '<form id="form-nuevo-anuncio" class="form-grid">' +
        '<div class="form-group">' +
          '<label>Título del anuncio *</label>' +
          '<input class="form-control" name="titulo" required placeholder="Ej: Cambio de horario – semana del 5 de julio" value="' + esc(anuncio ? anuncio.titulo : "") + '">' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Mensaje *</label>' +
          '<textarea class="form-control" name="cuerpo" rows="4" required placeholder="Escriba aquí el contenido del anuncio...">' + esc(anuncio ? anuncio.cuerpo : "") + '</textarea>' +
        '</div>' +
        '<div class="form-group">' +
          '<label>Enlace externo (opcional)</label>' +
          '<input class="form-control" name="link" type="url" placeholder="https://..." value="' + esc(anuncio ? anuncio.link : "") + '">' +
          '<div class="form-hint">Puede agregar un link a Drive, PTA, PVA u otro recurso.</div>' +
        '</div>' +
        (anuncio ? '<input type="hidden" name="id" value="' + esc(anuncio.id) + '">' : '') +
        '<div class="form-acciones">' +
          '<button type="submit" class="btn btn-primary">' + (anuncio ? '💾 Guardar' : '✓ Publicar') + '</button>' +
          '<button type="button" class="btn btn-ghost" id="btn-cancelar-anuncio">Cancelar</button>' +
        '</div>' +
      '</form>';
  }

  function limpiarForm() {
    var cont = document.getElementById("form-anuncio-container");
    if (cont) { cont.innerHTML = htmlFormAnuncio(); adjuntarFormListeners(); }
  }

  function adjuntarFormListeners() {
    var form = document.getElementById("form-nuevo-anuncio");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); guardarAnuncio(); });
    var btnCancelar = document.getElementById("btn-cancelar-anuncio");
    if (btnCancelar) btnCancelar.addEventListener("click", function () {
      var cont = document.getElementById("form-anuncio-container");
      if (cont) cont.classList.remove("visible");
    });
  }

  function guardarAnuncio() {
    var form = document.getElementById("form-nuevo-anuncio");
    if (!form) return;
    var datos = {};
    new FormData(form).forEach(function (v, k) { datos[k] = v; });
    if (!datos.titulo || !datos.cuerpo) { TOAST.error("Complete los campos obligatorios"); return; }

    var anuncios = DB.getAnuncios();
    if (datos.id) {
      anuncios = anuncios.map(function (a) {
        if (a.id !== datos.id) return a;
        return { id: a.id, titulo: datos.titulo, cuerpo: datos.cuerpo, link: datos.link, fecha: a.fecha };
      });
      TOAST.exito("Anuncio actualizado ✓");
    } else {
      anuncios.push({
        id: ID("ann"),
        titulo: datos.titulo,
        cuerpo: datos.cuerpo,
        link: datos.link || "",
        fecha: FEC.hoy(),
      });
      TOAST.exito("Anuncio publicado ✓");
    }
    DB.setAnuncios(anuncios);
    var cont = document.getElementById("form-anuncio-container");
    if (cont) cont.classList.remove("visible");
    limpiarForm();
    renderLista();
  }

  function renderLista() {
    var lista = document.getElementById("lista-anuncios");
    if (!lista) return;
    var esMaestro = getRol() === "maestro";
    var anuncios = DB.getAnuncios().sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });

    if (anuncios.length === 0) {
      lista.innerHTML = '<div class="empty-state"><div class="emoji">📭</div><p>No hay anuncios publicados aún.' + (esMaestro ? ' Publique el primero con el botón de arriba.' : '') + '</p></div>';
      return;
    }

    var html = "";
    anuncios.forEach(function (a, i) {
      html +=
        '<div class="anuncio-card">' +
          (i === 0 ? '<span class="anuncio-nuevo">Más reciente</span>' : '') +
          '<div class="anuncio-titulo">' + esc(a.titulo) + '</div>' +
          '<div class="anuncio-cuerpo">' + esc(a.cuerpo).replace(/\n/g, "<br>") + '</div>' +
          '<div class="anuncio-footer">' +
            '<span class="anuncio-fecha">📅 ' + FEC.formatoLargo(a.fecha) + '</span>' +
            '<div class="anuncio-acciones">' +
              (a.link ? '<a href="' + esc(a.link) + '" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">🔗 Ver enlace</a>' : '') +
              (esMaestro ?
                '<button class="btn btn-ghost btn-sm btn-edit-ann" data-id="' + a.id + '">✏️ Editar</button>' +
                '<button class="btn btn-peligro btn-sm btn-del-ann" data-id="' + a.id + '">🗑️</button>'
                : '') +
            '</div>' +
          '</div>' +
        '</div>';
    });
    lista.innerHTML = html;

    if (esMaestro) {
      lista.querySelectorAll(".btn-del-ann").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          if (!confirm("¿Eliminar este anuncio?")) return;
          DB.setAnuncios(DB.getAnuncios().filter(function (a) { return a.id !== id; }));
          TOAST.exito("Anuncio eliminado");
          renderLista();
        });
      });
      lista.querySelectorAll(".btn-edit-ann").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = this.getAttribute("data-id");
          var ann = DB.getAnuncios().find(function (a) { return a.id === id; });
          if (!ann) return;
          var cont = document.getElementById("form-anuncio-container");
          if (cont) {
            cont.innerHTML = htmlFormAnuncio(ann);
            cont.classList.add("visible");
            adjuntarFormListeners();
            cont.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
  }

  window.UCENM_ANUNCIOS = { render: render };

})();
