'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useEmployees } from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import { calculatePayrollTotals } from "@/lib/kitchen/finance";

export default function PayrollCalculator() {
  const { user } = useFirebaseSession();
  const employeesQuery = useEmployees(user?.uid);
  const [legalBurdenRate, setLegalBurdenRate] = useState(0.24);
  const [bonusRate, setBonusRate] = useState(0.1);

  const payroll = useMemo(
    () =>
      calculatePayrollTotals(
        employeesQuery.data ?? [],
        legalBurdenRate,
        bonusRate,
      ),
    [bonusRate, employeesQuery.data, legalBurdenRate],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Sueldos base</span>
          <strong className={styles.summaryValue}>
            ${payroll.grossSalaries.toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Cargas + bonos</span>
          <strong className={styles.summaryValue}>
            ${(payroll.burdenTotal + payroll.bonusTotal).toFixed(2)}
          </strong>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.smallLabel}>Liquido a pagar</span>
          <strong className={styles.summaryValue}>
            ${payroll.totalPayroll.toFixed(2)}
          </strong>
        </article>
      </section>

      <div className={styles.workspaceGridWide}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Parametros</h2>
              <p className={styles.sectionDescription}>
                Ajusta cargas legales y bonos para estimar liquidaciones.
              </p>
            </div>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Carga legal</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  setLegalBurdenRate(Number(event.target.value) / 100 || 0)
                }
                type="number"
                value={(legalBurdenRate * 100).toFixed(2)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Bonos / extras</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  setBonusRate(Number(event.target.value) / 100 || 0)
                }
                type="number"
                value={(bonusRate * 100).toFixed(2)}
              />
            </label>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Detalle por empleado</h2>
              <p className={styles.sectionDescription}>
                Estimacion de costo total mensual por persona.
              </p>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHeadFive}>
              <span>Empleado</span>
              <span>Sueldo</span>
              <span>Carga</span>
              <span>Bono</span>
              <span>Total</span>
            </div>
            {payroll.items.length ? (
              payroll.items.map((employee) => (
                <div className={styles.tableRowFive} key={employee.id}>
                  <span>{employee.name}</span>
                  <span>${employee.salary.toFixed(2)}</span>
                  <span>${employee.burden.toFixed(2)}</span>
                  <span>${employee.bonus.toFixed(2)}</span>
                  <span>${employee.total.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyCard}>
                No hay empleados cargados para calcular liquidaciones.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
