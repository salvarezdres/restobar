import type {
  ConsolidatedIngredient,
  CostBreakdown,
  CostCatalogItem,
  Menu,
  Recipe,
} from "@/lib/kitchen/types";
import {
  areUnitsCompatible,
  convertFromCanonical,
  convertToCanonical,
  getCanonicalUnit,
  normalizeName,
} from "@/lib/kitchen/units";

export function scaleRecipeIngredients(
  recipe: Recipe,
  targetServings: number,
): ConsolidatedIngredient[] {
  const scale = recipe.baseServings > 0 ? targetServings / recipe.baseServings : 0;

  return recipe.ingredients.map((ingredient) => ({
    name: ingredient.name,
    normalizedName: normalizeName(ingredient.name),
    canonicalUnit: getCanonicalUnit(ingredient.unit),
    quantity: convertToCanonical(ingredient.quantity * scale, ingredient.unit),
    sources: [
      {
        recipeId: recipe.id,
        recipeName: recipe.name,
        quantity: ingredient.quantity * scale,
        unit: ingredient.unit,
      },
    ],
  }));
}

export function consolidateMenuIngredients(
  menu: Menu,
  recipes: Recipe[],
): ConsolidatedIngredient[] {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const consolidated = new Map<string, ConsolidatedIngredient>();

  for (const entry of menu.recipes) {
    const recipe = recipeMap.get(entry.recipeId);

    if (!recipe) {
      continue;
    }

    for (const ingredient of scaleRecipeIngredients(recipe, entry.servings)) {
      const key = `${ingredient.normalizedName}:${ingredient.canonicalUnit}`;
      const current = consolidated.get(key);

      if (!current) {
        consolidated.set(key, ingredient);
        continue;
      }

      current.quantity += ingredient.quantity;
      current.sources.push(...ingredient.sources);
    }
  }

  return Array.from(consolidated.values()).sort((left, right) =>
    left.name.localeCompare(right.name, "es"),
  );
}

function calculateBreakdown(
  menu: Menu,
  recipes: Recipe[],
  costCatalog: CostCatalogItem[],
) {
  const consolidatedIngredients = consolidateMenuIngredients(menu, recipes);
  const costMap = new Map(costCatalog.map((item) => [item.normalizedName, item]));

  const breakdown = consolidatedIngredients.map<CostBreakdown>((ingredient) => {
    const costItem = costMap.get(ingredient.normalizedName);

    if (!costItem || !areUnitsCompatible(ingredient.canonicalUnit, costItem.unit)) {
      return {
        normalizedName: ingredient.normalizedName,
        displayName: ingredient.name,
        quantity: ingredient.quantity,
        canonicalUnit: ingredient.canonicalUnit,
        totalCost: 0,
        missingCost: true,
      };
    }

    const convertedQuantity = convertFromCanonical(ingredient.quantity, costItem.unit);
    const totalCost = convertedQuantity * costItem.costPerUnit;

    return {
      normalizedName: ingredient.normalizedName,
      displayName: ingredient.name,
      quantity: ingredient.quantity,
      canonicalUnit: ingredient.canonicalUnit,
      unitCost: costItem.costPerUnit,
      costUnit: costItem.unit,
      totalCost,
      missingCost: false,
    };
  });

  const totalCost = breakdown.reduce((sum, item) => sum + item.totalCost, 0);

  return {
    consolidatedIngredients,
    breakdown,
    totalCost,
  };
}

export function calculateMenuCosts(
  menu: Menu,
  recipes: Recipe[],
  costCatalog: CostCatalogItem[],
) {
  const { consolidatedIngredients, breakdown, totalCost } = calculateBreakdown(
    menu,
    recipes,
    costCatalog,
  );

  const recipeTotals = menu.recipes
    .map((entry) => {
      const singleRecipeMenu: Menu = {
        ...menu,
        recipes: [entry],
      };
      const detail = calculateBreakdown(singleRecipeMenu, recipes, costCatalog);

      return {
        recipeId: entry.recipeId,
        recipeName: entry.recipeName,
        servings: entry.servings,
        totalCost: detail.totalCost,
      };
    })
    .sort((left, right) => left.recipeName.localeCompare(right.recipeName, "es"));

  return {
    consolidatedIngredients,
    breakdown,
    recipeTotals,
    totalCost,
  };
}
