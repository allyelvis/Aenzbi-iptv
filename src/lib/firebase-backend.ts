import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import fs from "fs";
import path from "path";

let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    console.log("[Firebase Backend] Loaded config successfully from firebase-applet-config.json");
  } else {
    console.warn("[Firebase Backend] firebase-applet-config.json not found, attempting fallbacks");
  }
} catch (err) {
  console.error("[Firebase Backend] Error reading firebase-applet-config.json:", err);
}

if (!firebaseConfig) {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "studio-9253894531-2941f",
    appId: process.env.FIREBASE_APP_ID || "",
    apiKey: process.env.FIREBASE_API_KEY || "",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "studio-9253894531-2941f.firebaseapp.com",
    firestoreDatabaseId: process.env.FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-aenzbiiptv-e7cab222-505d-468b-b283-c1d1aee64558",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "studio-9253894531-2941f.firebasestorage.app",
  };
}

const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore with the specific databaseId if provided
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || "(default)");

const storage = getStorage(firebaseApp);

export { firebaseApp, db, storage, firebaseConfig };
