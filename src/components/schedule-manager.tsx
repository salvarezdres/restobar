'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useDeleteScheduleEvent,
  useEmployees,
  useSaveScheduleEvent,
  useScheduleEvents,
} from "@/hooks/use-kitchen-queries";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import type { ScheduleEvent } from "@/lib/kitchen/types";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptySchedule(ownerId: string): ScheduleEvent {
  return {
    id: "",
    ownerId,
    title: "",
    collaboratorIds: [],
    collaboratorNames: [],
    collaboratorEmails: [],
    date: todayDate(),
    startTime: "10:00",
    endTime: "11:00",
    notes: "",
  };
}

export default function ScheduleManager() {
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const employeesQuery = useEmployees(ownerId);
  const scheduleQuery = useScheduleEvents(ownerId);
  const saveScheduleEvent = useSaveScheduleEvent(ownerId);
  const deleteScheduleEvent = useDeleteScheduleEvent(ownerId);
  const [draft, setDraft] = useState<ScheduleEvent>(createEmptySchedule(stableOwnerId));
  const [error, setError] = useState<string | null>(null);
  const [isCreatingCalendarEvent, setIsCreatingCalendarEvent] = useState(false);

  const collaborators = useMemo(
    () =>
      employeesQuery.data?.filter((employee) =>
        draft.collaboratorIds.includes(employee.id),
      ) ?? [],
    [draft.collaboratorIds, employeesQuery.data],
  );

  const toggleCollaborator = (employeeId: string) => {
    const employee = employeesQuery.data?.find((item) => item.id === employeeId);

    if (!employee) {
      return;
    }

    setDraft((currentDraft) => {
      const isActive = currentDraft.collaboratorIds.includes(employeeId);
      const nextCollaboratorIds = isActive
        ? currentDraft.collaboratorIds.filter((id) => id !== employeeId)
        : [...currentDraft.collaboratorIds, employeeId];

      const selectedEmployees =
        employeesQuery.data?.filter((item) => nextCollaboratorIds.includes(item.id)) ?? [];

      return {
        ...currentDraft,
        collaboratorIds: nextCollaboratorIds,
        collaboratorNames: selectedEmployees.map((item) => item.name),
        collaboratorEmails: selectedEmployees
          .map((item) => item.email?.trim() ?? "")
          .filter(Boolean),
      };
    });
  };

  const resetDraft = () => {
    setDraft(createEmptySchedule(stableOwnerId));
    setError(null);
  };

  const persistEvent = async (calendar: boolean) => {
    if (!draft.title.trim()) {
      setError("La cita necesita un titulo.");
      return;
    }

    if (draft.startTime >= draft.endTime) {
      setError("La hora de termino debe ser mayor a la de inicio.");
      return;
    }

    setError(null);
    let googleCalendarEventId = draft.googleCalendarEventId;
    let googleCalendarLink = draft.googleCalendarLink;

    if (calendar) {
      setIsCreatingCalendarEvent(true);

      try {
        const calendarEvent = await createGoogleCalendarEvent({
          title: draft.title,
          description: draft.notes,
          startDateTime: `${draft.date}T${draft.startTime}:00`,
          endDateTime: `${draft.date}T${draft.endTime}:00`,
          attendees: draft.collaboratorEmails,
        });

        googleCalendarEventId = calendarEvent.id;
        googleCalendarLink = calendarEvent.htmlLink;
      } catch (calendarError: unknown) {
        setError(
          calendarError instanceof Error
            ? calendarError.message
            : "No se pudo crear la cita en Google Calendar.",
        );
        setIsCreatingCalendarEvent(false);
        return;
      }

      setIsCreatingCalendarEvent(false);
    }

    await saveScheduleEvent.mutateAsync({
      ...draft,
      ownerId: stableOwnerId,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      googleCalendarEventId,
      googleCalendarLink,
    });

    resetDraft();
  };

  return (
    <div className={styles.workspaceGridWide}>
      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Agenda</h2>
            <p className={styles.sectionDescription}>
              Crea citas internas y, si quieres, publicalas en Google Calendar.
            </p>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Titulo</span>
            <input
              className={styles.input}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  title: event.target.value,
                }))
              }
              value={draft.title}
            />
          </label>

          <div className={styles.formColumns}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Fecha</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    date: event.target.value,
                  }))
                }
                type="date"
                value={draft.date}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Inicio</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    startTime: event.target.value,
                  }))
                }
                type="time"
                value={draft.startTime}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Termino</span>
              <input
                className={styles.input}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    endTime: event.target.value,
                  }))
                }
                type="time"
                value={draft.endTime}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Notas</span>
            <textarea
              className={styles.textarea}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  notes: event.target.value,
                }))
              }
              value={draft.notes}
            />
          </label>

          <div className={styles.stack}>
            <span className={styles.fieldLabel}>Colaboradores</span>
            <div className={styles.buttonRow}>
              {employeesQuery.data?.map((employee) => (
                <button
                  className={
                    draft.collaboratorIds.includes(employee.id)
                      ? styles.primaryButton
                      : styles.tagButton
                  }
                  key={employee.id}
                  onClick={() => toggleCollaborator(employee.id)}
                  type="button"
                >
                  {employee.name}
                </button>
              ))}
            </div>
          </div>

          {collaborators.length ? (
            <div className={styles.listCard}>
              <span className={styles.cardTitle}>Invitados</span>
              {collaborators.map((employee) => (
                <p className={styles.cardMeta} key={employee.id}>
                  {employee.name}
                  {employee.email ? ` · ${employee.email}` : " · sin email"}
                </p>
              ))}
            </div>
          ) : null}

          {error ? <p className={styles.errorText}>{error}</p> : null}

          <div className={styles.buttonRow}>
            <button
              className={styles.primaryButton}
              disabled={saveScheduleEvent.isPending || isCreatingCalendarEvent}
              onClick={() => {
                void persistEvent(false);
              }}
              type="button"
            >
              Guardar cita
            </button>
            <button
              className={styles.secondaryButton}
              disabled={saveScheduleEvent.isPending || isCreatingCalendarEvent}
              onClick={() => {
                void persistEvent(true);
              }}
              type="button"
            >
              {isCreatingCalendarEvent ? "Creando..." : "Guardar y crear en Google Calendar"}
            </button>
            <button className={styles.tagButton} onClick={resetDraft} type="button">
              Limpiar
            </button>
          </div>
        </div>
      </section>

      <section className={styles.tableCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Agenda creada</h2>
            <p className={styles.sectionDescription}>
              Historial de citas internas y accesos a eventos publicados.
            </p>
          </div>
        </div>

        <div className={styles.stack}>
          {scheduleQuery.data?.length ? (
            scheduleQuery.data.map((event) => (
              <article className={styles.listCard} key={event.id}>
                <div className={styles.listCardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{event.title}</h3>
                    <p className={styles.cardMeta}>
                      {event.date} · {event.startTime} - {event.endTime}
                    </p>
                    <p className={styles.cardMeta}>
                      {event.collaboratorNames.join(", ") || "Sin colaboradores"}
                    </p>
                  </div>
                  <div className={styles.buttonRow}>
                    {event.googleCalendarLink ? (
                      <a
                        className={styles.tagButton}
                        href={event.googleCalendarLink}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Abrir Calendar
                      </a>
                    ) : null}
                    <button
                      className={styles.tagButton}
                      onClick={() => setDraft(event)}
                      type="button"
                    >
                      Editar
                    </button>
                    <button
                      className={styles.dangerButton}
                      onClick={() => {
                        void deleteScheduleEvent.mutateAsync(event.id);
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
              Todavia no hay citas creadas.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
