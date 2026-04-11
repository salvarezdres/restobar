import type { CostCatalogItem } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "cost_catalog";

export async function listCostCatalog(ownerId: string) {
  const items = await listCollectionByOwner<Omit<CostCatalogItem, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return items.sort((left, right) =>
    left.ingredientName.localeCompare(right.ingredientName, "es"),
  );
}

export async function createCostItem(
  item: Omit<CostCatalogItem, "id" | "createdAt" | "updatedAt">,
) {
  await createCollectionDocument(COLLECTION_NAME, item);
}

export async function updateCostItem(
  itemId: string,
  item: Partial<Omit<CostCatalogItem, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, itemId, item);
}

export async function deleteCostItem(itemId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, itemId);
}
