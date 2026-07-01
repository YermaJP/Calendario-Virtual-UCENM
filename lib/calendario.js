// ============================================================
// UCENM — Módulo de Calendario
// ============================================================
(function () {
  "use strict";
  var DB = window.UCENM_DB;
  var FEC = window.UCENM_FECHA;
  var TOAST = window.UCENM_TOAST;

  var calState = {
    anio: new Date().getFullYear(),
    mes: new Date().getMonth(), // 0-indexed
    diaSeleccionado: null,
  };

  var MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  var DIAS_SEMANA = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

  function getRol() { return window.UCENM_APP ? window.UCENM_APP.getRol() : "alumno"; }
  function esc(s) { return window.UCENM_APP ? window.UCENM_APP.escHtml(s) : String(s || ""); }

  function render() {
    var sec = document.getElementById("sec-calendario");
    if (!sec) return;

    var esMaestro = getRol() === "maestro";
    sec.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;flex-wrap:wrap;gap:.75rem;">' +
        '<h2 style="font-size:1.3rem;font-weight:700;color:var(--azul-inst)">📅 Calendario de clases</h2>' +
        (esMaestro ? '<button class="btn btn-primary" id="cal-nueva-clase">+ Agregar al calendario</button>' : '') +
      '</div>' +
      '<div class="cal-layout">' +
        '<div>' +
          '<div class="calendario-wrapper">' +
            '<div class="cal-header">' +
              '<button class="btn-cal-nav" id="cal-prev">←</button>' +
              '<h3 id="cal-titulo"></h3>' +
              '<button class="btn-cal-nav" id="cal-next">→</button>' +
            '</div>' +
            '<div class="cal-dias-semana">' +
              DIAS_SEMANA.map(function (d) { return '<div class="cal-dia-nombre">' + d + '</div>'; }).join('') +
            '</div>' +
            '<div class="cal-grid" id="cal-grid"></div>' +
          '</div>' +
          '<div class="leyenda">' +
            '<div class="leyenda-item"><div class="leyenda-dot" style="background:var(--azul-light);border:1px solid var(--azul-inst)"></div> Clase</div>' +
            '<div class="leyenda-item"><div class="leyenda-dot" style="background:var(--naranja-light);border:1px solid var(--naranja)"></div> Entrega de tarea</div>' +
            '<div class="leyenda-item"><div class="leyenda-dot" style="background:var(--verde-light);border:1px solid var(--verde)"></div> Evento / especial</div>' +
          '</div>' +
        '</div>' +
        '<div class="cal-panel" id="cal-panel">' +
          '<h4>Seleccione un día</h4>' +
          '<p class="sel-hint">Haga clic en cualquier día del calendario para ver las actividades programadas.</p>' +
        '</div>' +
      '</div>';

    renderGrid();

    document.getElementById("cal-prev").addEventListener("click", function () {
      calState.mes--;
      if (calState.mes < 0) { calState.mes = 11; calState.anio--; }
      renderGrid();
    });
    document.getElementById("cal-next").addEventListener("click", function () {
      calState.mes++;
      if (calState.mes > 11) { calState.mes = 0; calState.anio++; }
      renderGrid();
    });

    var btnNueva = document.getElementById("cal-nueva-clase");
    if (btnNueva) {
      btnNueva.addEventListener("click", function () {
        window.UCENM_APP.navegarA("admin");
        setTimeout(function () { window.UCENM_ADMIN && window.UCENM_ADMIN.abrirTab("clase"); }, 100);
      });
    }
  }

  function renderGrid() {
    var titulo = document.getElementById("cal-titulo");
    if (titulo) titulo.textContent = MESES[calState.mes] + " " + calState.anio;

    var grid = document.getElementById("cal-grid");
    if (!grid) return;

    var clases = DB.getClases();
    var tareas = DB.getTareas();

    // Agrupar por fecha
    var porFecha = {};
    clases.forEach(function (c) {
      if (!porFecha[c.fecha]) porFecha[c.fecha] = { clases: [], tareas: [] };
      porFecha[c.fecha].clases.push(c);
    });
    tareas.forEach(function (t) {
      if (!porFecha[t.fechaEntrega]) porFecha[t.fechaEntrega] = { clases: [], tareas: [] };
      porFecha[t.fechaEntrega].tareas.push(t);
    });

    // Primer día del mes y total de días
    var primero = new Date(calState.anio, calState.mes, 1).getDay(); // 0=Dom
    var diasEnMes = new Date(calState.anio, calState.mes + 1, 0).getDate();
    var hoy = FEC.hoy();

    var celdas = "";
    // Días del mes anterior para completar la primera semana
    var diasMesAnterior = new Date(calState.anio, calState.mes, 0).getDate();
    for (var i = 0; i < primero; i++) {
      var diaAnterior = diasMesAnterior - primero + 1 + i;
      celdas += '<div class="cal-celda otro-mes"><div class="cal-num">' + diaAnterior + '</div></div>';
    }

    for (var d = 1; d <= diasEnMes; d++) {
      var mm = String(calState.mes + 1).padStart(2, "0");
      var dd = String(d).padStart(2, "0");
      var fechaStr = calState.anio + "-" + mm + "-" + dd;
      var esHoy = fechaStr === hoy;
      var esSel = fechaStr === calState.diaSeleccionado;
      var actividades = porFecha[fechaStr] || null;

      var chips = "";
      if (actividades) {
        actividades.clases.forEach(function (c) {
          var colorClass = c.tipo === "extraordinaria" || c.tipo === "evento" ? "chip-verde" : "chip-azul";
          if (c.tipo === "cancelada") colorClass = "chip-dorado";
          chips += '<div class="chip ' + colorClass + '">' + esc(c.tema) + '</div>';
        });
        actividades.tareas.forEach(function (t) {
          chips += '<div class="chip chip-naranja">📋 ' + esc(t.titulo) + '</div>';
        });
      }

      celdas +=
        '<div class="cal-celda' + (esHoy ? " hoy" : "") + (esSel ? " seleccionada" : "") + '" data-fecha="' + fechaStr + '">' +
          '<div class="cal-num">' + d + '</div>' +
          (chips ? '<div class="cal-chips">' + chips + '</div>' : '') +
        '</div>';
    }

    // Completar última semana
    var totalCeldas = primero + diasEnMes;
    var sobrantes = totalCeldas % 7 === 0 ? 0 : 7 - (totalCeldas % 7);
    for (var s = 1; s <= sobrantes; s++) {
      celdas += '<div class="cal-celda otro-mes"><div class="cal-num">' + s + '</div></div>';
    }

    grid.innerHTML = celdas;

    grid.querySelectorAll(".cal-celda:not(.otro-mes)").forEach(function (celda) {
      celda.addEventListener("click", function () {
        calState.diaSeleccionado = this.getAttribute("data-fecha");
        grid.querySelectorAll(".cal-celda").forEach(function (c) { c.classList.remove("seleccionada"); });
        this.classList.add("seleccionada");
        renderPanel(calState.diaSeleccionado, porFecha[calState.diaSeleccionado]);
      });
    });
  }

  function renderPanel(fecha, actividades) {
    var panel = document.getElementById("cal-panel");
    if (!panel) return;
    var esMaestro = getRol() === "maestro";

    var html = '<h4>' + FEC.formatoLargo(fecha) + '</h4>';

    if (!actividades || (actividades.clases.length === 0 && actividades.tareas.length === 0)) {
      html += '<p class="sel-hint" style="margin-top:.5rem">Sin actividades programadas para este día.</p>';
      if (esMaestro) {
        html += '<button class="btn btn-primary btn-sm" style="margin-top:.75rem" id="panel-agregar-clase">+ Agregar clase</button>';
      }
    } else {
      actividades.clases.forEach(function (c) {
        var tipoClass = c.tipo === "extraordinaria" || c.tipo === "evento" ? "tipo-evento" : "";
        if (c.tipo === "cancelada") tipoClass = "tipo-tarea";
        html +=
          '<div class="evento-item ' + tipoClass + '">' +
            '<div class="hora">⏰ ' + esc(c.horaInicio) + ' – ' + esc(c.horaFin) + '</div>' +
            '<h5>' + esc(c.tema) + '</h5>' +
            (c.descripcion ? '<div class="desc">' + esc(c.descripcion) + '</div>' : '') +
            '<div style="margin-top:.3rem"><span style="font-size:.75rem;padding:.15rem .5rem;border-radius:999px;background:var(--azul-light);color:var(--azul-inst);font-weight:600">' + esc(c.tipo || "regular") + '</span></div>' +
            (esMaestro ?
              '<div class="evento-acciones">' +
                '<button class="btn btn-ghost btn-sm btn-editar-clase" data-id="' + c.id + '">✏️ Editar</button>' +
                '<button class="btn btn-peligro btn-sm btn-eliminar-clase" data-id="' + c.id + '">🗑️ Eliminar</button>' +
              '</div>' : '') +
          '</div>';
      });
      actividades.tareas.forEach(function (t) {
        html +=
          '<div class="evento-item tipo-tarea">' +
            '<div class="hora">📋 Entrega de tarea</div>' +
            '<h5>' + esc(t.titulo) + '</h5>' +
            '<div class="desc">' + esc(t.materia) + '</div>' +
            (t.linkMaterial ? '<a href="' + t.linkMaterial + '" target="_blank" rel="noopener" style="font-size:.82rem;color:var(--azul-med)">🔗 Ver material</a>' : '') +
          '</div>';
      });
    }

    panel.innerHTML = html;

    var btnAgregar = document.getElementById("panel-agregar-clase");
    if (btnAgregar) {
      btnAgregar.addEventListener("click", function () {
        window.UCENM_APP.navegarA("admin");
        setTimeout(function () {
          window.UCENM_ADMIN && window.UCENM_ADMIN.abrirTab("clase", fecha);
        }, 100);
      });
    }

    // Botones eliminar clase
    panel.querySelectorAll(".btn-eliminar-clase").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        if (!confirm("¿Eliminar esta clase?")) return;
        var clases = DB.getClases().filter(function (c) { return c.id !== id; });
        DB.setClases(clases);
        TOAST.exito("Clase eliminada");
        renderGrid();
        renderPanel(calState.diaSeleccionado, null);
      });
    });

    // Botones editar clase
    panel.querySelectorAll(".btn-editar-clase").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        window.UCENM_APP.navegarA("admin");
        setTimeout(function () {
          window.UCENM_ADMIN && window.UCENM_ADMIN.editarClase(id);
        }, 120);
      });
    });
  }

  window.UCENM_CAL = { render: render };

})();
