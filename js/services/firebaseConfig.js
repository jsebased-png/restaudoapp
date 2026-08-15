/**
 * Configuración centralizada de Firebase (js/services/firebaseConfig.js)
 * Conexión oficial a Firebase Realtime Database y Firebase Authentication.
 */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDummyKeyForLaboratoryOnly", // Reemplazar con tu Web API Key de Firebase Console si usas Auth directa
  authDomain: "stock-flow-a8907.firebaseapp.com",
  databaseURL: "https://restaudo-default-rtdb.firebaseio.com/",
  projectId: "stock-flow-a8907",
  storageBucket: "stock-flow-a8907.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

export const FIREBASE_RTDB_MENU_URL = `${FIREBASE_CONFIG.databaseURL}/menu.json`;
