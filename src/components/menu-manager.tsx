'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import {
  useCostCatalog,
  useDeleteMenu,
  useMenus,
  useRecipes,
  useSaveMenu,
} from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { calculateMenuCosts } from "@/lib/kitchen/calculations";
import { formatQuantity } from "@/lib/kitchen/units";
import type { Menu, MenuRecipeEntry } from "@/lib/kitchen/types";

function createEmptyMenu(ownerId: string): Menu {
  return {
    id: "",
    ownerId,
    name: "",
    notes: "",
    serviceCount: 1,
    recipes: [],
  };
}

export default function MenuManager() {
  const { user } = useFirebaseSession();
  const ownerId = user?.uid ?? "";
  const recipesQuery = useRecipes(user?.uid);
  const menusQuery = useMenus(user?.uid);
  const costsQuery = useCostCatalog(user?.uid);
  const saveMenu = useSaveMenu(user?.uid);
  const deleteMenu = useDeleteMenu(user?.uid);
  const [draft, setDraft] = useState<Menu>(createEmptyMenu(ownerId));
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [recipeServings, setRecipeServings] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const calculations = useMemo(
    () =>
      calculateMenuCosts(draft, recipesQuery.data ?? [], costsQuery.data ?? []),
    [costsQuery.data, draft, recipesQuery.data],
  );

  const resetDraft = () => {
    setDraft(createEmptyMenu(ownerId));
    setSelectedRecipeId("");
    setRecipeServings(1);
    setError(null);
  };

  const addRecipeToMenu = () => {
    const recipe = recipesQuery.data?.find((currentRecipe) => currentRecipe.id === selectedRecipeId);

    if (!recipe) {
      setError("Selecciona una receta antes de agregarla.");
      return;
    }

    const nextEntry: MenuRecipeEntry = {
      recipeId: recipe.id,
      recipeAlias: recipe.alias,
      recipeName: recipe.name,
      servings: recipeServings,
    };

    setDraft((currentDraft) => ({
      ...currentDraft,
      recipes: [...currentDraft.recipes, nextEntry],
    }));
    setSelectedRecipeId("");
    setRecipeServings(1);
    setError(null);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setError("El menu necesita nombre.");
      return;
    }

    if (!draft.recipes.length) {
      setError("Agrega al menos una receta al menu.");
      return;
    }

    setError(null);
    await saveMenu.mutateAsync({
      ...draft,
      ownerId,
      name: draft.name.trim(),
      notes: draft.notes.trim(),
    });
    resetDraft();
  };

  return (
    <div className={styles.workspaceGrid}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Construccion de menu</h2>
            <p className={styles.sectionDescription}>
              Reutiliza recetas por alias, define produccion y consolida la compra final.
            </p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nombre del menu</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
              }
              value={draft.name}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Servicios</span>
            <input
              className={styles.input}
              min="1"
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  serviceCount: Number(event.target.value) || 1,
                }))
              }
              type="number"
              value={draft.serviceCount}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Notas</span>
            <textarea
              className={styles.textarea}
              onChange={(event) =>
                setDraft((currentDraft) => ({ ...currentDraft, notes: event.target.value }))
              }
              value={draft.notes}
            />
          </label>

          <div className={styles.stack}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recetas seleccionadas</h3>
            </div>

            <div className={styles.menuRecipeGrid}>
              <select
                className={styles.select}
                onChange={(event) => setSelectedRecipeId(event.target.value)}
                value={selectedRecipeId}
              >
                <option value="">Selecciona receta por alias</option>
                {recipesQuery.data?.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    @{recipe.alias} · {recipe.name}
                  </option>
                ))}
              </select>
              <input
                className={styles.input}
                min="1"
                onChange={(event) => setRecipeServings(Number(event.target.value) || 1)}
                type="number"
                value={recipeServings}
              />
              <button className={styles.secondaryButton} onClick={addRecipeToMenu} type="button">
                +
              </button>
            </div>

            {draft.recipes.map((entry, index) => (
              <div className={styles.menuRecipeGrid} key={`${entry.recipeId}-${index}`}>
                <div className={styles.cardMeta}>
                  @{entry.recipeAlias} · {entry.recipeName}
                </div>
                <div className={styles.cardMeta}>{entry.servings} porciones</div>
                <button
                  className={styles.dangerButton}
                  onClick={() =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      recipes: currentDraft.recipes.filter((_, currentIndex) => currentIndex !== index),
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
              disabled={saveMenu.isPending}
              onClick={() => {
                void handleSave();
              }}
              type="button"
            >
              {saveMenu.isPending ? "Guardando..." : draft.id ? "Actualizar menu" : "Crear menu"}
            </button>
            <button className={styles.secondaryButton} onClick={resetDraft} type="button">
              Nuevo menu
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Menus y calculo</h2>
            <p className={styles.sectionDescription}>
              Selecciona un menu para ver ingredientes consolidados y costo total.
            </p>
          </div>
        </div>

        <div className={styles.stack}>
          {menusQuery.data?.length ? (
            menusQuery.data.map((menu) => (
              <article className={styles.listCard} key={menu.id}>
                <div className={styles.listCardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{menu.name}</h3>
                    <p className={styles.cardMeta}>
                      {menu.recipes.length} recetas · {menu.serviceCount} servicios
                    </p>
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.tagButton}
                      onClick={() => setDraft(menu)}
                      type="button"
                    >
                      Ver
                    </button>
                    <button
                      className={styles.dangerButton}
                      onClick={() => {
                        void deleteMenu.mutateAsync(menu.id);
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
              Todavia no hay menus. Primero crea recetas y luego arma un menu.
            </div>
          )}

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Detalle calculado</h3>
                <p className={styles.sectionDescription}>
                  {draft.name || "Selecciona un menu o construye uno nuevo"}
                </p>
              </div>
            </div>

            <div className={styles.stack}>
              <div className={styles.cardMeta}>
                Costo total: ${calculations.totalCost.toFixed(2)}
              </div>
              {calculations.consolidatedIngredients.map((ingredient) => (
                <div className={styles.tableRow} key={`${ingredient.normalizedName}-${ingredient.canonicalUnit}`}>
                  <span>{ingredient.name}</span>
                  <span>
                    {formatQuantity(ingredient.quantity)} {ingredient.canonicalUnit}
                  </span>
                  <span>
                    {
                      calculations.breakdown.find(
                        (item) =>
                          item.normalizedName === ingredient.normalizedName &&
                          item.canonicalUnit === ingredient.canonicalUnit,
                      )?.missingCost
                        ? "Sin costo"
                        : "Costo OK"
                    }
                  </span>
                  <span>
                    $
                    {(
                      calculations.breakdown.find(
                        (item) =>
                          item.normalizedName === ingredient.normalizedName &&
                          item.canonicalUnit === ingredient.canonicalUnit,
                      )?.totalCost ?? 0
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
