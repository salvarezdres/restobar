'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useCostCatalog,
  useDeleteMenu,
  useMenus,
  useRecipes,
  useSaveMenu,
} from "@/hooks/use-kitchen-queries";
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
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const recipesQuery = useRecipes(ownerId);
  const menusQuery = useMenus(ownerId);
  const costsQuery = useCostCatalog(ownerId);
  const saveMenu = useSaveMenu(ownerId);
  const deleteMenu = useDeleteMenu(ownerId);
  const [draft, setDraft] = useState<Menu>(createEmptyMenu(stableOwnerId));
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [recipeServings, setRecipeServings] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const calculations = useMemo(
    () => calculateMenuCosts(draft, recipesQuery.data ?? [], costsQuery.data ?? []),
    [costsQuery.data, draft, recipesQuery.data],
  );

  const missingCostCount = calculations.breakdown.filter((item) => item.missingCost).length;

  const resetDraft = () => {
    setDraft(createEmptyMenu(stableOwnerId));
    setSelectedRecipeId("");
    setRecipeServings(1);
    setError(null);
  };

  const addRecipeToMenu = () => {
    const recipe = recipesQuery.data?.find(
      (currentRecipe) => currentRecipe.id === selectedRecipeId,
    );

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
      ownerId: stableOwnerId,
      name: draft.name.trim(),
      notes: draft.notes.trim(),
    });
    resetDraft();
  };

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Modulo de menus</span>
          <h2 className={styles.heroTitle}>
            Construye produccion reutilizando recetas y viendo el impacto economico al instante.
          </h2>
          <p className={styles.heroDescription}>
            Un menu bien armado no solo agrupa platos. Debe responder cuanto comprar,
            cuanto producir y cuanto cuesta hacerlo.
          </p>
        </div>

        <div className={styles.menuMetaGrid}>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Recetas en borrador</span>
            <strong className={styles.metaValue}>{draft.recipes.length}</strong>
          </article>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Ingredientes consolidados</span>
            <strong className={styles.metaValue}>
              {calculations.consolidatedIngredients.length}
            </strong>
          </article>
          <article className={styles.metaCard}>
            <span className={styles.smallLabel}>Costo estimado</span>
            <strong className={styles.metaValue}>${calculations.totalCost.toFixed(2)}</strong>
          </article>
        </div>
      </section>

      <div className={styles.workspaceGridWide}>
        <section className={styles.panel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                {draft.id ? "Editar menu" : "Nuevo menu"}
              </h2>
              <p className={styles.sectionDescription}>
                Reutiliza recetas existentes y define la produccion sin recalcular manualmente.
              </p>
            </div>
            <span className={styles.miniPill}>{draft.serviceCount} servicios</span>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formColumns}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Nombre del menu</span>
                <input
                  className={styles.input}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej: Servicio viernes noche"
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
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Notas operativas</span>
              <textarea
                className={styles.textarea}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    notes: event.target.value,
                  }))
                }
                placeholder="Restricciones, observaciones del servicio o preparaciones previas."
                value={draft.notes}
              />
            </label>

            <section className={styles.recipeSelectionCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Agregar receta al menu</h3>
                  <p className={styles.sectionDescription}>
                    El alias debe ser la puerta de entrada, no la excusa para buscar a mano.
                  </p>
                </div>
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
                      @{recipe.alias} - {recipe.name}
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
                <button
                  className={styles.secondaryButton}
                  onClick={addRecipeToMenu}
                  type="button"
                >
                  Agregar
                </button>
              </div>
            </section>

            <div className={styles.stack}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Recetas seleccionadas</h3>
                  <p className={styles.sectionDescription}>
                    Este bloque define directamente compras y costo del servicio.
                  </p>
                </div>
              </div>

              {draft.recipes.length ? (
                draft.recipes.map((entry, index) => (
                  <div className={styles.recipeSelectionCard} key={`${entry.recipeId}-${index}`}>
                    <div className={styles.listCardHeader}>
                      <div className={styles.stack}>
                        <div className={styles.rowMetrics}>
                          <span className={styles.statusPill}>@{entry.recipeAlias}</span>
                          <span className={styles.miniPill}>{entry.servings} porciones</span>
                        </div>
                        <div>
                          <h4 className={styles.cardTitle}>{entry.recipeName}</h4>
                          <p className={styles.cardMeta}>
                            Entrada activa dentro del menu en construccion.
                          </p>
                        </div>
                      </div>
                      <button
                        className={styles.dangerButton}
                        onClick={() =>
                          setDraft((currentDraft) => ({
                            ...currentDraft,
                            recipes: currentDraft.recipes.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                          }))
                        }
                        type="button"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyCard}>
                  Aun no agregas recetas al menu. El calculo real empieza cuando este bloque
                  deja de estar vacio.
                </div>
              )}
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
                {saveMenu.isPending
                  ? "Guardando..."
                  : draft.id
                    ? "Actualizar menu"
                    : "Guardar menu"}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={resetDraft}
                type="button"
              >
                Limpiar borrador
              </button>
            </div>
          </div>
        </section>

        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Calculo en tiempo real</h2>
              <p className={styles.sectionDescription}>
                La utilidad de este modulo depende de que el resumen sea inmediato y accionable.
              </p>
            </div>
          </div>

          <div className={styles.splitMetrics}>
            <article className={styles.insightCard}>
              <span className={styles.smallLabel}>Costo total</span>
              <strong className={styles.insightValue}>${calculations.totalCost.toFixed(2)}</strong>
              <p className={styles.insightText}>
                Resultado consolidado desde las recetas seleccionadas.
              </p>
            </article>
            <article className={styles.insightCard}>
              <span className={styles.smallLabel}>Cruces sin costo</span>
              <strong className={styles.insightValue}>{missingCostCount}</strong>
              <p className={styles.insightText}>
                Ingredientes aun no cubiertos por tu catalogo de costos.
              </p>
            </article>
          </div>

          <div className={styles.detailGrid}>
            <section className={styles.spotlightCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Compra consolidada</h3>
                  <p className={styles.sectionDescription}>
                    Lista final unificada para comprar sin duplicados.
                  </p>
                </div>
              </div>

              <div className={styles.detailList}>
                {calculations.consolidatedIngredients.length ? (
                  calculations.consolidatedIngredients.map((ingredient) => {
                    const breakdownItem = calculations.breakdown.find(
                      (item) =>
                        item.normalizedName === ingredient.normalizedName &&
                        item.canonicalUnit === ingredient.canonicalUnit,
                    );

                    return (
                      <div
                        className={styles.tableRow}
                        key={`${ingredient.normalizedName}-${ingredient.canonicalUnit}`}
                      >
                        <span>{ingredient.name}</span>
                        <span>
                          {formatQuantity(ingredient.quantity)} {ingredient.canonicalUnit}
                        </span>
                        <span
                          className={
                            breakdownItem?.missingCost
                              ? styles.costStateMissing
                              : styles.costStateOk
                          }
                        >
                          {breakdownItem?.missingCost ? "Sin costo" : "Costo OK"}
                        </span>
                        <span>${(breakdownItem?.totalCost ?? 0).toFixed(2)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.emptyCard}>
                    El consolidado aparecera cuando el menu tenga recetas cargadas.
                  </div>
                )}
              </div>
            </section>

            <section className={styles.spotlightCard}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Menus guardados</h3>
                  <p className={styles.sectionDescription}>
                    Reabre configuraciones ya construidas sin rehacer el trabajo.
                  </p>
                </div>
                <span className={styles.miniPill}>{menusQuery.data?.length ?? 0} menus</span>
              </div>

              <div className={styles.menuList}>
                {menusQuery.data?.length ? (
                  menusQuery.data.map((menu) => (
                    <article className={styles.listCard} key={menu.id}>
                      <div className={styles.listCardHeader}>
                        <div className={styles.stack}>
                          <div className={styles.rowMetrics}>
                            <span className={styles.statusPill}>{menu.name}</span>
                            <span className={styles.miniPill}>
                              {menu.recipes.length} recetas
                            </span>
                          </div>
                          <p className={styles.cardMeta}>
                            {menu.serviceCount} servicios configurados para este menu.
                          </p>
                        </div>
                        <div className={styles.buttonRow}>
                          <button
                            className={styles.tagButton}
                            onClick={() => setDraft(menu)}
                            type="button"
                          >
                            Abrir
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
                    Todavia no hay menus. Primero estandariza recetas y luego arma el servicio.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
