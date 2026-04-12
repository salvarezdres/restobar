'use client'

import { useState } from "react";

import styles from "@/components/workspace.module.css";

import { useEmployeeManager } from "../application/use-employee-manager";
import { useEmployeeFeatureGateway } from "../infrastructure/use-employee-feature-gateway";
import { EmployeeForm } from "./employee-form";
import { EmployeeList } from "./employee-list";
import { EmployeeOverviewCards } from "./employee-overview-cards";

export default function EmployeeManagerFeature() {
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  async function handleSaveDraft() {
    const didSave = await saveDraft();

    if (didSave) {
      setIsFormOpen(false);
    }
  }

  function handleCreateEmployee() {
    resetDraft();
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    resetDraft();
    setIsFormOpen(false);
  }

  function handleEditEmployee(employee: (typeof employees)[number]) {
    startEditing(employee);
    setIsFormOpen(true);
  }

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

      <div className={styles.stack}>
        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Estado del equipo</h2>
              <p className={styles.sectionDescription}>
                La vista laboral debe dejar claro a quien puedes ignorar y a quien no.
              </p>
            </div>
            <button
              className={styles.primaryButton}
              onClick={handleCreateEmployee}
              type="button"
            >
              Añadir nuevo trabajador a la nómina
            </button>
          </div>

          <EmployeeList
            employees={employees}
            evaluations={evaluations}
            onDelete={(employeeId) => {
              if (!isDeleting) {
                void removeEmployee(employeeId);
              }
            }}
            onEdit={handleEditEmployee}
          />
        </section>
      </div>

      {isFormOpen ? (
        <div
          aria-modal="true"
          className={styles.modalOverlay}
          onClick={handleCloseForm}
          role="dialog"
        >
          <div className={styles.modalShell} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.statusPill}>
                  {draft.id ? "Editar trabajador" : "Nuevo trabajador"}
                </span>
                <h2 className={styles.sectionTitle}>Ficha laboral para nómina y liquidaciones</h2>
              </div>
              <button
                aria-label="Cerrar formulario"
                className={styles.secondaryButton}
                onClick={handleCloseForm}
                type="button"
              >
                Cerrar
              </button>
            </div>

            <EmployeeForm
              draft={draft}
              error={error}
              isSaving={isSaving}
              onDraftFieldChange={updateDraftField}
              onLegalProfileChange={updateLegalProfileField}
              onReset={resetDraft}
              onSave={() => {
                void handleSaveDraft();
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
