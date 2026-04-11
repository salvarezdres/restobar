'use client'

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

import styles from "@/components/workspace.module.css";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/auth";

function mapAccessError(message: string) {
  if (message.includes("auth/popup-closed-by-user")) {
    return "Cerraste la ventana de acceso antes de completar el inicio de sesion.";
  }

  if (message.includes("auth/popup-blocked")) {
    return "El navegador bloqueo la ventana de acceso. Habilitala e intenta otra vez.";
  }

  if (message.includes("auth/account-exists-with-different-credential")) {
    return "Esa cuenta ya existe con otro metodo de acceso.";
  }

  if (message.includes("auth/unauthorized-domain")) {
    return "Este dominio no esta habilitado para iniciar sesion.";
  }

  return "No se pudo iniciar sesion. Intenta nuevamente.";
}

export default function AuthCard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useFirebaseSession({
    onAuthenticated: () => {
      router.replace("/dashboard");
    },
  });

  const handleSignIn = () => {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();

    setError(null);
    setIsLoading(true);

    void signInWithPopup(auth, provider)
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((loginError: unknown) => {
        setError(
          loginError instanceof Error
            ? mapAccessError(loginError.message)
            : "No se pudo iniciar sesion. Intenta nuevamente.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className={styles.page}>
      <div
        style={{
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
        }}
      >
        <section
          className={styles.panel}
          style={{ width: "min(100%, 440px)", padding: "24px" }}
        >
          <div className={styles.stack}>
            <span className={styles.eyebrow}>Kitchen OS</span>
            <h1 className={styles.pageTitle}>Acceso</h1>
            <p className={styles.pageDescription}>
              Entra al panel para gestionar recetas, menus, costos y equipo.
            </p>
            <button
              className={styles.primaryButton}
              disabled={isLoading || Boolean(user)}
              onClick={handleSignIn}
              type="button"
            >
              {isLoading ? "Conectando..." : "Continuar"}
            </button>
            {error ? <p className={styles.errorText}>{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
