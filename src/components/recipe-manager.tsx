'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useDeleteRecipe,
  useRecipes,
  useSaveRecipe,
} from "@/hooks/use-kitchen-queries";
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
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const recipesQuery = useRecipes(ownerId);
  const saveRecipe = useSaveRecipe(ownerId);
  const deleteRecipe = useDeleteRecipe(ownerId);
  const [draft, setDraft] = useState<Recipe>(createEmptyRecipe(stableOwnerId));
  const [error, setError] = useState<string | null>(null);

  const ingredientCount = draft.ingredients.length;
  const namedIngredients = useMemo(
    () => draft.ingredients.filter((ingredient) => ingredient.name.trim()).length,
    [draft.ingredients],
  );

  const resetDraft = () => {
    setDraft(createEmptyRecipe(stableOwnerId));
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
      ownerId: stableOwnerId,
      alias: draft.alias.trim(),
      name: draft.name.trim(),
    });
    resetDraft();
  };

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Modulo de recetas</span>
          <h2 className={styles.heroTitle}>
            Estandariza preparaciones para que el menu no dependa de memoria ni WhatsApp.
          </h2>
          <p className={styles.heroDescription}>
            Cada receta debe quedar suficientemente clara para ser reutilizada,
            escalada y costificada sin reinterpretaciones.
          </p>
        </div>

        <div className={styles.recipeMetaGrid}>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Alias actual</span>
            <strong className={styles.metaValue}>
              {draft.alias.trim() ? `@${draft.alias.trim()}` : "Sin alias"}
            </strong>
          </article>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Ingredientes</span>
            <strong className={styles.metaValue}>{ingredientCount}</strong>
          </article>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Base de servicio</span>
            <strong className={styles.metaValue}>{draft.baseServings} porciones</strong>
          </article>
        </div>
      </section>

      <div className={styles.workspaceGrid}>
        <section className={styles.panel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {draft.id ? "Editar receta" : "Nueva receta"}
              </h2>
              <p className={styles.sectionDescription}>
                Nombra bien, define alias consistente y deja la base lista para escalar.
              </p>
            </div>
            <span className={styles.miniPill}>
              {namedIngredients}/{ingredientCount} ingredientes completos
            </span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formColumns}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Nombre</span>
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej: Salsa pomodoro base"
                  value={draft.name}
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Alias</span>
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      alias: event.target.value,
                    }))
                  }
                  placeholder="pomodoro-base"
                  value={draft.alias}
                />
              </label>
            </div>

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
                <div>
                  <h3 className={styles.sectionTitle}>Ingredientes base</h3>
                  <p className={styles.sectionDescription}>
                    Cada fila debe quedar utilizable para compra, costo y escalado.
                  </p>
                </div>
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
                <div className={styles.ingredientRow} key={ingredient.id}>
                  <div className={styles.ingredientGrid}>
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
                      placeholder="0"
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
                                  (currentIngredient) =>
                                    currentIngredient.id !== ingredient.id,
                                )
                              : currentDraft.ingredients,
                        }))
                      }
                      type="button"
                    >
                      x
                    </button>
                  </div>
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
                {saveRecipe.isPending
                  ? "Guardando..."
                  : draft.id
                    ? "Actualizar receta"
                    : "Guardar receta"}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={resetDraft}
                type="button"
              >
                Limpiar formulario
              </button>
            </div>
          </div>
        </section>

        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Biblioteca de recetas</h2>
              <p className={styles.sectionDescription}>
                Reutiliza lo ya estandarizado. Si una receta no se entiende aqui,
                tampoco se entiende en cocina.
              </p>
            </div>
            <span className={styles.miniPill}>{recipesQuery.data?.length ?? 0} recetas</span>
          </div>

          <div className={styles.recipeList}>
            {recipesQuery.data?.length ? (
              recipesQuery.data.map((recipe) => (
                <article className={styles.listCard} key={recipe.id}>
                  <div className={styles.listCardHeader}>
                    <div className={styles.stack}>
                      <div className={styles.rowMetrics}>
                        <span className={styles.statusPill}>@{recipe.alias}</span>
                        <span className={styles.miniPill}>
                          {recipe.baseServings} porciones base
                        </span>
                        <span className={styles.miniPill}>
                          {recipe.ingredients.length} ingredientes
                        </span>
                      </div>
                      <div>
                        <h3 className={styles.cardTitle}>{recipe.name}</h3>
                        <p className={styles.cardMeta}>
                          Lista para menu, escalado y cruce con costos.
                        </p>
                      </div>
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
                Todavia no hay recetas. Empieza por una base clave del menu y no por una
                preparacion marginal.
              </div>
            )}
          </div>

          <section className={styles.spotlightCard}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Criterio de una receta profesional</h3>
                <p className={styles.sectionDescription}>
                  Si quieres que el sistema sea confiable, estas reglas no son opcionales.
                </p>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Alias consistente</strong>
                  <p className={styles.cardMeta}>
                    Debe poder encontrarse rapido y no cambiar segun quien lo escriba.
                  </p>
                </div>
                <span className={styles.miniPill}>Clave</span>
              </div>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Unidades claras</strong>
                  <p className={styles.cardMeta}>
                    Sin unidad correcta no hay costo correcto ni compra consolidada.
                  </p>
                </div>
                <span className={styles.miniPill}>Control</span>
              </div>
              <div className={styles.statusRow}>
                <div>
                  <strong className={styles.cardTitle}>Base realista</strong>
                  <p className={styles.cardMeta}>
                    Define la produccion normal, no una cifra improvisada para salir del paso.
                  </p>
                </div>
                <span className={styles.miniPill}>Operacion</span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
