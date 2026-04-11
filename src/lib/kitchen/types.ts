export type IngredientUnit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "unit"
  | "tbsp"
  | "tsp";

export type IngredientInput = {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
};

export type Recipe = {
  id: string;
  ownerId: string;
  name: string;
  alias: string;
  baseServings: number;
  ingredients: IngredientInput[];
  createdAt?: string;
  updatedAt?: string;
};

export type MenuRecipeEntry = {
  recipeId: string;
  recipeName: string;
  recipeAlias: string;
  servings: number;
};

export type Menu = {
  id: string;
  ownerId: string;
  name: string;
  serviceCount: number;
  recipes: MenuRecipeEntry[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CostCatalogItem = {
  id: string;
  ownerId: string;
  ingredientName: string;
  normalizedName: string;
  unit: IngredientUnit;
  costPerUnit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeRole = "chef" | "ayudante" | "garzon" | "administracion";

export type Employee = {
  id: string;
  ownerId: string;
  name: string;
  role: EmployeeRole;
  salary: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ConsolidatedIngredient = {
  name: string;
  normalizedName: string;
  canonicalUnit: "g" | "ml" | "unit";
  quantity: number;
  sources: Array<{
    recipeId: string;
    recipeName: string;
    quantity: number;
    unit: IngredientUnit;
  }>;
};

export type CostBreakdown = {
  normalizedName: string;
  displayName: string;
  quantity: number;
  canonicalUnit: "g" | "ml" | "unit";
  unitCost?: number;
  costUnit?: IngredientUnit;
  totalCost: number;
  missingCost: boolean;
};
