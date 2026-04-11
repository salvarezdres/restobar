'use client'

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import { getFirebaseAuth } from "@/lib/auth";

export default function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      router.replace(user ? "/dashboard" : "/");
    });

    return unsubscribe;
  }, [router]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-black px-6 text-center text-[#d1ab4b]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-[#d1ab4b]/70">
          Redirecting
        </p>
        <h1 className="font-serif text-4xl">Redirigiendo...</h1>
        <p className="max-w-md text-sm leading-7 text-[#f6e8c7]/60">
          Estamos enviandote a la pantalla correcta segun tu sesion actual.
        </p>
      </div>
    </main>
  );
}
