import type { Recipe } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "recipes";

export async function listRecipes(ownerId: string) {
  const recipes = await listCollectionByOwner<Omit<Recipe, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return recipes.sort((left, right) => left.name.localeCompare(right.name, "es"));
}

export async function createRecipe(recipe: Omit<Recipe, "id" | "createdAt" | "updatedAt">) {
  await createCollectionDocument(COLLECTION_NAME, recipe);
}

export async function updateRecipe(
  recipeId: string,
  recipe: Partial<Omit<Recipe, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, recipeId, recipe);
}

export async function deleteRecipe(recipeId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, recipeId);
}
