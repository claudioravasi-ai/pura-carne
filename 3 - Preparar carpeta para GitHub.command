#!/bin/bash
# Pura Carne — armar la carpeta para subir a GitHub con doble clic.
# Copia SOLO los archivos de la app guardados en git. Nunca copia la carpeta protocolos
# (tiene derechos de autor) ni archivos ocultos.

cd "$(dirname "$0")" || exit 1
clear
DESTINO="$HOME/Desktop/SUBIR A GITHUB - Pura Carne"
echo "=============================================="
echo "   Pura Carne · carpeta para GitHub"
echo "=============================================="
echo
rm -rf "$DESTINO"
mkdir -p "$DESTINO"
git archive HEAD | tar -x -C "$DESTINO" || { echo "No se pudo armar la carpeta. Mandale a Claude una foto de esta ventana."; read -r -p "Apretá Enter para cerrar…" _; exit 1; }
rm -f "$DESTINO/.gitignore"
if [ -d "$DESTINO/protocolos" ]; then rm -rf "$DESTINO/protocolos"; fi
echo "Listo: en el Escritorio quedó la carpeta \"SUBIR A GITHUB - Pura Carne\"."
echo
echo "Ahora:"
echo "  1. Se abre github.com en Safari."
echo "     Si es la primera vez: tocá New (Nuevo), nombre pura-carne, elegí Public y tocá Create repository."
echo "     (Public hace falta para que GitHub la publique gratis. No tiene datos reales: los pacientes son inventados.)"
echo "     Después tocá el enlace \"uploading an existing file\"."
echo "     Si ya lo tenés: entrá a pura-carne › Add file › Upload files."
echo "  2. Abrí la carpeta del Escritorio, seleccioná TODO lo de adentro (Cmd + A)"
echo "     y arrastralo a la página de GitHub. (El contenido, no la carpeta.)"
echo "  3. Esperá que suban todos y tocá Commit changes (el botón verde de abajo)."
echo "  4. Solo la primera vez: Settings › Pages › Branch: main y carpeta / (root) › Save."
echo "     En 1 o 2 minutos la app queda en https://TU-USUARIO.github.io/pura-carne/"
echo
open "$DESTINO"
open "https://github.com/new"
read -r -p "Apretá Enter para cerrar…" _
