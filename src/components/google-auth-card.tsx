'use client'

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth, googleProvider } from "@/lib/auth";
import styles from "@/app/page.module.css";

function formatUserName(user: User) {
  return user.displayName ?? user.email ?? "Usuario autenticado";
}

export default function GoogleAuthCard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingLabel, setPendingLabel] = useState<"login" | "logout" | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        router.replace("/dashboard");
      }
    });

    return unsubscribe;
  }, [router]);

  const handleGoogleLogin = () => {
    setError(null);
    setIsLoading(true);
    setPendingLabel("login");

    void signInWithPopup(auth, googleProvider)
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((authError: unknown) => {
        setError(
          authError instanceof Error
            ? authError.message
            : "No se pudo iniciar sesion con Google.",
        );
      })
      .finally(() => {
        setPendingLabel(null);
        setIsLoading(false);
      });
  };

  const handleLogout = () => {
    setError(null);
    setIsLoading(true);
    setPendingLabel("logout");

    void signOut(auth)
      .catch((authError: unknown) => {
        setError(
          authError instanceof Error
            ? authError.message
            : "No se pudo cerrar sesion.",
        );
      })
      .finally(() => {
        setPendingLabel(null);
        setIsLoading(false);
      });
  };

  return (
    <section className={styles.authShell}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>MC</span>
        <span>Menu Creator</span>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.googleHeader}>
          <span className={styles.googleDot}>G</span>
          <span>Continuar con Google</span>
        </div>

        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Restaurant Menu Builder</span>
          <h1>Diseña una carta elegante y actualízala en segundos.</h1>
          <p>
            Inicia sesión con tu cuenta de Google para administrar el menú,
            añadir platillos y mantener la carta sincronizada con Firestore.
          </p>
        </div>

        <div className={styles.accountCard}>
          <span className={styles.accountLabel}>Cuenta</span>
          <strong className={styles.accountValue}>
            {user ? formatUserName(user) : "Selecciona tu cuenta de Google"}
          </strong>
          <p className={styles.accountHint}>
            {user?.email
              ? `Sesión detectada: ${user.email}`
              : "Usa una cuenta autorizada para entrar al editor del menú."}
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.googleButton}
            disabled={isLoading || Boolean(user)}
            onClick={handleGoogleLogin}
            type="button"
          >
            <span className={styles.googleBadge}>G</span>
            {pendingLabel === "login" ? "Abriendo Google..." : "Continuar con Google"}
          </button>

          <button
            className={styles.secondaryButton}
            disabled={isLoading || !user}
            onClick={handleLogout}
            type="button"
          >
            {pendingLabel === "logout" ? "Cerrando..." : "Salir de esta cuenta"}
          </button>
        </div>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        <p className={styles.footnote}>
          Después de autenticarte entrarás directo al dashboard del menú.
        </p>
      </div>
    </section>
  );
}
