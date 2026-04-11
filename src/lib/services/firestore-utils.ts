import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

type TimestampLike = {
  toDate?: () => Date;
};

type TimestampFields = {
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
};

function serializeTimestamp(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in (value as TimestampLike) &&
    typeof (value as TimestampLike).toDate === "function"
  ) {
    return (value as TimestampLike).toDate?.()?.toISOString();
  }

  return undefined;
}

export function mapFirestoreDoc<T extends DocumentData>(
  id: string,
  data: T,
): T & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
} {
  const timestampFields = data as T & TimestampFields;

  return {
    ...data,
    id,
    createdAt: serializeTimestamp(timestampFields.createdAt),
    updatedAt: serializeTimestamp(timestampFields.updatedAt),
    lastLoginAt: serializeTimestamp(timestampFields.lastLoginAt),
  };
}

export async function listCollectionByOwner<T extends DocumentData>(
  collectionName: string,
  ownerId: string,
) {
  const snapshot = await getDocs(
    query(collection(db, collectionName), where("ownerId", "==", ownerId)),
  );

  return snapshot.docs.map((document) =>
    mapFirestoreDoc(document.id, document.data() as T),
  );
}

export async function createCollectionDocument<T extends DocumentData>(
  collectionName: string,
  payload: T,
) {
  const documentReference = await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return documentReference.id;
}

export async function updateCollectionDocument<T extends DocumentData>(
  collectionName: string,
  id: string,
  payload: Partial<T>,
) {
  await updateDoc(doc(db, collectionName, id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCollectionDocument(collectionName: string, id: string) {
  await deleteDoc(doc(db, collectionName, id));
}
