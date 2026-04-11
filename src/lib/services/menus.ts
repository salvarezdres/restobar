import type { Menu } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "menus";

export async function listMenus(ownerId: string) {
  const menus = await listCollectionByOwner<Omit<Menu, "id">>(COLLECTION_NAME, ownerId);

  return menus.sort((left, right) => left.name.localeCompare(right.name, "es"));
}

export async function createMenu(menu: Omit<Menu, "id" | "createdAt" | "updatedAt">) {
  await createCollectionDocument(COLLECTION_NAME, menu);
}

export async function updateMenu(
  menuId: string,
  menu: Partial<Omit<Menu, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, menuId, menu);
}

export async function deleteMenu(menuId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, menuId);
}
