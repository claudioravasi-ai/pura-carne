/* Pura Carne — app de anatomía patológica (demo, todo en memoria del navegador). */
(function () {
  'use strict';

  var D = window.PC_DATOS;
  var vista = document.getElementById('vista');
  var menu = document.getElementById('menu');
  var tostada = document.getElementById('tostada');
  var imprimible = document.getElementById('imprimible');

  /* ---------- Utilidades ---------- */
  function clon(o) { return JSON.parse(JSON.stringify(o)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hora() { var d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function semilla(t) { var s = 0; String(t).split('').forEach(function (ch) { s = (s * 31 + ch.charCodeAt(0)) % 2147483647; }); return s || 7; }
  function azar(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }
  function sinAcentos(t) { return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function ir(r) { location.hash = '#/' + r; }
  function descargar(nombre, contenido, tipo) {
    var url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
    var a = document.createElement('a'); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  /* Librerías externas: se cargan solo cuando hacen falta, con versión fija. */
  var CDN = {
    lectorQR: 'https://cdnjs.cloudflare.com/ajax/libs/html5-qrcode/2.3.8/html5-qrcode.min.js',
    jsQR: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
    qrcode: 'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js',
    tesseract: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
    fabric: 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js',
    gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    lottie: 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js',
    sortable: 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.2/Sortable.min.js',
    fuse: 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js',
    minisearch: 'https://cdn.jsdelivr.net/npm/minisearch@6.3.0/dist/umd/index.min.js',
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    echarts: 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js',
    dexie: 'https://cdn.jsdelivr.net/npm/dexie@3.2.7/dist/dexie.min.js',
    calendario: 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js',
    calendarioEs: 'https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.15/locales/es.global.min.js',
    tiptapCore: 'https://esm.sh/@tiptap/core@2.27.3',
    tiptapKit: 'https://esm.sh/@tiptap/starter-kit@2.27.3?deps=@tiptap/core@2.27.3,@tiptap/pm@2.27.3'
  };
  var cargas = {};
  function cargar(nombre) {
    var url = CDN[nombre] || nombre;
    if (!cargas[url]) {
      cargas[url] = new Promise(function (ok, mal) {
        var sc = document.createElement('script'); sc.src = url; sc.async = true;
        sc.onload = function () { ok(); };
        sc.onerror = function () { delete cargas[url]; sc.remove(); mal(new Error('sin conexión')); };
        document.head.appendChild(sc);
      });
    }
    return cargas[url];
  }
  function sinLibreria(que) { avisar('No se pudo cargar ' + que + '. Revisá la conexión a internet.'); }

  var tT;
  function avisar(t) {
    tostada.textContent = t; tostada.hidden = false; tostada.classList.remove('ver'); void tostada.offsetWidth; tostada.classList.add('ver');
    clearTimeout(tT); tT = setTimeout(function () { tostada.hidden = true; }, 3400);
  }

  var I = {
    recepcion: '<path d="M4 7h16M4 7l2 13h12l2-13M9 7V4h6v3"/>',
    caso: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    imagenes: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-8 8"/>',
    ilustracion: '<circle cx="12" cy="12" r="8"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="14" r="1.5"/>',
    laboratorio: '<path d="M4 5h16v11H9l-5 4z"/>',
    celular: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    buscador: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    calidad: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    micro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    lapiz: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/>',
    regla: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    pdf: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 13h6M9 17h4"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    escanear: '<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M7 12h10"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    doc: '<path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/>',
    impr: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
    bajar: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
    pausa: '<path d="M8 5v14M16 5v14"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    subir: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V4h12"/>',
    ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
  };
  function ic(n, t, extra) { t = t || 18; return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' + (extra || '') + '>' + I[n] + '</svg>'; }
  function logo(t) {
    return '<svg width="' + t + '" height="' + t + '" viewBox="0 0 40 40" fill="none" role="img" aria-label="Logo de Pura Carne: microscopio con un estetoscopio enrollado">' +
      '<rect width="40" height="40" rx="11" fill="#33225E"/>' +
      '<path d="M9 33h18" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M13 33v-3h9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M22 30c5-2.5 6-9 2.5-14" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M13 6l7 11" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M18.5 17l2 3" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M11 22h11" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M28 6v3c0 2-3 2.5-3 4.5M33 6v3c0 2 3 2.5 1 4.5" stroke="#FF4F8B" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M25 13.5c0 1.5 9 1 9 0M24 17c4 2 8 1.5 9-1M23.5 21c4 2 8 1.5 9-1M23 25c3 1.5 6 1.5 7.5 0M30.5 25c1.5 1.5 1.5 3.5 0 4.5" stroke="#FF4F8B" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="30" cy="32" r="2.6" fill="#A88BFF" stroke="#FFFFFF" stroke-width="1.2"/></svg>';
  }

  /* QR: real si cargó la librería; si no (sin internet), un dibujo con la misma forma. */
  function qrMatriz(texto) {
    if (window.qrcode) {
      try {
        var q = window.qrcode(0, 'M'); q.addData(texto); q.make();
        var n = q.getModuleCount(), m = [];
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) m.push([c, r]);
        return { n: n, m: m, real: true };
      } catch (e) { /* sigue con el dibujo */ }
    }
    var rnd = azar(semilla(texto)), N = 21, M = [];
    function fi(c, r) { return c === 0 || c === 6 || r === 0 || r === 6 || (c >= 2 && c <= 4 && r >= 2 && r <= 4); }
    for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
      var on;
      if (x < 8 && y < 8) on = x < 7 && y < 7 && fi(x, y);
      else if (x >= N - 8 && y < 8) on = x >= N - 7 && y < 7 && fi(x - (N - 7), y);
      else if (x < 8 && y >= N - 8) on = x < 7 && y >= N - 7 && fi(x, y - (N - 7));
      else on = rnd() < 0.5;
      if (on) M.push([x, y]);
    }
    return { n: N, m: M, real: false };
  }
  function qrSvg(texto, px, etiqueta) {
    var q = qrMatriz(texto), t = q.n + 4;
    var d = q.m.map(function (p) { return 'M' + (p[0] + 2) + ' ' + (p[1] + 2) + 'h1v1h-1z'; }).join('');
    return '<svg class="qr" width="' + px + '" height="' + px + '" viewBox="0 0 ' + t + ' ' + t + '" shape-rendering="crispEdges" ' +
      (etiqueta ? 'role="img" aria-label="' + esc(etiqueta) + '"' : 'aria-hidden="true"') + '><rect width="' + t + '" height="' + t + '" fill="#FFFFFF"/><path fill="#1A1036" d="' + d + '"/></svg>';
  }

  /* ---------- Estado ---------- */
  var CTRL = [['rotulo', 'El rótulo del frasco coincide con la orden'], ['fijador', 'Formol 10 % en volumen suficiente (≈10:1)'], ['hora', 'Hora de fijación anotada'], ['foto', 'Foto del frasco y de la orden tomada']];
  var S = {
    ruta: '',
    rec: { filtro: 'todos', estadoF: '', busqueda: '', sel: 'B26-04807', panel: 'etiquetas', recien: null, leida: null, lectura: 'aut', camara: false, lectorMsg: '', codigo: '', nuevoPac: null, paso: 1, qPac: '', pac: null, tipo: 'Biopsia', organo: '', frascos: 1, ctrl: { rotulo: true, fijador: true, hora: false, foto: false }, siguiente: 4812, ingresos: clon(D.ingresos) },
    caso: { taco: 'A1', ok: { tipo: true, tam: true, calc: true }, adjuntos: [], firmado: false, informe: '', capturas: [], valores: {} },
    img: { modo: 'real', lamina: 'OS-1', marcando: false, marcas: {}, tin: 'he', zoom: 1, vidrio: 'A1-1', subidas: [], nota: '', video: false, notas: [['#FFB020', 'Foco invasor con patrón en nidos y túbulos escasos. Medir extensión en este nivel.'], ['#A88BFF', 'Microcalcificaciones en el cilindro 5; coinciden con la radiografía de la pieza.']] },
    ilu: { h: 'extra', pausa: false, rotulos: true, perls: false },
    lab: { rol: 'medico', sel: 'p1', borrador: '', semilla: 7, alcance: 'jornada', pedidos: clon(D.pedidos), chats: clon(D.chats),
      tecnicos: [{ id: 't1', nombre: 'Téc. [NOMBRE]', detalle: 'Mesada de corte · desde 08:05' }, { id: 't2', nombre: 'Téc. [NOMBRE 2]', detalle: 'Inmunohistoquímica · desde 08:40' }] },
    cel: { paso: 'escaneo', hechos: {}, calidad: {}, fotos: {}, enviados: [], codigo: null },
    bus: { consulta: 'carcinoma mama HER2', buscado: 'carcinoma mama HER2', on: { atipia: true, tubulos: true } },
    cal: { tipo: 'bio', periodo: 'tri', fuera: false },
    agenda: { vista: 'timeGridWeek', eventos: eventosDemo(), sel: null, nuevo: null }
  };
  var PADRON_EXTRA = {}; // pacientes dados de alta en este equipo
  var OYENTES_GUARDAR = []; // quienes quieren enterarse de cada cambio (la nube)
  var A = {};   // acciones de clic: data-a="nombre" data-v="valor"
  var IN = {};  // acciones de escritura: data-in="nombre"

  /* ---------- Menú y rutas ---------- */
  var RUTAS = [['recepcion', 'Recepción'], ['caso', 'Ficha del caso'], ['imagenes', 'Imágenes y video'], ['ilustracion', 'Ilustración animada'], ['laboratorio', 'Laboratorio'], ['celular', 'Celular del técnico'], ['buscador', 'Buscador diagnóstico'], ['calidad', 'Calidad y estadísticas'], ['agenda', 'Agenda']];
  function pintarMenu() {
    menu.innerHTML = '<a class="marca" href="#/recepcion">' + logo(42) + '<span><strong>Pura Carne</strong><span class="sub">Anatomía Patológica</span></span></a>' +
      '<div class="links">' + RUTAS.map(function (r) { return '<a href="#/' + r[0] + '" data-ruta="' + r[0] + '">' + ic(r[0]) + '<span>' + r[1] + '</span></a>'; }).join('') + '</div>' +
      '<div class="pie"><strong>Dra. [NOMBRE]</strong><br>Médica patóloga · Turno mañana<br><span class="demo">Demo: datos inventados</span>' +
      '<span id="estado-nube" class="nube-estado">Guardado en este equipo</span><button type="button" class="link borrar-local" data-a="borrarLocal">Borrar los datos de este equipo</button></div>';
  }
  function marcarMenu() {
    menu.querySelectorAll('[data-ruta]').forEach(function (a) {
      if (a.dataset.ruta === S.ruta) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function leerRuta() {
    var m = location.hash.match(/^#\/([a-z]+)(?:\?(.*))?$/);
    var r = m && VISTAS[m[1]] ? m[1] : 'recepcion';
    return { r: r, q: new URLSearchParams((m && m[2]) || '') };
  }
  var DESPUES = {}, ANTES = [];
  function despues(ruta, f) { (DESPUES[ruta] = DESPUES[ruta] || []).push(f); }
  function alSalir(f) { ANTES.push(f); }
  var tEnt;
  function irA() {
    var lr = leerRuta(), cambio = lr.r !== S.ruta;
    S.ruta = lr.r;
    var c = lr.q.get('c');
    if (c && S.ruta === 'celular') { S.cel.codigo = c; if (S.cel.paso === 'escaneo') S.cel.paso = 'lista'; document.body.classList.add('modo-tecnico'); }
    else document.body.classList.remove('modo-tecnico');
    render(cambio);
    if (cambio) window.scrollTo(0, 0);
  }
  function render(entrando) {
    var a = document.activeElement, id = a && a.id && vista.contains(a) ? a.id : null, s0 = null, s1 = null;
    if (id) { try { s0 = a.selectionStart; s1 = a.selectionEnd; } catch (e) { s0 = null; } }
    var y = window.scrollY;
    soltarVisor();
    ANTES.splice(0).forEach(function (f) { try { f(); } catch (e) { /* ya estaba cerrado */ } });
    vista.innerHTML = VISTAS[S.ruta]();
    if (S.ruta === 'imagenes') montarVisor();
    (DESPUES[S.ruta] || []).forEach(function (f) { try { f(entrando); } catch (e) { if (window.console) console.error(e); } });
    if (entrando) {
      vista.classList.remove('entrando'); void vista.offsetWidth; vista.classList.add('entrando');
      clearTimeout(tEnt); tEnt = setTimeout(function () { vista.classList.remove('entrando'); }, 1000);
    } else window.scrollTo(0, y);
    marcarMenu();
    document.title = (RUTAS.filter(function (r) { return r[0] === S.ruta; })[0] || ['', 'Pura Carne'])[1] + ' · Pura Carne';
    if (id) {
      var el = document.getElementById(id);
      if (el) { el.focus({ preventScroll: true }); if (s0 != null) { try { el.setSelectionRange(s0, s1); } catch (e) { /* campo sin selección */ } } }
    }
    guardarLocal();
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-a]');
    if (!el || el.disabled) return;
    var f = A[el.dataset.a];
    if (!f) return;
    e.preventDefault();
    f(el.dataset.v, el);
  });
  document.addEventListener('input', function (e) {
    var el = e.target, f = el.dataset && IN[el.dataset.in];
    if (f) f(el.value, el);
  });
  document.addEventListener('keydown', function (e) {
    var el = e.target;
    if (e.key === 'Enter' && el.dataset && el.dataset.enter && A[el.dataset.enter] && el.tagName !== 'TEXTAREA') { e.preventDefault(); A[el.dataset.enter](null, el); }
    if (e.key === 'Escape' && S.img.dibujo) A.dibCerrar();
  });
  document.addEventListener('change', function (e) {
    var el = e.target;
    if (el.id === 'img-archivo') subirArchivos(el.files);
    if (el.id === 'rec-foto-qr') leerFotoQR(el.files && el.files[0]);
    if (el.id === 'np-orden' || el.id === 'orden-foto') leerOrden(el.files && el.files[0]);
    if (el.dataset && el.dataset.vid) fotoVidrio(el.dataset.vid, el.files);
  });
  window.addEventListener('hashchange', irA);

  function cab(kicker, titulo, sub, acciones) {
    return '<header class="cab"><div><span class="kicker">' + kicker + '</span><h1>' + titulo + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' +
      (acciones ? '<div class="acciones">' + acciones + '</div>' : '') + '</header>';
  }
  function chips(lista, accion, actual, clase) {
    return lista.map(function (o) { return '<button type="button" class="chip ' + (clase || '') + '" data-a="' + accion + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (o[0] === actual) + '">' + esc(o[1]) + '</button>'; }).join('');
  }
  function seg(lista, accion, actual, oscuro, etiqueta) {
    return '<div class="seg' + (oscuro ? ' oscuro' : '') + '" role="group" aria-label="' + esc(etiqueta || '') + '">' +
      lista.map(function (o) { return '<button type="button" data-a="' + accion + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (o[0] === actual) + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>';
  }

  /* =====================================================================
     1 · RECEPCIÓN
     ===================================================================== */
  var EST = { urg: ['Urgente · en corte', 'urg'], proc: ['En procesador', 'proc'], macro: ['Esperando macroscopía', ''], obs: ['Observado: falta un control', 'obs'], nuevo: ['Recién ingresado', 'nuevo'], secre: ['Falta admitir en el laboratorio', 'secre'] };
  var COLOR_TIPO = { 'Biopsia': '#6A3DF5', 'Pieza quirúrgica': '#00A8A0', 'Intraoperatoria': '#E0245E', 'Citología': '#FFB020', 'Consulta': '#5E5874' };
  var PREF = { 'Biopsia': 'B', 'Pieza quirúrgica': 'Q', 'Intraoperatoria': 'I', 'Citología': 'C', 'Consulta': 'X' };
  function tokenEtiqueta(id) { var r = azar(semilla(id + 'pc')), l = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', t = ''; for (var i = 0; i < 6; i++) t += l[Math.floor(r() * l.length)]; return t; }
  function seleccionRec() {
    var R = S.rec, m = R.ingresos.filter(function (x) { return x.id === R.sel; })[0] || R.ingresos[0];
    var p = D.padron[m.pac];
    return Object.assign({}, m, p, { paciente: p.n });
  }
  /* Busca aunque esté mal escrito (Fuse.js). Sin la librería, busca el texto exacto. */
  function buscarTolerante(lista, texto, campos) {
    var t = String(texto || '').trim();
    if (!t) return lista;
    var filas = lista.map(function (x) { return { x: x, txt: sinAcentos(campos(x).join(' ')) }; });
    if (window.Fuse) {
      var f = new window.Fuse(filas, { keys: ['txt'], threshold: 0.38, ignoreLocation: true, minMatchCharLength: 2 });
      return f.search(sinAcentos(t)).map(function (r) { return r.item.x; });
    }
    var q = sinAcentos(t);
    return filas.filter(function (r) { return r.txt.indexOf(q) >= 0; }).map(function (r) { return r.x; });
  }
  function casetesDe(s) { var n = s.frascos > 1 ? s.frascos + 1 : 3, out = []; for (var i = 0; i < n; i++) out.push(String.fromCharCode(65 + Math.floor(i / 3)) + (i % 3 + 1)); return out; }

  function vRecepcion() {
    var R = S.rec, P = D.padron, q = sinAcentos(R.busqueda.trim());
    function cuenta(e) { return R.ingresos.filter(function (m) { return m.estado === e || (e === 'macro' && m.estado === 'nuevo'); }).length; }
    var coinciden = buscarTolerante(R.ingresos, R.busqueda, function (m) { return [m.id, P[m.pac].n, m.material, P[m.pac].dni]; });
    var vis = coinciden.filter(function (m) {
      return (R.filtro === 'todos' || m.tipo === R.filtro) &&
        (!R.estadoF || m.estado === R.estadoF || (R.estadoF === 'macro' && m.estado === 'nuevo'));
    });
    var kdef = [['', 'Todas', R.ingresos.length, ''], ['secre', 'Falta admitir', cuenta('secre'), 'teal'], ['macro', 'Esperan macroscopía', cuenta('macro'), ''], ['urg', 'Urgentes', cuenta('urg'), 'rosa'], ['obs', 'Con observaciones', cuenta('obs'), 'ambar']];
    var titulo = R.estadoF ? kdef.filter(function (k) { return k[0] === R.estadoF; })[0][1] : 'Muestras de hoy';

    var hero = '<section class="hero" aria-label="Resumen del día"><span class="orbe o1"></span><span class="orbe o2"></span><span class="orbe o3"></span>' +
      '<div class="cab"><div><span class="kicker">Jueves 23 de octubre de 2026 · Recepción</span><h1>Hoy llegaron ' + R.ingresos.length + ' muestras</h1></div>' +
      '<div class="acciones"><button type="button" class="btn fant" data-a="recEscanear">' + ic('escanear', 20) + 'Leer etiqueta</button>' +
      '<button type="button" class="btn rosa" data-a="recNuevo">' + ic('mas', 20) + 'Nuevo ingreso</button></div></div>' +
      '<div class="buscador-hero">' + ic('buscador', 20) + '<label class="oculto-v" for="rec-buscar">Buscar por protocolo, paciente u órgano</label>' +
      '<input id="rec-buscar" type="search" data-in="recBuscar" value="' + esc(R.busqueda) + '" placeholder="Buscá por protocolo, paciente u órgano" autocomplete="off"></div>' +
      '<div class="rejilla" style="--min:150px">' + kdef.map(function (k) {
        return '<button type="button" class="kpi-b ' + k[3] + '" data-a="recEstado" data-v="' + k[0] + '" aria-pressed="' + (R.estadoF === k[0]) + '"><span>' + k[1] + '</span><strong data-cuenta="' + k[2] + '">' + k[2] + '</strong></button>';
      }).join('') + '</div></section>';

    var lista = '<section class="principal" aria-labelledby="t-lista"><div class="tarjeta-cab"><h2 id="t-lista" style="font-size:17px">' + titulo + '</h2>' +
      '<div class="fila" role="group" aria-label="Tipo de material">' + chips([['todos', 'Todos'], ['Biopsia', 'Biopsias'], ['Pieza quirúrgica', 'Piezas'], ['Intraoperatoria', 'Intraoperatorias'], ['Citología', 'Citologías']], 'recFiltro', R.filtro) + '</div></div>' +
      (vis.length ? '<div class="rejilla llena" style="--min:250px" aria-live="polite">' + vis.map(function (m) {
        var e = EST[m.estado], sel = m.id === R.sel;
        return '<button type="button" class="ficha' + (m.id === R.recien ? ' recien' : '') + '" data-a="recSel" data-v="' + m.id + '" aria-pressed="' + sel + '" style="--tipo:' + (COLOR_TIPO[m.tipo] || '#6A3DF5') + '">' +
          '<span class="ficha-cab"><strong class="mono">' + m.id + '</strong><span class="mono gris chico">' + m.hora + '</span></span>' +
          '<span class="ficha-pac">' + esc(P[m.pac].n) + ' · ' + P[m.pac].edad + ' a</span>' +
          '<span class="ficha-mat">' + esc(m.material) + '</span>' +
          '<span class="ficha-pie"><span class="estado ' + e[1] + '">' + e[0] + '</span><span class="gris mini">' + esc(m.origen) + '</span></span></button>';
      }).join('') + '</div>' : '<p class="vacia">No hay muestras con ese filtro.</p>') + '</section>';

    return hero + '<div class="dos">' + lista + '<aside class="lateral" id="panel-lateral">' + panelRec() + '</aside></div>';
  }

  function panelRec() {
    var R = S.rec, P = D.padron;
    if (R.panel === 'escaner') {
      return '<section class="tarjeta oscura escaner" aria-labelledby="t-lector"><h2 id="t-lector">Leer la etiqueta del frasco</h2>' +
        '<div id="lector" class="lector">' + (R.camara ? '' : '<div class="visor-qr"><span class="linea-escaneo"></span></div>') + '</div>' +
        '<p class="chico" id="lector-estado" role="status">' + esc(R.lectorMsg || 'Elegí cómo leer la etiqueta de 4 × 4 cm:') + '</p>' +
        '<div class="pila" style="width:100%">' +
        '<button type="button" class="btn rosa ancho" data-a="recCamara">' + ic('camara') + (R.camara ? 'Apagar la cámara' : 'Usar la cámara') + '</button>' +
        '<label class="btn sec ancho" for="rec-foto-qr">' + ic('imagenes') + 'Sacar una foto de la etiqueta</label><input id="rec-foto-qr" type="file" accept="image/*" capture="environment" hidden>' +
        '<div class="escribir"><label class="oculto-v" for="rec-codigo">Código de la etiqueta</label><input id="rec-codigo" class="entrada" type="text" data-in="recCodigo" data-enter="recBuscarCodigo" value="' + esc(R.codigo || '') + '" placeholder="Lectora USB o escribí el protocolo" autocomplete="off" autocapitalize="characters"><button type="button" class="btn pri" data-a="recBuscarCodigo">Buscar</button></div>' +
        '</div><div class="fila" style="justify-content:center"><button type="button" class="btn fant" data-a="recLeer">Probar con una etiqueta de ejemplo</button><button type="button" class="btn fant" data-a="recCerrar">Cancelar</button></div></section>';
    }
    if (R.panel === 'nuevo') {
      var nombres = ['Paciente', 'Material', 'Control', 'Confirmar'];
      var bloq = (R.paso === 1 && (!R.pac || !!R.nuevoPac)) || (R.paso === 2 && !R.organo.trim());
      var cuerpo = '';
      if (R.paso === 1) {
        var qp = sinAcentos(R.qPac.trim());
        var ks = buscarTolerante(Object.keys(P), R.qPac, function (k) { return [P[k].n, P[k].dni, P[k].dniCompleto || '', P[k].hc]; }).slice(0, 4);
        if (R.nuevoPac) { cuerpo = formPacienteNuevo(); }
        else cuerpo = '<label class="btn rosa ancho" for="orden-foto">' + ic('camara') + 'Leer la orden médica con la cámara</label><input id="orden-foto" type="file" accept="image/*" capture="environment" hidden>' +
          '<p class="nota-pie">Copia los datos de la orden: paciente, DNI, material y médico. Si el paciente ya está cargado, lo elige solo.</p>' +
          '<div class="campo"><label for="rec-pac">¿O lo buscás a mano?</label><input id="rec-pac" class="entrada" type="search" data-in="recQPac" value="' + esc(R.qPac) + '" placeholder="DNI, historia clínica o apellido" autocomplete="off"></div>' +
          '<div class="pila">' + (ks.length ? ks.map(function (k) {
            return '<button type="button" class="opcion" data-a="recPac" data-v="' + k + '" aria-pressed="' + (R.pac === k) + '"><span class="caja">' + ic('ok', 16) + '</span><span class="txt"><strong>' + esc(P[k].n) + '</strong><br><span class="gris chico">' + P[k].edad + ' a · ' + P[k].sexo + ' · DNI ' + P[k].dni + ' · ' + P[k].hc + '</span></span></button>';
          }).join('') : '<p class="gris chico">No aparece en el padrón.</p>') + '</div>' +
          '<button type="button" class="btn suave ancho" data-a="npAbrir">' + ic('usuario') + 'Paciente nuevo (no está en la lista)</button>';
      } else if (R.paso === 2) {
        cuerpo = '<span class="etiq">Tipo de material</span><div class="fila">' + chips(['Biopsia', 'Pieza quirúrgica', 'Intraoperatoria', 'Citología', 'Consulta'].map(function (t) { return [t, t]; }), 'recTipo', R.tipo, 'lila') + '</div>' +
          '<div class="campo"><label for="rec-org">Órgano y sitio</label><input id="rec-org" class="entrada" type="text" data-in="recOrg" value="' + esc(R.organo) + '" placeholder="Ej.: mama izquierda, cuadrante superoexterno" autocomplete="off"></div>' +
          '<div class="rejilla" style="--min:160px"><div class="campo"><label for="rec-med">Médico que lo pide</label><input id="rec-med" class="entrada" type="text" data-in="recMed" value="' + esc(R.medico || '') + '" placeholder="Apellido y matrícula" autocomplete="off"></div>' +
          '<div class="campo"><label for="rec-serv">Servicio</label><input id="rec-serv" class="entrada" type="text" data-in="recServ" value="' + esc(R.servicio || '') + '" placeholder="Ej.: Ginecología" autocomplete="off"></div></div>' +
          '<div class="tarjeta-cab"><span class="etiq">Frascos recibidos</span><span class="contador"><button type="button" class="btn-icono" data-a="recFrasco" data-v="-1" aria-label="Un frasco menos">−</button><strong>' + R.frascos + '</strong><button type="button" class="btn-icono" data-a="recFrasco" data-v="1" aria-label="Un frasco más">+</button></span></div>';
      } else if (R.paso === 3) {
        cuerpo = '<span class="etiq">Control al recibir</span><div class="pila">' + CTRL.map(function (c) {
          return '<button type="button" class="opcion" data-a="recCtrl" data-v="' + c[0] + '" aria-pressed="' + !!R.ctrl[c[0]] + '"><span class="caja">' + ic('ok', 16) + '</span><span class="txt">' + c[1] + '</span></button>';
        }).join('') + '</div>';
      } else {
        var faltan = CTRL.filter(function (c) { return !R.ctrl[c[0]]; }).map(function (c) { return c[1].toLowerCase(); });
        cuerpo = '<div class="resumen"><span class="gris chico">Se va a crear</span><strong class="prot mono">' + PREF[R.tipo] + '26-0' + R.siguiente + '</strong>' +
          '<strong>' + esc(P[R.pac].n) + ' · ' + P[R.pac].edad + ' a · ' + P[R.pac].hc + '</strong>' +
          '<span>' + esc(R.tipo + ' · ' + R.organo + ' · ' + R.frascos + (R.frascos > 1 ? ' frascos' : ' frasco')) + '</span>' +
          (R.medico || R.servicio ? '<span class="chico">Pide: ' + esc([R.medico, R.servicio].filter(Boolean).join(' · ')) + '</span>' : '') +
          '<span class="chico">Después de crearla queda “falta admitir” hasta que el técnico lea el QR del frasco.</span>' +
          '<span class="chico" style="color:' + (faltan.length ? '#8A4B00' : '#00704F') + '">' + (faltan.length ? 'Queda observado: falta ' + faltan.join(' y ') + '.' : 'Control completo.') + '</span></div>';
      }
      return '<section class="tarjeta" aria-labelledby="t-nuevo"><div class="tarjeta-cab"><h2 id="t-nuevo">Nuevo ingreso · paso ' + R.paso + ' de 4</h2>' +
        '<button type="button" class="btn-icono" data-a="recCerrar" aria-label="Cerrar">×</button></div>' +
        '<div class="pasos">' + nombres.map(function (n, i) { return '<span class="' + (i < R.paso ? 'hecho' : '') + '">' + n + '</span>'; }).join('') + '</div>' +
        cuerpo +
        '<div class="fila">' + (R.paso > 1 ? '<button type="button" class="btn sec" data-a="recVolver">Atrás</button>' : '') +
        '<button type="button" class="btn pri" style="flex:1" data-a="recSeguir"' + (bloq ? ' disabled' : '') + '>' + (R.paso < 4 ? 'Siguiente' : 'Crear protocolo y etiquetas') + '</button></div></section>';
    }
    var s = seleccionRec(), cas = casetesDe(s), tok = tokenEtiqueta(s.id);
    var lectura = R.lectura === 'aut'
      ? '<div class="lectura ok"><span class="tit">Datos filiatorios</span><span>' + esc(s.paciente) + ' · ' + s.edad + ' a · ' + s.sexo + ' · DNI ' + s.dni + '</span><span>' + s.hc + ' · ' + s.cob + '</span>' +
        '<span class="tit" style="margin-top:4px">Lo relevante para este estudio</span>' + s.relevante.map(function (r) { return '<span class="dato"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></span>'; }).join('') +
        '<span class="nota-pie">El resto de la historia clínica queda en el sistema del hospital. Con la app conectada a Firebase, solo lo ve quien entró con su usuario del servicio.</span></div>'
      : '<div class="lectura no"><strong>Solo ve: PC1·' + s.id + '·' + tok + '</strong><span class="chico">Un código sin datos: el QR no lleva nombre, DNI ni historia clínica. Los datos se ven solo dentro de Pura Carne; en la etiqueta van escritos el nombre y los últimos 3 números del DNI.</span></div>';
    return '<section class="tarjeta" aria-labelledby="t-et"><div class="tarjeta-cab"><h2 id="t-et">Etiquetas de ' + s.id + '</h2>' +
      (s.id === 'B26-04807' ? '<a href="#/caso" class="chico">Abrir la ficha del caso</a>' : '<span class="nota-pie">Ficha de ejemplo: B26-04807</span>') + '</div>' +
      circuitoHtml(s) + ((s.estado === 'secre' || s.estado === 'obs') ? admisionHtml(s) : (s.admision ? '<p class="nota-pie">Admitida en el laboratorio: ' + esc(s.admision) + '</p>' : '')) +
      (R.leida === s.id ? '<div class="leida"><span class="tilde">' + ic('ok', 16) + '</span><span><strong>Etiqueta leída: paciente encontrado</strong><br><span class="chico">Estos son los datos que cargó recepción al registrar la muestra.</span></span></div>' : '') +
      '<div class="etiqueta-zona"><div class="e44" aria-label="Vista de la etiqueta de 4 por 4 centímetros">' + etiqueta44(s, 1) + '</div>' +
      '<span class="nota-pie">Vista ampliada. Impresa mide 4 × 4 cm, con un QR de 2,2 cm que se lee con cualquier cámara a 10 o 15 cm. Una etiqueta por frasco.</span></div>' +
      '<div class="rejilla llena" style="--min:96px">' + cas.map(function (c) { return '<div class="casete">' + qrSvg('PC1:' + s.id + '-' + c + ':' + tok, 30) + '<span><strong class="mono">' + c + '</strong><span class="mini">Casete</span></span></div>'; }).join('') + '</div>' +
      '<span class="nota-pie">Los casetes los imprime la casetera del laboratorio con el mismo código.</span>' +
      seg([['aut', 'Leído con Pura Carne'], ['otro', 'Leído con otro celular']], 'recLectura', R.lectura, false, 'Quién lee el QR') + lectura +
      '<button type="button" class="btn osc ancho" data-a="recImprimir">' + ic('impr') + 'Imprimir ' + (s.frascos > 1 ? 'las ' + s.frascos + ' etiquetas (4 × 4 cm)' : 'la etiqueta (4 × 4 cm)') + '</button></section>';
  }

  /* Circuito: secretaría → admisión técnica → macroscopía → cortes y tinciones → diagnóstico médico. */
  var CIRCUITO = ['Secretaría', 'Admisión técnica', 'Macroscopía', 'Cortes y tinciones', 'Diagnóstico médico'];
  function pasoCircuito(s) {
    if (s.id === 'B26-04807') { var p1 = S.lab.pedidos.filter(function (p) { return p.id === 'p1'; })[0]; return S.caso.firmado ? 5 : (p1 && p1.etapa === 3 ? 4 : 3); }
    return { secre: 1, obs: 1, nuevo: 1, macro: 2, proc: 3, urg: 3 }[s.estado] || 1;
  }
  function circuitoHtml(s) {
    var n = pasoCircuito(s);
    return '<ol class="circuito" aria-label="Circuito de la muestra">' + CIRCUITO.map(function (t, i) {
      return '<li class="' + (i < n ? 'hecho' : i === n ? 'ahora' : '') + '"' + (i === n ? ' aria-current="step"' : '') + '><span>' + (i < n ? '✓' : i + 1) + '</span>' + t + '</li>';
    }).join('') + '</ol>';
  }
  function admisionHtml(s) {
    return '<div class="admision"><strong>Paso 2 · Admisión en el laboratorio</strong><span class="chico">El técnico lee el QR del frasco, controla que la muestra llegó bien y la admite. Recién ahí pasa a macroscopía.</span>' +
      (s.estado === 'obs' ? '<span class="aviso ambar">Secretaría la dejó observada (falta un control): revisalo antes de admitir.</span>' : '') +
      '<button type="button" class="btn rosa ancho" data-a="recAdmitir">' + ic('ok') + 'Admitir en el laboratorio</button></div>';
  }
  A.recAdmitir = function () {
    var R = S.rec, m = R.ingresos.filter(function (x) { return x.id === R.sel; })[0]; if (!m) return;
    m.estado = 'macro'; m.admision = hora() + ' · Téc. [NOMBRE]';
    S.lab.pedidos.push({ id: 'adm-' + m.id, caso: m.id, taco: 'frasco', pedido: 'Macroscopía y tallado', tincion: m.material, clase: 'esp', quien: 'Secretaría de AP', etapa: 0, urgente: m.tipo === 'Intraoperatoria' });
    R.recien = m.id; render();
    avisar(m.id + ' admitida. Ya está en el tablero de Laboratorio, en la columna “Pedido”, para macroscopía.');
    festejar();
  };

  /* Etiqueta de 4 × 4 cm: QR arriba y los datos del paciente escritos abajo. */
  function fechaIngreso(m) { return m.fecha || '23/10/2026'; }
  function etiqueta44(s, frasco, qrHtml) {
    var tok = tokenEtiqueta(s.id), partes = String(s.paciente).split(',');
    var ape = (partes[0] || '').trim().toUpperCase(), nom = (partes[1] || '').trim();
    return '<div class="e44-qr">' + (qrHtml || qrSvg('PC1:' + s.id + ':' + tok, 92, 'Código QR del frasco ' + s.id)) + '</div>' +
      '<strong class="e44-prot">' + s.id + '</strong>' +
      '<span class="e44-nom">' + esc(ape) + (nom ? ', ' + esc(nom) : '') + '</span>' +
      '<span class="e44-lin">DNI ' + esc(s.dni) + ' · ' + s.edad + ' a · ' + s.sexo + '</span>' +
      '<span class="e44-lin">' + esc(s.material) + '</span>' +
      '<span class="e44-lin">' + fechaIngreso(s) + ' ' + s.hora + ' · Frasco ' + frasco + '/' + s.frascos + '</span>';
  }

  /* ---------- Lectura de etiquetas: cámara, foto o lectora USB ---------- */
  var camara = null;
  function estadoLector(t) { S.rec.lectorMsg = t; var el = document.getElementById('lector-estado'); if (el) el.textContent = t; }
  function detenerCamara() {
    if (!camara) return;
    var c = camara; camara = null; S.rec.camara = false;
    try { c.stop().then(function () { try { c.clear(); } catch (e) { /* ya estaba vacío */ } }).catch(function () { /* ya estaba apagada */ }); } catch (e) { /* no había arrancado */ }
  }
  function leerCodigo(texto) {
    detenerCamara();
    var t = String(texto || '').trim();
    var m = t.match(/^PC1:([A-Z]\d{2}-\d{5})(?:-([A-Z]\d))?:([A-Z0-9]{6})$/i);
    var id = m ? m[1].toUpperCase() : t.toUpperCase().replace(/\s+/g, '');
    var ing = S.rec.ingresos.filter(function (x) { return x.id === id; })[0];
    if (!ing) { S.rec.panel = 'escaner'; render(); estadoLector('No hay ninguna muestra con el código “' + (id || 'vacío') + '”. Revisá la etiqueta.'); avisar(S.rec.lectorMsg); return; }
    if (m && m[3].toUpperCase() !== tokenEtiqueta(ing.id)) { S.rec.panel = 'escaner'; render(); estadoLector('Esta etiqueta no coincide con la muestra registrada ' + ing.id + ': no la uses y avisá a recepción.'); avisar(S.rec.lectorMsg); return; }
    Object.assign(S.rec, { sel: ing.id, panel: 'etiquetas', recien: ing.id, leida: ing.id, lectura: 'aut', filtro: 'todos', estadoF: '', busqueda: '', lectorMsg: '', codigo: '' });
    render();
    avisar('Etiqueta leída: ' + ing.id + ' · ' + D.padron[ing.pac].n + (m && m[2] ? ' · casete ' + m[2].toUpperCase() : ''));
    if (window.innerWidth < 980) { var p = document.getElementById('panel-lateral'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  function leerFotoQR(file) {
    if (!file) return;
    estadoLector('Leyendo la foto…');
    cargar('jsQR').then(function () {
      return new Promise(function (ok, mal) { var img = new Image(); img.onload = function () { ok(img); }; img.onerror = mal; img.src = URL.createObjectURL(file); });
    }).then(function (img) {
      var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      var x = c.getContext('2d'); x.drawImage(img, 0, 0, c.width, c.height);
      var r = window.jsQR(x.getImageData(0, 0, c.width, c.height).data, c.width, c.height, { inversionAttempts: 'attemptBoth' });
      if (r && r.data) leerCodigo(r.data);
      else estadoLector('No encontré un QR en la foto. Acercate más, con buena luz y sin reflejos.');
    }).catch(function () { estadoLector('No se pudo leer la foto. Revisá la conexión a internet.'); });
  }
  A.recCamara = function () {
    if (S.rec.camara) { detenerCamara(); render(); return; }
    if (!window.isSecureContext || !navigator.mediaDevices) { estadoLector('La cámara en vivo funciona con la app publicada (https). Ahora usá “Sacar una foto de la etiqueta”: hace lo mismo.'); return; }
    estadoLector('Abriendo la cámara…');
    cargar('lectorQR').then(function () {
      S.rec.camara = true; render(); estadoLector('Apuntá al QR de la etiqueta. Se lee solo.');
      camara = new window.Html5Qrcode('lector', { verbose: false, formatsToSupport: [window.Html5QrcodeSupportedFormats.QR_CODE] });
      alSalir(detenerCamara);
      return camara.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 210, height: 210 } }, function (txt) { leerCodigo(txt); }, function () { /* todavía no hay QR a la vista */ });
    }).catch(function (e) {
      detenerCamara(); S.rec.camara = false; render();
      estadoLector('No se pudo abrir la cámara' + (e && e.name === 'NotAllowedError' ? ': falta el permiso.' : '.') + ' Probá con “Sacar una foto de la etiqueta”.');
    });
  };
  IN.recCodigo = function (v) { S.rec.codigo = v; };
  A.recBuscarCodigo = function () { var t = (S.rec.codigo || '').trim(); if (t) leerCodigo(t); else estadoLector('Escribí el protocolo (por ejemplo B26-04807) o pasá la lectora.'); };

  /* ---------- Paciente nuevo, con lectura de la orden médica (Tesseract.js) ---------- */
  var CAMPOS_NP = [['ape', 'Apellido', 'text'], ['nom', 'Nombre', 'text'], ['dni', 'DNI', 'text'], ['nac', 'Fecha de nacimiento', 'date'], ['hc', 'Historia clínica', 'text'], ['cob', 'Cobertura', 'text'], ['motivo', 'Motivo del estudio', 'text'], ['ant', 'Antecedentes relevantes', 'text'], ['trat', 'Tratamientos previos', 'text']];
  function formPacienteNuevo() {
    var np = S.rec.nuevoPac;
    return '<div class="np"><div class="tarjeta-cab"><strong>Paciente nuevo</strong><button type="button" class="link" data-a="npCerrar">Volver a la búsqueda</button></div>' +
      '<label class="btn sec ancho" for="np-orden">' + ic('camara') + 'Leer la orden médica con la cámara</label><input id="np-orden" type="file" accept="image/*" capture="environment" hidden>' +
      (np.ocr ? '<p class="aviso lila" id="np-ocr" role="status">' + esc(np.ocr) + '</p>' : '') +
      '<div class="rejilla" style="--min:150px">' + CAMPOS_NP.map(function (c) {
        return '<div class="campo"><label for="np-' + c[0] + '">' + c[1] + '</label><input id="np-' + c[0] + '" class="entrada" type="' + c[2] + '" data-in="np" data-campo="' + c[0] + '" value="' + esc(np[c[0]] || '') + '" autocomplete="off"' + (c[0] === 'dni' ? ' inputmode="numeric"' : '') + '></div>';
      }).join('') + '</div>' +
      '<span class="etiq">Sexo</span><div class="fila">' + chips([['F', 'Femenino'], ['M', 'Masculino'], ['X', 'No binario']], 'npSexo', np.sexo || '', 'lila') + '</div>' +
      (np.error ? '<p class="aviso ambar" role="alert">' + esc(np.error) + '</p>' : '') +
      '<button type="button" class="btn pri ancho" data-a="npGuardar">Guardar paciente y seguir</button>' +
      '<span class="nota-pie">El DNI completo queda solo en esta ficha; en pantallas y etiquetas se ven los últimos 3 números.</span></div>';
  }
  function edadDe(nac) { if (!nac) return ''; var n = new Date(nac + 'T12:00:00'), h = new Date(), e = h.getFullYear() - n.getFullYear(); if (h.getMonth() < n.getMonth() || (h.getMonth() === n.getMonth() && h.getDate() < n.getDate())) e--; return isNaN(e) ? '' : e; }
  function mascaraDni(d) { var n = String(d).replace(/\D/g, ''); return n.length < 6 ? n : '••.•••.' + n.slice(-3); }
  function capital(t) { return String(t).toLowerCase().replace(/(^|[\s'-])([a-záéíóúñ])/g, function (m, a, b) { return a + b.toUpperCase(); }).trim(); }
  function extraerOrden(t) {
    var d = {}, l = String(t).replace(/\r/g, ''), m;
    m = l.match(/D\.?\s?N\.?\s?I\.?\s*(?:N[º°o.]*)?\s*[:#]?\s*([0-9]{1,2}[.\s]?[0-9]{3}[.\s]?[0-9]{3})/i); if (m) d.dni = m[1].replace(/\D/g, '');
    m = l.match(/(?:Paciente|Apellido y nombres?|Nombre y apellido)\s*[:\-]\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' ]+?)\s*,\s*([A-ZÁÉÍÓÚÑa-záéíóúñ' ]+)/i); if (m) { d.ape = capital(m[1]); d.nom = capital(m[2]); }
    m = l.match(/(?:Fecha de nac(?:imiento)?|F\.?\s?nac\.?)\s*[:\-]?\s*(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/i);
    if (m) { var y = m[3].length === 2 ? '19' + m[3] : m[3]; d.nac = y + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[1]).slice(-2); }
    m = l.match(/(?:H\.?\s?C\.?|Historia cl[ií]nica)\s*(?:N[º°o.]*)?\s*[:#]?\s*([0-9][0-9 .]{3,})/i); if (m) d.hc = 'HC ' + m[1].replace(/[ .]+$/, '').trim();
    m = l.match(/(?:Obra social|Cobertura|Prepaga)\s*[:\-]\s*([^\n]+)/i); if (m) d.cob = m[1].trim();
    m = l.match(/(?:Diagn[oó]stico presuntivo|Sospecha diagn[oó]stica|Motivo(?: del estudio)?)\s*[:\-]\s*([^\n]+)/i); if (m) d.motivo = m[1].trim();
    m = l.match(/Sexo\s*[:\-]?\s*(F|M|Femenino|Masculino)\b/i); if (m) d.sexo = m[1][0].toUpperCase();
    m = l.match(/(?:Material|Muestra|Pieza|Estudio solicitado)\s*[:\-]\s*([^\n]+)/i); if (m) d.organo = m[1].trim();
    var tt = sinAcentos(l);
    if (/intraoperatori|congelaci/.test(tt)) d.tipo = 'Intraoperatoria';
    else if (/paaf|citolog|puncion/.test(tt)) d.tipo = 'Citología';
    else if (/pieza quirurgica|reseccion|ectomia/.test(tt)) d.tipo = 'Pieza quirúrgica';
    else if (/biopsia|core|punch/.test(tt)) d.tipo = 'Biopsia';
    m = l.match(/M[eé]dico(?: solicitante)?\s*[:\-]\s*([^\n]{3,50})/i); if (m) d.medico = m[1].trim();
    m = l.match(/Servicio\s*[:\-]\s*([^\n]{3,40})/i); if (m) d.servicio = m[1].trim();
    return d;
  }
  function leerOrden(file) {
    if (!file) return;
    if (!S.rec.nuevoPac) S.rec.nuevoPac = { sexo: '' };
    var np = S.rec.nuevoPac;
    np.ocr = 'Leyendo la orden… La primera vez baja el diccionario en castellano y tarda un poco.'; render();
    cargar('tesseract').then(function () {
      return window.Tesseract.recognize(file, 'spa', { logger: function (m) { if (m.status === 'recognizing text') { var el = document.getElementById('np-ocr'); if (el) el.textContent = 'Leyendo la orden… ' + Math.round(m.progress * 100) + ' %'; } } });
    }).then(function (r) {
      var datos = extraerOrden(r.data.text || ''), n = 0, R = S.rec;
      if (datos.organo && !R.organo) R.organo = datos.organo;
      if (datos.tipo) R.tipo = datos.tipo;
      if (datos.medico) R.medico = datos.medico;
      if (datos.servicio) R.servicio = datos.servicio;
      var ya = datos.dni && Object.keys(D.padron).filter(function (k) { return D.padron[k].dniCompleto === datos.dni; })[0];
      if (ya) { R.pac = ya; R.nuevoPac = null; render(); avisar('La orden es de ' + D.padron[ya].n + ', que ya estaba cargado. Seguí con el material.'); return; }
      ['ape', 'nom', 'dni', 'nac', 'hc', 'cob', 'motivo', 'sexo'].forEach(function (k) { if (datos[k] && !np[k]) { np[k] = datos[k]; n++; } });
      np.ocr = n ? 'Listo: completé ' + n + ' dato' + (n > 1 ? 's' : '') + ' desde la orden. Revisalos antes de guardar.' : 'No encontré datos claros en la foto. Completalos a mano.';
      render();
    }).catch(function () { np.ocr = 'No se pudo leer la orden. Revisá la conexión o completala a mano.'; render(); });
  }
  A.npAbrir = function () { S.rec.nuevoPac = { sexo: '' }; S.rec.pac = null; render(); var el = document.getElementById('np-ape'); if (el) el.focus(); };
  A.npCerrar = function () { S.rec.nuevoPac = null; render(); };
  A.npSexo = function (v) { S.rec.nuevoPac.sexo = v; render(); };
  IN.np = function (v, el) { S.rec.nuevoPac[el.dataset.campo] = v; };
  A.npGuardar = function () {
    var np = S.rec.nuevoPac, dni = String(np.dni || '').replace(/\D/g, '');
    var falta = [];
    if (!String(np.ape || '').trim()) falta.push('apellido');
    if (!String(np.nom || '').trim()) falta.push('nombre');
    if (dni.length < 7 || dni.length > 8) falta.push('DNI de 7 u 8 números');
    if (!np.sexo) falta.push('sexo');
    if (falta.length) { np.error = 'Falta completar: ' + falta.join(', ') + '.'; render(); return; }
    var repetido = Object.keys(D.padron).filter(function (k) { return D.padron[k].dniCompleto === dni; })[0];
    if (repetido) { S.rec.pac = repetido; S.rec.nuevoPac = null; render(); avisar('Ese DNI ya estaba cargado: elegí a ' + D.padron[repetido].n + '.'); return; }
    var id = 'n' + Date.now().toString(36), rel = [];
    if (np.motivo) rel.push(['Motivo', np.motivo]);
    if (np.ant) rel.push(['Antecedentes', np.ant]);
    if (np.trat) rel.push(['Tratamientos', np.trat]);
    var p = { n: capital(np.ape) + ', ' + capital(np.nom), dni: mascaraDni(dni), dniCompleto: dni, edad: edadDe(np.nac) === '' ? '¿?' : edadDe(np.nac), nac: np.nac || '', sexo: np.sexo, hc: np.hc || 'HC sin número', cob: np.cob || 'Sin cobertura cargada', relevante: rel.length ? rel : [['Motivo', 'Sin datos clínicos cargados']], nuevo: true };
    D.padron[id] = p; PADRON_EXTRA[id] = p;
    S.rec.pac = id; S.rec.nuevoPac = null; S.rec.qPac = '';
    render(); avisar('Paciente ' + p.n + ' guardado. Seguí con el material.');
  };

  IN.recBuscar = function (v) { S.rec.busqueda = v; render(); };
  IN.recQPac = function (v) { S.rec.qPac = v; render(); };
  IN.recOrg = function (v) { S.rec.organo = v; render(); };
  IN.recMed = function (v) { S.rec.medico = v; };
  IN.recServ = function (v) { S.rec.servicio = v; };
  A.recSel = function (v) {
    detenerCamara();
    Object.assign(S.rec, { sel: v, panel: 'etiquetas', lectura: 'aut', recien: null, leida: null }); render();
    if (window.innerWidth < 980) { var p = document.getElementById('panel-lateral'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  A.recFiltro = function (v) { S.rec.filtro = v; render(); };
  A.recEstado = function (v) { S.rec.estadoF = v || ''; render(); };
  A.recNuevo = function () {
    detenerCamara();
    Object.assign(S.rec, { panel: 'nuevo', paso: 1, nuevoPac: null }); render();
    var el = document.getElementById('rec-pac'); if (el) { el.focus(); if (window.innerWidth < 980) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  };
  A.recCerrar = function () { detenerCamara(); Object.assign(S.rec, { panel: 'etiquetas', nuevoPac: null, lectorMsg: '' }); render(); };
  A.recEscanear = function () {
    Object.assign(S.rec, { panel: 'escaner', lectorMsg: '', codigo: '' }); render();
    var c = document.getElementById('rec-codigo'); if (c && window.innerWidth >= 980) c.focus();
    if (window.innerWidth < 980) { var p = document.getElementById('panel-lateral'); if (p) p.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  };
  A.recLeer = function () {
    var m = S.rec.ingresos.filter(function (x) { return x.id === 'Q26-01122'; })[0] || S.rec.ingresos[0];
    leerCodigo('PC1:' + m.id + ':' + tokenEtiqueta(m.id));
  };
  A.recPac = function (v) { S.rec.pac = v; render(); };
  A.recTipo = function (v) { S.rec.tipo = v; render(); };
  A.recFrasco = function (v) { S.rec.frascos = Math.max(1, Math.min(9, S.rec.frascos + Number(v))); render(); };
  A.recCtrl = function (v) { S.rec.ctrl[v] = !S.rec.ctrl[v]; render(); };
  A.recVolver = function () { S.rec.paso = Math.max(1, S.rec.paso - 1); render(); };
  A.recSeguir = function () {
    var R = S.rec;
    if ((R.paso === 1 && !R.pac) || (R.paso === 2 && !R.organo.trim())) return;
    if (R.paso < 4) { R.paso++; render(); if (R.paso === 2) { var o = document.getElementById('rec-org'); if (o) o.focus(); } return; }
    var id = PREF[R.tipo] + '26-0' + R.siguiente;
    var faltan = CTRL.filter(function (c) { return !R.ctrl[c[0]]; }).length;
    var hoy = new Date(), fecha = ('0' + hoy.getDate()).slice(-2) + '/' + ('0' + (hoy.getMonth() + 1)).slice(-2) + '/' + hoy.getFullYear();
    R.ingresos.unshift({ id: id, pac: R.pac, tipo: R.tipo, material: R.tipo + ' · ' + R.organo.trim(), origen: R.servicio || 'Secretaría de AP', medico: R.medico || '', hora: hora(), fecha: fecha, estado: faltan ? 'obs' : 'secre', frascos: R.frascos });
    Object.assign(R, { sel: id, recien: id, panel: 'etiquetas', paso: 1, pac: null, qPac: '', organo: '', medico: '', servicio: '', frascos: 1, filtro: 'todos', estadoF: '', busqueda: '', siguiente: R.siguiente + 1, lectura: 'aut', ctrl: { rotulo: true, fijador: true, hora: false, foto: false } });
    render(); avisar('Protocolo ' + id + ' creado. Imprimí la etiqueta de 4 × 4 cm y pegala en el frasco.');
    if (window.gsap) window.gsap.from('.ficha.recien', { scale: 0.85, opacity: 0, duration: 0.6, ease: 'back.out(2)', clearProps: 'transform,opacity' });
    festejar();
  };
  A.recLectura = function (v) { S.rec.lectura = v; render(); };
  A.recImprimir = function () {
    var s = seleccionRec(), texto = 'PC1:' + s.id + ':' + tokenEtiqueta(s.id);
    function armar(qrHtml) {
      var hojas = '';
      for (var f = 1; f <= s.frascos; f++) hojas += '<div class="imp-44">' + etiqueta44(s, f, qrHtml) + '</div>';
      imprimible.innerHTML = hojas;
      document.body.classList.add('imprimiendo-44');
      var pg = document.getElementById('estilo-pagina') || document.head.appendChild(Object.assign(document.createElement('style'), { id: 'estilo-pagina' }));
      pg.textContent = '@page { size: 40mm 40mm; margin: 0; }';
      avisar('Abriendo la impresión: ' + s.frascos + (s.frascos > 1 ? ' etiquetas' : ' etiqueta') + ' de 4 × 4 cm.');
      setTimeout(function () { window.print(); }, 350);
    }
    cargar('qrcode').then(function () {
      window.QRCode.toString(texto, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' }, function (err, svg) { armar(err ? null : svg); });
    }).catch(function () { armar(null); });
  };
  window.addEventListener('afterprint', function () { document.body.classList.remove('imprimiendo-44'); var pg = document.getElementById('estilo-pagina'); if (pg) pg.textContent = ''; });

  /* =====================================================================
     2 · FICHA DEL CASO
     ===================================================================== */
  var COLOR_TIN = { he: '#C2346F', ihq: '#7A4A1E', esp: '#2F6FB0' };
  function vCaso() {
    var C = S.caso, p1 = S.lab.pedidos.filter(function (p) { return p.id === 'p1'; })[0], et = p1 ? p1.etapa : 0;
    var ESTADOS = ['En procesador', 'En corte', 'En tinción', 'Vidrios listos para ver'];
    var estado = C.firmado ? 'Informe firmado' : ESTADOS[et];
    var pasos = [['Recepción', '08:12'], ['Macroscopía', '09:05'], ['Casetes', '09:11 · 3'], ['Procesador', 'desde 09:30'], ['Inclusión y corte', ''], ['Tinción', ''], ['Diagnóstico', '']];
    var cur = C.firmado ? 7 : 3 + et;
    var traza = '<section class="tarjeta" aria-labelledby="t-traza"><div class="tarjeta-cab"><h2 id="t-traza">Trazabilidad de la muestra</h2><span class="gris chico">Isquemia fría: 18 min · Fijación: 6 h 40 min (en rango de 6 a 72 h)</span></div>' +
      '<div class="traza-barra"><span style="width:' + Math.min(100, Math.round(cur / 6 * 100)) + '%"></span></div><ol class="traza">' +
      pasos.map(function (p, i) { var cls = i < cur ? '' : i === cur ? 'ahora' : 'pend'; return '<li class="' + cls + '"><strong>' + p[0] + '</strong><span class="mono gris">' + (i < cur ? (p[1] || 'hecho') : i === cur ? 'ahora' : '—') + '</span></li>'; }).join('') + '</ol></section>';

    var t = D.tacos.filter(function (x) { return x.id === C.taco; })[0];
    var tacos = '<div class="rejilla" style="--min:170px">' + D.tacos.map(function (x) {
      return '<button type="button" class="taco" data-a="casoTaco" data-v="' + x.id + '" aria-pressed="' + (x.id === C.taco) + '"><span class="taco-cab"><strong class="mono">' + x.id + '</strong>' +
        '<svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true"><rect x="1" y="1" width="32" height="22" rx="3" fill="#F4F1FB" stroke="#CFC7E4"/><path d="M7 7h14M7 12h14M7 17h14" stroke="#CFC7E4"/><rect x="24" y="5" width="6" height="14" rx="1" fill="#FFC2D7"/></svg></span>' +
        '<span>' + x.desc + '</span><span class="gris mini">' + x.resumen + '</span></button>';
    }).join('') + '</div>';
    var vidrios = '<div class="lista-vid"><div class="lista-vid-cab"><strong>Vidrios del taco ' + t.id + '</strong><span class="leyenda"><span><i style="background:#C2346F"></i>H&amp;E</span><span><i style="background:#7A4A1E"></i>Inmunohistoquímica</span><span><i style="background:#2F6FB0"></i>Especiales</span></span></div>' +
      t.vidrios.map(function (v) {
        var cargado = S.cel.enviados.indexOf(v[0]) >= 0, obs = S.cel.calidad[v[0]];
        var est = cargado ? (obs && obs !== 'ok' ? 'Cargado · ' + (obs === 'pliegue' ? 'pliegue' : 'tinción débil') : 'Cargado por el técnico') : v[3];
        return '<div class="vidrio"><span class="tira" style="background:' + COLOR_TIN[v[4]] + '"></span><span class="vid-id mono">' + v[0] + '</span><span class="vid-tin">' + v[1] + '</span><span class="vid-det">' + v[2] + '</span>' +
          '<span class="estado ' + (cargado ? (obs && obs !== 'ok' ? 'obs' : 'ok') : '') + '">' + est + '</span>' +
          '<button type="button" class="link" data-a="verVidrio" data-v="' + v[0] + '">Ver imagen</button><button type="button" class="link" data-a="ilustrar" data-v="carci">Ilustrar</button></div>';
      }).join('') + '</div>';

    var hechos = D.checklist.filter(function (c) { return C.ok[c[0]]; }).length, total = D.checklist.length;
    var informe = '<section class="tarjeta" aria-labelledby="t-inf"><div class="tarjeta-cab"><h2 id="t-inf">Informe · ' + (C.firmado ? 'firmado' : 'borrador') + '</h2><span class="gris chico">Protocolo CAP · carcinoma invasor de mama (biopsia)</span></div>' +
      '<div class="fila" style="flex-wrap:nowrap"><div class="barra" style="flex:1"><span style="width:' + Math.round(hechos / total * 100) + '%"></span></div><strong style="font-variant-numeric:tabular-nums">' + hechos + '/' + total + '</strong></div>' +
      '<div class="pila">' + D.checklist.map(function (c) {
        return '<button type="button" class="opcion" data-a="casoChk" data-v="' + c[0] + '" aria-pressed="' + !!C.ok[c[0]] + '"><span class="caja">' + ic('ok', 16) + '</span><span class="txt">' + c[1] + '</span><span class="gris mini">' + c[2] + '</span></button>';
      }).join('') + '</div>' +
      (C.adjuntos.length ? '<div class="aviso lila">Adjuntos: ' + C.adjuntos.map(esc).join(', ') + '</div>' : '') +
      '<button type="button" class="btn osc ancho" data-a="casoFirmar">' + (C.firmado ? 'Informe firmado ✓' : 'Revisar y firmar informe') + '</button></section>';

    return cab('<a href="#/recepcion">← Recepción</a>', '<span class="mono">B26-04807</span> <span class="estado ' + (et === 3 || C.firmado ? 'ok' : 'proc') + '" style="vertical-align:middle;font-size:13px">' + estado + '</span>',
      'Biopsia core guiada por ecografía · mama izquierda, cuadrante superoexterno',
      '<button type="button" class="btn sec" data-a="casoEtiquetas">' + ic('impr') + 'Reimprimir etiquetas</button><button type="button" class="btn sec" data-a="casoPedir">Pedir 2 niveles más</button><a class="btn pri" href="#/buscador">' + ic('buscador') + 'Buscar casos parecidos</a>') +
      '<section class="datos-pac" aria-label="Datos filiatorios"><div><span>Paciente</span><strong>Ríos, María E.</strong></div><div><span>Edad · sexo</span><strong>58 a · F</strong></div><div><span>DNI</span><strong class="mono">••.•••.412</strong></div><div><span>Solicitante</span><strong>Dr. [APELLIDO] · MP [N°]</strong></div><div><span>Clínica</span><strong>Nódulo de 14 mm · BI-RADS 4C</strong></div></section>' +
      traza + '<div class="dos"><section class="principal" aria-labelledby="t-tacos"><div class="tarjeta-cab"><h2 id="t-tacos" style="font-size:17px">Tacos y vidrios</h2><span class="gris chico">Tocá un taco para ver sus vidrios</span></div>' + tacos + vidrios + '</section>' +
      '<div class="lateral">' + informe + '</div></div>' + redaccion();
  }
  A.casoTaco = function (v) { S.caso.taco = v; render(); };
  A.casoChk = function (v) { S.caso.ok[v] = !S.caso.ok[v]; S.caso.firmado = false; render(); };
  A.casoFirmar = function () {
    var faltan = D.checklist.filter(function (c) { return !S.caso.ok[c[0]]; }).length;
    if (S.caso.firmado) { avisar('El informe ya está firmado.'); return; }
    if (faltan) { avisar('Faltan ' + faltan + ' ítems del protocolo CAP para poder firmar.'); return; }
    S.caso.firmado = true; S.caso.fechaFirma = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
    render(); avisar('Informe de B26-04807 firmado. Ya podés descargar el PDF sin la marca de borrador.');
    festejar();
  };
  A.casoPedir = function () {
    var n = S.lab.pedidos.length + 1;
    S.lab.pedidos.push({ id: 'p' + n + '-' + Date.now(), caso: 'B26-04807', taco: S.caso.taco, pedido: '2 niveles más profundos', tincion: 'Hematoxilina-eosina', clase: 'he', quien: 'Dra. [NOMBRE]', etapa: 0, urgente: false });
    avisar('Pedido enviado al laboratorio: 2 niveles más del taco ' + S.caso.taco + '.');
  };
  A.casoEtiquetas = function () { S.rec.sel = 'B26-04807'; A.recImprimir(); };
  A.verVidrio = function (v) {
    var mapa = { 'A1-3': 're', 'A1-4': 're', 'A1-5': 'her2', 'A2-2': 'ki67' };
    Object.assign(S.img, { modo: 'real', lamina: VIDRIO_LAM[v] || 'OS-1', vidrio: v, tin: mapa[v] || 'he', zoom: 1, marcando: false }); ir('imagenes');
  };
  A.ilustrar = function (v) { S.ilu.h = v || 'carci'; ir('ilustracion'); };

  /* =====================================================================
     3 · IMÁGENES Y VIDEO
     ===================================================================== */
  var TIN = {
    he: { corto: 'H&E', nombre: 'Hematoxilina-eosina', fondo: '#F3CADA', nucleo: '#5B3C8C', pos: '#5B3C8C', borde: 'none' },
    re: { corto: 'RE', nombre: 'Receptor de estrógeno', fondo: '#E7EEF5', nucleo: '#8DA3C9', pos: '#7A4A1E', borde: 'none' },
    her2: { corto: 'HER2', nombre: 'HER2', fondo: '#EEF1F4', nucleo: '#9DB0CF', pos: '#9DB0CF', borde: '#7A4A1E' },
    ki67: { corto: 'Ki-67', nombre: 'Ki-67', fondo: '#E9EFF5', nucleo: '#8DA3C9', pos: '#6B3A14', borde: 'none' }
  };
  var CELULAS = (function () {
    var r = azar(7), out = [];
    for (var i = 0; i < 170; i++) { var k = r(); out.push({ x: Math.round(r() * 800), y: Math.round(r() * 460), rx: Math.round(7 + k * 6), ry: Math.round(5 + k * 4), p: r() }); }
    return out;
  })();
  function pintaCel(t, c) {
    var s = TIN[t], pos = t === 're' ? c.p < 0.85 : t === 'ki67' ? c.p < 0.2 : false;
    return { fill: pos ? s.pos : s.nucleo, stroke: t === 'her2' ? s.borde : 'none', sw: t === 'her2' ? (c.p < 0.3 ? 3 : 1) : 0 };
  }

  /* Láminas reales escaneadas (de ejemplo): proyecto OpenSlide, libres para distribuir. */
  var OSD_IMG = 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/';
  var BASE_LAM = 'https://openslide-demo-site.s3.dualstack.us-east-2.amazonaws.com/';
  var LAMINAS = [
    { id: 'OS-1', corto: 'H&E', nombre: 'Hematoxilina-eosina', ruta: 'hamamatsu/os-1', w: 122880, h: 110592, mpp: 0.2271, origen: 'Hamamatsu NanoZoomer, 2012', lic: 'libre distribución' },
    { id: 'OS-2', corto: 'Ki-67', nombre: 'Ki-67 (inmunohistoquímica)', ruta: 'hamamatsu/os-2', w: 126976, h: 73728, mpp: 0.2271, origen: 'Hamamatsu NanoZoomer, 2012', lic: 'libre distribución' },
    { id: 'OS-3', corto: 'IHQ', nombre: 'PTEN (inmunohistoquímica)', ruta: 'hamamatsu/os-3', w: 122880, h: 77824, mpp: 0.2271, origen: 'Hamamatsu NanoZoomer, 2012', lic: 'libre distribución' },
    { id: 'Philips-1', corto: 'Ganglio', nombre: 'Ganglio linfático · H&E', ruta: 'philips-tiff/philips-1', w: 45056, h: 35840, mpp: 0.2269, origen: 'Philips · Radboud UMC', lic: 'CC0' },
    { id: 'CMU-1', corto: 'CMU-1', nombre: 'Tejido en campo claro', ruta: 'aperio/cmu-1', w: 46000, h: 32914, mpp: 0.499, origen: 'Aperio · Carnegie Mellon', lic: 'CC0' }
  ];
  var VIDRIO_LAM = { 'A1-1': 'OS-1', 'A1-2': 'OS-1', 'A2-1': 'OS-1', 'A3-1': 'Philips-1', 'A1-3': 'OS-3', 'A1-4': 'OS-3', 'A1-5': 'OS-3', 'A2-2': 'OS-2', 'A2-3': 'OS-3', 'A3-2': 'CMU-1' };
  var FOTOS = [['Frasco 1', 'Foto · rótulo y orden', '#D9D3E8'], ['Rx pieza', 'Radiografía · calcificaciones', '#3D3656']];
  function lamina(id) { return LAMINAS.filter(function (l) { return l.id === id; })[0] || LAMINAS[0]; }
  function fuenteLamina(l) { return { Image: { xmlns: 'http://schemas.microsoft.com/deepzoom/2008', Url: BASE_LAM + l.ruta + '/slide_files/', Format: 'jpeg', Overlap: '1', TileSize: '510', Size: { Width: String(l.w), Height: String(l.h) } } }; }
  function miniLamina(l) { var m = Math.max(l.w, l.h), max = Math.ceil(Math.log2(m)), nivel = max - Math.ceil(Math.log2(m / 510)); return BASE_LAM + l.ruta + '/slide_files/' + nivel + '/0_0.jpeg'; }
  function subidaActual() { return S.img.subidas.filter(function (x) { return x.id === S.img.vidrio; })[0]; }
  function hayZoom() { var sub = subidaActual(); return !!window.OpenSeadragon && (sub ? !sub.video : S.img.modo === 'real'); }
  function claveVisor() { var sub = subidaActual(); return sub ? sub.id : lamina(S.img.lamina).id; }
  function marcasActuales() { var k = claveVisor(); return (S.img.marcas[k] = S.img.marcas[k] || []); }

  var visor = null, visorClave = null, vistas = {};
  function soltarVisor() {
    if (!visor) return;
    try { if (visor.viewport && visorClave) vistas[visorClave] = visor.viewport.getBounds(); visor.destroy(); } catch (e) { /* ya estaba cerrado */ }
    visor = null;
  }
  function montarVisor() {
    var el = document.getElementById('osd');
    if (!el || !window.OpenSeadragon) return;
    var sub = subidaActual(), clave = claveVisor(), OSD = window.OpenSeadragon;
    visorClave = clave;
    visor = OSD({
      element: el, prefixUrl: OSD_IMG, tileSources: sub ? { type: 'image', url: sub.url } : fuenteLamina(lamina(S.img.lamina)),
      crossOriginPolicy: 'Anonymous', showNavigationControl: false, showNavigator: true, navigatorPosition: 'TOP_RIGHT',
      navigatorSizeRatio: 0.2, navigatorAutoFade: false, animationTime: 0.6, blendTime: 0.15, maxZoomPixelRatio: 2,
      visibilityRatio: 0.5, zoomPerScroll: 1.5, gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      gestureSettingsTouch: { pinchRotate: false }
    });
    var listo = function () { var c = document.getElementById('osd-cargando'); if (c) c.hidden = true; };
    visor.addHandler('open', function () { var b = vistas[clave]; if (b) visor.viewport.fitBounds(b, true); pintarMarcas(); medir(); setTimeout(listo, 4000); });
    visor.addOnceHandler('tile-drawn', listo);
    visor.addHandler('animation', medir);
    visor.addHandler('open-failed', function () { var c = document.getElementById('osd-cargando'); if (c) { c.hidden = false; c.textContent = 'No se pudo abrir la lámina. Revisá la conexión a internet.'; } });
    visor.addHandler('canvas-click', function (ev) {
      if (!S.img.marcando || !ev.quick) return;
      ev.preventDefaultAction = true;
      agregarMarca(visor.viewport.pointFromPixel(ev.position));
    });
  }
  function medir() {
    if (!visor || !visor.viewport || !visor.world.getItemCount() || subidaActual()) return;
    var l = lamina(S.img.lamina), iz = visor.viewport.viewportToImageZoom(visor.viewport.getZoom(true));
    var um = l.mpp / iz, aumento = 10 * iz / l.mpp, largo = 1;
    [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000].forEach(function (p) { if (p / um <= 140) largo = p; });
    var b = document.getElementById('osd-barra'), t = document.getElementById('osd-um'), m = document.getElementById('osd-mag');
    if (b) b.style.width = Math.max(8, Math.round(largo / um)) + 'px';
    if (t) t.textContent = largo >= 1000 ? String(largo / 1000).replace('.', ',') + ' mm' : largo + ' µm';
    if (m) m.textContent = '≈ ' + (aumento < 10 ? aumento.toFixed(1).replace('.', ',') : Math.round(aumento)) + 'x';
  }
  function pintarMarcas() {
    if (!visor) return;
    var OSD = window.OpenSeadragon;
    visor.clearOverlays();
    marcasActuales().forEach(function (m) {
      var d = document.createElement('div'); d.className = 'marca-osd'; d.textContent = m.n; d.title = m.texto;
      visor.addOverlay({ element: d, location: new OSD.Point(m.x, m.y), placement: OSD.Placement.CENTER, checkResize: false });
    });
  }
  function agregarMarca(p) {
    var lista = marcasActuales();
    lista.push({ n: lista.length + 1, x: p.x, y: p.y, z: visor.viewport.getZoom(), texto: S.img.nota.trim() || 'Punto marcado sin texto' });
    S.img.nota = ''; S.img.marcando = false;
    pintarMarcas(); refrescarNotas(); refrescarMarcar();
    avisar('Marca ' + lista.length + ' guardada en la lámina.');
  }
  function refrescarNotas() { var c = document.getElementById('img-notas'); if (c) c.innerHTML = notasCuerpo(); }
  function refrescarMarcar() {
    var b = document.getElementById('osd-marcar'), m = S.img.marcando;
    if (b) { b.className = 'btn ' + (m ? 'rosa' : 'sec') + ' btn-marcar'; b.setAttribute('aria-pressed', String(m)); b.textContent = m ? 'Tocá la lámina para marcar' : '+ Marcar un punto'; }
    var lz = document.querySelector('.visor-lienzo'); if (lz) lz.classList.toggle('marcando', m);
  }
  function notasCuerpo() {
    var G = S.img, ms = hayZoom() ? marcasActuales() : [];
    return '<h2 id="t-notas">Notas sobre la lámina</h2>' +
      G.notas.map(function (n) { return '<div class="nota"><i style="background:' + n[0] + '"></i><span>' + esc(n[1]) + '</span></div>'; }).join('') +
      (ms.length ? '<div class="pila">' + ms.map(function (m, i) {
        return '<button type="button" class="marca-nota" data-a="imgIrMarca" data-v="' + i + '"><span class="marca-osd chica">' + m.n + '</span><span class="txt">' + esc(m.texto) + '</span><span class="mini gris">Ir ›</span></button>';
      }).join('') + '</div>' : '') +
      '<div class="campo"><label for="img-nota">' + (hayZoom() ? 'Escribí la nota y después tocá “Marcar un punto”' : 'Agregar nota') + '</label><textarea id="img-nota" class="entrada" data-in="imgNota" placeholder="Qué querés marcar en esta lámina">' + esc(G.nota) + '</textarea></div>' +
      '<button type="button" class="btn suave" id="img-nota-btn" data-a="imgNotaAdd"' + (G.nota.trim() ? '' : ' disabled') + '>Guardar nota sin marcar</button>';
  }

  function vImagenes() {
    var G = S.img, sub = subidaActual(), zoom = hayZoom(), l = lamina(G.lamina), s = TIN[G.tin];
    var lienzo, titulo, selector = '', pie;
    if (sub && sub.video) {
      lienzo = '<video src="' + sub.url + '" controls playsinline></video>';
      titulo = esc(sub.nombre) + ' · video'; pie = 'Se ve solo en este navegador; no se sube a ningún lado.';
    } else if (zoom) {
      var ctrl = [['in', '+', 'Acercar'], ['out', '−', 'Alejar'], ['casa', '⌂', 'Ver la lámina entera'], ['rotar', '↻', 'Girar 90 grados'], ['completa', '⛶', 'Pantalla completa']];
      lienzo = '<div id="osd" class="osd"></div><canvas id="osd-puntos" class="osd-puntos" aria-hidden="true" hidden></canvas><span class="cargando-osd" id="osd-cargando">Cargando lámina…</span>' +
        '<button type="button" id="osd-marcar" class="btn ' + (G.marcando ? 'rosa' : 'sec') + ' btn-marcar" data-a="imgMarcar" aria-pressed="' + G.marcando + '">' + (G.marcando ? 'Tocá la lámina para marcar' : '+ Marcar un punto') + '</button>' +
        '<div class="ctrl-osd">' + ctrl.map(function (c) { return '<button type="button" data-a="imgZ" data-v="' + c[0] + '" aria-label="' + c[2] + '" title="' + c[2] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
        (sub ? '' : '<div class="escala-osd" aria-live="off"><strong id="osd-mag">—</strong><i id="osd-barra"></i><span id="osd-um">—</span></div>');
      titulo = sub ? esc(sub.nombre) + ' · imagen subida' : 'Lámina real ' + l.id + ' · ' + l.nombre;
      if (!sub) selector = '<div class="seg oscuro" role="group" aria-label="Lámina">' + LAMINAS.map(function (x) { return '<button type="button" data-a="imgLamina" data-v="' + x.id + '" aria-pressed="' + (x.id === l.id) + '">' + esc(x.corto) + '</button>'; }).join('') + '</div>';
      pie = sub ? 'Se ve solo en este navegador; no se sube a ningún lado. Rueda, dos dedos o doble clic para acercar.'
        : 'Lámina de ejemplo del proyecto OpenSlide (' + l.origen + ', ' + l.lic + '): no es de esta paciente. Rueda, dos dedos o doble clic para acercar; arrastrá para moverte. En la app real acá se ve el escaneo de cada vidrio del caso.';
    } else {
      lienzo = '<svg id="lamina" viewBox="0 0 800 460" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de la lámina ' + G.vidrio + ' con ' + s.nombre + '">' +
        '<rect id="lam-fondo" class="fondo" width="800" height="460" fill="' + s.fondo + '"/><g id="lam-g" class="lienzo" style="transform:scale(' + G.zoom + ')">' +
        CELULAS.map(function (c, i) { var p = pintaCel(G.tin, c); return '<ellipse class="cel" data-i="' + i + '" cx="' + c.x + '" cy="' + c.y + '" rx="' + c.rx + '" ry="' + c.ry + '" fill="' + p.fill + '" stroke="' + p.stroke + '" stroke-width="' + p.sw + '"/>'; }).join('') +
        '</g></svg><span class="pin"><i></i>Nota 1 · foco invasor</span>' +
        '<div class="zoom"><button type="button" class="btn-icono" data-a="imgZoom" data-v="2" aria-label="Acercar">+</button><button type="button" class="btn-icono" data-a="imgZoom" data-v="0.5" aria-label="Alejar">−</button></div>' +
        '<span class="escala mono"><i></i><span id="img-escala">' + Math.round(200 / G.zoom) + ' µm</span></span>';
      titulo = 'Ilustración ' + G.vidrio + ' · <span id="img-tin">' + s.nombre + '</span> · <span id="img-zoom">' + (G.zoom * 10) + 'x</span>';
      selector = '<div class="seg oscuro" role="group" aria-label="Tinción" id="img-tins">' + Object.keys(TIN).map(function (k) { return '<button type="button" data-a="imgTin" data-v="' + k + '" aria-pressed="' + (k === G.tin) + '">' + TIN[k].corto + '</button>'; }).join('') + '</div>';
      pie = 'Ilustración esquemática con la tinción elegida.' + (window.OpenSeadragon ? '' : ' Sin internet no se pueden abrir las láminas reales.');
    }
    var visorHtml = '<section class="visor principal" aria-labelledby="t-visor"><div class="visor-cab"><h2 id="t-visor">' + titulo + '</h2>' + selector + '</div>' +
      '<div class="visor-lienzo' + (G.marcando && zoom ? ' marcando' : '') + '">' + lienzo + '</div><p class="visor-pie">' + pie + '</p></section>';

    var video = '<section class="tarjeta" aria-labelledby="t-video"><h2 id="t-video">Video de macroscopía</h2><button type="button" class="video" data-a="imgVideo" aria-label="' + (G.video ? 'Pausar' : 'Reproducir') + ' el video de macroscopía">' +
      '<span class="play">' + ic(G.video ? 'pausa' : 'play', 22) + '</span><span class="cap mono">02:14 · frascos, cilindros, casetes</span>' + (G.video ? '<span class="avance"></span>' : '') + '</button></section>';

    var galeria = FOTOS.map(function (g) {
      return '<button type="button" class="miniatura" data-a="imgFoto" data-v="' + g[0] + '"><span class="muestra" style="background:' + g[2] + '"></span><span class="pie-mini"><strong class="mono">' + g[0] + '</strong><span>' + g[1] + '</span></span></button>';
    }).concat(LAMINAS.map(function (x) {
      return '<button type="button" class="miniatura" data-a="imgLamina" data-v="' + x.id + '" aria-pressed="' + (!sub && G.modo === 'real' && x.id === l.id) + '"><span class="muestra"><img src="' + miniLamina(x) + '" alt="" loading="lazy" crossorigin="anonymous"></span><span class="pie-mini"><strong class="mono">' + x.id + '</strong><span>Lámina real · ' + esc(x.nombre) + '</span></span></button>';
    })).concat(G.subidas.map(function (g) {
      return '<button type="button" class="miniatura" data-a="imgVidrio" data-v="' + g.id + '" aria-pressed="' + (g.id === G.vidrio) + '"><span class="muestra">' + (g.video ? '<span style="display:flex;height:100%;align-items:center;justify-content:center;background:#33225E;color:#fff">' + ic('play', 22) + '</span>' : '<img src="' + g.url + '" alt="">') + '</span><span class="pie-mini"><strong>' + esc(g.id) + '</strong><span>' + esc(g.nombre) + '</span></span></button>';
    })).join('') + '<label class="miniatura subir" for="img-archivo">' + ic('subir', 24) + 'Subir foto o video<input id="img-archivo" type="file" accept="image/*,video/*" multiple hidden></label>';

    return cab('<a href="#/caso">← Caso B26-04807</a>', 'Imágenes y video del caso', 'Cada foto, video y lámina queda atada a su taco o vidrio y respalda el informe.',
      seg([['real', 'Lámina real'], ['ilus', 'Ilustración']], 'imgModo', sub ? '' : G.modo, false, 'Qué mostrar') +
      (zoom ? '<button type="button" class="btn sec" data-a="imgCaptura">' + ic('camara') + 'Capturar para el informe</button><button type="button" class="btn sec" data-a="imgDibujar">' + ic('regla') + 'Dibujar y medir</button>' + (sub ? '' : '<button type="button" class="btn sec" data-a="imgContar">' + ic('ojo') + 'Contar positivos</button>') : '') +
      '<label class="btn pri" for="img-archivo">' + ic('subir') + 'Subir foto</label>') +
      '<div class="dos">' + visorHtml + '<div class="lateral">' + tarjetaConteo() + '<section class="tarjeta" id="img-notas" aria-labelledby="t-notas">' + notasCuerpo() + '</section>' + video + '</div></div>' +
      '<section class="pila" aria-labelledby="t-gal"><div class="tarjeta-cab"><h2 id="t-gal" style="font-size:17px">Todo el material del caso</h2><span class="gris chico">Tocá una lámina para abrirla con zoom</span></div><div class="rejilla llena" style="--min:150px">' + galeria + '</div></section>' + modalDibujo();
  }
  function actualizarLamina() {
    var G = S.img, s = TIN[G.tin];
    var f = document.getElementById('lam-fondo'), g = document.getElementById('lam-g');
    if (!f || !g) { render(); return; }
    f.setAttribute('fill', s.fondo);
    g.style.transform = 'scale(' + G.zoom + ')';
    g.querySelectorAll('.cel').forEach(function (el) { var p = pintaCel(G.tin, CELULAS[+el.dataset.i]); el.setAttribute('fill', p.fill); el.setAttribute('stroke', p.stroke); el.setAttribute('stroke-width', p.sw); });
    var t = document.getElementById('img-tin'); if (t) t.textContent = s.nombre;
    var z = document.getElementById('img-zoom'); if (z) z.textContent = (G.zoom * 10) + 'x';
    var e = document.getElementById('img-escala'); if (e) e.textContent = Math.round(200 / G.zoom) + ' µm';
    document.querySelectorAll('#img-tins button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === G.tin)); });
  }
  A.imgModo = function (v) { S.img.modo = v; S.img.marcando = false; if (subidaActual()) S.img.vidrio = 'A1-1'; render(); };
  A.imgLamina = function (v) { S.img.modo = 'real'; S.img.lamina = v; S.img.marcando = false; if (subidaActual()) S.img.vidrio = 'A1-1'; render(); };
  A.imgTin = function (v) { S.img.tin = v; actualizarLamina(); };
  A.imgZoom = function (v) { S.img.zoom = Math.max(1, Math.min(8, S.img.zoom * Number(v))); actualizarLamina(); };
  A.imgZ = function (v) {
    if (!visor || !visor.viewport) return;
    var vp = visor.viewport;
    if (v === 'in') vp.zoomBy(1.8);
    else if (v === 'out') vp.zoomBy(1 / 1.8);
    else if (v === 'casa') vp.goHome();
    else if (v === 'rotar') vp.setRotation((vp.getRotation() + 90) % 360);
    else if (v === 'completa') { visor.setFullScreen(!visor.isFullPage()); return; }
    vp.applyConstraints();
  };
  A.imgMarcar = function () { S.img.marcando = !S.img.marcando; refrescarMarcar(); if (S.img.marcando) avisar('Tocá el lugar exacto de la lámina donde va la marca.'); };
  A.imgIrMarca = function (v) {
    var m = marcasActuales()[+v]; if (!m || !visor) return;
    visor.viewport.panTo(new window.OpenSeadragon.Point(m.x, m.y)); visor.viewport.zoomTo(m.z);
  };
  A.imgCaptura = function () {
    if (!visor || !visor.drawer || !visor.drawer.canvas) { avisar('Esperá a que cargue la lámina.'); return; }
    try {
      var url = visor.drawer.canvas.toDataURL('image/png'), nombre = 'captura-' + claveVisor() + '.png';
      var a = document.createElement('a'); a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
      var n = 'Captura de la lámina ' + claveVisor();
      if (S.caso.adjuntos.indexOf(n) < 0) S.caso.adjuntos.push(n);
      guardarCaptura(n, url, umPorPxCaptura());
      avisar('Captura descargada y adjunta al informe de B26-04807.');
    } catch (e) { avisar('El navegador no dejó capturar esta imagen.'); }
  };
  A.imgFoto = function (v) { avisar(v + ': en la app real se abre la foto tomada en recepción.'); };
  A.imgVidrio = function (v) { S.img.vidrio = v; S.img.marcando = false; render(); };
  IN.imgNota = function (v) { S.img.nota = v; var b = document.getElementById('img-nota-btn'); if (b) b.disabled = !v.trim(); };
  A.imgNotaAdd = function () {
    var t = S.img.nota.trim(); if (!t) return;
    var colores = ['#FF4F8B', '#00A8A0', '#FFB020', '#A88BFF'];
    S.img.notas.push([colores[S.img.notas.length % 4], t]); S.img.nota = ''; refrescarNotas(); avisar('Nota guardada.');
  };
  A.imgVideo = function () { S.img.video = !S.img.video; render(); if (S.img.video) avisar('Video de ejemplo: acá se reproduce la grabación real de la macroscopía.'); };
  function subirArchivos(files) {
    if (!files || !files.length) return;
    Array.prototype.forEach.call(files, function (f) {
      var n = S.img.subidas.length + 1;
      S.img.subidas.push({ id: 'Foto ' + n, nombre: f.name, url: URL.createObjectURL(f), video: f.type.indexOf('video') === 0 });
    });
    S.img.vidrio = S.img.subidas[S.img.subidas.length - 1].id;
    render(); avisar(files.length + (files.length > 1 ? ' archivos agregados' : ' archivo agregado') + ' al caso (solo en este navegador). Podés acercar con zoom.');
  }

  /* =====================================================================
     4 · ILUSTRACIÓN DIAGNÓSTICA ANIMADA
     ===================================================================== */
  var CSS_ESC = [
    '.esc *{transform-box:fill-box;transform-origin:center}',
    '@keyframes fluye{from{transform:translateX(-160px)}to{transform:translateX(960px)}}.fluye{animation:fluye 7s linear infinite}',
    '@keyframes sale1{0%{transform:translate(0,0);opacity:0}12%{opacity:1}40%{transform:translate(8px,38px)}100%{transform:translate(-70px,150px)}}',
    '@keyframes sale2{0%{transform:translate(0,0);opacity:0}12%{opacity:1}40%{transform:translate(12px,40px)}100%{transform:translate(80px,165px)}}',
    '@keyframes sale3{0%{transform:translate(0,0);opacity:0}12%{opacity:1}40%{transform:translate(4px,42px)}100%{transform:translate(10px,120px)}}',
    '.sale1{animation:sale1 5s ease-out infinite}.sale2{animation:sale2 5s ease-out infinite}.sale3{animation:sale3 5s ease-out infinite}',
    '@keyframes eng1{0%{transform:translate(200px,-120px) scale(1);opacity:1}65%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(0,0) scale(.35);opacity:0}}',
    '@keyframes eng2{0%{transform:translate(-220px,110px) scale(1);opacity:1}65%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(0,0) scale(.35);opacity:0}}',
    '@keyframes eng3{0%{transform:translate(150px,140px) scale(1);opacity:1}65%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(0,0) scale(.35);opacity:0}}',
    '.eng1{animation:eng1 6s ease-in infinite}.eng2{animation:eng2 6s ease-in infinite}.eng3{animation:eng3 6s ease-in infinite}',
    '@keyframes pigmento{0%,35%{opacity:0;transform:scale(.2)}60%,100%{opacity:1;transform:scale(1)}}.pig{animation:pigmento 6s ease infinite}',
    '@keyframes respira{0%,100%{transform:scale(1)}50%{transform:scale(1.03,.98)}}.respira{animation:respira 4s ease-in-out infinite}',
    '@keyframes brota{0%{opacity:0;transform:scale(0)}25%{opacity:1;transform:scale(1)}85%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}.brota{animation:brota 6s ease-out infinite}',
    '@keyframes capa{0%{opacity:0;transform:scaleY(0)}12%{opacity:1;transform:scaleY(1)}90%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1)}}.capa{transform-origin:50% 100%;animation:capa 9s ease-out infinite both}',
    '@keyframes infiltra{0%{opacity:0;transform:scale(.6)}20%{opacity:1;transform:scale(1)}100%{opacity:1;transform:scale(1)}}.infiltra{animation:infiltra 7s ease-out infinite}',
    '@keyframes sepA{0%,30%{transform:translateX(0)}70%,100%{transform:translateX(-16px)}}@keyframes sepB{0%,30%{transform:translateX(0)}70%,100%{transform:translateX(16px)}}',
    '.sepA{animation:sepA 3s ease-in-out infinite alternate}.sepB{animation:sepB 3s ease-in-out infinite alternate}',
    '@keyframes rotula{from{opacity:0}to{opacity:1}}.rot{animation:rotula .6s ease both}'
  ].join('\n');
  (function () { var st = document.createElement('style'); st.id = 'estilo-escenas'; st.textContent = CSS_ESC; document.head.appendChild(st); })();

  var GEO = (function () {
    var r = azar(11);
    function onda(x, y, w, a) { return 'M' + x + ' ' + y + ' q ' + (w / 4) + ' ' + (-a) + ' ' + (w / 2) + ' 0 t ' + (w / 2) + ' 0'; }
    var g = { fibras: [], bajas: [], densas: [], fibroblastos: [], luz: [], endotelio: [], pig: [], basales: [], focos: [], flujo: [], capas: [], leucos: [], nidos: [] }, i;
    for (i = 0; i < 26; i++) g.fibras.push(onda(Math.round(r() * 760), Math.round(r() * 480), 60 + Math.round(r() * 60), 6));
    for (i = 0; i < 18; i++) g.bajas.push(onda(Math.round(r() * 760), 230 + Math.round(r() * 240), 70, 6));
    for (i = 0; i < 60; i++) g.densas.push(onda(Math.round(r() * 780), Math.round(r() * 480), 50 + Math.round(r() * 70), 8));
    for (i = 0; i < 12; i++) { var yy = r() < 0.5 ? 40 + r() * 120 : 300 + r() * 160; g.fibroblastos.push([Math.round(r() * 780), Math.round(yy), Math.round(r() * 60 - 30)]); }
    for (i = 0; i < 16; i++) g.luz.push([200 + Math.round(r() * 60), (-r() * 7).toFixed(2)]);
    for (var x = 40; x < 800; x += 110) { g.endotelio.push([x, 190]); if (x < 400 || x > 500) g.endotelio.push([x + 50, 270]); }
    for (i = 0; i < 22; i++) { var a = r() * Math.PI * 2, rr = 30 + r() * 70; g.pig.push([Math.round(430 + Math.cos(a) * rr * 1.1), Math.round(255 + Math.sin(a) * rr * 0.7), (2 + r() * 3).toFixed(1), (-r() * 6).toFixed(2)]); }
    for (x = 10; x < 800; x += 18) g.basales.push([x, 104 + Math.round(Math.sin(x / 20) * 10)]);
    [[160, 200, 0], [520, 215, -1.5], [690, 190, -3], [330, 230, -4.5]].forEach(function (f) { var pts = []; for (var k = 0; k < 14; k++) { var b = r() * Math.PI * 2, d = r() * 34; pts.push([Math.round(f[0] + Math.cos(b) * d), Math.round(f[1] + Math.sin(b) * d * 0.7)]); } g.focos.push([f[2], pts]); });
    for (i = 0; i < 12; i++) g.flujo.push([90 + Math.round(r() * 120), (-r() * 4.5).toFixed(2)]);
    for (i = 0; i < 9; i++) { var y = 418 - i * 24; g.capas.push(['M150 ' + (y + 24) + ' L150 ' + y + ' q 50 -10 100 0 t 100 0 t 100 0 t 100 0 t 100 0 L650 ' + (y + 24) + ' Z', i % 2 ? '#C83A55' : '#F1B9CC', (i * 0.6).toFixed(1)]); }
    for (i = 0; i < 18; i++) g.leucos.push([Math.round(250 + r() * 300), Math.round(250 + r() * 170)]);
    [[180, 150, 0], [420, 120, -1], [300, 330, -2], [560, 260, -3], [150, 380, -4]].forEach(function (n) { var cs = []; for (var k = 0; k < 7; k++) { var b = k / 7 * Math.PI * 2, d = k === 0 ? 0 : 28; cs.push([Math.round(n[0] + Math.cos(b) * d), Math.round(n[1] + Math.sin(b) * d), (7 + r() * 5).toFixed(1), (6 + r() * 4).toFixed(1)]); } g.nidos.push([n[2], cs]); });
    return g;
  })();
  function hematie(cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#D33A55"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.4) + '" fill="#E9798A"/>'; }
  function fibras(lista, color, w) { return lista.map(function (d) { return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + w + '"/>'; }).join(''); }
  function rotulos(lista) {
    return lista.map(function (l) {
      var dy = l[3] < l[1] ? -6 : 16;
      return '<g class="rot"><line x1="' + l[0] + '" y1="' + l[1] + '" x2="' + l[2] + '" y2="' + l[3] + '" stroke="#1A1036" stroke-width="1.5"/><circle cx="' + l[0] + '" cy="' + l[1] + '" r="4" fill="#1A1036"/>' +
        '<text x="' + l[2] + '" y="' + l[3] + '" dy="' + dy + '" text-anchor="' + (l[5] || 'start') + '" font-family="IBM Plex Sans, sans-serif" font-size="15" font-weight="600" fill="#1A1036" stroke="#FFFFFF" stroke-width="4" paint-order="stroke">' + esc(l[4]) + '</text></g>';
    }).join('');
  }
  var HALL = {
    extra: { nombre: 'Extravasación de hematíes', aumento: 'Objetivo 40x', color: '#D33A55',
      texto: 'Glóbulos rojos que salen de la luz del capilar por una solución de continuidad de la pared y quedan libres en el estroma, todavía sin macrófagos: es una hemorragia reciente.',
      criterios: ['Hematíes fuera de la luz vascular, entre las fibras del estroma', 'Pared capilar con solución de continuidad', 'Sin hemosiderina: sangrado reciente'],
      dd: 'Hematíes arrastrados al tallar la pieza (artefacto): quedan en superficie y sin relación con un vaso.',
      rot: [[120, 230, 110, 150, 'Luz capilar con hematíes'], [451, 280, 560, 340, 'Pared rota'], [390, 400, 250, 440, 'Hematíes extravasados en el estroma', 'end'], [260, 190, 300, 70, 'Núcleo endotelial']],
      svg: function () {
        return '<defs><clipPath id="cl-luz"><rect x="0" y="186" width="800" height="88"/></clipPath></defs><rect width="800" height="480" fill="#F6D3E1"/>' + fibras(GEO.fibras, '#EAB0C8', 2) +
          GEO.fibroblastos.map(function (n) { return '<ellipse cx="' + n[0] + '" cy="' + n[1] + '" rx="12" ry="3.5" fill="#7A57A6" transform="rotate(' + n[2] + ' ' + n[0] + ' ' + n[1] + ')"/>'; }).join('') +
          '<rect x="0" y="186" width="800" height="88" fill="#FBE8EF"/><g clip-path="url(#cl-luz)">' + GEO.luz.map(function (h) { return '<g class="fluye" style="animation-delay:' + h[1] + 's">' + hematie(0, h[0], 10) + '</g>'; }).join('') + '</g>' +
          '<line x1="0" y1="183" x2="800" y2="183" stroke="#C66A93" stroke-width="6"/><line x1="0" y1="277" x2="430" y2="277" stroke="#C66A93" stroke-width="6"/><line x1="472" y1="277" x2="800" y2="277" stroke="#C66A93" stroke-width="6"/>' +
          GEO.endotelio.map(function (e) { return '<ellipse cx="' + e[0] + '" cy="' + e[1] + '" rx="16" ry="4" fill="#5B3C8C"/>'; }).join('') +
          [['sale1', 0], ['sale2', -1.7], ['sale3', -3.4], ['sale1', -2.5], ['sale2', -4.2]].map(function (f) { return '<g class="' + f[0] + '" style="animation-delay:' + f[1] + 's">' + hematie(451, 262, 10) + '</g>'; }).join('');
      } },
    hemo: { nombre: 'Hemocateresis', aumento: 'Objetivo 100x', color: '#B9822A',
      texto: 'Un macrófago fagocita hematíes extravasados y degrada su hemoglobina; el hierro queda como gránulos de hemosiderina pardo-dorados (azules con Perls). Indica un sangrado de días.',
      criterios: ['Macrófago grande con núcleo excéntrico arriñonado', 'Hematíes dentro de fagosomas', 'Gránulos de hemosiderina, positivos con Perls'],
      dd: 'Pigmento de formol (birrefringente, fuera de las células) o melanina (negativa con Perls).',
      rot: function () { return [[300, 170, 180, 90, 'Macrófago (histiocito)', 'end'], [365, 215, 330, 440, 'Núcleo', 'end'], [470, 235, 640, 120, 'Hematíe fagocitado'], [450, 300, 560, 420, S.ilu.perls ? 'Hemosiderina (azul con Perls)' : 'Hemosiderina pardo-dorada']]; },
      svg: function () {
        var col = S.ilu.perls ? '#2F5DA8' : '#B9822A';
        return '<rect width="800" height="480" fill="#F6D3E1"/>' + fibras(GEO.fibras, '#EAB0C8', 2) +
          '<g class="respira"><path d="M285 170 C 330 110, 470 105, 530 160 C 590 215, 560 330, 480 350 C 400 372, 300 350, 270 290 C 248 245, 255 200, 285 170 Z" fill="#F3E2EC" stroke="#B97A9F" stroke-width="3"/></g>' +
          '<path d="M330 215 C 340 185, 395 185, 400 215 C 404 238, 385 240, 372 232 C 360 226, 350 245, 338 240 C 326 235, 326 225, 330 215 Z" fill="#5E3E8E"/>' +
          '<circle cx="470" cy="235" r="22" fill="#FBEFF4" stroke="#D9A9C1" stroke-width="2"/><circle cx="470" cy="235" r="11" fill="#D33A55" opacity=".75"/>' +
          GEO.pig.map(function (p) { return '<circle class="pig" cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + col + '" style="animation-delay:' + p[3] + 's"/>'; }).join('') +
          [[520, 200, 'eng1', 0], [300, 300, 'eng2', -2], [480, 330, 'eng3', -4]].map(function (g) { return '<g class="' + g[2] + '" style="animation-delay:' + g[3] + 's">' + hematie(g[0], g[1], 10) + '</g>'; }).join('');
      } },
    pete: { nombre: 'Petequias', aumento: 'Objetivo 10x', color: '#C9253F',
      texto: 'Focos puntiformes de hematíes extravasados alrededor de capilares de la dermis papilar, bajo una epidermis conservada. A simple vista miden 1 a 2 mm y no desaparecen a la presión.',
      criterios: ['Pequeños focos de hematíes perivasculares', 'Capilares de la dermis papilar', 'Epidermis sin cambios'],
      dd: 'Púrpura o equimosis (focos más grandes) y vasculitis (hay daño de la pared y neutrófilos).',
      rot: [[400, 60, 400, 22, 'Epidermis', 'middle'], [330, 175, 250, 300, 'Capilar de la dermis papilar', 'end'], [520, 215, 600, 330, 'Foco petequial'], [700, 420, 780, 455, 'Dermis', 'end']],
      svg: function () {
        return '<rect width="800" height="480" fill="#F5D8E5"/><path d="M0 0 H800 V96 C 760 130, 720 80, 680 112 C 640 144, 600 86, 560 116 C 520 146, 480 84, 440 114 C 400 144, 360 86, 320 116 C 280 146, 240 84, 200 114 C 160 144, 120 86, 80 116 C 50 138, 20 100, 0 112 Z" fill="#C893B6"/><path d="M0 0 H800 V30 H0 Z" fill="#E7C2D6"/>' +
          GEO.basales.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4" fill="#5B3C8C"/>'; }).join('') +
          [150, 330, 520, 690].map(function (x) { return '<path d="M' + (x - 22) + ' 260 C ' + (x - 22) + ' 150, ' + (x + 22) + ' 150, ' + (x + 22) + ' 260" fill="none" stroke="#C66A93" stroke-width="5" stroke-linecap="round"/>'; }).join('') +
          fibras(GEO.bajas, '#EAB0C8', 2) +
          GEO.focos.map(function (f) { return '<g class="brota" style="animation-delay:' + f[0] + 's">' + f[1].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#C9253F"/>'; }).join('') + '</g>'; }).join('');
      } },
    trombo: { nombre: 'Trombo', aumento: 'Objetivo 4x', color: '#8E2A44',
      texto: 'Masa adherida a la pared del vaso, formada por capas alternas de fibrina con plaquetas (pálidas) y de hematíes (rojas): las líneas de Zahn. La sangre sigue pasando por la luz que queda libre.',
      criterios: ['Adherido a la pared vascular', 'Líneas de Zahn: capas pálidas y rojas alternadas', 'Luz residual con flujo'],
      dd: 'Coágulo post mortem: no se adhiere a la pared, no tiene capas y se ve en “grasa de pollo” y “jalea de grosella”.',
      rot: [[220, 120, 120, 60, 'Pared vascular', 'end'], [400, 330, 780, 455, 'Línea de Zahn: fibrina y plaquetas', 'end'], [400, 355, 160, 450, 'Capa de hematíes', 'end'], [400, 140, 780, 30, 'Luz residual con flujo', 'end']],
      svg: function () {
        return '<defs><clipPath id="cl-vaso"><circle cx="400" cy="240" r="180"/></clipPath><clipPath id="cl-mont"><ellipse cx="400" cy="450" rx="215" ry="220"/></clipPath></defs>' +
          '<rect width="800" height="480" fill="#F6D3E1"/>' + fibras(GEO.fibras, '#EAB0C8', 2) + '<circle cx="400" cy="240" r="180" fill="#FBE8EF"/>' +
          '<g clip-path="url(#cl-vaso)">' + GEO.flujo.map(function (f) { return '<g class="fluye" style="animation-delay:' + f[1] + 's;animation-duration:4.5s">' + hematie(0, f[0], 9) + '</g>'; }).join('') +
          '<g clip-path="url(#cl-mont)">' + GEO.capas.map(function (c) { return '<path class="capa" d="' + c[0] + '" fill="' + c[1] + '" style="animation-delay:' + c[2] + 's"/>'; }).join('') +
          GEO.leucos.map(function (l) { return '<circle cx="' + l[0] + '" cy="' + l[1] + '" r="4" fill="#4B2E7A"/>'; }).join('') + '</g></g>' +
          '<circle cx="400" cy="240" r="190" fill="none" stroke="#C66A93" stroke-width="20"/>';
      } },
    carci: { nombre: 'Carcinoma invasor', aumento: 'Objetivo 20x', color: '#4B2E7A',
      texto: 'Nidos de células epiteliales atípicas, de núcleos grandes e irregulares con nucléolo, que infiltran un estroma fibroso reactivo. Hay mitosis. Corresponde al caso B26-04807.',
      criterios: ['Nidos sin capa de células mioepiteliales', 'Pleomorfismo nuclear y nucléolos', 'Estroma desmoplásico', 'Mitosis'],
      dd: 'Adenosis esclerosante: conserva las células mioepiteliales (p63 positivo).',
      rot: [[420, 120, 520, 40, 'Nido de células neoplásicas'], [300, 330, 300, 455, 'Núcleo pleomórfico con nucléolo', 'middle'], [640, 370, 760, 440, 'Mitosis', 'end'], [690, 160, 780, 110, 'Estroma desmoplásico', 'end']],
      svg: function () {
        return '<rect width="800" height="480" fill="#F7D7E4"/>' + fibras(GEO.densas, '#E6A4C0', 2.5) +
          GEO.nidos.map(function (n) { return '<g class="infiltra" style="animation-delay:' + n[0] + 's">' + n[1].map(function (c) { return '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="17" ry="14" fill="#E3A3C2" stroke="#C77AA0" stroke-width="1.5"/><ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '" fill="#4B2E7A"/><circle cx="' + c[0] + '" cy="' + c[1] + '" r="2.4" fill="#E66A8A"/>'; }).join('') + '</g>'; }).join('') +
          '<ellipse cx="640" cy="370" rx="24" ry="20" fill="#E3A3C2" stroke="#C77AA0" stroke-width="1.5"/><g class="sepA"><rect x="634" y="358" width="4" height="24" rx="2" fill="#2A1450"/></g><g class="sepB"><rect x="642" y="358" width="4" height="24" rx="2" fill="#2A1450"/></g>';
      } }
  };
  function escenaSvg(k, exportar) {
    var h = HALL[k], rot = typeof h.rot === 'function' ? h.rot() : h.rot;
    return '<svg class="esc" ' + (exportar ? 'xmlns="http://www.w3.org/2000/svg" ' : '') + 'viewBox="0 0 800 480" role="img" aria-label="' + esc(h.nombre) + ': dibujo animado de lo que se ve al microscopio">' +
      (exportar ? '<style>' + CSS_ESC + '</style>' : '') + h.svg() + rotulos(rot) + '</svg>';
  }
  function vIlustracion() {
    var L = S.ilu, h = HALL[L.h];
    return cab('Después del diagnóstico · para el informe, el ateneo y la docencia', 'Ilustración diagnóstica animada', 'Elegí el hallazgo: la app dibuja lo que se ve al microscopio y lo rotula.',
      '<button type="button" class="btn sec" id="ilu-pausa" data-a="iluPausa">' + ic(L.pausa ? 'play' : 'pausa') + (L.pausa ? 'Reanudar' : 'Pausar') + '</button>' +
      '<button type="button" class="btn sec" id="ilu-rot" data-a="iluRot" aria-pressed="' + L.rotulos + '">' + (L.rotulos ? 'Ocultar rótulos' : 'Mostrar rótulos') + '</button>' +
      '<button type="button" class="btn pri" data-a="iluAdjuntar">' + ic('doc') + 'Adjuntar al informe</button>') +
      '<section class="rejilla" style="--min:150px" aria-label="Hallazgos">' + Object.keys(HALL).map(function (k) {
        return '<button type="button" class="hallazgo" data-a="iluH" data-v="' + k + '" aria-pressed="' + (k === L.h) + '"><span class="punto" style="background:' + HALL[k].color + '"></span><strong>' + HALL[k].nombre + '</strong><span class="gris mini">' + HALL[k].aumento + '</span></button>';
      }).join('') + '</section>' +
      '<div class="dos"><section class="visor principal" aria-labelledby="t-esc"><div class="visor-cab"><h2 id="t-esc">' + h.nombre + ' · ' + (L.h === 'hemo' && L.perls ? 'Perls (azul de Prusia)' : 'Hematoxilina-eosina') + '</h2><span class="mono mini">' + h.aumento + '</span></div>' +
      '<div id="escena-caja" class="escena-caja' + (L.pausa ? ' pausa' : '') + (L.rotulos ? '' : ' sin-rotulos') + '">' + escenaSvg(L.h) + '</div>' +
      '<div class="visor-pie fila"><span style="flex:1 1 260px">Dibujo esquemático generado a partir del diagnóstico. Acompaña a la foto real de la lámina, no la reemplaza.</span>' +
      (L.h === 'hemo' ? '<button type="button" class="btn fant" data-a="iluPerls">' + (L.perls ? 'Volver a H&amp;E' : 'Ver con Perls') + '</button>' : '') + '</div></section>' +
      '<div class="lateral"><section class="tarjeta" aria-labelledby="t-que"><h2 id="t-que">Qué se ve</h2><p style="line-height:1.6">' + h.texto + '</p></section>' +
      '<section class="tarjeta" aria-labelledby="t-crit"><h2 id="t-crit">Criterios que muestra el dibujo</h2>' + h.criterios.map(function (c) { return '<span class="vineta">' + c + '</span>'; }).join('') + '</section>' +
      '<section class="aviso ambar" aria-labelledby="t-dd"><strong id="t-dd">No confundir con</strong><br>' + h.dd + '</section>' +
      '<div class="fila"><button type="button" class="btn sec" data-a="iluExportar">' + ic('bajar') + 'Descargar animación</button><a class="btn sec" href="#/imagenes">' + ic('imagenes') + 'Ver la foto real</a></div></div></div>';
  }
  A.iluH = function (v) { S.ilu.h = v; render(); };
  A.iluPausa = function () {
    S.ilu.pausa = !S.ilu.pausa;
    var c = document.getElementById('escena-caja'), b = document.getElementById('ilu-pausa');
    if (c) c.classList.toggle('pausa', S.ilu.pausa);
    if (b) b.innerHTML = ic(S.ilu.pausa ? 'play' : 'pausa') + (S.ilu.pausa ? 'Reanudar' : 'Pausar');
  };
  A.iluRot = function () {
    S.ilu.rotulos = !S.ilu.rotulos;
    var c = document.getElementById('escena-caja'), b = document.getElementById('ilu-rot');
    if (c) c.classList.toggle('sin-rotulos', !S.ilu.rotulos);
    if (b) { b.textContent = S.ilu.rotulos ? 'Ocultar rótulos' : 'Mostrar rótulos'; b.setAttribute('aria-pressed', String(S.ilu.rotulos)); }
  };
  A.iluPerls = function () { S.ilu.perls = !S.ilu.perls; render(); };
  A.iluAdjuntar = function () {
    var n = HALL[S.ilu.h].nombre;
    if (S.caso.adjuntos.indexOf(n) < 0) S.caso.adjuntos.push(n);
    avisar('“' + n + '” quedó adjunta al informe de B26-04807.');
  };
  A.iluExportar = function () {
    descargar('pura-carne-' + S.ilu.h + '.svg', escenaSvg(S.ilu.h, true), 'image/svg+xml');
    avisar('Descargada: se abre en Safari o en cualquier navegador y sigue animada.');
  };

  /* =====================================================================
     5 · LABORATORIO
     ===================================================================== */
  var ETAPAS = ['Pedido', 'En corte', 'En tinción', 'Listo para ver'];
  var ACCION_ETAPA = ['Empezar corte', 'Pasar a tinción', 'Marcar listo'];
  function codigoLab() { var r = azar(S.lab.semilla), l = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', c = 'PC-'; for (var i = 0; i < 6; i++) c += l[Math.floor(r() * l.length)]; return c; }
  function urlTecnico() {
    // En Apps Script la app corre dentro de un marco: el enlace va a la dirección /exec con parámetros.
    if (window.PC_URL_BASE) return window.PC_URL_BASE + '?vista=celular&c=' + codigoLab();
    var base = /^https?:/.test(location.protocol) ? location.href.split('#')[0] : 'https://[TU-PROYECTO].web.app/';
    return base + '#/celular?c=' + codigoLab();
  }
  function vLaboratorio() {
    var L = S.lab, cod = codigoLab(), url = urlTecnico();
    var inv = '<section class="tarjeta" aria-labelledby="t-qr"><div class="invitacion"><div class="qr-caja">' + qrSvg(url, 176, 'Código QR para que el técnico entre con su celular') + '<span class="linea-escaneo"></span></div>' +
      '<div class="pila"><h2 id="t-qr">Invitar técnicos con QR</h2><p class="chico" style="line-height:1.55;color:var(--tinta-2)">El técnico lo lee con la cámara del celular, sin instalar nada, y carga ahí los cortes, niveles y tinciones que preparó. Cada vidrio cae en el caso y el taco que le corresponde.</p>' +
      '<div class="fila" role="group" aria-label="Qué abre el QR">' + chips([['pedido', 'Solo el pedido elegido'], ['jornada', 'Mis pedidos de hoy'], ['servicio', 'Todo el laboratorio']], 'labAlcance', L.alcance, 'lila') + '</div>' +
      '<span class="fila chico gris"><span>Código <strong class="mono" style="color:var(--tinta)">' + cod + '</strong></span><span>Vigencia prevista: ' + (L.alcance === 'pedido' ? '2 h' : 'hasta el fin del turno') + ' (todavía no se aplica en la demo)</span><span>Con Firebase, el acceso se corta al quitarle el usuario</span></span>' +
      '<div class="fila"><button type="button" class="btn sec" data-a="labQR">Generar otro código</button><button type="button" class="btn sec" data-a="labCopiar">' + ic('copiar') + 'Copiar enlace</button><a class="btn pri" href="#/celular">' + ic('celular') + 'Ver lo que ve el técnico</a></div></div>' +
      '<div class="pila" style="flex:1 1 240px"><strong>Celulares conectados</strong>' + (L.tecnicos.length ? L.tecnicos.map(function (t) {
        return '<div class="conectado">' + ic('celular', 18, ' style="color:var(--violeta)"') + '<span><strong class="chico">' + esc(t.nombre) + '</strong><span class="mini gris">' + esc(t.detalle) + '</span></span><button type="button" class="btn peligro" data-a="labQuitar" data-v="' + t.id + '">Quitar acceso</button></div>';
      }).join('') : '<span class="chico gris">Nadie conectado. El acceso se corta solo al vencer el código.</span>') + '</div></div></section>';

    var kanban = '<section class="kanban" aria-label="Tablero de pedidos">' + ETAPAS.map(function (t, i) {
      var ps = L.pedidos.filter(function (p) { return p.etapa === i; });
      return '<div class="columna" data-etapa="' + i + '"><div class="columna-cab">' + t + '<span>' + ps.length + '</span></div>' + ps.map(function (p) {
        return '<div class="pedido" data-id="' + p.id + '" data-sel="' + (p.id === L.sel ? 1 : 0) + '"><button type="button" class="pedido-abrir" data-a="labSel" data-v="' + p.id + '">' +
          '<span class="cab-p"><strong class="mono">' + p.caso + ' · ' + p.taco + '</strong>' + (p.urgente ? '<span class="urgente">URGENTE</span>' : '') + '</span>' +
          '<span class="que">' + esc(p.pedido) + '</span><span class="quien"><i style="background:' + COLOR_TIN[p.clase] + '"></i>' + esc(p.tincion) + ' · ' + esc(p.quien) + '</span></button>' +
          (i < 3 ? '<button type="button" class="avanzar" data-a="labAvanzar" data-v="' + p.id + '">' + ACCION_ETAPA[i] + ' →</button>' : '') + '</div>';
      }).join('') + '</div>';
    }).join('') + '</section>';

    var s = L.pedidos.filter(function (p) { return p.id === L.sel; })[0] || L.pedidos[0];
    var msgs = L.chats[s.id] || [];
    var rapidas = L.rol === 'medico' ? ['¿Para cuándo está?', 'Agregá 2 niveles más', 'Pedí control positivo', 'Gracias, ya lo veo'] : ['Taco agotado, ¿desgasto más?', 'Corte con pliegues, repito', 'Listo en 1 hora', 'Falta control positivo'];
    var chat = '<section class="tarjeta chat" aria-labelledby="t-chat"><div class="chat-info"><h2 id="t-chat"><span class="mono">' + s.caso + ' · ' + s.taco + '</span></h2><span>' + esc(s.pedido) + '</span>' +
      '<span class="chico gris">Tinción: ' + esc(s.tincion) + '</span><span class="chico gris">Estado: ' + ETAPAS[s.etapa] + '</span><span class="chico gris">Pidió: ' + esc(s.quien) + '</span>' +
      (s.caso === 'B26-04807' ? '<a class="chico" href="#/caso">Abrir la ficha del caso</a>' : '') + '</div>' +
      '<div class="chat-cuerpo"><div class="mensajes" id="mensajes" aria-live="polite">' + (msgs.length ? msgs.map(function (m) {
        var yo = (m.rol || (m.yo ? 'medico' : 'tecnico')) === L.rol;
        return '<div class="msg' + (yo ? ' yo' : '') + '"><span>' + esc(m.autor) + ' · ' + m.hora + '</span><p>' + esc(m.texto) + '</p></div>';
      }).join('') : '<p class="gris chico">Todavía no hay mensajes en este pedido.</p>') + '</div>' +
      '<div class="fila">' + rapidas.map(function (t, i) { return '<button type="button" class="chip lila" data-a="labRapida" data-v="' + i + '">' + t + '</button>'; }).join('') + '</div>' +
      '<div class="escribir"><label class="oculto-v" for="lab-msg">Escribir mensaje</label><input id="lab-msg" class="entrada" type="text" data-in="labMsg" data-enter="labEnviar" value="' + esc(L.borrador) + '" placeholder="Escribí al equipo de este pedido" autocomplete="off">' +
      '<button type="button" class="btn pri" data-a="labEnviar">Enviar</button></div></div></section>';

    return cab('Histotecnología · cortes, niveles y tinciones', 'Laboratorio: patólogos y técnicos', 'Cada pedido es una tarjeta con su conversación. Arrastrala a la columna que corresponde o usá su botón.',
      seg([['medico', 'Soy patólogo'], ['tecnico', 'Soy técnico']], 'labRol', L.rol, false, 'Ver como')) + inv + kanban + chat;
  }
  function bajarChat() { var m = document.getElementById('mensajes'); if (m) m.scrollTop = m.scrollHeight; }
  function mandarMensaje(texto) {
    var L = S.lab; texto = String(texto || '').trim(); if (!texto) return;
    var autor = L.rol === 'medico' ? 'Dra. [NOMBRE]' : 'Téc. [NOMBRE]';
    (L.chats[L.sel] = L.chats[L.sel] || []).push({ rol: L.rol, autor: autor, hora: hora(), texto: texto });
    L.borrador = ''; render(); bajarChat();
  }
  A.labAlcance = function (v) { S.lab.alcance = v; render(); };
  A.labQR = function () { S.lab.semilla = (S.lab.semilla * 48271) % 2147483647; S.lab.tecnicos = []; render(); avisar('Código nuevo. Los celulares anteriores quedaron desconectados.'); };
  A.labCopiar = function () {
    var u = urlTecnico();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(function () { avisar('Enlace copiado. Mandalo al técnico por mensaje.'); }, function () { avisar(u); });
    else avisar(u);
  };
  A.labQuitar = function (v) { S.lab.tecnicos = S.lab.tecnicos.filter(function (t) { return t.id !== v; }); render(); avisar('Acceso quitado.'); };
  A.labSel = function (v) { S.lab.sel = v; render(); bajarChat(); };
  A.labAvanzar = function (v) {
    var p = S.lab.pedidos.filter(function (x) { return x.id === v; })[0]; if (!p) return;
    p.etapa = Math.min(3, p.etapa + 1); S.lab.sel = v; render();
    avisar(p.caso + ' · ' + p.taco + ': ' + ETAPAS[p.etapa].toLowerCase() + '.');
  };
  A.labRol = function (v) { S.lab.rol = v; render(); bajarChat(); };
  A.labRapida = function (v) {
    var rap = S.lab.rol === 'medico' ? ['¿Para cuándo está?', 'Agregá 2 niveles más', 'Pedí control positivo', 'Gracias, ya lo veo'] : ['Taco agotado, ¿desgasto más?', 'Corte con pliegues, repito', 'Listo en 1 hora', 'Falta control positivo'];
    mandarMensaje(rap[+v]);
  };
  IN.labMsg = function (v) { S.lab.borrador = v; };
  A.labEnviar = function () { mandarMensaje(S.lab.borrador); var el = document.getElementById('lab-msg'); if (el) el.focus(); };

  /* =====================================================================
     6 · CELULAR DEL TÉCNICO
     ===================================================================== */
  var OPC_CAL = [['ok', 'Todo bien'], ['pliegue', 'Pliegue o rotura'], ['debil', 'Tinción débil']];
  function vCelular() {
    var C = S.cel, vids = D.tacos[0].vidrios, hechos = vids.filter(function (v) { return C.hechos[v[0]]; }).length;
    var tecnico = document.body.classList.contains('modo-tecnico');
    var cuerpo;
    if (C.paso === 'escaneo') {
      cuerpo = '<div class="tel-cuerpo oscuro"><h1 style="font-size:22px">Leé el QR del patólogo</h1><p class="chico" style="color:#B9B0DA">Apuntá la cámara al código de la pantalla o de la hoja de la mesada.</p>' +
        '<div class="camara"><i></i><i></i><i></i><i></i><span class="linea-escaneo"></span></div>' +
        '<button type="button" class="btn sec ancho" data-a="celLeer">Simular lectura del QR</button>' +
        '<p class="mini" style="color:#B9B0DA">Con el celular de verdad: abrí la cámara y apuntá al QR de la pantalla Laboratorio. No hace falta instalar nada. El celular ve protocolos y tacos, nunca el nombre del paciente.</p></div>';
    } else if (C.paso === 'lista') {
      cuerpo = '<div class="tel-cuerpo"><div class="pila" style="gap:2px"><span class="chico gris">Pedido de Dra. [NOMBRE]</span><h1 class="mono" style="font-size:22px;font-weight:500">B26-04807 · A1</h1><span>IHQ: RE, RP y HER2 · ' + hechos + ' de ' + vids.length + ' cargados</span></div>' +
        '<div class="barra"><span style="width:' + Math.round(hechos / vids.length * 100) + '%"></span></div>' +
        vids.map(function (v) {
          var ok = !!C.hechos[v[0]], q = C.calidad[v[0]] || 'ok', foto = C.fotos[v[0]];
          return '<div class="vid-cel' + (ok ? ' listo' : '') + '"><div class="vid-cel-cab"><span class="tira" style="width:8px;height:40px;border-radius:4px;background:' + COLOR_TIN[v[4]] + '"></span>' +
            '<span><strong class="mono">' + v[0] + '</strong><span class="chico gris">' + v[1] + ' · ' + v[2] + '</span></span>' +
            (foto ? '<img class="foto-mini" src="' + foto + '" alt="Foto del vidrio ' + v[0] + '">' : '') + (ok ? '<span class="tilde">' + ic('ok', 16) + '</span>' : '') + '</div>' +
            (ok ? '<div class="fila">' + OPC_CAL.map(function (o) { return '<button type="button" class="chip' + (o[0] === 'ok' ? '' : ' lila') + '" data-a="celCal" data-v="' + v[0] + '|' + o[0] + '" aria-pressed="' + (q === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>'
              : '<div class="fila" style="flex-wrap:nowrap"><button type="button" class="btn pri" style="flex:1" data-a="celCargar" data-v="' + v[0] + '">' + ic('escanear') + 'Escanear vidrio</button>' +
              '<label class="btn-icono" for="foto-' + v[0] + '" aria-label="Sacar foto del vidrio ' + v[0] + '">' + ic('camara', 20) + '</label><input id="foto-' + v[0] + '" type="file" accept="image/*" capture="environment" data-vid="' + v[0] + '" hidden></div>') + '</div>';
        }).join('') +
        '<button type="button" class="btn pri ancho" data-a="celEnviar"' + (hechos < vids.length ? ' disabled' : '') + '>Enviar al patólogo</button></div>';
    } else {
      var obs = Object.keys(C.calidad).filter(function (k) { return C.calidad[k] !== 'ok'; }).length;
      cuerpo = '<div class="final"><div class="exito" id="exito-cel"><span class="onda"></span><span class="tilde-g">' + ic('ok', 46) + '</span></div><h1 style="font-size:24px">' + vids.length + ' vidrios cargados</h1>' +
        '<p style="line-height:1.55;color:var(--tinta-2)">Ya figuran en el caso B26-04807, taco A1. La Dra. [NOMBRE] recibió el aviso y el pedido pasó a “Listo para ver”.</p>' +
        '<p class="chico gris">' + (obs ? obs + ' con observación: el patólogo ve el aviso.' : 'Sin observaciones de calidad.') + '</p>' +
        '<button type="button" class="btn osc ancho" data-a="celOtro">Leer otro pedido</button>' + (tecnico ? '' : '<a class="btn sec ancho" href="#/caso">Ver el caso como patólogo</a>') + '</div>';
    }
    var tel = '<div class="telefono" aria-label="Pantalla del celular del técnico"><div class="tel-cab">' + logo(32) + '<span class="tt"><strong>Pura Carne</strong><span>' + (C.paso === 'escaneo' ? 'Laboratorio · técnico' : 'Código ' + (C.codigo || codigoLab()) + ' · vence 16:00') + '</span></span>' +
      (C.paso !== 'escaneo' ? '<span class="estado ok">Conectado</span>' : '') + '</div>' + cuerpo + '</div>';
    if (tecnico) return tel;
    return cab('Lo que ve el técnico en su celular', 'Celular del técnico', 'Entra con el QR de la pantalla Laboratorio y carga lo que preparó. Probalo acá o abrí el enlace en tu celular.', '<a class="btn sec" href="#/laboratorio">← Volver al laboratorio</a>') +
      '<div class="telefono-zona">' + tel + '<section class="tarjeta" style="flex:1 1 300px"><h2>Cómo funciona</h2><ol class="lista-num">' +
      ['El patólogo genera el QR en Laboratorio y elige qué abre: un pedido, sus pedidos del día o todo el laboratorio.', 'El técnico lo lee con la cámara del celular. Se abre esta pantalla en el navegador, sin instalar nada.', 'Escanea cada vidrio o le saca una foto, marca si salió bien o con algún problema, y lo envía.', 'El pedido pasa solo a “Listo para ver” en el tablero y en la ficha del caso, con aviso al patólogo.', 'El código vence al terminar el turno y el patólogo puede cortar el acceso de un celular cuando quiera.'].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ol>' +
      '<p class="nota-pie">En esta versión de prueba todo pasa dentro de este navegador. Para que el celular y la computadora se hablen de verdad hace falta subirla a Firebase.</p></section></div>';
  }
  A.celLeer = function () { S.cel.paso = 'lista'; S.cel.codigo = codigoLab(); render(); };
  A.celCargar = function (v) { S.cel.hechos[v] = true; render(); };
  A.celCal = function (v) { var p = v.split('|'); S.cel.calidad[p[0]] = p[1]; render(); };
  function fotoVidrio(id, files) {
    if (!files || !files[0]) return;
    S.cel.fotos[id] = URL.createObjectURL(files[0]); S.cel.hechos[id] = true; render();
  }
  A.celEnviar = function () {
    var C = S.cel, ids = D.tacos[0].vidrios.map(function (v) { return v[0]; });
    if (ids.some(function (i) { return !C.hechos[i]; })) return;
    C.paso = 'fin'; C.enviados = ids;
    var p1 = S.lab.pedidos.filter(function (p) { return p.id === 'p1'; })[0]; if (p1) p1.etapa = 3;
    var obs = Object.keys(C.calidad).filter(function (k) { return C.calidad[k] !== 'ok'; });
    (S.lab.chats.p1 = S.lab.chats.p1 || []).push({ rol: 'tecnico', autor: 'Téc. [NOMBRE]', hora: hora(), texto: 'Cargué los ' + ids.length + ' vidrios del A1.' + (obs.length ? ' Ojo: ' + obs.join(', ') + ' con observación.' : ' Todo salió bien.') });
    render(); avisar('Enviado. El pedido pasó a “Listo para ver” en el laboratorio y en la ficha del caso.');
    festejar(document.getElementById('exito-cel'));
  };
  A.celOtro = function () { Object.assign(S.cel, { paso: 'escaneo', hechos: {}, calidad: {}, fotos: {} }); render(); };

  /* =====================================================================
     7 · BUSCADOR Y APOYO DIAGNÓSTICO
     ===================================================================== */
  function vBuscador() {
    var B = S.bus;
    var hall = buscarEnBase(B.buscado), res = hall.casos.map(function (c) { return { c: c }; });
    var crudo = D.diferenciales.map(function (d) { var s = 2; Object.keys(d.p).forEach(function (k) { if (B.on[k]) s += d.p[k]; }); return { d: d, s: Math.max(0.2, s) }; });
    var tot = crudo.reduce(function (a, x) { return a + x.s; }, 0);
    var COLS = ['#6A3DF5', '#FF4F8B', '#00A8A0', '#FFB020'];
    var difs = crudo.map(function (x) { return { d: x.d, pct: Math.round(x.s / tot * 100) }; }).sort(function (a, b) { return b.pct - a.pct; });
    var top = difs[0].d.nombre;
    var pista = B.on.ecad || B.on.fila ? 'confirmar con E-cadherina y p120' : top.indexOf('Adenosis') === 0 ? 'p63 y calponina para ver las mioepiteliales' : 'E-cadherina si hay dudas entre ductal y lobulillar';
    var q = encodeURIComponent(B.buscado || 'breast carcinoma');

    return cab('Cruza la base del servicio con criterios de la OMS, protocolos CAP y guías vigentes', 'Buscador y apoyo diagnóstico', '') +
      '<section class="pila"><div class="busqueda">' + ic('buscador', 22) + '<label class="oculto-v" for="bus-q">Buscar</label><input id="bus-q" type="search" data-in="busQ" data-enter="busBuscar" value="' + esc(B.consulta) + '" placeholder="Diagnóstico, órgano, tinción, hallazgo…" autocomplete="off">' +
      '<button type="button" class="btn pri" data-a="busBuscar">Buscar</button></div>' +
      '<div class="fila"><span class="chico gris">Probá:</span>' + ['HER2-bajo mama', 'margen colon', 'Helicobacter Giemsa', 'tiroides Bethesda'].map(function (t) { return '<button type="button" class="chip lila" data-a="busSug" data-v="' + t + '">' + t + '</button>'; }).join('') + '</div></section>' +
      '<section class="tarjeta" aria-labelledby="t-res"><div class="tarjeta-cab"><h2 id="t-res">Casos parecidos en la base del servicio</h2><span class="gris chico">' + res.length + ' resultado' + (res.length === 1 ? '' : 's') + ' para “' + esc(B.buscado) + '” · sin nombre ni DNI</span></div>' +
      (res.length ? '<div class="rejilla" style="--min:260px">' + res.map(function (x) { return '<div class="resultado"><span class="cab-r"><strong class="mono">' + x.c[0] + '</strong><span class="estado proc">' + x.c[1] + '</span></span><span class="chico">' + esc(x.c[2]) + '</span></div>'; }).join('') + '</div>' : '<p class="gris chico">Sin coincidencias. Probá con otras palabras.</p>') + '</section>' +
      '<section class="tarjeta" aria-labelledby="t-prot"><div class="tarjeta-cab"><h2 id="t-prot">Protocolos para informar</h2><span class="gris chico">' + hall.protocolos.length + ' de ' + (window.PC_PROTOCOLOS || []).length + ' protocolos del ICCR y del CAP</span></div>' +
      (hall.protocolos.length ? '<div class="rejilla" style="--min:240px">' + hall.protocolos.map(function (p) {
        return '<a class="fuente-ext" href="' + esc(enlaceProtocolo(p)) + '" target="_blank" rel="noopener"><span>' + esc(p.fuente + ' · ' + p.cat) + '</span><strong>' + esc(p.t) + ' ' + ic('ext', 14) + '</strong><span>' + (location.protocol === 'file:' && p.archivo ? 'Abre el PDF guardado en tu carpeta' : 'Abre la página oficial') + '</span></a>';
      }).join('') + '</div>' : '<p class="gris chico">Ningún protocolo coincide. Probá con el órgano: mama, colon, próstata…</p>') + '</section>' +
      '<div class="dos"><section class="tarjeta principal" aria-labelledby="t-dif"><div class="tarjeta-cab"><h2 id="t-dif">Diagnósticos diferenciales · caso B26-04807</h2><span class="gris chico">Coincidencia con criterios OMS 5.ª ed.</span></div>' +
      '<div aria-live="polite">' + difs.map(function (x, i) {
        return '<div class="dif"><div class="dif-cab"><strong>' + x.d.nombre + '</strong><b style="color:' + COLS[i] + '">' + x.pct + ' %</b></div><div class="barra"><span style="width:' + x.pct + '%;background:' + COLS[i] + '"></span></div>' +
          '<span class="chico" style="color:var(--tinta-2)">' + x.d.clave + '</span><div class="dif-cajas"><div><b>Criterios esenciales</b>' + x.d.esenciales + '</div><div><b>IHQ que lo separa</b>' + x.d.ihq + '</div></div>' +
          '<span class="fuente">' + ic('doc', 14) + x.d.fuente + '</span></div>';
      }).join('') + '</div>' +
      '<div class="aviso lila">Cada criterio lleva su cita. La biblioteca de criterios se revisa contra la última edición de la OMS, los protocolos CAP vigentes y la bibliografía indexada en PubMed; si una guía cambia, el criterio muestra la versión nueva y la fecha.</div>' +
      '<div class="aviso ambar">Orientativo. El diagnóstico lo firma el patólogo; la app solo ordena la evidencia y sugiere qué técnica ayuda a separar.</div>' +
      '<div class="fila"><span style="flex:1 1 220px">Siguiente paso sugerido: <strong>' + pista + '</strong></span><button type="button" class="btn suave" data-a="busPedir">Pedir al laboratorio</button></div></section>' +
      '<section class="tarjeta lateral" aria-labelledby="t-crit"><h2 id="t-crit">¿Qué ves en la lámina?</h2><p class="chico gris">Marcá los hallazgos y mirá cómo se reordenan los diferenciales.</p><div class="pila">' +
      D.criterios.map(function (c) { return '<button type="button" class="opcion" data-a="busCrit" data-v="' + c[0] + '" aria-pressed="' + !!B.on[c[0]] + '"><span class="caja">' + ic('ok', 16) + '</span><span class="txt">' + c[1] + '</span><span class="gris mini">' + c[2] + '</span></button>'; }).join('') + '</div></section></div>' +
      '<section class="pila" aria-labelledby="t-fuentes"><h2 id="t-fuentes" style="font-size:17px">Comparar con bases internacionales y bibliografía</h2><div class="rejilla" style="--min:220px">' +
      '<a class="fuente-ext" href="https://pubmed.ncbi.nlm.nih.gov/?term=' + q + '&amp;filter=datesearch.y_5" target="_blank" rel="noopener"><span>Bibliografía · últimos 5 años</span><strong>PubMed ' + ic('ext', 14) + '</strong><span>Artículos sobre “' + esc(B.buscado) + '”</span></a>' +
      '<a class="fuente-ext" href="https://portal.gdc.cancer.gov/" target="_blank" rel="noopener"><span>Cohortes públicas con láminas</span><strong>NCI GDC · TCGA ' + ic('ext', 14) + '</strong><span>Imágenes y datos moleculares de referencia</span></a>' +
      '<a class="fuente-ext" href="https://www.cbioportal.org/" target="_blank" rel="noopener"><span>Perfiles moleculares</span><strong>cBioPortal ' + ic('ext', 14) + '</strong><span>Compara el perfil con estudios publicados</span></a>' +
      '<a class="fuente-ext" href="https://www.cap.org/protocols-and-guidelines/cancer-reporting-tools/cancer-protocol-templates" target="_blank" rel="noopener"><span>Informe sinóptico</span><strong>Protocolos CAP ' + ic('ext', 14) + '</strong><span>Versión vigente de cada protocolo</span></a></div></section>';
  }
  IN.busQ = function (v) { S.bus.consulta = v; };
  A.busBuscar = function () { S.bus.buscado = S.bus.consulta.trim() || S.bus.buscado; render(); };
  A.busSug = function (v) { S.bus.consulta = v; S.bus.buscado = v; render(); };
  A.busCrit = function (v) { S.bus.on[v] = !S.bus.on[v]; render(); };
  A.busPedir = function () {
    S.lab.pedidos.push({ id: 'pb-' + Date.now(), caso: 'B26-04807', taco: 'A2', pedido: 'E-cadherina y p120', tincion: 'Inmunohistoquímica', clase: 'ihq', quien: 'Dra. [NOMBRE]', etapa: 0, urgente: false });
    avisar('Pedido enviado al laboratorio: E-cadherina y p120 del taco A2.');
  };

  /* =====================================================================
     8 · CALIDAD Y ESTADÍSTICAS
     ===================================================================== */
  var PERIODOS = { mes: ['Mes', 'octubre 2026', 0.35], tri: ['Trimestre', 'agosto a octubre 2026', 1], anio: ['Año', 'últimos 12 meses', 4] };
  var TABLA_INT = [
    ['Biopsias informadas en 7 días', '74 %', '80 %', 'RCPath (Reino Unido)', 'mal'],
    ['Intraoperatorias en 20 minutos', '93 %', '90 %', 'CAP', 'bien'],
    ['Concordancia congelación / diferido', '97,8 %', '[valor de referencia]', 'CAP Q-Probes', 'cargar'],
    ['Informes de mama con todos los ítems CAP', '88 %', '100 %', 'Protocolos CAP', 'mal'],
    ['Muestras observadas en recepción', '2,1 %', '[valor de referencia]', '[fuente]', 'cargar']
  ];
  function vCalidad() {
    var Q = S.cal, d = D.calidad[Q.tipo], f = PERIODOS[Q.periodo][2];
    var hist = d.hist.map(function (h) { return [h[0], Math.max(1, Math.round(h[1] * f))]; });
    var max = Math.max.apply(null, hist.map(function (h) { return h[1]; }));
    var fuera = hist.filter(function (h) { return parseInt(h[0], 10) > d.limite; }).reduce(function (a, h) { return a + h[1]; }, 0);
    var totE = d.etapas.reduce(function (a, e) { return a + e[1]; }, 0), masLarga = Math.max.apply(null, d.etapas.map(function (e) { return e[1]; }));
    var TONOS = ['#C9BDFF', '#A88BFF', '#8A63FF', '#6A3DF5', '#3E1BB0'];
    var u = Q.tipo === 'intra' ? ' min' : ' d';
    var cumple = d.enPlazo >= 90;
    var arco = (163.4 * (1 - d.enPlazo / 100)).toFixed(1);
    return cab('Datos de ejemplo · ' + PERIODOS[Q.periodo][1], 'Calidad de atención y diagnóstico', 'Se calcula sola, con las horas que la app registra en cada paso del caso.',
      seg(Object.keys(PERIODOS).map(function (k) { return [k, PERIODOS[k][0]]; }), 'calPeriodo', Q.periodo, false, 'Período')) +
      '<div class="fila" role="group" aria-label="Tipo de material">' + chips(Object.keys(D.calidad).map(function (k) { return [k, D.calidad[k].txt]; }), 'calTipo', Q.tipo) + '</div>' +
      '<section class="rejilla" style="--min:220px" aria-label="Indicadores">' +
      '<div class="kpi"><svg width="66" height="66" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="#EDE8F7" stroke-width="8"/><circle class="anillo" cx="32" cy="32" r="26" fill="none" stroke="' + (cumple ? '#00A676' : '#FF8A1F') + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="163.4" style="stroke-dashoffset:' + arco + '" transform="rotate(-90 32 32)"/></svg>' +
      '<div><span>En plazo (' + d.plazo + ')</span><strong data-cuenta="' + d.enPlazo + '" data-suf=" %">' + d.enPlazo + ' %</strong><span class="mini">Ref.: ' + d.ref + '</span></div></div>' +
      '<div class="kpi"><div><span>Ingreso → informe final (mediana)</span><strong>' + d.mediana + '</strong><span class="mini">Percentil 90: ' + d.p90 + '</span></div></div>' +
      '<div class="kpi"><div><span>' + d.concTxt + '</span><strong>' + d.conc + '</strong><span class="mini">Ref.: ' + d.concRef + '</span></div></div>' +
      '<div class="kpi"><div><span>Informes corregidos</span><strong>' + d.correg + '</strong><span class="mini">Ref.: [valor de referencia]</span></div></div></section>' +
      '<section class="tarjeta" aria-labelledby="t-tend"><div class="tarjeta-cab"><h2 id="t-tend">Evolución del porcentaje en plazo</h2><span class="gris chico">Últimos 12 meses · datos de ejemplo</span></div><div id="graf-tend" class="grafico"><p class="gris chico">Cargando el gráfico…</p></div></section>' +
      '<div class="dos"><section class="tarjeta principal" aria-labelledby="t-hist"><div class="tarjeta-cab"><h2 id="t-hist">Tiempo desde el ingreso hasta el informe final</h2><span class="leyenda"><span><i style="background:#6A3DF5"></i>En plazo</span><span><i style="background:#FF8A1F"></i>Fuera de plazo</span></span></div>' +
      '<div id="graf-hist" class="grafico"><div class="hist">' + hist.map(function (h) { return '<div><span>' + h[1] + '</span><i style="height:' + Math.round(h[1] / max * 86) + '%;background:' + (parseInt(h[0], 10) > d.limite ? '#FF8A1F' : '#6A3DF5') + '"></i></div>'; }).join('') + '</div>' +
      '<div class="hist-ejes">' + hist.map(function (h) { return '<span>' + h[0] + '</span>'; }).join('') + '</div></div><span class="nota-pie">Cantidad de casos según los ' + d.unidad + 's que pasaron desde el ingreso hasta la firma del informe final. Fuera de plazo: ' + fuera + ' casos.</span></section>' +
      '<section class="tarjeta lateral" aria-labelledby="t-etapas"><h2 id="t-etapas">¿En qué paso se va el tiempo?</h2><div id="graf-etapas" class="grafico bajo"><div class="tramos">' +
      d.etapas.map(function (e, i) { return '<i style="width:' + (e[1] / totE * 100).toFixed(1) + '%;background:' + (e[1] === masLarga ? '#FF8A1F' : TONOS[i % 5]) + '"></i>'; }).join('') + '</div><div class="pila">' +
      d.etapas.map(function (e, i) { return '<div class="etapa"><i style="background:' + (e[1] === masLarga ? '#FF8A1F' : TONOS[i % 5]) + '"></i><span>' + e[0] + '</span><strong style="font-variant-numeric:tabular-nums">' + String(e[1]).replace('.', ',') + u + '</strong></div>'; }).join('') + '</div></div></section></div>' +
      '<div class="dos"><section class="tarjeta principal" style="padding:0;gap:0" aria-labelledby="t-int"><h2 id="t-int" style="padding:16px 20px;border-bottom:1px solid var(--borde)">Comparación con referencias internacionales</h2><div class="tabla-caja"><table class="tabla"><thead><tr><th>Indicador</th><th>Servicio</th><th>Referencia</th><th>Fuente</th><th>Estado</th></tr></thead><tbody>' +
      TABLA_INT.map(function (r) { var e = { mal: ['obs', 'Por debajo'], bien: ['ok', 'Cumple'], cargar: ['', 'Cargar ref.'] }[r[4]]; return '<tr><td>' + r[0] + '</td><td style="font-variant-numeric:tabular-nums">' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td><span class="estado ' + e[0] + '">' + e[1] + '</span></td></tr>'; }).join('') +
      '</tbody></table></div><p class="nota-pie" style="padding:12px 20px 16px">Las referencias se revisan contra la versión vigente de cada guía antes de usarlas.</p></section>' +
      '<section class="tarjeta oscura lateral" aria-labelledby="t-concl"><h2 id="t-concl">Conclusiones del período</h2>' +
      d.conclusiones.map(function (c) { return '<div class="concl"><i style="background:' + (c[1] === 'mal' ? '#FFA552' : '#B9A5FF') + '"></i><span>' + c[0] + '</span></div>'; }).join('') +
      '<div class="fila"><button type="button" class="btn sec" data-a="calExportar">' + ic('bajar') + 'Exportar planilla</button><button type="button" class="btn fant" data-a="calFuera">Ver casos fuera de plazo</button></div>' +
      (Q.fuera ? '<div class="pila">' + ['B26-03981 · mama · IHQ repetida', 'Q26-00877 · colon · consulta externa', 'B26-04102 · piel · nivel adicional'].map(function (t) { return '<span class="chico" style="padding:8px 10px;border-radius:10px;background:#33225E">' + t + '</span>'; }).join('') + '<span class="mini" style="color:#B9B0DA">Muestra de ' + fuera + ' casos fuera de plazo (ejemplo).</span></div>' : '') + '</section></div>';
  }
  A.calTipo = function (v) { S.cal.tipo = v; S.cal.fuera = false; render(); };
  A.calPeriodo = function (v) { S.cal.periodo = v; render(); };
  A.calFuera = function () { S.cal.fuera = !S.cal.fuera; render(); };
  A.calExportar = function () {
    var filas = [['Tipo', 'En plazo %', 'Plazo', 'Referencia', 'Mediana', 'Percentil 90', 'Informes corregidos']];
    Object.keys(D.calidad).forEach(function (k) { var d = D.calidad[k]; filas.push([d.txt, d.enPlazo, d.plazo, d.ref, d.mediana, d.p90, d.correg]); });
    filas.push([]); filas.push(['Indicador', 'Servicio', 'Referencia', 'Fuente']);
    TABLA_INT.forEach(function (r) { filas.push(r.slice(0, 4)); });
    var csv = '﻿' + filas.map(function (f) { return f.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
    descargar('pura-carne-calidad.csv', csv, 'text/csv;charset=utf-8');
    avisar('Planilla descargada (se abre con Excel o Numbers). Datos de ejemplo.');
  };


  /* =====================================================================
     9 · AGENDA (FullCalendar)
     ===================================================================== */
  var TIPOS_AG = { ateneo: ['Ateneo', '#6A3DF5'], macro: ['Macroscopía', '#00A8A0'], intra: ['Intraoperatoria', '#E0245E'], entrega: ['Entrega de informes', '#FFB020'], reunion: ['Reunión', '#5E5874'] };
  function eventosDemo() {
    var hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    var lunes = new Date(hoy); lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    function f(dia, h, m) { var d = new Date(lunes); d.setDate(lunes.getDate() + dia); d.setHours(h, m || 0, 0, 0); return d.toISOString(); }
    var ev = [];
    for (var d = 0; d < 5; d++) ev.push({ id: 'm' + d, titulo: 'Macroscopía · turno mañana', tipo: 'macro', inicio: f(d, 9), fin: f(d, 11) });
    ev.push({ id: 'a1', titulo: 'Ateneo de mama (B26-04807)', tipo: 'ateneo', inicio: f(3, 13), fin: f(3, 14, 30) });
    ev.push({ id: 'a2', titulo: 'Ateneo de patología digestiva', tipo: 'ateneo', inicio: f(10, 13), fin: f(10, 14, 30) });
    ev.push({ id: 'i1', titulo: 'Intraoperatoria programada · Quirófano 3', tipo: 'intra', inicio: f(1, 10, 30), fin: f(1, 11, 30) });
    ev.push({ id: 'e1', titulo: 'Entrega de informes a Ginecología', tipo: 'entrega', inicio: f(4, 15), fin: f(4, 16) });
    ev.push({ id: 'r1', titulo: 'Reunión de calidad del servicio', tipo: 'reunion', inicio: f(2, 12), fin: f(2, 13) });
    ev.push({ id: 'm9', titulo: 'Macroscopía · turno mañana', tipo: 'macro', inicio: f(7, 9), fin: f(7, 11) });
    return ev;
  }
  function rangoTexto(a, b) {
    var i = new Date(a), f = new Date(b), dia = i.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
    function h(d) { return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }); }
    return dia.charAt(0).toUpperCase() + dia.slice(1) + ' · ' + h(i) + ' a ' + h(f);
  }
  function vAgenda() {
    return cab('Ateneos, turnos de macroscopía, intraoperatorias y entregas', 'Agenda del servicio', 'Tocá o arrastrá sobre un horario libre para agendar; arrastrá un evento para moverlo.',
      seg([['timeGridWeek', 'Semana'], ['dayGridMonth', 'Mes'], ['listWeek', 'Lista']], 'agVista', S.agenda.vista, false, 'Vista')) +
      '<div class="leyenda">' + Object.keys(TIPOS_AG).map(function (k) { return '<span><i style="background:' + TIPOS_AG[k][1] + '"></i>' + TIPOS_AG[k][0] + '</span>'; }).join('') + '</div>' +
      '<div class="dos"><section class="tarjeta principal" aria-label="Calendario"><div id="calendario" class="calendario"><p class="gris chico">Cargando la agenda…</p></div></section>' +
      '<aside class="lateral" id="agenda-lateral">' + lateralAgenda() + '</aside></div>';
  }
  function lateralAgenda() {
    var G = S.agenda;
    if (G.nuevo) {
      return '<section class="tarjeta" aria-labelledby="t-agn"><h2 id="t-agn">Agendar</h2><span class="chico gris">' + rangoTexto(G.nuevo.inicio, G.nuevo.fin) + '</span>' +
        '<div class="campo"><label for="ag-titulo">Qué es</label><input id="ag-titulo" class="entrada" type="text" data-in="agTitulo" data-enter="agGuardar" value="' + esc(G.nuevo.titulo || '') + '" placeholder="Ej.: Ateneo de piel" autocomplete="off"></div>' +
        '<span class="etiq">Tipo</span><div class="fila">' + Object.keys(TIPOS_AG).map(function (k) { return '<button type="button" class="chip lila" data-a="agTipo" data-v="' + k + '" aria-pressed="' + (G.nuevo.tipo === k) + '">' + TIPOS_AG[k][0] + '</button>'; }).join('') + '</div>' +
        '<div class="fila"><button type="button" class="btn sec" data-a="agCancelar">Cancelar</button><button type="button" class="btn pri" style="flex:1" data-a="agGuardar">Guardar</button></div></section>';
    }
    var sel = G.eventos.filter(function (e) { return e.id === G.sel; })[0];
    if (sel) {
      return '<section class="tarjeta" aria-labelledby="t-ags"><h2 id="t-ags">' + esc(sel.titulo) + '</h2><span class="estado" style="background:' + TIPOS_AG[sel.tipo][1] + ';color:#fff;align-self:flex-start">' + TIPOS_AG[sel.tipo][0] + '</span><span class="chico">' + rangoTexto(sel.inicio, sel.fin) + '</span>' +
        '<div class="fila"><button type="button" class="btn sec" data-a="agCerrar">Cerrar</button><button type="button" class="btn peligro" data-a="agBorrar">' + (G.confirmarBorrar ? 'Tocá de nuevo para borrar' : 'Borrar') + '</button></div></section>';
    }
    var prox = G.eventos.filter(function (e) { return new Date(e.fin) >= new Date(); }).sort(function (a, b) { return new Date(a.inicio) - new Date(b.inicio); }).slice(0, 6);
    return '<section class="tarjeta" aria-labelledby="t-agp"><h2 id="t-agp">Próximos</h2>' + (prox.length ? prox.map(function (e) {
      return '<button type="button" class="marca-nota" data-a="agVer" data-v="' + e.id + '"><span class="punto-ag" style="background:' + TIPOS_AG[e.tipo][1] + '"></span><span class="txt"><strong>' + esc(e.titulo) + '</strong><br><span class="mini gris">' + rangoTexto(e.inicio, e.fin) + '</span></span></button>';
    }).join('') : '<p class="gris chico">No hay nada agendado.</p>') + '</section>';
  }
  function refrescarAgenda() { var l = document.getElementById('agenda-lateral'); if (l) l.innerHTML = lateralAgenda(); }
  var calendario = null;
  function eventoFC(e) { var c = TIPOS_AG[e.tipo][1]; return { id: e.id, title: e.titulo, start: e.inicio, end: e.fin, backgroundColor: c, borderColor: c, textColor: e.tipo === 'entrega' ? '#1A1036' : '#FFFFFF' }; }
  despues('agenda', function () {
    cargar('calendario').then(function () { return cargar('calendarioEs').catch(function () { /* queda en inglés */ }); }).then(function () {
      var el = document.getElementById('calendario'); if (!el || S.ruta !== 'agenda') return;
      el.innerHTML = '';
      calendario = new window.FullCalendar.Calendar(el, {
        locale: 'es', firstDay: 1, initialView: window.innerWidth < 700 && S.agenda.vista === 'timeGridWeek' ? 'listWeek' : S.agenda.vista,
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' }, height: 'auto',
        slotMinTime: '07:00:00', slotMaxTime: '19:00:00', allDaySlot: false, nowIndicator: true, selectable: true, editable: true,
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false }, events: S.agenda.eventos.map(eventoFC),
        select: function (info) { S.agenda.nuevo = { inicio: info.start.toISOString(), fin: info.end.toISOString(), tipo: 'ateneo', titulo: '' }; S.agenda.sel = null; refrescarAgenda(); var t = document.getElementById('ag-titulo'); if (t) t.focus(); },
        eventClick: function (info) { info.jsEvent.preventDefault(); S.agenda.sel = info.event.id; S.agenda.nuevo = null; S.agenda.confirmarBorrar = false; refrescarAgenda(); },
        eventChange: function (info) {
          var e = S.agenda.eventos.filter(function (x) { return x.id === info.event.id; })[0]; if (!e) return;
          e.inicio = info.event.start.toISOString(); e.fin = (info.event.end || info.event.start).toISOString();
          guardarLocal(); refrescarAgenda(); avisar('Movido: ' + rangoTexto(e.inicio, e.fin) + '.');
        }
      });
      calendario.render(); window.PC.calendario = calendario;
      alSalir(function () { if (calendario) { calendario.destroy(); calendario = null; window.PC.calendario = null; } });
    }).catch(function () { var el = document.getElementById('calendario'); if (el) el.innerHTML = '<p class="aviso ambar">No se pudo cargar el calendario. Revisá la conexión a internet.</p>'; });
  });
  A.agVista = function (v) {
    S.agenda.vista = v;
    if (!calendario) { render(); return; }
    calendario.changeView(v);
    document.querySelectorAll('[data-a="agVista"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === v)); });
  };
  IN.agTitulo = function (v) { if (S.agenda.nuevo) S.agenda.nuevo.titulo = v; };
  A.agTipo = function (v) { S.agenda.nuevo.tipo = v; document.querySelectorAll('[data-a="agTipo"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === v)); }); };
  A.agCancelar = function () { S.agenda.nuevo = null; refrescarAgenda(); if (calendario) calendario.unselect(); };
  A.agGuardar = function () {
    var n = S.agenda.nuevo; if (!n) return;
    if (!String(n.titulo || '').trim()) { var t = document.getElementById('ag-titulo'); if (t) { t.focus(); t.placeholder = 'Escribí qué es'; } return; }
    var e = { id: 'e' + Date.now().toString(36), titulo: n.titulo.trim(), tipo: n.tipo || 'ateneo', inicio: n.inicio, fin: n.fin };
    S.agenda.eventos.push(e); S.agenda.nuevo = null;
    if (calendario) { calendario.addEvent(eventoFC(e)); calendario.unselect(); }
    refrescarAgenda(); guardarLocal(); avisar('Agendado: ' + e.titulo + '.');
  };
  A.agVer = function (v) { S.agenda.sel = v; S.agenda.nuevo = null; refrescarAgenda(); var e = S.agenda.eventos.filter(function (x) { return x.id === v; })[0]; if (e && calendario) calendario.gotoDate(e.inicio); };
  A.agCerrar = function () { S.agenda.sel = null; refrescarAgenda(); };
  A.agBorrar = function () {
    if (!S.agenda.confirmarBorrar) { S.agenda.confirmarBorrar = true; refrescarAgenda(); setTimeout(function () { S.agenda.confirmarBorrar = false; }, 4000); return; }
    var id = S.agenda.sel;
    S.agenda.eventos = S.agenda.eventos.filter(function (x) { return x.id !== id; }); S.agenda.sel = null; S.agenda.confirmarBorrar = false;
    if (calendario) { var ev = calendario.getEventById(id); if (ev) ev.remove(); }
    refrescarAgenda(); guardarLocal(); avisar('Borrado de la agenda.');
  };

  /* =====================================================================
     10 · REDACCIÓN DEL INFORME: editor (TipTap), dictado, PDF (jsPDF) y FHIR
     ===================================================================== */
  var PLANTILLA_MAMA = '<h2>Macroscopía</h2><p>Se reciben [N] cilindros de tejido blanco amarillento, de [x] a [y] mm de longitud, fijados en formol al 10 %. Se incluyen en su totalidad en 3 casetes (A1 a A3).</p>' +
    '<h2>Microscopía</h2><ul><li>Tipo histológico: [carcinoma invasor de tipo no especial]</li><li>Grado de Nottingham: [ ] (túbulos [ ], pleomorfismo [ ], mitosis [ ])</li><li>Extensión del carcinoma en los cilindros: [ ] mm</li><li>Invasión linfovascular: [no identificada]</li><li>Carcinoma in situ asociado: [ ]</li><li>Microcalcificaciones: [presentes, asociadas al carcinoma]</li></ul>' +
    '<h2>Inmunohistoquímica</h2><ul><li>Receptor de estrógeno: [ ] % de núcleos, intensidad [ ]</li><li>Receptor de progesterona: [ ] % de núcleos</li><li>HER2: [0 / 1+ / 2+ / 3+] (criterios ASCO/CAP 2023)</li><li>Ki-67: [ ] %</li></ul>' +
    '<h2>Diagnóstico</h2><p><strong>Mama izquierda, cuadrante superoexterno, biopsia core guiada por ecografía:</strong> [diagnóstico].</p>' +
    '<h2>Comentario</h2><p>[ ]</p>';
  function redaccion() {
    var C = S.caso, botones = [['h2', 'Título'], ['b', 'Negrita'], ['i', 'Cursiva'], ['ul', 'Lista'], ['undo', 'Deshacer'], ['redo', 'Rehacer']];
    return '<section class="tarjeta" aria-labelledby="t-redac"><div class="tarjeta-cab"><h2 id="t-redac">Redacción del informe</h2><span class="gris chico">Plantilla de biopsia core de mama con los ítems del ICCR y del CAP</span></div>' +
      '<div class="barra-editor" role="toolbar" aria-label="Formato del texto">' + botones.map(function (b) { return '<button type="button" class="chip" data-a="ed" data-v="' + b[0] + '" aria-pressed="false">' + b[1] + '</button>'; }).join('') +
      '<button type="button" class="chip lila" id="btn-dictar" data-a="dictar" aria-pressed="false">' + ic('micro', 16) + ' Dictar</button>' +
      '<button type="button" class="chip" data-a="edPlantilla">Volver a la plantilla</button></div>' +
      '<div id="editor-informe" class="editor editor-simple" contenteditable="true" data-in="informeSimple" role="textbox" aria-multiline="true" aria-label="Texto del informe">' + (C.informe || PLANTILLA_MAMA) + '</div>' +
      ((C.capturas || []).length ? '<div class="capturas">' + C.capturas.map(function (c) { return '<figure><img src="' + c.url + '" alt="' + esc(c.nombre) + '"><figcaption>' + esc(c.nombre) + '</figcaption></figure>'; }).join('') + '</div>' : '<p class="nota-pie">Las capturas y los dibujos que guardes en Imágenes aparecen acá y van al PDF.</p>') +
      '<div class="fila"><button type="button" class="btn pri" data-a="informePDF">' + ic('pdf') + 'Descargar el informe en PDF</button><button type="button" class="btn sec" data-a="informeFHIR">' + ic('bajar') + 'Exportar para el hospital (FHIR)</button></div>' +
      '<p class="nota-pie">El PDF sale como borrador hasta que firmes. El archivo FHIR es el formato que entienden los sistemas de historia clínica (HL7 FHIR R4).</p></section>';
  }
  var editor = null;
  despues('caso', function () {
    var el = document.getElementById('editor-informe'); if (!el) return;
    if (!S.caso.informe) S.caso.informe = el.innerHTML;
    Promise.all([import(CDN.tiptapCore), import(CDN.tiptapKit)]).then(function (m) {
      if (!document.body.contains(el) || S.ruta !== 'caso') return;
      var Editor = m[0].Editor, Kit = m[1].StarterKit || m[1].default;
      el.innerHTML = ''; el.removeAttribute('contenteditable'); el.removeAttribute('data-in'); el.removeAttribute('role'); el.classList.remove('editor-simple');
      editor = new Editor({ element: el, extensions: [Kit], content: S.caso.informe,
        editorProps: { attributes: { 'aria-label': 'Texto del informe', role: 'textbox', 'aria-multiline': 'true' } },
        onUpdate: function (p) { S.caso.informe = p.editor.getHTML(); guardarLocal(); }, onTransaction: marcarBarra });
      alSalir(function () { if (editor) { editor.destroy(); editor = null; } });
      marcarBarra();
    }).catch(function () { /* queda el editor simple */ });
  });
  IN.informeSimple = function (v, el) { S.caso.informe = el.innerHTML; guardarLocal(); };
  A.ed = function (v) {
    if (!editor) {
      var cmd = { b: 'bold', i: 'italic', ul: 'insertUnorderedList', undo: 'undo', redo: 'redo', h2: 'formatBlock' }[v];
      try { document.execCommand(cmd, false, v === 'h2' ? 'h2' : null); } catch (e) { /* sin formato */ }
      var el = document.getElementById('editor-informe'); if (el) S.caso.informe = el.innerHTML;
      return;
    }
    var c = editor.chain().focus();
    if (v === 'h2') c.toggleHeading({ level: 2 }).run();
    else if (v === 'b') c.toggleBold().run();
    else if (v === 'i') c.toggleItalic().run();
    else if (v === 'ul') c.toggleBulletList().run();
    else if (v === 'undo') c.undo().run();
    else if (v === 'redo') c.redo().run();
  };
  function marcarBarra() {
    if (!editor) return;
    var act = { h2: editor.isActive('heading', { level: 2 }), b: editor.isActive('bold'), i: editor.isActive('italic'), ul: editor.isActive('bulletList') };
    document.querySelectorAll('[data-a="ed"]').forEach(function (b) { if (b.dataset.v in act) b.setAttribute('aria-pressed', String(act[b.dataset.v])); });
  }
  A.edPlantilla = function (v, b) {
    if (!b.dataset.ok) { b.dataset.ok = '1'; b.textContent = 'Tocá de nuevo: se borra lo escrito'; setTimeout(function () { delete b.dataset.ok; b.textContent = 'Volver a la plantilla'; }, 4000); return; }
    delete b.dataset.ok; b.textContent = 'Volver a la plantilla';
    S.caso.informe = PLANTILLA_MAMA;
    if (editor) editor.commands.setContent(PLANTILLA_MAMA, false); else { var el = document.getElementById('editor-informe'); if (el) el.innerHTML = PLANTILLA_MAMA; }
    guardarLocal(); avisar('Volvió la plantilla en blanco.');
  };
  /* Dictado por voz: lo hace el navegador (Safari y Chrome), en castellano de Argentina. */
  var dictado = null;
  function puntuacion(t) {
    return (' ' + t + ' ').replace(/\s+dos puntos\s+/gi, ': ').replace(/\s+punto y aparte\s+/gi, '. ').replace(/\s+punto y seguido\s+/gi, '. ')
      .replace(/\s+punto\s+/gi, '. ').replace(/\s+coma\s+/gi, ', ').replace(/\s+/g, ' ').trim() + ' ';
  }
  function insertarTexto(t) {
    if (editor) { editor.chain().focus().insertContent(t).run(); return; }
    var el = document.getElementById('editor-informe'); if (!el) return;
    el.insertAdjacentText('beforeend', t); S.caso.informe = el.innerHTML; guardarLocal();
  }
  function marcarDictado(on) { var b = document.getElementById('btn-dictar'); if (b) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = ic('micro', 16) + (on ? ' Escuchando… tocá para terminar' : ' Dictar'); } }
  A.dictar = function () {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { avisar('Este navegador no permite dictar. Usá Safari o Chrome; en la Mac también sirve Edición › Iniciar dictado.'); return; }
    if (dictado) { dictado.stop(); return; }
    dictado = new SR(); dictado.lang = 'es-AR'; dictado.continuous = true; dictado.interimResults = false;
    dictado.onresult = function (ev) { for (var i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) insertarTexto(puntuacion(ev.results[i][0].transcript)); };
    dictado.onend = function () { dictado = null; marcarDictado(false); };
    dictado.onerror = function (e) { avisar(e.error === 'not-allowed' ? 'Falta el permiso del micrófono.' : 'Se cortó el dictado. Probá de nuevo.'); };
    try { dictado.start(); marcarDictado(true); avisar('Dictando. Decí “punto”, “coma” o “dos puntos” para la puntuación.'); } catch (e) { dictado = null; }
    alSalir(function () { if (dictado) dictado.stop(); });
  };
  function textoPDF(t) {
    return String(t).replace(/≈/g, 'aprox. ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, '-').replace(/[•·]/g, '-')
      .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/→/g, '->').replace(/[^\x00-\xFF]/g, '');
  }
  A.informePDF = function () {
    avisar('Armando el PDF…');
    cargar('jspdf').then(function () {
      var J = window.jspdf.jsPDF, doc = new J({ unit: 'mm', format: 'a4' }), C = S.caso, p = D.padron.p1;
      var ing = S.rec.ingresos.filter(function (x) { return x.id === 'B26-04807'; })[0] || {}, M = 18, Wd = 210 - 2 * M, y = 0;
      function encabezado() {
        doc.setFillColor(26, 16, 54); doc.rect(0, 0, 210, 24, 'F'); doc.setFillColor(106, 61, 245); doc.rect(0, 24, 210, 1.6, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('Pura Carne', M, 12);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(textoPDF('Servicio de Anatomía Patológica'), M, 18);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('B26-04807', 210 - M, 12, { align: 'right' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.text(textoPDF('Informe anatomopatológico'), 210 - M, 18, { align: 'right' });
        doc.setTextColor(26, 16, 54); y = 34;
      }
      function salto(alto) { if (y + alto > 278) { doc.addPage(); encabezado(); } }
      function parrafo(t, tam, negrita, sangria) {
        doc.setFont('helvetica', negrita ? 'bold' : 'normal'); doc.setFontSize(tam);
        doc.splitTextToSize(textoPDF(t), Wd - (sangria || 0)).forEach(function (l) { salto(tam * 0.5); doc.text(l, M + (sangria || 0), y); y += tam * 0.45; });
        y += 1.2;
      }
      encabezado();
      var filas = [['Paciente', p.n], ['Edad y sexo', p.edad + ' años, ' + (p.sexo === 'F' ? 'femenino' : 'masculino')], ['DNI', p.dni], ['Historia clínica', p.hc], ['Solicitante', 'Dr. [APELLIDO] - MP [N°]'], ['Material', 'Biopsia core de mama izquierda'], ['Recibido', fechaIngreso(ing) + ' ' + (ing.hora || '')], ['Informado', C.firmado ? (C.fechaFirma || '') : 'Borrador sin firmar']];
      var altoCaja = Math.ceil(filas.length / 2) * 7 + 5;
      doc.setDrawColor(228, 222, 242); doc.setFillColor(244, 241, 251); doc.roundedRect(M, y - 5, Wd, altoCaja, 2, 2, 'FD');
      filas.forEach(function (f, i) {
        var x = M + 4 + (i % 2) * (Wd / 2), yy = y + Math.floor(i / 2) * 7;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(94, 88, 116); doc.text(textoPDF(f[0]), x, yy);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(26, 16, 54); doc.text(textoPDF(String(f[1])).slice(0, 46), x + 26, yy);
      });
      y += altoCaja + 2;
      var cont = document.createElement('div'); cont.innerHTML = C.informe || PLANTILLA_MAMA;
      Array.prototype.forEach.call(cont.children, function (n) {
        if (/^H[1-3]$/.test(n.tagName)) { y += 2; salto(10); doc.setTextColor(62, 27, 176); parrafo(n.textContent, 12, true); doc.setTextColor(26, 16, 54); }
        else if (n.tagName === 'UL' || n.tagName === 'OL') Array.prototype.forEach.call(n.querySelectorAll('li'), function (li) { parrafo('-  ' + li.textContent, 10, false, 3); });
        else parrafo(n.textContent, 10, false);
      });
      y += 2; salto(12); doc.setTextColor(62, 27, 176); parrafo('Ítems del protocolo (CAP / ICCR)', 12, true); doc.setTextColor(26, 16, 54);
      D.checklist.forEach(function (c) { parrafo((C.ok[c[0]] ? '[x] ' : '[  ] ') + c[1] + ' (' + c[2] + ')', 9.5, false, 3); });
      (C.capturas || []).forEach(function (cap) {
        try {
          var pr = doc.getImageProperties(cap.url), ancho = Wd / 2 - 3, alto = ancho * pr.height / pr.width;
          if (alto > 80) { alto = 80; ancho = alto * pr.width / pr.height; }
          salto(alto + 10); doc.addImage(cap.url, 'PNG', M, y, ancho, alto);
          doc.setFontSize(8); doc.setTextColor(94, 88, 116); doc.text(textoPDF(cap.nombre), M, y + alto + 4); doc.setTextColor(26, 16, 54); y += alto + 9;
        } catch (e) { /* imagen que no se pudo agregar */ }
      });
      salto(40); y += 8; doc.setDrawColor(26, 16, 54); doc.line(M, y, M + 75, y); y += 5;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(C.firmado ? 'Dra. [NOMBRE] - Médica patóloga - MP [N°]' : 'Sin firmar (borrador)', M, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      doc.text(textoPDF(C.firmado ? 'Firmado electrónicamente el ' + (C.fechaFirma || '') : 'Este documento no tiene validez hasta que el patólogo lo firme.'), M, y + 5);
      var q = qrMatriz('PC1-INF:B26-04807:' + tokenEtiqueta('INF-B26-04807')), lado = 24, mod = lado / (q.n + 2), x0 = 210 - M - lado, y0 = y - 14;
      doc.setFillColor(255, 255, 255); doc.rect(x0, y0, lado, lado, 'F'); doc.setFillColor(26, 16, 54);
      q.m.forEach(function (m) { doc.rect(x0 + (m[0] + 1) * mod, y0 + (m[1] + 1) * mod, mod + 0.02, mod + 0.02, 'F'); });
      doc.setFontSize(7); doc.text(textoPDF('Código de verificación'), x0 + lado / 2, y0 + lado + 3.5, { align: 'center' });
      var paginas = doc.getNumberOfPages();
      for (var pg = 1; pg <= paginas; pg++) {
        doc.setPage(pg); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(94, 88, 116);
        doc.text(textoPDF('Pura Carne - B26-04807 - Datos de demostración - Página ' + pg + ' de ' + paginas), 105, 290, { align: 'center' });
        if (!C.firmado) {
          try { doc.setGState(new doc.GState({ opacity: 0.1 })); } catch (e) { /* sin transparencia */ }
          doc.setTextColor(106, 61, 245); doc.setFont('helvetica', 'bold'); doc.setFontSize(60); doc.text('BORRADOR', 105, 170, { align: 'center', angle: 35 });
          try { doc.setGState(new doc.GState({ opacity: 1 })); } catch (e) { /* sin transparencia */ }
        }
      }
      doc.save('Informe-B26-04807' + (C.firmado ? '' : '-borrador') + '.pdf');
      avisar('PDF descargado' + (C.firmado ? '.' : ' como borrador: firmá el informe para que salga sin esa marca.'));
    }).catch(function () { sinLibreria('el armado del PDF'); });
  };
  A.informeFHIR = function () {
    var C = S.caso, p = D.padron.p1, ahora = new Date().toISOString(), tmp = document.createElement('div');
    tmp.innerHTML = C.informe || PLANTILLA_MAMA;
    var diag = '';
    Array.prototype.forEach.call(tmp.querySelectorAll('h2'), function (h) { if (/diagn/i.test(h.textContent) && h.nextElementSibling) diag = h.nextElementSibling.textContent.trim(); });
    var paquete = { resourceType: 'Bundle', type: 'collection', timestamp: ahora, meta: { tag: [{ system: 'urn:pura-carne', code: 'demo', display: 'Datos de demostración' }] }, entry: [
      { fullUrl: 'urn:uuid:paciente-p1', resource: { resourceType: 'Patient', id: 'p1', identifier: [{ type: { text: 'DNI' }, value: p.dni }], name: [{ text: p.n, family: p.n.split(',')[0], given: [(p.n.split(',')[1] || '').trim()] }], gender: p.sexo === 'F' ? 'female' : p.sexo === 'M' ? 'male' : 'other' } },
      { fullUrl: 'urn:uuid:muestra-b26-04807', resource: { resourceType: 'Specimen', id: 'B26-04807', accessionIdentifier: { value: 'B26-04807' }, type: { text: 'Biopsia core de mama' }, subject: { reference: 'urn:uuid:paciente-p1' }, receivedTime: '2026-10-23T08:12:00-03:00', collection: { bodySite: { text: 'Mama izquierda, cuadrante superoexterno' } },
        container: D.tacos.map(function (t) { return { identifier: [{ value: 'B26-04807-' + t.id }], description: 'Taco ' + t.id + ': ' + t.desc }; }) } },
      { fullUrl: 'urn:uuid:informe-b26-04807', resource: { resourceType: 'DiagnosticReport', id: 'inf-B26-04807', status: C.firmado ? 'final' : 'preliminary',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0074', code: 'SP', display: 'Surgical Pathology' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '11526-1', display: 'Pathology study' }], text: 'Informe anatomopatológico' },
        subject: { reference: 'urn:uuid:paciente-p1' }, specimen: [{ reference: 'urn:uuid:muestra-b26-04807' }], issued: ahora,
        performer: [{ display: 'Servicio de Anatomía Patológica - Dra. [NOMBRE]' }], conclusion: diag || 'Pendiente',
        presentedForm: [{ contentType: 'text/html', language: 'es-AR', title: 'Informe B26-04807', data: btoa(unescape(encodeURIComponent(C.informe || PLANTILLA_MAMA))) }] } }
    ] };
    if (C.valores && C.valores.ki67 != null) paquete.entry.push({ fullUrl: 'urn:uuid:ki67', resource: { resourceType: 'Observation', status: 'preliminary', code: { text: 'Ki-67 (índice de proliferación)' }, subject: { reference: 'urn:uuid:paciente-p1' }, valueQuantity: { value: C.valores.ki67, unit: '%', system: 'http://unitsofmeasure.org', code: '%' }, method: { text: 'Conteo asistido por imagen (orientativo)' } } });
    descargar('FHIR-B26-04807.json', JSON.stringify(paquete, null, 2), 'application/fhir+json');
    avisar('Archivo FHIR descargado: es el formato para mandar el informe al sistema del hospital.');
  };

  /* =====================================================================
     11 · IMÁGENES: dibujar y medir (Fabric.js) y contar positivos
     ===================================================================== */
  function umPorPxCaptura() {
    if (!visor || subidaActual() || !visor.drawer || !visor.drawer.canvas) return null;
    var l = lamina(S.img.lamina), iz = visor.viewport.viewportToImageZoom(visor.viewport.getZoom(true));
    return l.mpp / iz / (visor.drawer.canvas.width / Math.max(1, visor.container.clientWidth));
  }
  function guardarCaptura(nombre, url, umPx) {
    S.caso.capturas = (S.caso.capturas || []).filter(function (c) { return c.nombre !== nombre; });
    S.caso.capturas.push({ nombre: nombre, url: url, umPx: umPx || null });
    if (S.caso.capturas.length > 6) S.caso.capturas.shift();
    guardarLocal();
  }
  var lienzoF = null, herramientaDib = 'flecha', colorDib = '#FF4F8B', trazo = null, inicioDib = null;
  A.imgDibujar = function () {
    var sub = subidaActual();
    if (sub && !sub.video) { S.img.dibujo = { url: sub.url, nombre: sub.nombre, umPx: null }; render(); return; }
    if (!visor || !visor.drawer || !visor.drawer.canvas) { avisar('Esperá a que cargue la lámina.'); return; }
    try { S.img.dibujo = { url: visor.drawer.canvas.toDataURL('image/png'), nombre: 'Lámina ' + claveVisor(), umPx: umPorPxCaptura() }; render(); }
    catch (e) { avisar('El navegador no dejó tomar esta imagen.'); }
  };
  function modalDibujo() {
    var Dd = S.img.dibujo; if (!Dd) return '';
    var herr = [['mover', 'Mover', 'ojo'], ['flecha', 'Flecha', 'ext'], ['circulo', 'Círculo', 'ilustracion'], ['rect', 'Recuadro', 'imagenes'], ['regla', Dd.umPx ? 'Medir (µm)' : 'Medir', 'regla'], ['lapiz', 'Lápiz', 'lapiz'], ['texto', 'Texto', 'doc']];
    var colores = [['#FF4F8B', 'rosa'], ['#FFB020', 'amarillo'], ['#00A676', 'verde'], ['#FFFFFF', 'blanco'], ['#1A1036', 'negro']];
    return '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="t-dib"><div class="modal-caja"><div class="tarjeta-cab"><h2 id="t-dib">Dibujar sobre ' + esc(Dd.nombre) + '</h2><button type="button" class="btn-icono" data-a="dibCerrar" aria-label="Cerrar">×</button></div>' +
      '<div class="fila barra-dibujo" role="toolbar" aria-label="Herramientas">' + herr.map(function (h) { return '<button type="button" class="chip lila" data-a="dibHerr" data-v="' + h[0] + '" aria-pressed="' + (herramientaDib === h[0]) + '">' + ic(h[2], 16) + ' ' + h[1] + '</button>'; }).join('') +
      '<span class="colores">' + colores.map(function (c) { return '<button type="button" class="color" data-a="dibColor" data-v="' + c[0] + '" aria-label="Color ' + c[1] + '" aria-pressed="' + (colorDib === c[0]) + '" style="background:' + c[0] + '"></button>'; }).join('') + '</span>' +
      '<button type="button" class="chip" data-a="dibDeshacer">Deshacer</button><button type="button" class="chip" data-a="dibBorrar">Borrar lo elegido</button></div>' +
      '<div id="dibujo-zona" class="dibujo-zona"><canvas id="dibujo-c"></canvas><span class="cargando-osd" id="dib-cargando">Abriendo el editor…</span></div>' +
      '<p class="nota-pie">' + (Dd.umPx ? 'La regla mide en micrones según el aumento de la captura.' : 'Esta foto no tiene escala: la regla mide en píxeles.') + ' Arrastrá para dibujar; con “Mover” corregís o borrás.</p>' +
      '<div class="fila"><button type="button" class="btn sec" data-a="dibCerrar">Cancelar</button><button type="button" class="btn pri" data-a="dibGuardar">Guardar en el caso</button></div></div></div>';
  }
  despues('imagenes', function () {
    if (visor) visor.addHandler('viewport-change', limpiarPuntos);
    if (S.img.dibujo) montarFabric();
  });
  function montarFabric() {
    var Dd = S.img.dibujo;
    cargar('fabric').then(function () {
      var F = window.fabric, zona = document.getElementById('dibujo-zona');
      if (!zona || S.img.dibujo !== Dd) return;
      F.Image.fromURL(Dd.url, function (img) {
        if (!document.getElementById('dibujo-c') || !img || !img.width) return;
        var ancho = Math.min(zona.clientWidth || 800, 1100), k = ancho / img.width, alto = Math.round(img.height * k), tope = window.innerHeight * 0.6;
        if (alto > tope) { k = tope / img.height; ancho = Math.round(img.width * k); alto = Math.round(img.height * k); }
        Dd.k = k;
        lienzoF = new F.Canvas('dibujo-c', { width: ancho, height: alto, selection: false, preserveObjectStacking: true });
        img.set({ selectable: false, evented: false }); img.scale(k);
        lienzoF.setBackgroundImage(img, lienzoF.renderAll.bind(lienzoF));
        lienzoF.on('mouse:down', dibAbajo); lienzoF.on('mouse:move', dibMover); lienzoF.on('mouse:up', dibArriba);
        alSalir(function () { if (lienzoF) { lienzoF.dispose(); lienzoF = null; } });
        var c = document.getElementById('dib-cargando'); if (c) c.hidden = true;
        aplicarHerramienta();
      }, { crossOrigin: 'anonymous' });
    }).catch(function () { sinLibreria('el editor de dibujo'); });
  }
  function aplicarHerramienta() {
    document.querySelectorAll('[data-a="dibHerr"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === herramientaDib)); });
    document.querySelectorAll('[data-a="dibColor"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === colorDib)); });
    if (!lienzoF) return;
    var F = window.fabric, h = herramientaDib;
    lienzoF.isDrawingMode = h === 'lapiz';
    if (h === 'lapiz') { lienzoF.freeDrawingBrush = new F.PencilBrush(lienzoF); lienzoF.freeDrawingBrush.color = colorDib; lienzoF.freeDrawingBrush.width = 4; }
    lienzoF.selection = h === 'mover';
    lienzoF.getObjects().forEach(function (o) { o.selectable = h === 'mover'; o.evented = h === 'mover'; });
    lienzoF.defaultCursor = h === 'mover' ? 'default' : 'crosshair';
    lienzoF.discardActiveObject(); lienzoF.requestRenderAll();
  }
  function dibAbajo(o) {
    var h = herramientaDib, F = window.fabric; if (!lienzoF || h === 'mover' || h === 'lapiz') return;
    var p = lienzoF.getPointer(o.e); inicioDib = p;
    var base = { stroke: colorDib, strokeWidth: 4, fill: 'transparent', selectable: false, evented: false, strokeUniform: true };
    if (h === 'texto') {
      var t = new F.IText('Escribí acá', { left: p.x, top: p.y, fontSize: 20, fill: colorDib, fontFamily: 'IBM Plex Sans', fontWeight: '700', stroke: colorDib === '#FFFFFF' ? '#1A1036' : '#FFFFFF', strokeWidth: 0.6, paintFirst: 'stroke' });
      lienzoF.add(t); herramientaDib = 'mover'; aplicarHerramienta(); lienzoF.setActiveObject(t); t.enterEditing(); t.selectAll(); return;
    }
    if (h === 'circulo') trazo = new F.Ellipse(Object.assign({ left: p.x, top: p.y, rx: 1, ry: 1, originX: 'center', originY: 'center' }, base));
    else if (h === 'rect') trazo = new F.Rect(Object.assign({ left: p.x, top: p.y, width: 1, height: 1 }, base));
    else trazo = new F.Line([p.x, p.y, p.x, p.y], base);
    lienzoF.add(trazo);
  }
  function dibMover(o) {
    if (!trazo || !lienzoF) return;
    var p = lienzoF.getPointer(o.e), a = inicioDib;
    if (herramientaDib === 'circulo') trazo.set({ rx: Math.abs(p.x - a.x), ry: Math.abs(p.y - a.y) });
    else if (herramientaDib === 'rect') trazo.set({ left: Math.min(a.x, p.x), top: Math.min(a.y, p.y), width: Math.abs(p.x - a.x), height: Math.abs(p.y - a.y) });
    else trazo.set({ x2: p.x, y2: p.y });
    lienzoF.requestRenderAll();
  }
  function textoMedida(px) {
    var Dd = S.img.dibujo, real = px / (Dd.k || 1);
    if (!Dd.umPx) return Math.round(real) + ' px';
    var um = real * Dd.umPx;
    return um >= 1000 ? (um / 1000).toFixed(2).replace('.', ',') + ' mm' : Math.round(um) + ' µm';
  }
  function dibArriba() {
    if (!trazo || !lienzoF) return;
    var F = window.fabric, h = herramientaDib, t = trazo; trazo = null;
    if (h === 'flecha' || h === 'regla') {
      var dx = t.x2 - t.x1, dy = t.y2 - t.y1, largo = Math.sqrt(dx * dx + dy * dy);
      lienzoF.remove(t);
      if (largo < 6) return;
      var partes = [new F.Line([t.x1, t.y1, t.x2, t.y2], { stroke: colorDib, strokeWidth: 4 })];
      if (h === 'flecha') partes.push(new F.Triangle({ left: t.x2, top: t.y2, originX: 'center', originY: 'center', angle: Math.atan2(dy, dx) * 180 / Math.PI + 90, width: 20, height: 22, fill: colorDib }));
      else {
        var nx = -dy / largo * 9, ny = dx / largo * 9;
        [[t.x1, t.y1], [t.x2, t.y2]].forEach(function (q) { partes.push(new F.Line([q[0] + nx, q[1] + ny, q[0] - nx, q[1] - ny], { stroke: colorDib, strokeWidth: 4 })); });
        partes.push(new F.Text(textoMedida(largo), { left: (t.x1 + t.x2) / 2, top: (t.y1 + t.y2) / 2 - 28, originX: 'center', fontSize: 17, fontWeight: '700', fill: '#FFFFFF', backgroundColor: 'rgba(26,16,54,0.85)', fontFamily: 'IBM Plex Sans' }));
      }
      lienzoF.add(new F.Group(partes, { selectable: false, evented: false }));
    } else if ((t.type === 'rect' && t.width < 4 && t.height < 4) || (t.type === 'ellipse' && t.rx < 3 && t.ry < 3)) lienzoF.remove(t);
    lienzoF.requestRenderAll();
  }
  A.dibHerr = function (v) { herramientaDib = v; aplicarHerramienta(); };
  A.dibColor = function (v) {
    colorDib = v; aplicarHerramienta();
    var o = lienzoF && lienzoF.getActiveObject();
    if (o) { if (o.type === 'i-text') o.set('fill', v); else o.set('stroke', v); lienzoF.requestRenderAll(); }
  };
  A.dibDeshacer = function () { if (!lienzoF) return; var objs = lienzoF.getObjects(); if (objs.length) lienzoF.remove(objs[objs.length - 1]); };
  A.dibBorrar = function () { if (!lienzoF) return; lienzoF.getActiveObjects().forEach(function (x) { lienzoF.remove(x); }); lienzoF.discardActiveObject(); lienzoF.requestRenderAll(); };
  A.dibCerrar = function () { S.img.dibujo = null; render(); };
  A.dibGuardar = function () {
    if (!lienzoF) { avisar('Esperá a que abra el editor.'); return; }
    var Dd = S.img.dibujo, url = lienzoF.toDataURL({ format: 'png', multiplier: 1 / (Dd.k || 1) });
    var id = 'Foto ' + (S.img.subidas.length + 1), nombre = 'Dibujo · ' + Dd.nombre;
    S.img.subidas.push({ id: id, nombre: nombre, url: url, video: false });
    guardarCaptura(nombre, url, Dd.umPx);
    if (S.caso.adjuntos.indexOf(nombre) < 0) S.caso.adjuntos.push(nombre);
    S.img.dibujo = null; S.img.vidrio = id; render();
    avisar('Dibujo guardado en el caso y adjunto al informe.');
  };
  /* Conteo de núcleos positivos (marrón, DAB) y negativos (azul, hematoxilina) en lo que se ve. */
  function tarjetaConteo() {
    var c = S.img.conteo; if (!c || c.clave !== claveVisor() || !hayZoom()) return '';
    return '<section class="tarjeta conteo" aria-labelledby="t-conteo"><div class="tarjeta-cab"><h2 id="t-conteo">Conteo en esta vista</h2><button type="button" class="link" data-a="imgContarCerrar">Cerrar</button></div>' +
      '<div class="conteo-num"><strong>' + c.pct + ' %</strong><span>núcleos positivos (marrones)</span></div><div class="barra"><span style="width:' + c.pct + '%;background:#7A4A1E"></span></div>' +
      '<span class="chico">' + c.pos + ' positivos de ' + (c.pos + c.neg) + ' núcleos, a ' + c.aumento + '. En la lámina: círculos rosas = positivos, celestes = negativos.</span>' +
      (c.aviso ? '<p class="aviso ambar">' + esc(c.aviso) + '</p>' : '') +
      '<p class="nota-pie">Conteo automático orientativo, como el de QuPath: separa por color. El valor final lo valida el patólogo en campos representativos.</p>' +
      '<button type="button" class="btn suave ancho" data-a="imgConteoInforme">Pasar ' + c.pct + ' % al informe como Ki-67</button></section>';
  }
  function limpiarPuntos() { var cv = document.getElementById('osd-puntos'); if (cv && !cv.hidden) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); cv.hidden = true; } }
  function pintarPuntos(pos, neg, W, H) {
    var cv = document.getElementById('osd-puntos'); if (!cv) return;
    cv.width = W; cv.height = H; cv.hidden = false;
    var x = cv.getContext('2d'), r = Math.max(4, W / 260);
    x.lineWidth = Math.max(2, r / 2.4);
    x.strokeStyle = '#FF4F8B'; pos.forEach(function (p) { x.beginPath(); x.arc(p[0], p[1], r, 0, 6.3); x.stroke(); });
    x.strokeStyle = '#00E0C6'; neg.forEach(function (p) { x.beginPath(); x.arc(p[0], p[1], r * 0.8, 0, 6.3); x.stroke(); });
  }
  A.imgContar = function () {
    if (!visor || !visor.drawer || !visor.drawer.canvas || !visor.world.getItemCount()) { avisar('Esperá a que cargue la lámina.'); return; }
    var c = visor.drawer.canvas, W = c.width, H = c.height, datos;
    try { datos = c.getContext('2d').getImageData(0, 0, W, H).data; } catch (e) { avisar('El navegador no dejó leer esta imagen.'); return; }
    var paso = 2, w = Math.floor(W / paso), h = Math.floor(H / paso), tipo = new Uint8Array(w * h);
    for (var yy = 0; yy < h; yy++) for (var xx = 0; xx < w; xx++) {
      var i = ((yy * paso) * W + xx * paso) * 4, r = datos[i], g = datos[i + 1], b = datos[i + 2], br = (r + g + b) / 3;
      if (br > 205 || datos[i + 3] < 200) continue;
      if ((r - b > 28 && r >= g && br < 175) || (br < 95 && r > b + 6)) tipo[yy * w + xx] = 1; // marrón claro u oscuro (DAB)
      else if (b - r > 10 && b >= g - 6 && br < 190) tipo[yy * w + xx] = 2;
    }
    var umCelda = umPorPxCaptura() * paso, aMin = Math.PI * Math.pow(2.2 / umCelda, 2), aMed = Math.PI * Math.pow(4 / umCelda, 2), aMax = aMed * 2.6;
    var visto = new Uint8Array(w * h), pila = new Int32Array(w * h), pos = [], neg = [];
    for (var p = 0; p < w * h; p++) {
      var t = tipo[p]; if (!t || visto[p]) continue;
      var n = 0, sx = 0, sy = 0, top = 0; pila[top++] = p; visto[p] = 1;
      while (top) {
        var q = pila[--top], qx = q % w, qy = (q / w) | 0; n++; sx += qx; sy += qy;
        if (qx > 0 && !visto[q - 1] && tipo[q - 1] === t) { visto[q - 1] = 1; pila[top++] = q - 1; }
        if (qx < w - 1 && !visto[q + 1] && tipo[q + 1] === t) { visto[q + 1] = 1; pila[top++] = q + 1; }
        if (qy > 0 && !visto[q - w] && tipo[q - w] === t) { visto[q - w] = 1; pila[top++] = q - w; }
        if (qy < h - 1 && !visto[q + w] && tipo[q + w] === t) { visto[q + w] = 1; pila[top++] = q + w; }
      }
      if (n < aMin) continue;
      var veces = n > aMax ? Math.min(12, Math.round(n / aMed)) : 1;
      for (var k = 0; k < veces; k++) (t === 1 ? pos : neg).push([sx / n * paso, sy / n * paso]);
    }
    var total = pos.length + neg.length, l = lamina(S.img.lamina), iz = visor.viewport.viewportToImageZoom(visor.viewport.getZoom(true)), aviso = '';
    if (aMin < 3) aviso = 'Estás lejos: acercate a 20x o más para que cada núcleo se vea entero.';
    else if (total < 50) aviso = 'Hay pocos núcleos en esta vista. Elegí un campo con más células.';
    if (l.corto === 'H&E' || l.corto === 'Ganglio' || l.corto === 'CMU-1') aviso = 'Esta lámina no es de inmunohistoquímica: el conteo sirve para Ki-67, RE o RP. Probá con la lámina Ki-67.';
    S.img.conteo = { clave: claveVisor(), pos: pos.length, neg: neg.length, pct: total ? Math.round(pos.length / total * 100) : 0, aumento: '≈ ' + Math.round(10 * iz / l.mpp) + 'x', aviso: aviso };
    pintarPuntos(pos, neg, W, H);
    var lat = document.querySelector('.dos > .lateral');
    if (lat) { var vieja = lat.querySelector('.conteo'); if (vieja) vieja.outerHTML = tarjetaConteo(); else lat.insertAdjacentHTML('afterbegin', tarjetaConteo()); }
    avisar(total ? 'Conteo listo: ' + S.img.conteo.pct + ' % de ' + total + ' núcleos.' : 'No encontré núcleos para contar en esta vista.');
  };
  A.imgContarCerrar = function () { S.img.conteo = null; limpiarPuntos(); var t = document.querySelector('.conteo'); if (t) t.remove(); };
  A.imgConteoInforme = function () {
    var c = S.img.conteo; if (!c) return;
    S.caso.valores = S.caso.valores || {}; S.caso.valores.ki67 = c.pct; S.caso.ok.ki67 = true;
    var txt = 'Ki-67: ' + c.pct + ' % (conteo asistido en ' + (c.pos + c.neg) + ' núcleos; a validar)';
    var html = S.caso.informe || PLANTILLA_MAMA;
    S.caso.informe = /Ki-67:[^<]*/.test(html) ? html.replace(/Ki-67:[^<]*/, txt) : html + '<p>' + txt + '</p>';
    guardarLocal(); avisar('Pasé el Ki-67 al informe de B26-04807 y quedó tildado en el protocolo.');
  };

  /* =====================================================================
     12 · LABORATORIO: arrastrar pedidos entre columnas (SortableJS)
     ===================================================================== */
  var ordenadores = [];
  despues('laboratorio', function () {
    cargar('sortable').then(function () {
      if (S.ruta !== 'laboratorio') return;
      document.querySelectorAll('.columna').forEach(function (col) {
        ordenadores.push(window.Sortable.create(col, { group: 'pedidos', draggable: '.pedido', animation: 180, ghostClass: 'pedido-fantasma', chosenClass: 'pedido-elegido',
          delay: 120, delayOnTouchOnly: true, filter: '.avanzar', preventOnFilter: false,
          onEnd: function (ev) {
            var id = ev.item.dataset.id, et = +ev.to.dataset.etapa, p = S.lab.pedidos.filter(function (x) { return x.id === id; })[0];
            if (p && p.etapa !== et) { p.etapa = et; S.lab.sel = id; setTimeout(function () { render(); avisar(p.caso + ' · ' + p.taco + ': ' + ETAPAS[et].toLowerCase() + '.'); }, 0); }
          } }));
      });
      alSalir(function () { ordenadores.splice(0).forEach(function (o) { try { o.destroy(); } catch (e) { /* ya no estaba */ } }); });
    }).catch(function () { /* sin la librería quedan los botones */ });
  });

  /* =====================================================================
     13 · BUSCADOR: índice de casos, protocolos y diferenciales (MiniSearch)
     ===================================================================== */
  var indice = null;
  function armarIndice() {
    if (indice || !window.MiniSearch) return indice;
    var docs = [];
    D.base.forEach(function (c, i) { docs.push({ id: 'c' + i, tipo: 'caso', titulo: c[0] + ' ' + c[1], texto: c[2], ref: c }); });
    (window.PC_PROTOCOLOS || []).forEach(function (p, i) { docs.push({ id: 'p' + i, tipo: 'protocolo', titulo: p.t, texto: p.cat + ' ' + p.fuente + ' ' + (p.es || ''), ref: p }); });
    D.diferenciales.forEach(function (d, i) { docs.push({ id: 'd' + i, tipo: 'diferencial', titulo: d.nombre, texto: d.esenciales + ' ' + d.ihq + ' ' + d.clave, ref: d }); });
    indice = new window.MiniSearch({ fields: ['titulo', 'texto'], storeFields: ['tipo', 'ref'], processTerm: function (t) { return sinAcentos(t); } });
    indice.addAll(docs);
    return indice;
  }
  function buscarEnBase(q) {
    var ix = armarIndice(), out = { casos: [], protocolos: [], diferenciales: [] };
    if (!String(q || '').trim()) return out;
    if (!ix) {
      var toks = sinAcentos(q).split(/[^a-z0-9-]+/).filter(function (t) { return t.length >= 3; });
      function tiene(txt) { txt = sinAcentos(txt); return toks.some(function (t) { return txt.indexOf(t) >= 0; }); }
      out.casos = D.base.filter(function (c) { return tiene(c[1] + ' ' + c[2]); }).slice(0, 5);
      out.protocolos = (window.PC_PROTOCOLOS || []).filter(function (p) { return tiene(p.t + ' ' + p.cat + ' ' + (p.es || '')); }).slice(0, 6);
      return out;
    }
    ix.search(q, { prefix: true, fuzzy: 0.2, boost: { titulo: 2 }, combineWith: 'OR' }).forEach(function (r) {
      var grupo = r.tipo === 'caso' ? out.casos : r.tipo === 'protocolo' ? out.protocolos : out.diferenciales;
      if (grupo.length < (r.tipo === 'protocolo' ? 6 : 5)) grupo.push(r.ref);
    });
    return out;
  }
  function enlaceProtocolo(p) { return location.protocol === 'file:' && p.archivo ? encodeURI(p.archivo) : p.url; }

  /* =====================================================================
     14 · CALIDAD: gráficos interactivos (ECharts)
     ===================================================================== */
  var graficos = [];
  despues('calidad', function (entrando) {
    if (entrando) cargar('gsap').then(contarNumeros).catch(function () { /* sin animación */ });
    cargar('echarts').then(function () { if (S.ruta === 'calidad') dibujarGraficos(); }).catch(function () { /* quedan los gráficos simples */ });
  });
  despues('recepcion', function (entrando) { if (entrando) cargar('gsap').then(contarNumeros).catch(function () { /* sin animación */ }); });
  function dibujarGraficos() {
    var E = window.echarts, Q = S.cal, d = D.calidad[Q.tipo], f = PERIODOS[Q.periodo][2], u = Q.tipo === 'intra' ? ' min' : ' d';
    var hist = d.hist.map(function (h) { return [h[0], Math.max(1, Math.round(h[1] * f))]; });
    graficos.splice(0).forEach(function (g) { try { g.dispose(); } catch (e) { /* ya estaba */ } });
    var base = { textStyle: { fontFamily: 'IBM Plex Sans' }, animationDuration: 900, animationEasing: 'cubicOut' };
    var el = document.getElementById('graf-hist');
    if (el) {
      el.innerHTML = ''; var g1 = E.init(el); graficos.push(g1);
      g1.setOption(Object.assign({}, base, {
        grid: { left: 40, right: 12, top: 26, bottom: 40 },
        tooltip: { trigger: 'axis', formatter: function (p) { return p[0].value + ' casos con ' + p[0].name + ' ' + d.unidad + (p[0].name === '1' ? '' : 's'); } },
        xAxis: { type: 'category', data: hist.map(function (h) { return h[0]; }), name: d.unidad + 's hasta el informe', nameLocation: 'middle', nameGap: 26, axisTick: { show: false } },
        yAxis: { type: 'value', splitLine: { lineStyle: { color: '#EDE8F7' } } },
        series: [{ type: 'bar', barWidth: '62%', data: hist.map(function (h) { return { value: h[1], itemStyle: { color: parseInt(h[0], 10) > d.limite ? '#FF8A1F' : '#6A3DF5', borderRadius: [6, 6, 0, 0] } }; }), label: { show: true, position: 'top', color: '#3D3656', fontSize: 11 } }]
      }));
    }
    var el2 = document.getElementById('graf-etapas');
    if (el2) {
      el2.innerHTML = ''; var g2 = E.init(el2); graficos.push(g2);
      var mx = Math.max.apply(null, d.etapas.map(function (e) { return e[1]; }));
      g2.setOption(Object.assign({}, base, {
        grid: { left: 8, right: 52, top: 6, bottom: 6, containLabel: true }, tooltip: { formatter: function (p) { return p.name + ': ' + String(p.value).replace('.', ',') + u; } },
        xAxis: { type: 'value', show: false },
        yAxis: { type: 'category', inverse: true, data: d.etapas.map(function (e) { return e[0]; }), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: '#3D3656', width: 150, overflow: 'break' } },
        series: [{ type: 'bar', barWidth: 16, data: d.etapas.map(function (e) { return { value: e[1], itemStyle: { color: e[1] === mx ? '#FF8A1F' : '#A88BFF', borderRadius: 8 } }; }),
          label: { show: true, position: 'right', formatter: function (p) { return String(p.value).replace('.', ',') + u; }, color: '#1A1036', fontWeight: 600 } }]
      }));
    }
    var el3 = document.getElementById('graf-tend');
    if (el3) {
      el3.innerHTML = ''; var g3 = E.init(el3); graficos.push(g3);
      var r = azar(semilla(Q.tipo)), meses = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'];
      var vals = meses.map(function (m, i) { return Math.max(40, Math.min(100, Math.round(d.enPlazo - 8 + i * 0.7 + (r() - 0.5) * 8))); }); vals[11] = d.enPlazo;
      var ref = parseInt(d.ref, 10), serie = { type: 'line', smooth: true, data: vals, symbolSize: 7, lineStyle: { width: 3, color: '#6A3DF5' }, itemStyle: { color: '#6A3DF5' },
        areaStyle: { color: new E.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(106,61,245,0.32)' }, { offset: 1, color: 'rgba(106,61,245,0)' }]) } };
      if (!isNaN(ref)) serie.markLine = { symbol: 'none', label: { formatter: 'Referencia ' + ref + ' %', color: '#C2410C', position: 'insideEndTop' }, lineStyle: { color: '#FF8A1F', type: 'dashed', width: 2 }, data: [{ yAxis: ref }] };
      g3.setOption(Object.assign({}, base, {
        grid: { left: 44, right: 16, top: 24, bottom: 28 }, tooltip: { trigger: 'axis', formatter: function (p) { return p[0].name + ': ' + p[0].value + ' % en plazo'; } },
        xAxis: { type: 'category', data: meses, boundaryGap: false }, yAxis: { type: 'value', min: 40, max: 100, axisLabel: { formatter: '{value} %' }, splitLine: { lineStyle: { color: '#EDE8F7' } } },
        series: [serie]
      }));
    }
    alSalir(function () { graficos.splice(0).forEach(function (g) { try { g.dispose(); } catch (e) { /* ya estaba */ } }); });
  }
  window.addEventListener('resize', function () { graficos.forEach(function (g) { try { g.resize(); } catch (e) { /* ya estaba */ } }); });

  /* =====================================================================
     15 · ANIMACIONES: números que cuentan (GSAP) y festejo (Lottie)
     ===================================================================== */
  function sinMovimiento() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function contarNumeros() {
    if (!window.gsap || sinMovimiento()) return;
    document.querySelectorAll('[data-cuenta]').forEach(function (el) {
      var fin = parseFloat(el.dataset.cuenta), suf = el.dataset.suf || '', o = { v: 0 };
      if (isNaN(fin)) return;
      window.gsap.to(o, { v: fin, duration: 1.1, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) + suf; } });
    });
  }
  var LOTTIE_OK = { v: '5.7.4', fr: 30, ip: 0, op: 40, w: 120, h: 120, nm: 'listo', ddd: 0, assets: [], layers: [
    { ddd: 0, ind: 1, ty: 4, nm: 'tilde', sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } }, ao: 0,
      shapes: [{ ty: 'gr', it: [
        { ty: 'sh', ks: { a: 0, k: { i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]], v: [[-22, 2], [-6, 18], [24, -16]], c: false } } },
        { ty: 'st', c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 9 }, lc: 2, lj: 2 },
        { ty: 'tm', s: { a: 0, k: 0 }, e: { a: 1, k: [{ t: 10, s: [0], i: { x: [0.3], y: [1] }, o: { x: [0.7], y: [0] } }, { t: 26, s: [100] }] }, o: { a: 0, k: 0 }, m: 1 },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }],
      ip: 0, op: 40, st: 0, bm: 0 },
    { ddd: 0, ind: 2, ty: 4, nm: 'circulo', sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [60, 60, 0] }, a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: 0, s: [0, 0, 100], i: { x: [0.3, 0.3, 0.3], y: [1.5, 1.5, 1] }, o: { x: [0.7, 0.7, 0.7], y: [0, 0, 0] } }, { t: 14, s: [100, 100, 100] }] } }, ao: 0,
      shapes: [{ ty: 'gr', it: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] } },
        { ty: 'fl', c: { a: 0, k: [0, 0.651, 0.463, 1] }, o: { a: 0, k: 100 } },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }] }],
      ip: 0, op: 40, st: 0, bm: 0 }] };
  function festejar(caja) {
    if (sinMovimiento()) return;
    cargar('lottie').then(function () {
      var capa = null;
      if (!caja) { capa = document.createElement('div'); capa.className = 'festejo'; capa.setAttribute('aria-hidden', 'true'); document.body.appendChild(capa); caja = capa; }
      else caja.innerHTML = '';
      var anim = window.lottie.loadAnimation({ container: caja, renderer: 'svg', loop: false, autoplay: true, animationData: JSON.parse(JSON.stringify(LOTTIE_OK)) });
      if (capa) anim.addEventListener('complete', function () { setTimeout(function () { capa.classList.add('fuera'); setTimeout(function () { anim.destroy(); capa.remove(); }, 400); }, 300); });
    }).catch(function () { /* sin animación */ });
  }

  /* =====================================================================
     16 · GUARDADO EN ESTE EQUIPO (Dexie / IndexedDB)
     ===================================================================== */
  var base = null, baseLista = false, listoLocal = false, tGuardar = null;
  function instantanea() {
    return { v: 1, rec: { ingresos: S.rec.ingresos, siguiente: S.rec.siguiente }, padron: PADRON_EXTRA,
      caso: { ok: S.caso.ok, adjuntos: S.caso.adjuntos, firmado: S.caso.firmado, fechaFirma: S.caso.fechaFirma || '', informe: S.caso.informe, capturas: S.caso.capturas, valores: S.caso.valores },
      lab: { pedidos: S.lab.pedidos, chats: S.lab.chats, tecnicos: S.lab.tecnicos, semilla: S.lab.semilla }, img: { notas: S.img.notas, marcas: S.img.marcas },
      cel: { enviados: S.cel.enviados, calidad: S.cel.calidad }, agenda: S.agenda.eventos };
  }
  function aplicarInstantanea(d) {
    if (!d || d.v !== 1) return;
    if (d.padron) Object.keys(d.padron).forEach(function (k) { PADRON_EXTRA[k] = d.padron[k]; D.padron[k] = d.padron[k]; });
    if (d.rec && d.rec.ingresos) { S.rec.ingresos = d.rec.ingresos.filter(function (m) { return D.padron[m.pac]; }); S.rec.siguiente = d.rec.siguiente || S.rec.siguiente; }
    if (d.caso) Object.keys(d.caso).forEach(function (k) { if (d.caso[k] !== undefined) S.caso[k] = d.caso[k]; });
    if (d.lab) Object.keys(d.lab).forEach(function (k) { if (d.lab[k] !== undefined) S.lab[k] = d.lab[k]; });
    if (d.img) { if (d.img.notas) S.img.notas = d.img.notas; if (d.img.marcas) S.img.marcas = d.img.marcas; }
    if (d.cel) { S.cel.enviados = d.cel.enviados || []; S.cel.calidad = d.cel.calidad || {}; }
    if (d.agenda) S.agenda.eventos = d.agenda;
  }
  function guardarLocal() {
    if (!listoLocal) return;
    clearTimeout(tGuardar);
    tGuardar = setTimeout(function () {
      var datos = instantanea();
      OYENTES_GUARDAR.forEach(function (f) { try { f(datos); } catch (e) { /* la nube no respondió */ } });
      if (base && baseLista) base.estado.put({ id: 'demo', datos: JSON.stringify(datos), fecha: Date.now() }).catch(function () { /* sin espacio */ });
    }, 500);
  }
  function abrirBase() {
    return cargar('dexie').then(function () {
      base = new window.Dexie('pura-carne'); base.version(1).stores({ estado: 'id' });
      return base.estado.get('demo');
    }).then(function (r) { if (r && r.datos) aplicarInstantanea(JSON.parse(r.datos)); baseLista = true; })
      .catch(function () { base = null; });
  }
  A.borrarLocal = function (v, el) {
    if (!el.dataset.ok) { el.dataset.ok = '1'; el.textContent = 'Tocá de nuevo para borrar todo'; setTimeout(function () { delete el.dataset.ok; el.textContent = 'Borrar los datos de este equipo'; }, 4000); return; }
    listoLocal = false;
    var fin = function () { location.hash = '#/recepcion'; location.reload(); };
    if (base) base.delete().then(fin, fin); else fin();
  };

  /* ---------- Arranque ---------- */
  var VISTAS = { recepcion: vRecepcion, caso: vCaso, imagenes: vImagenes, ilustracion: vIlustracion, laboratorio: vLaboratorio, celular: vCelular, buscador: vBuscador, calidad: vCalidad, agenda: vAgenda };
  window.PC = { S: S, D: D, render: render, avisar: avisar, cargar: cargar, esc: esc, aplicar: aplicarInstantanea, instantanea: instantanea, alGuardar: function (f) { OYENTES_GUARDAR.push(f); }, visor: function () { return visor; } };
  var arranco = false;
  function arrancar() {
    pintarMenu();
    if (window.PC_INICIO && !location.hash) location.replace('#/' + window.PC_INICIO);
    var datosLocales = abrirBase().then(function () { if (arranco) render(); });
    Promise.race([datosLocales, new Promise(function (ok) { setTimeout(ok, 2500); })]).then(function () {
      arranco = true; listoLocal = true;
      var est = document.getElementById('estado-nube'); if (est && !base) est.textContent = 'Sin guardado en este navegador';
      irA();
      ['fuse', 'sortable', 'gsap', 'minisearch'].forEach(function (n) {
        cargar(n).then(function () {
          if (n === 'minisearch' && S.ruta === 'buscador') render();
          if (n === 'fuse' && S.ruta === 'recepcion' && S.rec.busqueda) render();
        }).catch(function () { /* sin conexión: hay alternativa simple */ });
      });
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.PC_URL_BASE) navigator.serviceWorker.register('sw.js').catch(function () { /* sin modo sin conexión */ });
      document.dispatchEvent(new Event('pc-lista'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar); else arrancar();
})();
