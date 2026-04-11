import type { IngredientUnit } from "@/lib/kitchen/types";

const CANONICAL_UNIT_BY_GROUP = {
  mass: "g",
  volume: "ml",
  count: "unit",
} as const;

const UNIT_GROUPS: Record<IngredientUnit, keyof typeof CANONICAL_UNIT_BY_GROUP> = {
  g: "mass",
  kg: "mass",
  ml: "volume",
  l: "volume",
  unit: "count",
  tbsp: "volume",
  tsp: "volume",
};

const UNIT_FACTORS: Record<IngredientUnit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  unit: 1,
  tbsp: 15,
  tsp: 5,
};

export function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function getUnitGroup(unit: IngredientUnit) {
  return UNIT_GROUPS[unit];
}

export function getCanonicalUnit(unit: IngredientUnit) {
  return CANONICAL_UNIT_BY_GROUP[getUnitGroup(unit)];
}

export function convertToCanonical(quantity: number, unit: IngredientUnit) {
  return quantity * UNIT_FACTORS[unit];
}

export function convertFromCanonical(
  quantity: number,
  targetUnit: IngredientUnit,
) {
  return quantity / UNIT_FACTORS[targetUnit];
}

export function areUnitsCompatible(
  leftUnit: IngredientUnit,
  rightUnit: IngredientUnit,
) {
  return getUnitGroup(leftUnit) === getUnitGroup(rightUnit);
}

export function formatQuantity(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  if (value >= 100) {
    return value.toFixed(1);
  }

  if (value >= 10) {
    return value.toFixed(2);
  }

  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
