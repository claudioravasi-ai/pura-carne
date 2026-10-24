#!/usr/bin/env python3
"""Arma la versión de Pura Carne para Google Apps Script.

Apps Script no sirve carpetas: necesita un solo archivo HTML. Este script junta
index.html, el CSS y los JS en apps-script/Index.html. Correrlo cada vez que se
cambie la app:

    python3 armar-apps-script.py
"""
from pathlib import Path

raiz = Path(__file__).resolve().parent
html = (raiz / 'index.html').read_text(encoding='utf-8')
css = (raiz / 'css' / 'estilos.css').read_text(encoding='utf-8')
datos = (raiz / 'js' / 'datos.js').read_text(encoding='utf-8')
app = (raiz / 'js' / 'app.js').read_text(encoding='utf-8')
protocolos = (raiz / 'js' / 'protocolos.js').read_text(encoding='utf-8')
config = (raiz / 'firebase-config.js').read_text(encoding='utf-8')
nube = (raiz / 'js' / 'nube.js').read_text(encoding='utf-8')
logo = (raiz / 'img' / 'logo.svg').read_text(encoding='utf-8').strip()


def reemplazar(texto, viejo, nuevo):
    if viejo not in texto:
        raise SystemExit('No encontré en index.html: ' + viejo)
    return texto.replace(viejo, nuevo)


html = reemplazar(html, '<link rel="stylesheet" href="css/estilos.css">', '<style>\n' + css + '\n</style>')
html = reemplazar(html, '<link rel="icon" type="image/svg+xml" href="img/logo.svg">\n', '')
# La dirección pública y la pantalla inicial las completa Código.gs al servir la página.
html = reemplazar(html, '<script src="js/datos.js"></script>',
                  '<script>window.PC_URL_BASE = <?= url ?>; window.PC_INICIO = <?= inicio ?>;</script>\n'
                  '<script>\n' + datos + '\n</script>')
html = reemplazar(html, '<script src="js/protocolos.js"></script>', '<script>\n' + protocolos + '\n</script>')
html = reemplazar(html, '<script src="js/app.js"></script>', '<script>\n' + app + '\n</script>')
html = reemplazar(html, '<script src="firebase-config.js"></script>', '<script>\n' + config + '\n</script>')
html = reemplazar(html, '<script src="js/nube.js"></script>', '<script>\n' + nube + '\n</script>')
# En Apps Script no hay manifiesto ni ícono propio
html = html.replace('<link rel="manifest" href="manifest.webmanifest">\n', '').replace('<link rel="apple-touch-icon" href="img/icono-180.png">\n', '')
# Las expresiones <?= ?> de Apps Script escapan el texto: usamos valores JSON ya seguros.
html = html.replace('<?= url ?>', '<?!= JSON.stringify(url) ?>').replace('<?= inicio ?>', '<?!= JSON.stringify(inicio) ?>')

destino = raiz / 'apps-script' / 'Index.html'
destino.parent.mkdir(exist_ok=True)
destino.write_text(html, encoding='utf-8')
print('Listo:', destino, f'({len(html) // 1024} KB)')
