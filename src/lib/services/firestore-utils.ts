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
): T & { id: string; createdAt?: string; updatedAt?: string } {
  return {
    ...data,
    id,
    createdAt: serializeTimestamp(data.createdAt),
    updatedAt: serializeTimestamp(data.updatedAt),
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
  await addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
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
