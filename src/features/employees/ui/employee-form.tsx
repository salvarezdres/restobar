'use client'

import styles from "@/components/workspace.module.css";
import type { Employee } from "@/lib/kitchen/types";

import { ROLE_OPTIONS } from "../domain/employee-draft";

type EmployeeFormProps = {
  draft: Employee;
  error: string | null;
  isSaving: boolean;
  onDraftFieldChange: <Key extends keyof Employee>(
    field: Key,
    value: Employee[Key],
  ) => void;
  onLegalProfileChange: <Key extends keyof Employee["legalProfile"]>(
    field: Key,
    value: Employee["legalProfile"][Key],
  ) => void;
  onReset: () => void;
  onSave: () => void;
};

export function EmployeeForm({
  draft,
  error,
  isSaving,
  onDraftFieldChange,
  onLegalProfileChange,
  onReset,
  onSave,
}: EmployeeFormProps) {
  return (
    <section className={styles.panel} data-reveal>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>
            {draft.id ? "Editar trabajador" : "Nuevo trabajador"}
          </h2>
          <p className={styles.sectionDescription}>
            La ficha legal debe quedar completa desde el ingreso o el motor de riesgo no sirve.
          </p>
        </div>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formColumns}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nombre</span>
            <input
              className={styles.input}
              onChange={(event) => onDraftFieldChange("name", event.target.value)}
              value={draft.name}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Email</span>
            <input
              className={styles.input}
              onChange={(event) => onDraftFieldChange("email", event.target.value)}
              type="email"
              value={draft.email ?? ""}
            />
          </label>
        </div>

        <div className={styles.formColumns}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Rol</span>
            <select
              className={styles.select}
              onChange={(event) =>
                onDraftFieldChange("role", event.target.value as Employee["role"])
              }
              value={draft.role}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sueldo</span>
            <input
              className={styles.input}
              min="0"
              onChange={(event) =>
                onDraftFieldChange("salary", Number(event.target.value) || 0)
              }
              type="number"
              value={draft.salary}
            />
          </label>
        </div>

        <section className={styles.spotlightCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Control contractual y previsional</h3>
              <p className={styles.sectionDescription}>
                Aqui vive el seguimiento que activa avisos, riesgo y eventual incumplimiento.
              </p>
            </div>
          </div>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Fecha de ingreso</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  onLegalProfileChange("employmentStartDate", event.target.value)
                }
                type="date"
                value={draft.legalProfile.employmentStartDate}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Fecha firma contrato</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  onLegalProfileChange("contractSignedDate", event.target.value)
                }
                type="date"
                value={draft.legalProfile.contractSignedDate ?? ""}
              />
            </label>
          </div>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Tipo de contrato</span>
              <select
                className={styles.select}
                onChange={(event) =>
                  onLegalProfileChange(
                    "contractType",
                    event.target.value as NonNullable<Employee["legalProfile"]["contractType"]>,
                  )
                }
                value={draft.legalProfile.contractType ?? "indefinido"}
              >
                <option value="indefinido">Indefinido</option>
                <option value="plazo-fijo">Plazo fijo</option>
                <option value="por-obra">Por obra</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Ultimo mes cotizado</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  onLegalProfileChange("lastContributionPaidMonth", event.target.value)
                }
                type="month"
                value={draft.legalProfile.lastContributionPaidMonth ?? ""}
              />
            </label>
          </div>
        </section>

        <section className={styles.spotlightCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Jornada y seguridad</h3>
              <p className={styles.sectionDescription}>
                Sin jornada declarada ni mutual registrada no existe cumplimiento verificable.
              </p>
            </div>
          </div>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Horas semanales</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  onLegalProfileChange("weeklyHours", Number(event.target.value) || 0)
                }
                type="number"
                value={draft.legalProfile.weeklyHours}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Horas diarias</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  onLegalProfileChange("dailyWorkingHours", Number(event.target.value) || 0)
                }
                type="number"
                value={draft.legalProfile.dailyWorkingHours}
              />
            </label>
          </div>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Colacion en minutos</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  onLegalProfileChange("breakMinutes", Number(event.target.value) || 0)
                }
                type="number"
                value={draft.legalProfile.breakMinutes}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Horas extra por dia</span>
              <input
                className={styles.input}
                min="0"
                onChange={(event) =>
                  onLegalProfileChange("overtimeHoursPerDay", Number(event.target.value) || 0)
                }
                type="number"
                value={draft.legalProfile.overtimeHoursPerDay}
              />
            </label>
          </div>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Afiliado a mutual</span>
              <select
                className={styles.select}
                onChange={(event) =>
                  onLegalProfileChange("isMutualAffiliated", event.target.value === "si")
                }
                value={draft.legalProfile.isMutualAffiliated ? "si" : "no"}
              >
                <option value="no">No</option>
                <option value="si">Si</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Nombre mutual</span>
              <input
                className={styles.input}
                onChange={(event) => onLegalProfileChange("mutualName", event.target.value)}
                placeholder="ACHS, Mutual, IST..."
                value={draft.legalProfile.mutualName ?? ""}
              />
            </label>
          </div>
        </section>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.buttonRow}>
          <button
            className={styles.primaryButton}
            disabled={isSaving}
            onClick={onSave}
            type="button"
          >
            {isSaving
              ? "Guardando..."
              : draft.id
                ? "Actualizar trabajador"
                : "Crear trabajador"}
          </button>
          <button className={styles.secondaryButton} onClick={onReset} type="button">
            Limpiar
          </button>
        </div>
      </div>
    </section>
  );
}
