'use client'

import { useEffect, useEffectEvent, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { getFirebaseAuth } from "@/lib/auth";

type SessionOptions = {
  onAuthenticated?: (user: User) => void;
  onUnauthenticated?: () => void;
};

export function useFirebaseSession(options?: SessionOptions) {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const handleAuthChange = useEffectEvent((nextUser: User | null) => {
    setUser(nextUser);
    setIsCheckingSession(false);

    if (nextUser) {
      options?.onAuthenticated?.(nextUser);
      return;
    }

    options?.onUnauthenticated?.();
  });

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    return unsubscribe;
  }, []);

  return {
    user,
    isCheckingSession,
  };
}
