'use client'

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";

type WorkspaceSessionContextValue = {
  ownerId: string | undefined;
  user: User;
};

const WorkspaceSessionContext = createContext<WorkspaceSessionContextValue | null>(null);

export function WorkspaceSessionProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  const value = useMemo(
    () => ({
      ownerId: user.uid,
      user,
    }),
    [user],
  );

  return (
    <WorkspaceSessionContext.Provider value={value}>
      {children}
    </WorkspaceSessionContext.Provider>
  );
}

export function useWorkspaceSession() {
  const context = useContext(WorkspaceSessionContext);

  if (!context) {
    throw new Error("useWorkspaceSession must be used within WorkspaceSessionProvider.");
  }

  return context;
}
