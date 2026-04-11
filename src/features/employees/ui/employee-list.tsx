'use client'

import styles from "@/components/workspace.module.css";
import type { Employee, EmployeeLegalEvaluation } from "@/lib/kitchen/types";

import { getRiskBadgeClass } from "./risk-badge";

type EmployeeListProps = {
  employees: Employee[];
  evaluations: EmployeeLegalEvaluation[];
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
};

export function EmployeeList({
  employees,
  evaluations,
  onDelete,
  onEdit,
}: EmployeeListProps) {
  if (!evaluations.length) {
    return (
      <div className={styles.emptyCard}>
        Todavia no hay trabajadores cargados. Sin esta base no existe control laboral real.
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {evaluations.map((employee) => {
        const sourceEmployee = employees.find((item) => item.id === employee.employeeId);

        return (
          <article className={styles.listCard} key={employee.employeeId}>
            <div className={styles.listCardHeader}>
              <div className={styles.stack}>
                <div className={styles.rowMetrics}>
                  <span
                    className={`${styles.miniPill} ${getRiskBadgeClass(
                      employee.overallRisk,
                      styles,
                    )}`}
                  >
                    {employee.overallRisk}
                  </span>
                  <span className={styles.miniPill}>
                    Cumplimiento {employee.completionScore}%
                  </span>
                </div>
                <div>
                  <h3 className={styles.cardTitle}>{employee.employeeName}</h3>
                  <p className={styles.cardMeta}>
                    {employee.alerts.length} alertas activas en seguimiento.
                  </p>
                </div>
              </div>

              {sourceEmployee ? (
                <div className={styles.buttonRow}>
                  <button
                    className={styles.tagButton}
                    onClick={() => onEdit(sourceEmployee)}
                    type="button"
                  >
                    Editar
                  </button>
                  <button
                    className={styles.dangerButton}
                    onClick={() => onDelete(sourceEmployee.id)}
                    type="button"
                  >
                    Borrar
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.statusGrid}>
              {employee.checks.map((check) => (
                <div className={styles.statusRow} key={check.id}>
                  <div>
                    <strong className={styles.cardTitle}>{check.checkType}</strong>
                    <p className={styles.cardMeta}>{check.summary}</p>
                  </div>
                  <span
                    className={`${styles.miniPill} ${getRiskBadgeClass(
                      check.riskLevel,
                      styles,
                    )}`}
                  >
                    {check.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}
