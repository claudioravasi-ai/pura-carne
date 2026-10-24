# Pura Carne · Anatomía Patológica

App para el servicio de anatomía patológica: recepción de muestras con etiqueta QR, admisión en el
laboratorio, ficha del caso, láminas reales con zoom, ilustración animada, laboratorio con QR para
técnicos, buscador con protocolos, calidad con tiempos de informe y agenda.

**Es una demo.** Los pacientes y los números son inventados (`js/datos.js`). Lo que cargues queda
guardado **solo en este equipo** (ver "Tus datos" más abajo). No cargar datos reales de pacientes
hasta tener la versión con usuarios (Firebase) en marcha.

## Probarla en Safari (sin instalar nada)

Doble clic en `index.html`. Se abre en Safari y funciona entera. Con internet carga las letras,
los QR reales, las láminas y las herramientas; sin internet anda igual con lo básico.

La **cámara en vivo** para leer QR funciona con la app publicada (dirección `https://`). Abierta con
doble clic, usá **Sacar una foto de la etiqueta**: hace lo mismo.

## El circuito de una muestra

1. **Secretaría** (Recepción › **Nuevo ingreso**): tocá **Leer la orden médica con la cámara**.
   La app copia de la orden el paciente, el DNI, la fecha de nacimiento, la cobertura, el material,
   el médico y el servicio. Si el paciente ya existe, lo elige solo; si no, abre **Paciente nuevo**
   con los datos completados para revisar. También se puede buscar a mano (encuentra aunque esté
   mal escrito).
2. Seguí los pasos: material, control de recepción y confirmar. Se crea el protocolo y la
   **etiqueta de 4 × 4 cm**: QR de 2,2 cm y, escritos, protocolo, apellido y nombre, DNI (últimos 3
   números), edad, sexo, material, fecha y número de frasco. **Imprimir la etiqueta** saca una por
   frasco, del tamaño exacto, para pegar en cada frasco.
3. La muestra queda **"Falta admitir"**. **Los técnicos** tocan **Leer etiqueta** y leen el QR del
   frasco con la cámara, con una foto o con la lectora USB. Aparece el paciente con todos sus
   datos y el botón **Admitir en el laboratorio**.
4. Al admitirla, pasa sola al tablero de **Laboratorio** (columna "Pedido") para macroscopía.
   Después siguen los cortes y las tinciones.
5. **El médico** ve los vidrios en **Imágenes**, completa el **informe** y lo firma en la
   **Ficha del caso**.

Si alguien lee una etiqueta falsa o que no coincide con la muestra registrada, la app avisa.

## Qué hace cada pantalla

- **Recepción**: muestras del día, filtros, búsqueda tolerante a errores, nuevo ingreso con lectura
  de la orden, paciente nuevo, etiqueta de 4 × 4 cm, lectura de etiquetas y admisión.
- **Ficha del caso**: datos del paciente, recorrido de la muestra, tacos y vidrios, protocolo CAP
  para tildar y **Redacción del informe**: editor con plantilla de biopsia core de mama (ICCR y
  CAP), botones de formato, **Dictar** (por voz) y **Volver a la plantilla**. Botones para
  **Descargar el informe en PDF** (sale como borrador hasta firmar; incluye las capturas y un
  código de verificación) y **Exportar para el hospital (FHIR)**.
- **Imágenes y video**: 5 láminas reales escaneadas con zoom (minimapa, aumento, escala en µm,
  girar, pantalla completa, marcar puntos con nota). **Contar positivos** cuenta los núcleos
  marrones y azules de lo que se ve (orientativo, para Ki-67, RE o RP; conviene 20x o más) y pasa el
  porcentaje al informe. **Dibujar y medir** abre un editor para poner flechas, círculos,
  recuadros, texto y la regla, que en láminas mide en micrones. **Capturar para el informe** guarda
  la vista para el PDF. También se pueden subir fotos propias y recorrerlas con zoom.
- **Ilustración animada**: dibujos animados de hallazgos (extravasación, hemocateresis,
  petequias, trombo, carcinoma), para adjuntar o descargar.
- **Laboratorio**: QR para que los técnicos entren desde el celular, tablero de pedidos (se pueden
  **arrastrar** entre columnas) y chat por pedido.
