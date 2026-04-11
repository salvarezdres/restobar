import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/lib/firestore";
import { mapFirestoreDoc } from "@/lib/services/firestore-utils";
import type { SessionAuditUser } from "@/lib/kitchen/types";

const COLLECTION_NAME = "session_audit_users";

export async function trackUserSession(user: User) {
  const documentRef = doc(db, COLLECTION_NAME, user.uid);
  const existingRecord = await getDoc(documentRef);
  const providerIds = user.providerData
    .map((provider) => provider.providerId)
    .filter(Boolean);

  await setDoc(
    documentRef,
    {
      uid: user.uid,
      email: user.email ?? "sin-correo",
      displayName: user.displayName ?? "Sin nombre",
      photoURL: user.photoURL ?? "",
      providerIds,
      signInCount: increment(1),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      ...(existingRecord.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function listSessionAuditUsers() {
  const snapshot = await getDocs(collection(db, COLLECTION_NAME));

  return snapshot.docs
    .map((document) =>
      mapFirestoreDoc(document.id, document.data() as Omit<SessionAuditUser, "id">),
    )
    .sort((left, right) =>
      (right.lastLoginAt ?? "").localeCompare(left.lastLoginAt ?? ""),
    );
}
