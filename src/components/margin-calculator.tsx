'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import {
  useCostCatalog,
  useEmployees,
  useMenus,
  useRecipes,
} from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import {
  calculateMenuMargin,
  calculatePayrollTotals,
} from "@/lib/kitchen/finance";

export default function MarginCalculator() {
  const { user } = useFirebaseSession();
  const menusQuery = useMenus(user?.uid);
  const recipesQuery = useRecipes(user?.uid);
  const costsQuery = useCostCatalog(user?.uid);
  const employeesQuery = useEmployees(user?.uid);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [sellingPricePerService, setSellingPricePerService] = useState(0);
  const [legalBurdenRate] = useState(0.24);
  const [bonusRate] = useState(0.1);
  const [operationalCost, setOperationalCost] = useState(0);

  const selectedMenu =
    menusQuery.data?.find((menu) => menu.id === selectedMenuId) ?? null;

  const payroll = useMemo(
    () =>
      calculatePayrollTotals(
        employeesQuery.data ?? [],
        legalBurdenRate,
        bonusRate,
      ),
    [bonusRate, employeesQuery.data, legalBurdenRate],
  );

  const margin = useMemo(
    () =>
      calculateMenuMargin({
        menu: selectedMenu,
        recipes: recipesQuery.data ?? [],
        costs: costsQuery.data ?? [],
        sellingPricePerService,
        payrollCost: payroll.totalPayroll,
        operationalCost,
      }),
    [
      costsQuery.data,
      operationalCost,
      payroll.totalPayroll,
      recipesQuery.data,
      selectedMenu,
      sellingPricePerService,
    ],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Ingreso estimado</span>
          <strong className={styles.summaryValue}>${margin.revenue.toFixed(2)}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Margen bruto</span>
          <strong className={styles.summaryValue}>
            ${margin.grossMargin.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Margen liquido</span>
          <strong className={styles.summaryValue}>
            ${margin.netMargin.toFixed(2)}
          </strong>
        </article>
      </section>

      <div className={styles.workspaceGridWide}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Entradas del calculo</h2>
              <p className={styles.sectionDescription}>
                Cruza menu, costo directo, nomina y costos operacionales.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Menu</span>
              <select
                className={styles.select}
                onChange={(event) => setSelectedMenuId(event.target.value)}
                value={selectedMenuId}
              >
                <option value="">Selecciona menu</option>
                {menusQuery.data?.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Precio por servicio</span>
              <input
                className={styles.input}
                onChange={(event) => setSellingPricePerService(Number(event.target.value) || 0)}
                type="number"
                value={sellingPricePerService}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Costo operacional imputado</span>
              <input
                className={styles.input}
                onChange={(event) => setOperationalCost(Number(event.target.value) || 0)}
                type="number"
                value={operationalCost}
              />
            </label>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Resultado financiero</h2>
              <p className={styles.sectionDescription}>
                Vista rapida de rentabilidad para una corrida de menu.
              </p>
            </div>
          </div>

          <div className={styles.stack}>
            <div className={styles.tableRowCompact}>
              <span>Costo directo</span>
              <strong>${margin.directCost.toFixed(2)}</strong>
            </div>
            <div className={styles.tableRowCompact}>
              <span>Margen bruto</span>
              <strong>
                ${margin.grossMargin.toFixed(2)} ({(margin.grossMarginRate * 100).toFixed(1)}%)
              </strong>
            </div>
            <div className={styles.tableRowCompact}>
              <span>Nomina considerada</span>
              <strong>${payroll.totalPayroll.toFixed(2)}</strong>
            </div>
            <div className={styles.tableRowCompact}>
              <span>Margen liquido</span>
              <strong>
                ${margin.netMargin.toFixed(2)} ({(margin.netMarginRate * 100).toFixed(1)}%)
              </strong>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
