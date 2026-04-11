'use client'

import styles from "@/components/workspace.module.css";

import { useEmployeeManager } from "../application/use-employee-manager";
import { useEmployeeFeatureGateway } from "../infrastructure/use-employee-feature-gateway";
import { EmployeeForm } from "./employee-form";
import { EmployeeList } from "./employee-list";
import { EmployeeOverviewCards } from "./employee-overview-cards";

export default function EmployeeManagerFeature() {
  const gateway = useEmployeeFeatureGateway();
  const {
    draft,
    employees,
    error,
    evaluations,
    isDeleting,
    isSaving,
    overview,
    removeEmployee,
    resetDraft,
    saveDraft,
    startEditing,
    updateDraftField,
    updateLegalProfileField,
  } = useEmployeeManager(gateway);

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Modulo de empleados</span>
          <h2 className={styles.heroTitle}>
            La ficha del trabajador ya no es solo administrativa: alimenta control legal activo.
          </h2>
          <p className={styles.heroDescription}>
            Cada alta inicia seguimiento de contrato, cotizaciones, jornada y seguridad laboral.
          </p>
        </div>

        <EmployeeOverviewCards {...overview} />
      </section>

      <div className={styles.workspaceGridWide}>
        <EmployeeForm
          draft={draft}
          error={error}
          isSaving={isSaving}
          onDraftFieldChange={updateDraftField}
          onLegalProfileChange={updateLegalProfileField}
          onReset={resetDraft}
          onSave={() => {
            void saveDraft();
          }}
        />

        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Estado del equipo</h2>
              <p className={styles.sectionDescription}>
                La vista laboral debe dejar claro a quien puedes ignorar y a quien no.
              </p>
            </div>
          </div>

          <EmployeeList
            employees={employees}
            evaluations={evaluations}
            onDelete={(employeeId) => {
              if (!isDeleting) {
                void removeEmployee(employeeId);
              }
            }}
            onEdit={startEditing}
          />
        </section>
      </div>
    </div>
  );
}
