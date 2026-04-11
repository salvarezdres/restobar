'use client'

import { useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useCostCatalog,
  useDeleteCostItem,
  useSaveCostItem,
} from "@/hooks/use-kitchen-queries";
import type { CostCatalogItem, IngredientUnit } from "@/lib/kitchen/types";

const UNIT_OPTIONS: IngredientUnit[] = ["g", "kg", "ml", "l", "unit", "tbsp", "tsp"];

function createEmptyCost(ownerId: string): CostCatalogItem {
  return {
    id: "",
    ownerId,
    ingredientName: "",
    normalizedName: "",
    unit: "kg",
    costPerUnit: 0,
  };
}

export default function CostManager() {
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const costsQuery = useCostCatalog(ownerId);
  const saveCost = useSaveCostItem(ownerId);
  const deleteCost = useDeleteCostItem(ownerId);
  const [draft, setDraft] = useState<CostCatalogItem>(createEmptyCost(stableOwnerId));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!draft.ingredientName.trim() || draft.costPerUnit <= 0) {
      setError("Ingrediente y costo por unidad son obligatorios.");
      return;
    }

    setError(null);
    await saveCost.mutateAsync({
      ...draft,
      ownerId: stableOwnerId,
      ingredientName: draft.ingredientName.trim(),
    });
    setDraft(createEmptyCost(stableOwnerId));
  };

  return (
    <div className={styles.workspaceGrid}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Costo base</h2>
            <p className={styles.sectionDescription}>
              Define precios por unidad para calcular costos de recetas y menus.
            </p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Ingrediente</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  ingredientName: event.target.value,
                }))
              }
              value={draft.ingredientName}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Unidad de costo</span>
            <select
              className={styles.select}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  unit: event.target.value as IngredientUnit,
                }))
              }
              value={draft.unit}
            >
              {UNIT_OPTIONS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Costo por unidad</span>
            <input
              className={styles.input}
              min="0"
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  costPerUnit: Number(event.target.value) || 0,
                }))
              }
              type="number"
              value={draft.costPerUnit}
            />
          </label>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={saveCost.isPending}
              onClick={() => {
                void handleSave();
              }}
              type="button"
            >
              {saveCost.isPending ? "Guardando..." : draft.id ? "Actualizar costo" : "Agregar costo"}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => setDraft(createEmptyCost(stableOwnerId))}
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Catalogo de costos</h2>
            <p className={styles.sectionDescription}>
              Tabla base para cruce con ingredientes.
            </p>
          </div>
        </div>

        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Ingrediente</span>
            <span>Unidad</span>
            <span>Costo</span>
            <span>Acciones</span>
          </div>

          {costsQuery.data?.length ? (
            costsQuery.data.map((item) => (
              <div className={styles.tableRow} key={item.id}>
                <span>{item.ingredientName}</span>
                <span>{item.unit}</span>
                <span>${item.costPerUnit.toFixed(2)}</span>
                <div className={styles.buttonRow}>
                  <button
                    className={styles.tagButton}
                    onClick={() => setDraft(item)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className={styles.dangerButton}
                    onClick={() => {
                      void deleteCost.mutateAsync(item.id);
                    }}
                    type="button"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyCard}>
              Todavia no hay costos cargados. Sin este catalogo no hay calculo de rentabilidad.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
