import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firestore";

export type Dish = {
  id: string;
  name: string;
  description: string;
};

const dishesCollection = collection(db, "dishes");

export function subscribeToDishes(
  onUpdate: (dishes: Dish[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(dishesCollection, orderBy("createdAt", "desc")),
    (snapshot) => {
      const dishes = snapshot.docs.map((document) => {
        const data = document.data() as {
          name?: string;
          description?: string;
        };

        return {
          id: document.id,
          name: data.name ?? "",
          description: data.description ?? "",
        };
      });

      onUpdate(dishes);
    },
    (error) => {
      onError(error);
    },
  );
}

export async function createDish(input: {
  name: string;
  description: string;
  createdBy: string;
}) {
  await addDoc(dishesCollection, {
    name: input.name,
    description: input.description,
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  });
}
