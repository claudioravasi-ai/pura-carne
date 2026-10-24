/* Pura Carne — sincronización con Firebase (opcional).
   Mientras firebase-config.js tenga PC_FIREBASE = null, este archivo no hace nada y la app
   funciona en modo prueba, guardando solo en este equipo.
   Con la configuración puesta: pide usuario y contraseña, y comparte en vivo el estado del
   servicio (ingresos, pedidos del laboratorio, chat, agenda) entre la computadora y los celulares. */
(function () {
  'use strict';
  var cfg = window.PC_FIREBASE;
  if (!cfg || !cfg.apiKey) return;
  var V = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var servicio = cfg.servicio || 'principal';
  var ultimoRemoto = '', ultimoEnviado = '', tEnvio = null, usuario = null;

  function estado(t) { var el = document.getElementById('estado-nube'); if (el) el.textContent = t; }
  function esc(t) { return window.PC.esc(t); }

  function pantallaIngreso(error) {
    var caja = document.getElementById('ingreso-nube');
    if (!caja) { caja = document.createElement('div'); caja.id = 'ingreso-nube'; caja.className = 'modal'; document.body.appendChild(caja); }
    caja.innerHTML = '<form class="modal-caja ingreso" aria-labelledby="t-ing"><h2 id="t-ing">Ingresar a Pura Carne</h2>' +
      '<p class="chico gris">Cada persona del servicio tiene su usuario. Los crea la administración en Firebase.</p>' +
      '<div class="campo"><label for="ing-mail">Correo</label><input id="ing-mail" class="entrada" type="email" autocomplete="username" required></div>' +
      '<div class="campo"><label for="ing-clave">Contraseña</label><input id="ing-clave" class="entrada" type="password" autocomplete="current-password" required></div>' +
      (error ? '<p class="aviso ambar" role="alert">' + esc(error) + '</p>' : '') +
      '<button type="submit" class="btn pri ancho">Entrar</button>' +
      '<button type="button" class="link" id="ing-olvido">Me olvidé la contraseña</button></form>';
    var form = caja.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var mail = form.querySelector('#ing-mail').value.trim(), clave = form.querySelector('#ing-clave').value;
      firebase.auth().signInWithEmailAndPassword(mail, clave).catch(function () { pantallaIngreso('El correo o la contraseña no coinciden.'); });
    });
    form.querySelector('#ing-olvido').addEventListener('click', function () {
      var mail = form.querySelector('#ing-mail').value.trim();
      if (!mail) { pantallaIngreso('Escribí tu correo y tocá de nuevo “Me olvidé la contraseña”.'); return; }
      firebase.auth().sendPasswordResetEmail(mail).then(function () { pantallaIngreso('Te mandamos un correo para cambiar la contraseña.'); }, function () { pantallaIngreso('No se pudo mandar el correo.'); });
    });
    setTimeout(function () { var m = document.getElementById('ing-mail'); if (m) m.focus(); }, 50);
  }
  function sacarIngreso() { var caja = document.getElementById('ingreso-nube'); if (caja) caja.remove(); }

  /* Lo que viaja a la nube: todo menos las imágenes, que pesan y van a Storage en una etapa siguiente. */
  function paraNube(datos) {
    var copia = JSON.parse(JSON.stringify(datos));
    if (copia.caso) delete copia.caso.capturas;
    return JSON.stringify(copia);
  }

  function conectar(db) {
    var raiz = db.collection('servicios').doc(servicio);
    var doc = raiz.collection('estado').doc('actual');
    raiz.collection('accesos').add({ uid: usuario.uid, correo: usuario.email || '', que: 'ingreso', cuando: firebase.firestore.FieldValue.serverTimestamp() }).catch(function () { /* registro opcional */ });
    doc.onSnapshot(function (snap) {
      if (!snap.exists || snap.metadata.hasPendingWrites) return;
      var d = snap.data();
      if (!d || !d.datos || d.datos === ultimoEnviado || d.datos === ultimoRemoto) return;
      ultimoRemoto = d.datos;
      try { window.PC.aplicar(JSON.parse(d.datos)); window.PC.render(); } catch (e) { /* dato roto: se ignora */ }
      estado('En vivo · actualizado ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    }, function () { estado('Sin permiso en la nube: pedí que te den de alta en el servicio'); });
    window.PC.alGuardar(function (datos) {
      var texto = paraNube(datos);
      if (texto === ultimoRemoto || texto === ultimoEnviado) return;
      clearTimeout(tEnvio);
      tEnvio = setTimeout(function () {
        if (texto.length > 900000) { estado('Hay demasiados datos para la nube'); return; }
        ultimoEnviado = texto;
        doc.set({ datos: texto, autor: usuario.uid, cuando: firebase.firestore.FieldValue.serverTimestamp() })
          .then(function () { estado('En vivo · guardado en la nube'); }, function () { estado('No se pudo guardar en la nube'); });
      }, 800);
    });
    estado('En vivo · conectado');
  }

  function iniciar() {
    estado('Conectando con la nube…');
    var PC = window.PC;
    PC.cargar(V + 'firebase-app-compat.js').then(function () {
      return Promise.all([PC.cargar(V + 'firebase-auth-compat.js'), PC.cargar(V + 'firebase-firestore-compat.js')]);
    }).then(function () {
      firebase.initializeApp(cfg);
      var db = firebase.firestore(), conectado = false;
      firebase.auth().onAuthStateChanged(function (u) {
        if (!u) { usuario = null; estado('Falta ingresar'); pantallaIngreso(); return; }
        usuario = u; sacarIngreso();
        if (!conectado) { conectado = true; conectar(db); }
      });
    }).catch(function () { estado('Sin conexión con la nube: se guarda en este equipo'); });
  }
  if (window.PC) document.addEventListener('pc-lista', iniciar, { once: true });
  else document.addEventListener('DOMContentLoaded', function () { document.addEventListener('pc-lista', iniciar, { once: true }); });
})();
