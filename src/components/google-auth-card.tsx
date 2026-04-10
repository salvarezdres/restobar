'use client'

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, type User } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getFirebaseAuth, getGoogleProvider } from "@/lib/auth";

function GoogleGlyph() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M21.8 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.5a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.94-1.79 3.04-4.42 3.04-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.92 6.78-2.49l-3.3-2.56c-.92.62-2.09.99-3.48.99-2.67 0-4.93-1.8-5.74-4.22H2.86v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.26 13.72A6.02 6.02 0 0 1 5.94 12c0-.6.11-1.18.32-1.72V7.64H2.86a10 10 0 0 0 0 8.72l3.4-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.06c1.5 0 2.86.52 3.92 1.54l2.93-2.93C17.08 2.96 14.76 2 12 2A10 10 0 0 0 2.86 7.64l3.4 2.64c.8-2.42 3.07-4.22 5.74-4.22Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function mapFirebaseError(message: string) {
  if (message.includes("auth/popup-closed-by-user")) {
    return "Cerraste la ventana de Google antes de completar el acceso.";
  }

  if (message.includes("auth/popup-blocked")) {
    return "El navegador bloqueo el popup de Google. Habilitalo e intenta otra vez.";
  }

  if (message.includes("auth/account-exists-with-different-credential")) {
    return "Esa cuenta ya existe con otro metodo de acceso.";
  }

  if (message.includes("auth/unauthorized-domain")) {
    return "Este dominio no esta autorizado en Firebase Authentication.";
  }

  return "No se pudo iniciar sesion con Google. Intenta nuevamente.";
}

export default function GoogleAuthCard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        router.replace("/dashboard");
      }
    });

    return unsubscribe;
  }, [router]);

  const handleGoogleLogin = () => {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();

    setError(null);
    setLoading(true);

    void signInWithPopup(auth, provider)
      .then(() => {
        router.replace("/dashboard");
      })
      .catch((loginError: unknown) => {
        setError(
          loginError instanceof Error
            ? mapFirebaseError(loginError.message)
            : "No se pudo iniciar sesion con Google. Intenta nuevamente.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-black px-6">
      <div className="relative h-[380px] w-full max-w-[600px] border border-[#C9A44C] p-10 shadow-[0_0_40px_rgba(201,164,76,0.06)]">
        <div className="absolute left-4 top-4 text-xl text-[#C9A44C] opacity-20">
          ✦
        </div>
        <div className="absolute right-4 top-4 text-xl text-[#C9A44C] opacity-20">
          ✦
        </div>
        <div className="absolute bottom-4 left-4 text-xl text-[#C9A44C] opacity-20">
          ✦
        </div>
        <div className="absolute bottom-4 right-4 text-xl text-[#C9A44C] opacity-20">
          ✦
        </div>

        <div className="flex h-full flex-col items-center justify-center text-center">
          <h1
            className="mb-10 text-5xl text-[#C9A44C]"
            style={{
              fontFamily: "Playfair Display, serif",
              letterSpacing: "2px",
            }}
          >
            Login
          </h1>

          <button
            className="flex items-center gap-3 border border-[#C9A44C] px-6 py-3 text-[#C9A44C] transition-all duration-300 hover:bg-[#C9A44C] hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading || Boolean(user)}
            onClick={handleGoogleLogin}
            type="button"
          >
            <GoogleGlyph />
            {loading ? "Conectando..." : "Continuar con Google"}
          </button>

          {error ? (
            <p className="mt-5 max-w-sm text-sm text-[#d98d8d]">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
