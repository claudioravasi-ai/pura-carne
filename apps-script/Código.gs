/**
 * Pura Carne en Google Apps Script.
 * Sirve la app (archivo Index) como página web.
 * Con ?vista=celular&c=CODIGO abre directo la pantalla del técnico (es lo que trae el QR).
 */
var VISTAS = ['recepcion', 'caso', 'imagenes', 'ilustracion', 'laboratorio', 'celular', 'buscador', 'calidad'];

function doGet(e) {
  var p = (e && e.parameter) || {};
  var vista = VISTAS.indexOf(p.vista) >= 0 ? p.vista : '';
  var codigo = /^PC-[A-Z0-9]{6}$/.test(p.c || '') ? p.c : '';
  var t = HtmlService.createTemplateFromFile('Index');
  t.url = ScriptApp.getService().getUrl();
  t.inicio = vista ? vista + (codigo ? '?c=' + codigo : '') : '';
  return t.evaluate()
    .setTitle('Pura Carne · Anatomía Patológica')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