- **Celular del técnico**: lo que ve el técnico al leer el QR; carga cada vidrio y lo envía.
- **Buscador diagnóstico**: busca a la vez en casos anteriores, en los **194 protocolos** (ICCR en
  español, ICCR y CAP) y en los diferenciales; los criterios marcados reordenan los diferenciales.
  Abierta con doble clic, cada protocolo abre el PDF de tu carpeta; publicada, abre la página
  oficial.
- **Calidad y estadísticas**: tiempos desde el ingreso hasta el informe final, en qué paso se va el
  tiempo, evolución de 12 meses y comparación con referencias internacionales (gráficos
  interactivos). Exporta una planilla.
- **Agenda**: ateneos, turnos de macroscopía, intraoperatorias y entregas. Tocá o arrastrá sobre un
  horario libre para agendar; arrastrá un evento para moverlo; tocá uno para verlo o borrarlo.

La app se puede **instalar** en el celular (Safari › Compartir › Agregar a inicio) y sigue
funcionando sin internet con lo que ya se abrió.

## Tus datos y la privacidad

- **Dónde se guarda**: en modo prueba, todo queda en este equipo y navegador (IndexedDB). No viaja a
  ningún servidor. El botón **Borrar los datos de este equipo** (abajo en el menú; hay que tocarlo
  dos veces) lo borra todo y vuelve a la demo inicial.
- **Las fotos subidas** se ven solo mientras la página está abierta; no se guardan ni se suben.
  Las capturas y los dibujos que se guardan en el caso quedan en este equipo.
- **La etiqueta**: el QR lleva solo un código (protocolo y un control), nunca el nombre, el DNI ni la
  historia clínica. En la etiqueta van escritos el nombre y los últimos 3 números del DNI. El DNI
  completo queda solo en la ficha del paciente.
- **Lectura de la orden**: se hace dentro del navegador; la foto no se sube a ningún lado. La
  primera vez se baja el diccionario de castellano.
- **Dictado**: lo hace el navegador. **Safari y Chrome pueden mandar el audio a Apple o a Google**
  para pasarlo a texto. Por eso, no dictar nombres, DNI ni otros datos que identifiquen al paciente.
- **Servicios externos** que la app usa sin mandar datos de pacientes: librerías (cdnjs, jsDelivr,
  esm.sh, Google Fonts, Workbox), las láminas de ejemplo de OpenSlide y, al buscar, PubMed con las
  palabras escritas.
- **Con Firebase conectado**: hay que entrar con usuario y contraseña; solo ven los datos los
  usuarios dados de alta en el servicio; cada ingreso queda anotado y ese registro no se puede
  borrar. Los datos se guardan en los servidores de Google (fuera de Argentina): antes de usarlo con
  pacientes reales hace falta el registro de la base en la AAIP, el consentimiento informado y un
  acuerdo con Google sobre los datos de salud.

## Publicarla (igual que las otras apps)

Orden: **Firebase → Apps Script → GitHub**. Para ver la app en internet alcanza con GitHub; Firebase
hace falta recién cuando quieras usuarios y datos compartidos (ver "Conectar con Firebase").

### GitHub: la app en internet
1. Doble clic en **3 - Preparar carpeta para GitHub**: arma en el Escritorio la carpeta
   **SUBIR A GITHUB - Pura Carne** (sin `protocolos`, que tiene derechos de autor) y abre GitHub.
2. La primera vez: **New** › nombre **pura-carne** › **Public** (hace falta para publicarla gratis;
   no tiene datos reales) › **Create repository** › enlace **uploading an existing file**.
   Las siguientes: el repositorio › **Add file › Upload files**.
3. Seleccioná **todo lo de adentro** de la carpeta del Escritorio (Cmd + A), arrastralo a la página
   y tocá **Commit changes**.
4. Solo la primera vez: **Settings › Pages › Branch: main**, carpeta **/ (root)** › **Save**.
   En 1 o 2 minutos queda en `https://TU-USUARIO.github.io/pura-carne/`.

### Apps Script (opcional)
Doble clic en **2 - Preparar Apps Script**: abre script.google.com y te deja copiado cada archivo
(`Código.gs` e `Index`) para pegar, uno por vez.

