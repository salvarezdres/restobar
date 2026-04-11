'use client'

import { useState } from "react";

import styles from "@/components/workspace.module.css";
import {
  useDeleteEmployee,
  useEmployees,
  useSaveEmployee,
} from "@/hooks/use-kitchen-queries";
import { useFirebaseSession } from "@/hooks/use-firebase-session";
import type { Employee, EmployeeRole } from "@/lib/kitchen/types";

const ROLE_OPTIONS: EmployeeRole[] = [
  "chef",
  "ayudante",
  "garzon",
  "administracion",
];

function createEmptyEmployee(ownerId: string): Employee {
  return {
    id: "",
    ownerId,
    name: "",
    email: "",
    role: "chef",
    salary: 0,
  };
}

export default function EmployeeManager() {
  const { user } = useFirebaseSession();
  const ownerId = user?.uid ?? "";
  const employeesQuery = useEmployees(user?.uid);
  const saveEmployee = useSaveEmployee(user?.uid);
  const deleteEmployee = useDeleteEmployee(user?.uid);
  const [draft, setDraft] = useState<Employee>(createEmptyEmployee(ownerId));
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!draft.name.trim() || draft.salary <= 0) {
      setError("Nombre y sueldo son obligatorios.");
      return;
    }

    setError(null);
    await saveEmployee.mutateAsync({
      ...draft,
      ownerId,
      name: draft.name.trim(),
    });
    setDraft(createEmptyEmployee(ownerId));
  };

  return (
    <div className={styles.workspaceGrid}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Empleado</h2>
            <p className={styles.sectionDescription}>
              CRUD simple para construir la base del equipo.
            </p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Nombre</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))
              }
              value={draft.name}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Rol</span>
            <select
              className={styles.select}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  role: event.target.value as EmployeeRole,
                }))
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
            <span className={styles.fieldLabel}>Email</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  email: event.target.value,
                }))
              }
              type="email"
              value={draft.email ?? ""}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sueldo</span>
            <input
              className={styles.input}
              min="0"
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  salary: Number(event.target.value) || 0,
                }))
              }
              type="number"
              value={draft.salary}
            />
          </label>

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={saveEmployee.isPending}
              onClick={() => {
                void handleSave();
              }}
              type="button"
            >
              {saveEmployee.isPending
                ? "Guardando..."
                : draft.id
                  ? "Actualizar empleado"
                  : "Crear empleado"}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={() => setDraft(createEmptyEmployee(ownerId))}
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Equipo</h2>
            <p className={styles.sectionDescription}>
              Base operativa de personas para etapas futuras de asignacion y turnos.
            </p>
          </div>
        </div>

        <div className={styles.stack}>
          {employeesQuery.data?.length ? (
            employeesQuery.data.map((employee) => (
              <article className={styles.listCard} key={employee.id}>
                <div className={styles.listCardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{employee.name}</h3>
                    <p className={styles.cardMeta}>
                      {employee.role} · ${employee.salary.toFixed(2)}
                    </p>
                    {employee.email ? (
                      <p className={styles.cardMeta}>{employee.email}</p>
                    ) : null}
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      className={styles.tagButton}
                      onClick={() => setDraft(employee)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className={styles.dangerButton}
                      onClick={() => {
                        void deleteEmployee.mutateAsync(employee.id);
                      }}
                      type="button"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className={styles.emptyCard}>
              Todavia no hay empleados cargados.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
