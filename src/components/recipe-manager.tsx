'use client'

import { useState } from "react";

import styles from "@/components/workspace.module.css";
import {
  useDeleteRecipe,
  useRecipes,
  useSaveRecipe,
} from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import type { IngredientInput, IngredientUnit, Recipe } from "@/lib/kitchen/types";

const UNIT_OPTIONS: IngredientUnit[] = ["g", "kg", "ml", "l", "unit", "tbsp", "tsp"];

function createEmptyIngredient(): IngredientInput {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: 0,
    unit: "g",
  };
}

function createEmptyRecipe(ownerId: string): Recipe {
  return {
    id: "",
    ownerId,
    name: "",
    alias: "",
    baseServings: 1,
    ingredients: [createEmptyIngredient()],
  };
}

export default function RecipeManager() {
  const { user } = useFirebaseSession();
  const ownerId = user?.uid ?? "";
  const recipesQuery = useRecipes(user?.uid);
  const saveRecipe = useSaveRecipe(user?.uid);
  const deleteRecipe = useDeleteRecipe(user?.uid);
  const [draft, setDraft] = useState<Recipe>(createEmptyRecipe(ownerId));
  const [error, setError] = useState<string | null>(null);

  const resetDraft = () => {
    setDraft(createEmptyRecipe(ownerId));
    setError(null);
  };

  const updateIngredient = (
    ingredientId: string,
    field: keyof IngredientInput,
    value: string,
  ) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ingredients: currentDraft.ingredients.map((ingredient) =>
        ingredient.id === ingredientId
          ? {
              ...ingredient,
              [field]:
                field === "quantity"
                  ? Number(value) || 0
                  : field === "unit"
                    ? (value as IngredientUnit)
                    : value,
            }
          : ingredient,
      ),
    }));
  };

  const handleSave = async () => {
    if (!draft.name.trim() || !draft.alias.trim()) {
      setError("Nombre y alias son obligatorios.");
      return;
    }

    if (
      draft.ingredients.some(
        (ingredient) => !ingredient.name.trim() || ingredient.quantity <= 0,
      )
    ) {
      setError("Cada ingrediente necesita nombre y cantidad valida.");
      return;
    }

    setError(null);
    await saveRecipe.mutateAsync({
      ...draft,
      ownerId,
      alias: draft.alias.trim(),
      name: draft.name.trim(),
    });
    resetDraft();
  };

  return (
    <div className={styles.workspaceGrid}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Receta</h2>
            <p className={styles.sectionDescription}>
              Crea una receta reutilizable con alias y cantidades base.
            </p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nombre</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
              }
              value={draft.name}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Alias</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({ ...currentDraft, alias: event.target.value }))
              }
              value={draft.alias}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Porciones base</span>
            <input
              className={styles.input}
              min="1"
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  baseServings: Number(event.target.value) || 1,
                }))
              }
              type="number"
              value={draft.baseServings}
            />
          </label>

          <div className={styles.stack}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Ingredientes</h3>
              <button
                className={styles.secondaryButton}
                onClick={() =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    ingredients: [...currentDraft.ingredients, createEmptyIngredient()],
                  }))
                }
                type="button"
              >
                Agregar fila
              </button>
            </div>

            {draft.ingredients.map((ingredient) => (
              <div className={styles.ingredientGrid} key={ingredient.id}>
                <input
                  className={styles.input}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "name", event.target.value)
                  }
                  placeholder="Ingrediente"
                  value={ingredient.name}
                />
                <input
                  className={styles.input}
                  min="0"
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "quantity", event.target.value)
                  }
                  type="number"
                  value={ingredient.quantity}
                />
                <select
                  className={styles.select}
                  onChange={(event) =>
                    updateIngredient(ingredient.id, "unit", event.target.value)
                  }
                  value={ingredient.unit}
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.dangerButton}
                  onClick={() =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      ingredients:
                        currentDraft.ingredients.length > 1
                          ? currentDraft.ingredients.filter(
                              (currentIngredient) => currentIngredient.id !== ingredient.id,
                            )
                          : currentDraft.ingredients,
                    }))
                  }
                  type="button"
                >
                  x
                </button>
              </div>
            ))}
          </div>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={saveRecipe.isPending}
              onClick={() => {
                void handleSave();
              }}
              type="button"
            >
              {saveRecipe.isPending ? "Guardando..." : draft.id ? "Actualizar receta" : "Crear receta"}
            </button>
            <button className={styles.secondaryButton} onClick={resetDraft} type="button">
              Nueva receta
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Listado de recetas</h2>
            <p className={styles.sectionDescription}>
              Usa alias reutilizables para armar menus y escalar produccion.
            </p>
          </div>
        </div>

        <div className={styles.stack}>
          {recipesQuery.data?.length ? (
            recipesQuery.data.map((recipe) => (
              <article className={styles.listCard} key={recipe.id}>
                <div className={styles.listCardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{recipe.name}</h3>
                    <p className={styles.cardMeta}>
                      @{recipe.alias} · base {recipe.baseServings}
                    </p>
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.tagButton}
                      onClick={() => setDraft(recipe)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className={styles.dangerButton}
                      onClick={() => {
                        void deleteRecipe.mutateAsync(recipe.id);
                      }}
                      type="button"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyCard}>
              Todavia no hay recetas. Crea la primera para empezar a construir menus.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
