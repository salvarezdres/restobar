'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { calculateOperationalCosts } from "@/lib/kitchen/finance";

export default function OperationsCalculator() {
  const [rent, setRent] = useState(0);
  const [utilities, setUtilities] = useState(0);
  const [logistics, setLogistics] = useState(0);
  const [maintenance, setMaintenance] = useState(0);
  const [software, setSoftware] = useState(0);
  const [miscellaneous, setMiscellaneous] = useState(0);
  const [projectedSales, setProjectedSales] = useState(0);
  const [salesVariableRate, setSalesVariableRate] = useState(0.03);

  const totals = useMemo(
    () =>
      calculateOperationalCosts({
        rent,
        utilities,
        logistics,
        maintenance,
        software,
        miscellaneous,
        projectedSales,
        salesVariableRate,
      }),
    [
      logistics,
      maintenance,
      miscellaneous,
      projectedSales,
      rent,
      salesVariableRate,
      software,
      utilities,
    ],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Costo fijo</span>
          <strong className={styles.summaryValue}>
            ${totals.fixedTotal.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Costo variable</span>
          <strong className={styles.summaryValue}>
            ${totals.variableTotal.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Costo operacional</span>
          <strong className={styles.summaryValue}>
            ${totals.totalOperationalCost.toFixed(2)}
          </strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Costos operacionales</h2>
            <p className={styles.sectionDescription}>
              Registra costos fijos y un componente variable sobre ventas.
            </p>
          </div>
        </div>

        <div className={styles.formColumns}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Arriendo</span>
            <input className={styles.input} onChange={(event) => setRent(Number(event.target.value) || 0)} type="number" value={rent} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Servicios</span>
            <input className={styles.input} onChange={(event) => setUtilities(Number(event.target.value) || 0)} type="number" value={utilities} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Logistica</span>
            <input className={styles.input} onChange={(event) => setLogistics(Number(event.target.value) || 0)} type="number" value={logistics} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Mantenimiento</span>
            <input className={styles.input} onChange={(event) => setMaintenance(Number(event.target.value) || 0)} type="number" value={maintenance} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Software</span>
            <input className={styles.input} onChange={(event) => setSoftware(Number(event.target.value) || 0)} type="number" value={software} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Otros</span>
            <input className={styles.input} onChange={(event) => setMiscellaneous(Number(event.target.value) || 0)} type="number" value={miscellaneous} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Ventas proyectadas</span>
            <input className={styles.input} onChange={(event) => setProjectedSales(Number(event.target.value) || 0)} type="number" value={projectedSales} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Costo variable sobre ventas (%)</span>
            <input
              className={styles.input}
              onChange={(event) => setSalesVariableRate(Number(event.target.value) / 100 || 0)}
              type="number"
              value={(salesVariableRate * 100).toFixed(2)}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
