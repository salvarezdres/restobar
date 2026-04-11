'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import { useEmployees } from "@/hooks/use-kitchen-queries";
import {
  calculatePayrollTotals,
  calculateSalesProjection,
} from "@/lib/kitchen/finance";

export default function SalesProjectionCalculator() {
  const { ownerId } = useWorkspaceSession();
  const employeesQuery = useEmployees(ownerId);
  const [averageTicket, setAverageTicket] = useState(0);
  const [coversPerDay, setCoversPerDay] = useState(0);
  const [openDaysPerMonth, setOpenDaysPerMonth] = useState(26);
  const [growthRate, setGrowthRate] = useState(0.08);
  const [operationalFixedCost, setOperationalFixedCost] = useState(0);

  const payroll = useMemo(
    () => calculatePayrollTotals(employeesQuery.data ?? [], 0.24, 0.1),
    [employeesQuery.data],
  );

  const projection = useMemo(
    () =>
      calculateSalesProjection({
        averageTicket,
        coversPerDay,
        openDaysPerMonth,
        growthRate,
        payrollCost: payroll.totalPayroll,
        operationalCost: operationalFixedCost,
      }),
    [
      averageTicket,
      coversPerDay,
      growthRate,
      openDaysPerMonth,
      operationalFixedCost,
      payroll.totalPayroll,
    ],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Venta base mensual</span>
          <strong className={styles.summaryValue}>
            ${projection.baseSales.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Venta proyectada</span>
          <strong className={styles.summaryValue}>
            ${projection.projectedSales.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Punto de equilibrio</span>
          <strong className={styles.summaryValue}>
            ${projection.breakEvenSales.toFixed(2)}
          </strong>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Proyeccion de venta</h2>
            <p className={styles.sectionDescription}>
              Modelo rapido para estimar venta mensual y aporte despues de costos fijos.
            </p>
          </div>
        </div>

        <div className={styles.formColumns}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Ticket promedio</span>
            <input className={styles.input} onChange={(event) => setAverageTicket(Number(event.target.value) || 0)} type="number" value={averageTicket} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Cubiertos por dia</span>
            <input className={styles.input} onChange={(event) => setCoversPerDay(Number(event.target.value) || 0)} type="number" value={coversPerDay} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Dias abiertos al mes</span>
            <input className={styles.input} onChange={(event) => setOpenDaysPerMonth(Number(event.target.value) || 0)} type="number" value={openDaysPerMonth} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Crecimiento esperado (%)</span>
            <input
              className={styles.input}
              onChange={(event) => setGrowthRate(Number(event.target.value) / 100 || 0)}
              type="number"
              value={(growthRate * 100).toFixed(2)}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Costo operacional fijo</span>
            <input
              className={styles.input}
              onChange={(event) => setOperationalFixedCost(Number(event.target.value) || 0)}
              type="number"
              value={operationalFixedCost}
            />
          </label>
          <div className={styles.listCard}>
            <span className={styles.cardTitle}>Aporte despues de fijos</span>
            <p className={styles.cardMeta}>
              ${projection.contributionAfterFixed.toFixed(2)}
            </p>
            <p className={styles.cardMeta}>
              Nomina considerada: ${payroll.totalPayroll.toFixed(2)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
