#!/bin/bash
# Pura Carne — publicar la app en Firebase con doble clic.
# Sube solo lo que la app necesita (index.html, css, js, img, sw.js, manifest y firebase-config.js).
# No sube los protocolos, el Apps Script, el manual ni estos archivos de doble clic.

cd "$(dirname "$0")" || exit 1
clear
echo "=============================================="
echo "   Publicar Pura Carne en Firebase"
echo "=============================================="
echo

# 1. La herramienta de Firebase (solo la primera vez)
if ! command -v firebase >/dev/null 2>&1; then
  echo "PASO 1 · Instalo la herramienta de Firebase (solo esta vez)."
  echo "Te va a pedir la contraseña de esta Mac."
  echo "Al escribirla NO se ve nada, ni puntitos: es normal. Escribila y apretá Enter."
  echo
  curl -sL https://firebase.tools | bash
  if ! command -v firebase >/dev/null 2>&1; then
    echo
    echo "No se pudo instalar. Revisá la conexión a internet y volvé a hacer doble clic."
    read -r -p "Apretá Enter para cerrar…" _
    exit 1
  fi
  echo
fi

# 2. Entrar con la cuenta de Google (solo la primera vez)
if ! firebase projects:list >/dev/null 2>&1; then
  echo "PASO 2 · Ahora se abre Safari para que entres con tu cuenta de Google."
  echo "Si acá abajo pregunta \"Allow Firebase to collect CLI usage…?\", escribí  n  y apretá Enter."
  echo "En Safari elegí tu cuenta y tocá Permitir. Después volvé a esta ventana."
  echo
  firebase login
  echo
fi

# 3. Qué proyecto usar (solo la primera vez; queda guardado)
if [ ! -f .firebaserc ]; then
  echo "PASO 3 · Estos son tus proyectos de Firebase:"
  echo
  firebase projects:list
  echo
  echo "Copiá el \"Project ID\" de Pura Carne (por ejemplo pura-carne) y escribilo acá."
  read -r -p "Project ID: " PROYECTO
  PROYECTO="$(echo "$PROYECTO" | tr -d '[:space:]')"
  if [ -z "$PROYECTO" ]; then echo "No escribiste nada. Volvé a hacer doble clic."; read -r -p "Apretá Enter para cerrar…" _; exit 1; fi
  printf '{\n  "projects": {\n    "default": "%s"\n  }\n}\n' "$PROYECTO" > .firebaserc
  echo
fi

# 4. Subir
echo "PASO 4 · Subo la app…"
echo
if firebase deploy --only hosting; then
  PROYECTO="$(sed -n 's/.*"default": *"\([^"]*\)".*/\1/p' .firebaserc)"
  echo
  echo "=============================================="
  echo "   LISTO. Tu app está en:"
  echo "   https://$PROYECTO.web.app"
  echo "=============================================="
  open "https://$PROYECTO.web.app"
else
  echo
  echo "Algo falló. Mandale a Claude una foto de esta ventana."
fi
echo
read -r -p "Apretá Enter para cerrar…" _