### Otra forma: Firebase Hosting
Si preferís que la dirección sea `https://pura-carne.web.app`, doble clic en
**1 - Publicar en Firebase** (la primera vez pide la contraseña de la Mac y la cuenta de Google).

## Conectar con Firebase (usuarios y datos en vivo)

1. En el proyecto de Firebase: **Compilación › Authentication › Comenzar › Correo electrónico/
   contraseña › Habilitar**. En **Usuarios › Agregar usuario**, creá uno por persona del servicio.
2. **Compilación › Firestore Database › Crear base de datos** (ubicación `southamerica-east1`,
   San Pablo, la más cercana).
3. **Reglas**: abrí `reglas-firestore.txt`, copiá lo que está entre "PEGAR DESDE ACÁ" y "HASTA
   ACÁ", pegalo en Firestore › Reglas y tocá **Publicar**.
4. Dar de alta a cada usuario en el servicio: Firestore › **Iniciar colección** `servicios` ›
   documento `principal` › subcolección `usuarios` › documento con el **UID** del usuario (está en
   Authentication › Usuarios) y un campo `rol` (`patologo`, `tecnico` o `secretaria`).
5. **Configuración del proyecto › Tus apps › Web (</>)**: registrá la app y copiá los datos de
   `firebaseConfig` en `firebase-config.js`, en el lugar de `null`.
6. Volvé a subir la app a GitHub (doble clic en **3 - Preparar carpeta para GitHub** y arrastrar). Al abrirla pide usuario y contraseña, y lo que carga
   uno lo ven los demás al instante.

## Antes de usarla con pacientes reales

- Firebase conectado, con un usuario por persona y permisos por rol.
- Fotos y láminas en almacenamiento privado (Firebase Storage con reglas), nunca en enlaces públicos.
- Registro de la base de datos en la AAIP, consentimiento informado y acuerdo con Google.
- Láminas propias convertidas a teselas Deep Zoom (por ejemplo con `vips dzsave`).
- Conexión con el sistema del hospital por HL7 FHIR (el botón **Exportar para el hospital** ya
  arma el archivo en ese formato).

## Créditos y licencias

- Láminas de ejemplo: proyecto OpenSlide (Carnegie Mellon, Radboud UMC), CC0 o de libre
  distribución. No son de pacientes de esta demo.
- Protocolos: ICCR (uso libre para informar, enseñar e investigar sin fines comerciales, sin
  cambiar el contenido) y CAP (uso libre para informar). Quedan en `protocolos/`, fuera de GitHub y
  de la web publicada.
- Librerías: OpenSeadragon, qrcode-generator, node-qrcode, html5-qrcode, jsQR, Tesseract.js,
  Fabric.js, GSAP, Lottie, SortableJS, Fuse.js, MiniSearch, jsPDF, TipTap, ECharts, Dexie,
  Workbox, FullCalendar y Firebase, cada una con su licencia abierta.

## Qué hay en la carpeta

| Archivo | Qué es |
|---|---|
| `index.html` | La página |
| `css/estilos.css` | Colores, letras y animaciones |
| `js/datos.js` | Datos de demostración (inventados) |
| `js/protocolos.js` | Lista de los 194 protocolos para el buscador |
| `js/app.js` | Toda la app: pantallas y botones |
| `js/nube.js` | Conexión con Firebase (se activa con `firebase-config.js`) |
| `firebase-config.js` | Configuración de Firebase (vacía = modo prueba) |
| `reglas-firestore.txt` | Reglas de seguridad para pegar en Firestore |
| `sw.js`, `manifest.webmanifest` | Funcionar sin internet e instalarla en el celular |
| `img/` | Logo e íconos |
| `firebase.json` | Configuración de Firebase Hosting |
| `apps-script/` | Versión para Google Apps Script |
| `armar-apps-script.py` | Rearma la versión de Apps Script |
| `1 - Publicar en Firebase.command` | Doble clic: publica la app |
| `2 - Preparar Apps Script.command` | Doble clic: copia los archivos para Apps Script |
| `3 - Preparar carpeta para GitHub.command` | Doble clic: arma la carpeta para GitHub |
| `protocolos/` | Los PDF del ICCR y la lista del CAP (no se suben) |
