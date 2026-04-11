'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useComplianceOverview,
  useEmployees,
} from "@/hooks/use-kitchen-queries";
import { normalizeEmployeeLegalProfile } from "@/lib/legal-compliance";

function riskBadgeClass(risk: string) {
  if (risk === "OK") {
    return styles.riskOk;
  }

  if (risk === "RIESGO BAJO") {
    return styles.riskLow;
  }

  if (risk === "RIESGO MEDIO") {
    return styles.riskMedium;
  }

  return styles.riskHigh;
}

function alertBadgeClass(severity: string) {
  if (severity === "preventiva") {
    return styles.riskLow;
  }

  if (severity === "riesgo") {
    return styles.riskMedium;
  }

  return styles.riskHigh;
}

function formatDate(value?: string) {
  if (!value) {
    return "No informado";
  }

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function buildDocumentChecklist(employee: ReturnType<typeof normalizeEmployeeLegalProfile>) {
  return [
    {
      id: "contract",
      label: "Contrato firmado",
      present: Boolean(employee.legalProfile.contractSignedDate),
      detail: employee.legalProfile.contractSignedDate
        ? `Firmado el ${formatDate(employee.legalProfile.contractSignedDate)}`
        : "Falta cargar la fecha de firma del contrato.",
    },
    {
      id: "contributions",
      label: "Cotizacion del ultimo mes",
      present: Boolean(employee.legalProfile.lastContributionPaidMonth),
      detail: employee.legalProfile.lastContributionPaidMonth
        ? `Ultimo mes pagado: ${employee.legalProfile.lastContributionPaidMonth}`
        : "No hay mes de cotizacion registrado.",
    },
    {
      id: "mutual",
      label: "Mutual o seguro laboral",
      present:
        employee.legalProfile.isMutualAffiliated &&
        Boolean(employee.legalProfile.mutualName?.trim()),
      detail:
        employee.legalProfile.isMutualAffiliated && employee.legalProfile.mutualName?.trim()
          ? `Afiliado en ${employee.legalProfile.mutualName}`
          : "Falta registrar mutual o administrador del seguro.",
    },
    {
      id: "workday",
      label: "Jornada informada",
      present: Boolean(employee.legalProfile.weeklyHours),
      detail: `${employee.legalProfile.weeklyHours}h semanales, ${employee.legalProfile.dailyWorkingHours}h diarias, ${employee.legalProfile.breakMinutes} min de colacion.`,
    },
  ];
}

export default function LaborComplianceManager() {
  const { ownerId } = useWorkspaceSession();
  const employeesQuery = useEmployees(ownerId);
  const overviewQuery = useComplianceOverview(ownerId);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const overview = overviewQuery.data;
  const evaluations = useMemo(() => overview?.evaluations ?? [], [overview]);

  const selectedEvaluation = useMemo(
    () =>
      evaluations.find((item) => item.employeeId === selectedEmployeeId) ??
      evaluations[0] ??
      null,
    [evaluations, selectedEmployeeId],
  );

  const selectedEmployee = useMemo(() => {
    const employee = employeesQuery.data?.find((item) => item.id === selectedEvaluation?.employeeId);
    return employee ? normalizeEmployeeLegalProfile(employee) : null;
  }, [employeesQuery.data, selectedEvaluation?.employeeId]);

  const documentChecklist = useMemo(
    () => (selectedEmployee ? buildDocumentChecklist(selectedEmployee) : []),
    [selectedEmployee],
  );
  const missingContract = useMemo(
    () =>
      evaluations.filter((item) =>
        item.checks.some(
          (check) => check.checkType === "contract" && check.riskLevel !== "OK",
        ),
      ).length,
    [evaluations],
  );
  const missingMutual = useMemo(
    () =>
      evaluations.filter((item) =>
        item.checks.some(
          (check) => check.checkType === "seguridad" && check.riskLevel !== "OK",
        ),
      ).length,
    [evaluations],
  );
  const pendingContributions = useMemo(
    () =>
      evaluations.filter((item) =>
        item.checks.some(
          (check) =>
            check.checkType === "cotizaciones" && check.riskLevel !== "OK",
        ),
      ).length,
    [evaluations],
  );
  const workdayRisks = useMemo(
    () =>
      evaluations.filter((item) =>
        item.checks.some(
          (check) => check.checkType === "jornada" && check.riskLevel !== "OK",
        ),
      ).length,
    [evaluations],
  );

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Normativa laboral</span>
          <h2 className={styles.heroTitle}>
            Mira primero el riesgo, entra despues al trabajador y actua sobre lo que falta.
          </h2>
          <p className={styles.heroDescription}>
            El sistema traduce la normativa a tareas concretas: quien esta bien, quien tiene
            alerta y que documento falta hoy.
          </p>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.smallLabel}>Cumplimiento</span>
            <strong className={styles.summaryValue}>{overview?.compliancePercent ?? 100}%</strong>
            <p className={styles.summaryHint}>Lectura general del equipo completo.</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.smallLabel}>Empleados</span>
            <strong className={styles.summaryValue}>{evaluations.length}</strong>
            <p className={styles.summaryHint}>Base actualmente monitoreada.</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.smallLabel}>Alertas activas</span>
            <strong className={styles.summaryValue}>{overview?.activeAlerts.length ?? 0}</strong>
            <p className={styles.summaryHint}>Casos que requieren seguimiento.</p>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.smallLabel}>Riesgo alto o grave</span>
            <strong className={styles.summaryValue}>{overview?.severeWorkers.length ?? 0}</strong>
            <p className={styles.summaryHint}>Casos que no deberian esperar.</p>
          </article>
        </div>
      </section>

      <section className={styles.highlightPanel} data-reveal>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Que esta faltando hoy</h2>
            <p className={styles.sectionDescription}>
              Cuatro vistas simples para entender por donde partir.
            </p>
          </div>
        </div>

        <div className={styles.actionGrid}>
          <article className={styles.actionCard}>
            <span className={styles.smallLabel}>Contratos</span>
            <strong className={styles.actionCardTitle}>{missingContract} con alerta</strong>
            <p className={styles.actionDescription}>
              Trabajadores sin contrato firmado o con contrato fuera de plazo.
            </p>
          </article>
          <article className={styles.actionCard}>
            <span className={styles.smallLabel}>Cotizaciones</span>
            <strong className={styles.actionCardTitle}>{pendingContributions} pendientes</strong>
            <p className={styles.actionDescription}>
              Casos donde falta respaldo del ultimo pago previsional.
            </p>
          </article>
          <article className={styles.actionCard}>
            <span className={styles.smallLabel}>Mutual</span>
            <strong className={styles.actionCardTitle}>{missingMutual} sin registro</strong>
            <p className={styles.actionDescription}>
              Trabajadores sin mutual o seguro laboral registrado.
            </p>
          </article>
          <article className={styles.actionCard}>
            <span className={styles.smallLabel}>Jornada</span>
            <strong className={styles.actionCardTitle}>{workdayRisks} con riesgo</strong>
            <p className={styles.actionDescription}>
              Jornadas declaradas con riesgo por horas, colacion o permanencia.
            </p>
          </article>
        </div>
      </section>

      <div className={styles.progressiveGrid}>
        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Empleados priorizados</h2>
              <p className={styles.sectionDescription}>
                Ordenados por urgencia para que sepas a quien revisar primero.
              </p>
            </div>
          </div>

          <div className={styles.priorityList}>
            {evaluations.length ? (
              evaluations.map((evaluation) => {
                const topAlert = evaluation.alerts[0];
                const isActive = evaluation.employeeId === selectedEvaluation?.employeeId;

                return (
                  <button
                    className={`${styles.priorityCard} ${isActive ? styles.priorityCardActive : ""}`}
                    key={evaluation.employeeId}
                    onClick={() => setSelectedEmployeeId(evaluation.employeeId)}
                    type="button"
                  >
                    <div className={styles.priorityCardHeader}>
                      <div>
                        <div className={styles.rowMetrics}>
                          <span
                            className={`${styles.miniPill} ${riskBadgeClass(
                              evaluation.overallRisk,
                            )}`}
                          >
                            {evaluation.overallRisk}
                          </span>
                          <span className={styles.miniPill}>
                            {evaluation.completionScore}% cumplimiento
                          </span>
                        </div>
                        <h3 className={styles.cardTitle}>{evaluation.employeeName}</h3>
                      </div>
                      <span className={styles.arrowHint}>Ver</span>
                    </div>
                    <p className={styles.cardMeta}>
                      {topAlert
                        ? `${topAlert.title}: ${topAlert.description}`
                        : "Sin alertas activas. Ficha dentro de parametros."}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className={styles.emptyCard}>
                No hay trabajadores para evaluar. Carga empleados y el seguimiento se activara.
              </div>
            )}
          </div>
        </section>

        <section className={styles.highlightPanel} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Detalle del trabajador</h2>
              <p className={styles.sectionDescription}>
                Documentos presentes, faltantes y acciones inmediatas.
              </p>
            </div>
          </div>

          {selectedEvaluation && selectedEmployee ? (
            <div className={styles.stack}>
              <section className={styles.spotlightCard}>
                <div className={styles.listCardHeader}>
                  <div>
                    <div className={styles.rowMetrics}>
                      <span
                        className={`${styles.miniPill} ${riskBadgeClass(
                          selectedEvaluation.overallRisk,
                        )}`}
                      >
                        {selectedEvaluation.overallRisk}
                      </span>
                      <span className={styles.miniPill}>
                        {selectedEvaluation.alerts.length} alertas
                      </span>
                    </div>
                    <h3 className={styles.sectionTitle}>{selectedEvaluation.employeeName}</h3>
                    <p className={styles.cardMeta}>
                      Ingreso: {formatDate(selectedEmployee.legalProfile.employmentStartDate)}
                    </p>
                  </div>
                </div>

                <div className={styles.documentGrid}>
                  {documentChecklist.map((item) => (
                    <article className={styles.documentCard} key={item.id}>
                      <span
                        className={`${styles.documentIndicator} ${
                          item.present ? styles.documentReady : styles.documentMissing
                        }`}
                      />
                      <div>
                        <strong className={styles.cardTitle}>{item.label}</strong>
                        <p className={styles.cardMeta}>{item.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.spotlightCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Lo que tienes que hacer</h3>
                    <p className={styles.sectionDescription}>
                      Prioridad automatica basada en el motor legal.
                    </p>
                  </div>
                </div>

                <div className={styles.statusGrid}>
                  {selectedEvaluation.alerts.length ? (
                    selectedEvaluation.alerts.map((alert) => (
                      <div className={styles.statusRow} key={alert.id}>
                        <div>
                          <div className={styles.rowMetrics}>
                            <span
                              className={`${styles.miniPill} ${alertBadgeClass(alert.severity)}`}
                            >
                              {alert.severity}
                            </span>
                            <span className={styles.miniPill}>{alert.checkType}</span>
                          </div>
                          <strong className={styles.cardTitle}>{alert.title}</strong>
                          <p className={styles.cardMeta}>{alert.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyCard}>
                      Este trabajador no tiene alertas activas. Mantener sus documentos al dia.
                    </div>
                  )}
                </div>
              </section>

              <section className={styles.spotlightCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Chequeos legales</h3>
                    <p className={styles.sectionDescription}>
                      Traduccion simple del estado contractual, previsional y operativo.
                    </p>
                  </div>
                </div>

                <div className={styles.checkList}>
                  {selectedEvaluation.checks.map((check) => (
                    <div className={styles.checkListRow} key={check.id}>
                      <div>
                        <strong className={styles.cardTitle}>{check.checkType}</strong>
                        <p className={styles.cardMeta}>{check.summary}</p>
                      </div>
                      <span
                        className={`${styles.miniPill} ${riskBadgeClass(check.riskLevel)}`}
                      >
                        {check.riskLevel}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className={styles.emptyCard}>
              Selecciona un trabajador para ver sus documentos y alertas.
            </div>
          )}
        </section>
      </div>

      <section className={styles.highlightPanel} data-reveal>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Base tecnica del modulo</h2>
            <p className={styles.sectionDescription}>
              Lo complejo queda abajo, no encima del usuario.
            </p>
          </div>
        </div>

        <div className={styles.processGrid}>
          <article className={styles.processCard}>
            <span className={styles.processNumber}>1</span>
            <div>
              <h3 className={styles.processTitle}>Motor de reglas</h3>
              <p className={styles.processDescription}>
                Evalua contrato, cotizaciones, jornada y seguridad para cada trabajador.
              </p>
            </div>
          </article>
          <article className={styles.processCard}>
            <span className={styles.processNumber}>2</span>
            <div>
              <h3 className={styles.processTitle}>`legal_checks`</h3>
              <p className={styles.processDescription}>
                Guarda snapshots para reportes, auditoria y futuros procesos diarios.
              </p>
            </div>
          </article>
          <article className={styles.processCard}>
            <span className={styles.processNumber}>3</span>
            <div>
              <h3 className={styles.processTitle}>Alertas progresivas</h3>
              <p className={styles.processDescription}>
                Dia 5 preventiva, dia 10 riesgo, dia 14 critica y dia 15 incumplimiento grave.
              </p>
            </div>
          </article>
          <article className={styles.processCard}>
            <span className={styles.processNumber}>4</span>
            <div>
              <h3 className={styles.processTitle}>Cron preparado</h3>
              <p className={styles.processDescription}>
                La siguiente iteracion natural es reevaluacion diaria automatica para todo el owner.
              </p>
            </div>
          </article>
        </div>

        <div className={styles.smallLabel}>
          Checks persistidos: {evaluations.reduce((sum, item) => sum + item.checks.length, 0)}
        </div>
      </section>
    </div>
  );
}
