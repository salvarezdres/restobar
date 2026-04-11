import {
  browserLocalPersistence,
  GoogleAuthProvider,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";

let authInstance: Auth | null = null;
let googleProviderInstance: GoogleAuthProvider | null = null;

function ensureBrowser() {
  if (typeof window === "undefined") {
    throw new Error("El modulo de acceso solo puede inicializarse en el navegador.");
  }
}

export function getFirebaseAuth() {
  ensureBrowser();

  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
    void setPersistence(authInstance, browserLocalPersistence);
  }

  return authInstance;
}

export function getGoogleProvider() {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({
      prompt: "select_account",
    });
  }

  return googleProviderInstance;
}
