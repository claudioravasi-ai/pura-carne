/* Configuración de Firebase para Pura Carne.

   Mientras quede en null, la app funciona en MODO PRUEBA: todo queda guardado solo en este
   equipo y no se comparte con nadie.

   Para conectarla (los pasos están en LEEME.md, "Conectar con Firebase"):
   Firebase › rueda dentada › Configuración del proyecto › Tus apps › Web (</>) ›
   copiá los datos de "firebaseConfig" en el lugar de null, así:

   window.PC_FIREBASE = {
     apiKey: 'AIza…',
     authDomain: 'pura-carne-demo.firebaseapp.com',
     projectId: 'pura-carne-demo',
     appId: '1:…:web:…',
     servicio: 'principal'
   };

   Estos datos no son secretos (identifican el proyecto); lo que protege la información son
   las reglas de reglas-firestore.txt y los usuarios con contraseña. */
window.PC_FIREBASE = null;
