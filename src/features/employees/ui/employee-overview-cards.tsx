'use client'

import styles from "@/components/workspace.module.css";

type EmployeeOverviewCardsProps = {
  activeAlertsCount: number;
  compliancePercent: number;
  criticalCount: number;
  totalEmployees: number;
};

export function EmployeeOverviewCards({
  activeAlertsCount,
  compliancePercent,
  criticalCount,
  totalEmployees,
}: EmployeeOverviewCardsProps) {
  return (
    <div className={styles.summaryGrid}>
      <article className={styles.summaryCard}>
        <span className={styles.smallLabel}>Trabajadores</span>
        <strong className={styles.summaryValue}>{totalEmployees}</strong>
        <p className={styles.summaryHint}>Base activa para operacion y cumplimiento.</p>
      </article>
      <article className={styles.summaryCard}>
        <span className={styles.smallLabel}>Riesgo alto o grave</span>
        <strong className={styles.summaryValue}>{criticalCount}</strong>
        <p className={styles.summaryHint}>Casos que no deberian esperar una semana.</p>
      </article>
      <article className={styles.summaryCard}>
        <span className={styles.smallLabel}>Cumplimiento promedio</span>
        <strong className={styles.summaryValue}>{compliancePercent}%</strong>
        <p className={styles.summaryHint}>Lectura consolidada del estado laboral actual.</p>
      </article>
      <article className={styles.summaryCard}>
        <span className={styles.smallLabel}>Alertas activas</span>
        <strong className={styles.summaryValue}>{activeAlertsCount}</strong>
        <p className={styles.summaryHint}>Se generan desde las reglas legales configuradas.</p>
      </article>
    </div>
  );
}
