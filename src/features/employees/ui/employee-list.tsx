'use client'

import { useState } from "react";

import styles from "@/components/workspace.module.css";
import type {
  Employee,
  EmployeeLegalEvaluation,
  LegalCheck,
  LegalCheckType,
} from "@/lib/kitchen/types";

import { getRiskBadgeClass } from "./risk-badge";

type EmployeeListProps = {
  employees: Employee[];
  evaluations: EmployeeLegalEvaluation[];
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
};

const CHECK_TYPE_LABELS: Record<LegalCheckType, string> = {
  contract: "Contrato",
  cotizaciones: "Cotizaciones",
  jornada: "Jornada",
  seguridad: "Seguridad",
};

function getCheckLabel(checkType: LegalCheck["checkType"]) {
  return CHECK_TYPE_LABELS[checkType];
}

export function EmployeeList({
  employees,
  evaluations,
  onDelete,
  onEdit,
}: EmployeeListProps) {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

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
        const isExpanded = expandedEmployeeId === employee.employeeId;

        return (
          <article className={styles.listCard} key={employee.employeeId}>
            <button
              aria-expanded={isExpanded}
              className={styles.accordionTrigger}
              onClick={() =>
                setExpandedEmployeeId((current) =>
                  current === employee.employeeId ? null : employee.employeeId,
                )
              }
              type="button"
            >
              <div>
                <h3 className={styles.cardTitle}>{employee.employeeName}</h3>
                <p className={styles.cardMeta}>{sourceEmployee?.role ?? "Sin rol"}</p>
              </div>
              <span className={styles.arrowHint}>{isExpanded ? "Ocultar" : "Ver"}</span>
            </button>

            {isExpanded ? (
              <div className={styles.accordionContent}>
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
                  <span className={styles.miniPill}>
                    {employee.alerts.length} alertas activas
                  </span>
                </div>

                <div className={styles.statusGrid}>
                  {employee.checks.map((check) => (
                    <div className={styles.statusRow} key={check.id}>
                      <div>
                        <strong className={styles.cardTitle}>{getCheckLabel(check.checkType)}</strong>
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
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
