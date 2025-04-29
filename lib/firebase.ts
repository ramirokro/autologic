import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Verificar que tenemos todas las variables de entorno necesarias
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Imprimir en la consola para depuración (sin mostrar valores completos)
console.log(`Firebase API Key: ${apiKey ? "configurada" : "falta"}`);
console.log(`Firebase Project ID: ${projectId ? "configurado" : "falta"}`);
console.log(`Firebase App ID: ${appId ? "configurado" : "falta"}`);

// Configuración de Firebase
const firebaseConfig = {
  apiKey,
  authDomain: projectId ? `${projectId}.firebaseapp.com` : "",
  projectId,
  storageBucket: projectId ? `${projectId}.appspot.com` : "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId,
};

// Inicializar Firebase con manejo de errores
let app;
let auth;
let db;
let storage;

try {
  // Inicializar la app
  app = initializeApp(firebaseConfig);
  
  // Inicializar autenticación
  auth = getAuth(app);
  
  // Inicializar Firestore
  db = getFirestore(app);
  
  // Inicializar Storage
  storage = getStorage(app);
  
  // Usar emuladores en desarrollo si está configurado
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true") {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Firebase emulators conectados");
  }
  
  console.log("Firebase inicializado correctamente");
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  
  // Crear una instancia vacía en caso de error para evitar que la app se rompa
  if (!app) app = {} as any;
  if (!auth) auth = {} as any;
  if (!db) db = {} as any;
  if (!storage) storage = {} as any;
}

export { app, auth, db, storage };
export default app;