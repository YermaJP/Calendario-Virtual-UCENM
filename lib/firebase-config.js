// ============================================================
// UCENM — Configuración de Firebase
// ============================================================
// 1. Vaya a https://console.firebase.google.com/ y cree un proyecto.
// 2. Dentro del proyecto: ⚙️ Configuración del proyecto → General →
//    "Tus apps" → ícono </> (Web) → registre la app.
// 3. Copie el objeto "firebaseConfig" que le muestra y péguelo abajo,
//    reemplazando los valores de ejemplo.
// ============================================================
(function () {
  "use strict";

  var firebaseConfig = {
    apiKey: "AIzaSyAaylzasBMynKrtKnT-C9zKW3qG01Lh8yI",
    authDomain: "calendario-virtual-ucenm-2026.firebaseapp.com",
    projectId: "calendario-virtual-ucenm-2026",
    storageBucket: "calendario-virtual-ucenm-2026.firebasestorage.app",
    messagingSenderId: "615684998713",
    appId: "1:615684998713:web:3126dfb1d270980db1afe8",
  };

  if (!window.firebase) {
    console.error("UCENM: el SDK de Firebase no cargó. Revise los <script> en index.html o su conexión a internet.");
    return;
  }

  firebase.initializeApp(firebaseConfig);

  window.UCENM_FIREBASE = {
    db: firebase.firestore(),
    auth: firebase.auth(),
  };
})();
