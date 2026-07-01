// ============================================================
// UCENM — Aplicación principal (roles, nav, dashboard)
// ============================================================
(function () {
  "use strict";
  var CFG = window.UCENM_CONFIG;
  var DB = window.UCENM_DB;
  var FEC = window.UCENM_FECHA;
  var TOAST = window.UCENM_TOAST;

  var estado = { rol: null, seccionActiva: "inicio" };

  // ---- SVG LOGO UCENM ----
  function logoSVG(size) {
    size = size || 48;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="40" cy="40" r="38" fill="#003A75" stroke="#C9A327" stroke-width="2.5"/>' +
      '<text x="40" y="30" text-anchor="middle" font-family="Inter,sans-serif" font-size="11" font-weight="700" fill="#C9A327" letter-spacing="1">UCENM</text>' +
      '<text x="40" y="44" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="rgba(255,255,255,.85)">UNIVERSIDAD</text>' +
      '<text x="40" y="53" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="rgba(255,255,255,.85)">CRISTIANA</text>' +
      '<text x="40" y="62" text-anchor="middle" font-family="Inter,sans-serif" font-size="7" fill="rgba(255,255,255,.85)">EVANGÉLICA</text>' +
      '<path d="M22 68 Q40 74 58 68" stroke="#C9A327" stroke-width="1.5" fill="none" opacity=".5"/>' +
      '</svg>';
  }

  // ---- PANTALLA DE ROL ----
  function renderPantallaRol() {
    var el = document.getElementById("pantalla-rol");
    if (!el) return;
    el.innerHTML = '<div class="rol-card">' +
      '<div class="rol-logo">' + logoSVG(72) + '</div>' +
      '<h1>' + CFG.nombreInstitucion + '</h1>' +
      '<div class="ciclo">' + CFG.cicloAcademico + ' · ' + CFG.carrera + '</div>' +
      '<div class="materia">' + CFG.nombreMateria + '</div>' +
      '<div class="rol-divider"></div>' +
      '<h2>¿Cómo desea ingresar?</h2>' +
      '<div class="rol-botones">' +
        '<button class="btn-rol btn-rol-alumno" id="btn-alumno">📚 Soy alumno</button>' +
        '<button class="btn-rol btn-rol-maestro" id="btn-maestro">🎓 Soy maestro</button>' +
      '</div>' +
    '</div>';

    document.getElementById("btn-alumno").addEventListener("click", function () {
      activarRol("alumno");
    });
    document.getElementById("btn-maestro").addEventListener("click", function () {
      mostrarPinModal();
    });
  }

  function mostrarPinModal() {
    var overlay = document.createElement("div");
    overlay.className = "pin-overlay";
    overlay.id = "pin-overlay";
    overlay.innerHTML =
      '<div class="pin-modal">' +
        '<h3>🔐 Acceso para maestros</h3>' +
        '<p>Ingrese el PIN de acceso configurado para este salón.</p>' +
        '<input type="password" class="pin-input" id="pin-input" placeholder="• • • • • • • •" autocomplete="off"/>' +
        '<div class="pin-error" id="pin-error">PIN incorrecto. Intente nuevamente.</div>' +
        '<div class="pin-acciones">' +
          '<button class="btn btn-ghost" id="btn-pin-cancelar">Cancelar</button>' +
          '<button class="btn btn-primary" id="btn-pin-ok">Ingresar</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var inp = document.getElementById("pin-input");
    var err = document.getElementById("pin-error");

    function verificarPin() {
      if (inp.value === CFG.pinMaestro) {
        document.body.removeChild(overlay);
        activarRol("maestro");
      } else {
        err.classList.add("visible");
        inp.value = ""; inp.focus();
      }
    }

    document.getElementById("btn-pin-ok").addEventListener("click", verificarPin);
    document.getElementById("btn-pin-cancelar").addEventListener("click", function () {
      document.body.removeChild(overlay);
    });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") verificarPin(); });
    setTimeout(function () { inp.focus(); }, 100);
  }

  function activarRol(rol) {
    estado.rol = rol;
    localStorage.setItem(CFG.keys.rol, rol);
    var pantallaRol = document.getElementById("pantalla-rol");
    if (pantallaRol) pantallaRol.classList.add("hidden");
    renderHeader();
    renderNav();
    renderFooter();
    navegarA("inicio");
    var appMain = document.getElementById("app-main");
    if (appMain) appMain.classList.remove("hidden");
    var appFooter = document.getElementById("app-footer");
    if (appFooter) appFooter.classList.remove("hidden");
  }

  // ---- HEADER ----
  function renderHeader() {
    var h = document.getElementById("app-header");
    if (!h) return;
    h.innerHTML =
      '<div class="header-top">' +
        '<div class="header-logo">' + logoSVG(44) + '</div>' +
        '<div class="header-info">' +
          '<div class="inst">' + CFG.siglas + ' · ' + CFG.cicloAcademico + '</div>' +
          '<div class="materia">' + CFG.nombreMateria + '</div>' +
          '<div class="meta">' + CFG.nombreMaestro + ' · ' + CFG.carrera + '</div>' +
        '</div>' +
        '<div class="header-badge ' + (estado.rol === "maestro" ? "maestro" : "") + '">' +
          (estado.rol === "maestro" ? "🎓 Maestro" : "📚 Alumno") +
        '</div>' +
        '<button class="btn-hamburguesa" id="btn-hamburguesa" aria-label="Abrir menú">☰</button>' +
      '</div>' +
      '<nav id="app-nav">' +
        '<button class="nav-link activo" data-seccion="inicio">🏠 Inicio</button>' +
        '<button class="nav-link" data-seccion="calendario">📅 Calendario</button>' +
        '<button class="nav-link" data-seccion="tareas">📋 Tareas</button>' +
        '<button class="nav-link" data-seccion="anuncios">📢 Anuncios</button>' +
        (estado.rol === "maestro" ? '<button class="nav-link" data-seccion="admin">⚙️ Administrar</button>' : '') +
        '<span class="nav-spacer"></span>' +
        '<button class="btn-cerrar-sesion" id="btn-cerrar-sesion">↩ Cambiar rol</button>' +
      '</nav>' +
      '<div class="nav-mobile-menu hidden" id="nav-mobile-menu">' +
        '<button class="nav-link" data-seccion="inicio">🏠 Inicio</button>' +
        '<button class="nav-link" data-seccion="calendario">📅 Calendario</button>' +
        '<button class="nav-link" data-seccion="tareas">📋 Tareas</button>' +
        '<button class="nav-link" data-seccion="anuncios">📢 Anuncios</button>' +
        (estado.rol === "maestro" ? '<button class="nav-link" data-seccion="admin">⚙️ Administrar</button>' : '') +
        '<button class="nav-link" id="btn-cerrar-sesion-mobile">↩ Cambiar rol</button>' +
      '</div>';

    h.querySelectorAll("[data-seccion]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mobile = document.getElementById("nav-mobile-menu");
        if (mobile) mobile.classList.remove("abierto");
        navegarA(this.getAttribute("data-seccion"));
      });
    });
    document.getElementById("btn-cerrar-sesion").addEventListener("click", cerrarSesion);
    var mobClose = document.getElementById("btn-cerrar-sesion-mobile");
    if (mobClose) mobClose.addEventListener("click", cerrarSesion);

    var hamburger = document.getElementById("btn-hamburguesa");
    if (hamburger) {
      hamburger.addEventListener("click", function () {
        var menu = document.getElementById("nav-mobile-menu");
        if (menu) menu.classList.toggle("abierto");
      });
    }
  }

  function renderNav() { /* ya incluido en renderHeader */ }

  function actualizarNavActivo(seccion) {
    document.querySelectorAll(".nav-link[data-seccion]").forEach(function (b) {
      b.classList.toggle("activo", b.getAttribute("data-seccion") === seccion);
    });
  }

  // ---- FOOTER ----
  function renderFooter() {
    var f = document.getElementById("app-footer");
    if (!f) return;
    f.innerHTML =
      '<div class="footer-grid">' +
        '<div class="footer-brand">' +
          logoSVG(48) +
          '<h3>' + CFG.nombreInstitucion + '</h3>' +
          '<p>Formando líderes con valores cristianos al servicio de Honduras y Centroamérica.</p>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Plataformas</h4>' +
          '<a href="' + CFG.web + '" target="_blank" rel="noopener">web.ucenm.net</a>' +
          '<a href="' + CFG.pta + '" target="_blank" rel="noopener">PTA — Tareas</a>' +
          '<a href="' + CFG.pva + '" target="_blank" rel="noopener">PVA — Virtual</a>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Contacto</h4>' +
          '<a href="mailto:' + CFG.email + '">' + CFG.email + '</a>' +
          '<a href="tel:+50425570607">' + CFG.telefono + '</a>' +
          '<a href="' + CFG.whatsapp + '" target="_blank" rel="noopener">WhatsApp</a>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>© ' + CFG.siglas + ' 2026 — ' + CFG.nombreInstitucion + '</span>' +
        '<div class="footer-redes">' +
          '<a href="' + CFG.facebook + '" target="_blank" rel="noopener">Facebook</a>' +
          '<a href="' + CFG.instagram + '" target="_blank" rel="noopener">Instagram</a>' +
          '<a href="' + CFG.youtube + '" target="_blank" rel="noopener">YouTube</a>' +
        '</div>' +
      '</div>';
  }

  // ---- CERRAR SESIÓN ----
  function cerrarSesion() {
    localStorage.removeItem(CFG.keys.rol);
    estado.rol = null;
    var header = document.getElementById("app-header");
    var main = document.getElementById("app-main");
    var footer = document.getElementById("app-footer");
    if (header) header.innerHTML = "";
    if (main) main.classList.add("hidden");
    if (footer) { footer.innerHTML = ""; footer.classList.add("hidden"); }
    var pantallaRol = document.getElementById("pantalla-rol");
    if (pantallaRol) { pantallaRol.classList.remove("hidden"); renderPantallaRol(); }
  }

  // ---- NAVEGACIÓN ----
  function navegarA(seccion) {
    estado.seccionActiva = seccion;
    document.querySelectorAll(".seccion").forEach(function (s) { s.classList.remove("activa"); });
    var el = document.getElementById("sec-" + seccion);
    if (el) { el.classList.add("activa"); el.classList.add("fade-in"); }
    actualizarNavActivo(seccion);
    // Cerrar menú móvil
    var menu = document.getElementById("nav-mobile-menu");
    if (menu) menu.classList.remove("abierto");

    // Renderizar sección
    if (seccion === "inicio") renderDashboard();
    else if (seccion === "calendario") window.UCENM_CAL && window.UCENM_CAL.render();
    else if (seccion === "tareas") window.UCENM_TAREAS && window.UCENM_TAREAS.render();
    else if (seccion === "anuncios") window.UCENM_ANUNCIOS && window.UCENM_ANUNCIOS.render();
    else if (seccion === "admin") window.UCENM_ADMIN && window.UCENM_ADMIN.render();
  }

  // ---- DASHBOARD ----
  function renderDashboard() {
    var sec = document.getElementById("sec-inicio");
    if (!sec) return;

    var clases = DB.getClases();
    var tareas = DB.getTareas();
    var anuncios = DB.getAnuncios();
    var completadas = DB.getTareasCompletadas();

    var hoy = FEC.hoy();
    var pendientes = tareas.filter(function (t) { return !completadas[t.id]; });

    // Próxima clase
    var futuras = clases
      .filter(function (c) { return c.fecha >= hoy; })
      .sort(function (a, b) { return (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio); });
    var proxClase = futuras[0] || null;

    // Esta semana
    var inicioSemana = new Date(); inicioSemana.setHours(0,0,0,0);
    var finSemana = new Date(inicioSemana); finSemana.setDate(finSemana.getDate() + 7);
    var clasesSemana = clases.filter(function (c) {
      var d = new Date(c.fecha + "T12:00:00");
      return d >= inicioSemana && d < finSemana;
    });

    // Último anuncio
    var ultAnuncio = anuncios.sort(function (a, b) { return b.fecha.localeCompare(a.fecha); })[0] || null;

    var esMaestro = estado.rol === "maestro";
    var html = '<div class="dash-welcome"><h2>Buenos días 👋</h2><p>' +
      (esMaestro ? 'Panel del maestro · ' : 'Bienvenido, estudiante · ') +
      CFG.nombreMateria + ' · ' + CFG.cicloAcademico + '</p></div>' +

      '<div class="dash-grid">' +

      // Card próxima clase
      '<div class="dash-card">' +
        '<div class="dash-card-icon icon-azul">📅</div>' +
        '<div class="dash-card-label">Próxima clase</div>' +
        (proxClase ?
          '<div class="dash-card-valor">' + FEC.formatoCorto(proxClase.fecha) + '</div>' +
          '<div class="dash-card-desc">' + proxClase.horaInicio + ' – ' + proxClase.horaFin + ' · ' + truncar(proxClase.tema, 50) + '</div>'
          : '<div class="dash-card-valor">—</div><div class="dash-card-desc">Sin clases próximas programadas</div>') +
        '<a href="#" class="dash-card-link" data-ir="calendario">Ver calendario →</a>' +
      '</div>' +

      // Card tareas pendientes
      '<div class="dash-card">' +
        '<div class="dash-card-icon icon-naranja">📋</div>' +
        '<div class="dash-card-label">Tareas pendientes</div>' +
        '<div class="dash-card-valor">' + pendientes.length + '</div>' +
        '<div class="dash-card-desc">de ' + tareas.length + ' tareas en total</div>' +
        '<a href="#" class="dash-card-link" data-ir="tareas">Ver tareas →</a>' +
      '</div>' +

      // Card anuncios
      '<div class="dash-card">' +
        '<div class="dash-card-icon icon-dorado">📢</div>' +
        '<div class="dash-card-label">Anuncios</div>' +
        '<div class="dash-card-valor">' + anuncios.length + '</div>' +
        '<div class="dash-card-desc">publicados este ciclo</div>' +
        '<a href="#" class="dash-card-link" data-ir="anuncios">Ver anuncios →</a>' +
      '</div>' +

      // Card clases semana (solo maestro)
      (esMaestro ? '<div class="dash-card">' +
        '<div class="dash-card-icon icon-verde">📆</div>' +
        '<div class="dash-card-label">Clases esta semana</div>' +
        '<div class="dash-card-valor">' + clasesSemana.length + '</div>' +
        '<div class="dash-card-desc">programadas en los próximos 7 días</div>' +
      '</div>' : '') +

      '</div>' + // fin dash-grid

      // Acciones rápidas (solo maestro)
      (esMaestro ? '<div class="dash-acciones">' +
        '<button class="btn btn-primary" id="dash-nueva-clase">+ Nueva clase</button>' +
        '<button class="btn btn-secondary" id="dash-nueva-tarea">+ Nueva tarea</button>' +
        '<button class="btn btn-dorado" id="dash-nuevo-anuncio">+ Anuncio</button>' +
      '</div>' : '') +

      // Último anuncio
      (ultAnuncio ?
        '<div class="ultimo-anuncio">' +
          '<div class="label">📢 Último anuncio del maestro</div>' +
          '<h3>' + escHtml(ultAnuncio.titulo) + '</h3>' +
          '<p>' + escHtml(truncar(ultAnuncio.cuerpo, 200)) + '</p>' +
          (ultAnuncio.link ? '<a href="' + escAttr(ultAnuncio.link) + '" target="_blank" rel="noopener" style="display:block;margin-top:.5rem;font-size:.85rem;color:var(--azul-med)">🔗 Ver enlace adjunto</a>' : '') +
          '<div class="fecha">' + FEC.formatoLargo(ultAnuncio.fecha) + '</div>' +
        '</div>'
        : '');

    sec.innerHTML = html;

    // Eventos
    sec.querySelectorAll("[data-ir]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); navegarA(this.getAttribute("data-ir")); });
    });
    var dc = document.getElementById("dash-nueva-clase");
    var dt = document.getElementById("dash-nueva-tarea");
    var da = document.getElementById("dash-nuevo-anuncio");
    if (dc) dc.addEventListener("click", function () { navegarA("admin"); setTimeout(function () { window.UCENM_ADMIN && window.UCENM_ADMIN.abrirTab("clase"); }, 100); });
    if (dt) dt.addEventListener("click", function () { navegarA("admin"); setTimeout(function () { window.UCENM_ADMIN && window.UCENM_ADMIN.abrirTab("tarea"); }, 100); });
    if (da) da.addEventListener("click", function () { navegarA("admin"); setTimeout(function () { window.UCENM_ADMIN && window.UCENM_ADMIN.abrirTab("anuncio"); }, 100); });
  }

  // ---- HELPERS ----
  function escHtml(s) {
    return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function escAttr(s) { return String(s || "").replace(/"/g,"&quot;"); }
  function truncar(s, n) { s = s || ""; return s.length > n ? s.slice(0, n) + "…" : s; }

  // ---- INIT ----
  function init() {
    // Exponer globales
    window.UCENM_APP = {
      renderTodo: function () { renderDashboard(); },
      navegarA: navegarA,
      getRol: function () { return estado.rol; },
      escHtml: escHtml,
      escAttr: escAttr,
      truncar: truncar,
    };

    var rolGuardado = localStorage.getItem(CFG.keys.rol);
    if (rolGuardado === "alumno" || rolGuardado === "maestro") {
      var pantallaRol = document.getElementById("pantalla-rol");
      if (pantallaRol) pantallaRol.classList.add("hidden");
      activarRol(rolGuardado);
    } else {
      renderPantallaRol();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
