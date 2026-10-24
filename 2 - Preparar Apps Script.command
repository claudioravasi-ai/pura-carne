#!/bin/bash
# Pura Carne — preparar Apps Script con doble clic.
# Rearma el archivo Index.html y te deja copiado cada archivo para pegarlo en script.google.com.

cd "$(dirname "$0")" || exit 1
clear
echo "=============================================="
echo "   Pura Carne en Google Apps Script"
echo "=============================================="
echo
python3 armar-apps-script.py >/dev/null || { echo "No se pudo armar el archivo. Mandale a Claude una foto de esta ventana."; read -r -p "Apretá Enter para cerrar…" _; exit 1; }

echo "Se abre script.google.com en Safari."
echo "Si es la primera vez: tocá \"Nuevo proyecto\" y ponele de nombre Pura Carne."
echo "Si ya lo tenés: abrí el proyecto Pura Carne."
open "https://script.google.com/home"
echo
read -r -p "Cuando lo tengas abierto, apretá Enter acá…" _

pbcopy < "apps-script/Código.gs"
echo
echo "ARCHIVO 1 de 2 · Código.gs  (YA ESTÁ COPIADO)"
echo "  1. En Apps Script, a la izquierda, tocá el archivo Código.gs."
echo "  2. Borrá todo lo que tiene (Cmd + A y después Borrar)."
echo "  3. Pegá con Cmd + V."
echo "  4. Guardá con Cmd + S."
echo
read -r -p "Cuando termines, apretá Enter acá…" _

pbcopy < "apps-script/Index.html"
echo
echo "ARCHIVO 2 de 2 · Index  (YA ESTÁ COPIADO)"
echo "  1. Si es la primera vez: tocá el + al lado de \"Archivos\" › HTML › escribí Index › Enter."
echo "     Si ya existe: tocá el archivo Index."
echo "  2. Borrá todo lo que tiene (Cmd + A y después Borrar)."
echo "  3. Pegá con Cmd + V (es largo, tarda un segundo)."
echo "  4. Guardá con Cmd + S."
echo
read -r -p "Cuando termines, apretá Enter acá…" _

echo
echo "ÚLTIMO PASO · Publicar"
echo "  La PRIMERA vez:"
echo "    Implementar › Nueva implementación › rueda dentada › Aplicación web"
echo "    Ejecutar como: Yo  ·  Quién tiene acceso: Solo yo  ›  Implementar"
echo "    (acepta los permisos que te pida) y copiá el enlace que termina en /exec."
echo "  Las VECES SIGUIENTES (para no cambiar la dirección):"
echo "    Implementar › Administrar implementaciones › lápiz › Versión: Nueva versión › Implementar"
echo
echo "Listo."
read -r -p "Apretá Enter para cerrar…" _
