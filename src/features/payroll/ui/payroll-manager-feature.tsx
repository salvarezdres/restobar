'use client'

import { useMemo, useState } from "react";

import styles from "@/components/workspace.module.css";
import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useContracts,
  useEmployees,
  usePayrolls,
  useSaveContract,
  useSavePayroll,
} from "@/hooks/use-kitchen-queries";
import { normalizeEmployeeLegalProfile } from "@/lib/legal-compliance";
import type {
  Contract,
  Employee,
  Payroll,
  PayrollAlert,
  PayrollItem,
} from "@/lib/kitchen/types";

import {
  DEFAULT_CHILE_PAYROLL_CONFIG,
  calculateChilePayroll,
} from "../domain/chile-payroll";
import { buildPayrollAlerts, findActiveContract } from "../domain/payroll-alerts";

function currentMonthInput(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, 7);
}

function createEmptyContract(employee: Employee, referenceDate = new Date()): Contract {
  return {
    id: "",
    ownerId: employee.ownerId,
    employeeId: employee.id,
    employeeName: employee.name,
    employeeRut: employee.rut,
    tipoContrato:
      employee.legalProfile.contractType === "plazo-fijo" ? "plazo-fijo" : "indefinido",
    sueldoBase: employee.salary,
    fechaInicio:
      employee.legalProfile.employmentStartDate || referenceDate.toISOString().slice(0, 10),
    fechaFin: "",
    gratificacionTipo: "articulo-50",
    active: true,
  };
}

function createEmptyPayrollItem(): PayrollItem {
  return {
    tipo: "haber",
    codigo: "bono",
    nombre: "",
    monto: 0,
    imponible: true,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function getAlertPillClass(alert: PayrollAlert, stylesMap: typeof styles) {
  if (alert.severity === "critical") {
    return stylesMap.riskHigh;
  }

  if (alert.severity === "warning") {
    return stylesMap.riskMedium;
  }

  return stylesMap.riskLow;
}

function getEmployeeStatus(
  employee: Employee,
  contracts: Contract[],
  payrolls: Payroll[],
  period: string,
) {
  const { activeContract, alerts } = buildPayrollAlerts({
    contracts,
    employee,
    payrolls,
    period,
  });

  return {
    activeContract,
    alerts,
    payrollCount: payrolls.filter((item) => item.employeeId === employee.id).length,
  };
}

export default function PayrollManagerFeature() {
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const employeesQuery = useEmployees(ownerId);
  const contractsQuery = useContracts(ownerId);
  const payrollsQuery = usePayrolls(ownerId);
  const saveContract = useSaveContract(ownerId);
  const savePayroll = useSavePayroll(ownerId);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(() => currentMonthInput());
  const [contractDrafts, setContractDrafts] = useState<Record<string, Contract>>({});
  const [payrollItemsByContext, setPayrollItemsByContext] = useState<
    Record<string, PayrollItem[]>
  >({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const employees = useMemo(
    () => (employeesQuery.data ?? []).map((employee) => normalizeEmployeeLegalProfile(employee)),
    [employeesQuery.data],
  );
  const contracts = useMemo(() => contractsQuery.data ?? [], [contractsQuery.data]);
  const payrolls = useMemo(() => payrollsQuery.data ?? [], [payrollsQuery.data]);
  const effectiveEmployeeId = selectedEmployeeId || employees[0]?.id || "";
  const selectedEmployee =
    employees.find((employee) => employee.id === effectiveEmployeeId) ?? null;
  const contextKey = `${effectiveEmployeeId}:${selectedPeriod}`;

  const suggestedContract = useMemo(() => {
    if (!selectedEmployee) {
      return null;
    }

    return (
      findActiveContract(contracts, selectedEmployee.id, selectedPeriod) ??
      createEmptyContract(selectedEmployee)
    );
  }, [contracts, selectedEmployee, selectedPeriod]);

  const contractDraft = suggestedContract
    ? contractDrafts[contextKey] ?? suggestedContract
    : null;
  const payrollItems = useMemo(
    () => payrollItemsByContext[contextKey] ?? [],
    [contextKey, payrollItemsByContext],
  );

  const employeeStatuses = useMemo(
    () =>
      employees.map((employee) => ({
        employee,
        ...getEmployeeStatus(employee, contracts, payrolls, selectedPeriod),
      })),
    [contracts, employees, payrolls, selectedPeriod],
  );

  const selectedEmployeeStatus = employeeStatuses.find(
    (item) => item.employee.id === selectedEmployee?.id,
  );

  const preview = useMemo(() => {
    if (!selectedEmployee || !contractDraft) {
      return null;
    }

    return calculateChilePayroll({
      contract: contractDraft,
      employee: selectedEmployee,
      period: selectedPeriod,
      additionalItems: payrollItems.filter((item) => item.nombre.trim() && item.monto > 0),
      config: DEFAULT_CHILE_PAYROLL_CONFIG,
    });
  }, [contractDraft, payrollItems, selectedEmployee, selectedPeriod]);

  const selectedEmployeePayrolls = useMemo(
    () => payrolls.filter((payroll) => payroll.employeeId === selectedEmployee?.id),
    [payrolls, selectedEmployee],
  );
  const selectedEmployeeCompanyCost = useMemo(
    () =>
      selectedEmployeePayrolls.reduce(
        (total, payroll) => total + (payroll.costoEmpresa ?? payroll.liquido),
        0,
      ),
    [selectedEmployeePayrolls],
  );

  const totalCompanyCost = useMemo(
    () =>
      payrolls
        .filter((payroll) => payroll.periodo === selectedPeriod)
        .reduce((total, payroll) => total + (payroll.costoEmpresa ?? payroll.liquido), 0),
    [payrolls, selectedPeriod],
  );

  const totalLiquid = useMemo(
    () =>
      payrolls
        .filter((payroll) => payroll.periodo === selectedPeriod)
        .reduce((total, payroll) => total + payroll.liquido, 0),
    [payrolls, selectedPeriod],
  );
  const earningItems = preview?.detalleItems.filter((item) => item.tipo === "haber") ?? [];
  const discountItems = preview?.detalleItems.filter((item) => item.tipo === "descuento") ?? [];

  function updateContractField<Key extends keyof Contract>(field: Key, value: Contract[Key]) {
    if (!suggestedContract) {
      return;
    }

    setContractDrafts((currentDrafts) => ({
      ...currentDrafts,
      [contextKey]: {
        ...(currentDrafts[contextKey] ?? suggestedContract),
        [field]: value,
      },
    }));
  }

  function updatePayrollItem(index: number, patch: Partial<PayrollItem>) {
    setPayrollItemsByContext((currentState) => ({
      ...currentState,
      [contextKey]: (currentState[contextKey] ?? []).map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  }

  async function handleSaveContract() {
    if (!selectedEmployee || !contractDraft) {
      return;
    }

    await saveContract.mutateAsync({
      ...contractDraft,
      ownerId: stableOwnerId,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeRut: selectedEmployee.rut,
      sueldoBase: contractDraft.sueldoBase || selectedEmployee.salary,
    });

    setContractDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[contextKey];
      return nextDrafts;
    });
    setFeedback("Contrato guardado.");
  }

  async function handleSavePayroll() {
    if (!selectedEmployee || !contractDraft || !preview) {
      return;
    }

    const alerts = buildPayrollAlerts({
      contracts,
      employee: selectedEmployee,
      payrolls,
      period: selectedPeriod,
    }).alerts;

    await savePayroll.mutateAsync({
      id: selectedEmployeePayrolls.find((item) => item.periodo === selectedPeriod)?.id ?? "",
      ownerId: stableOwnerId,
      contractId: contractDraft.id || undefined,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      employeeRut: selectedEmployee.rut,
      periodo: selectedPeriod,
      imponible: preview.imponible,
      noImponible: preview.noImponible,
      descuentos: preview.descuentos,
      liquido: preview.liquido,
      costoEmpresa: preview.costoEmpresa,
      detalleItems: preview.detalleItems,
      legalAlerts: alerts.map((alert) => alert.title),
    });

    setFeedback("Liquidacion guardada.");
  }

  return (
    <div className={styles.stack}>
      <section className={styles.heroPanel} data-reveal>
        <div className={styles.heroHeader}>
          <span className={styles.statusPill}>Liquidaciones Chile</span>
          <h2 className={styles.heroTitle}>
            Contrato, descuentos legales y documento mensual en una sola superficie de trabajo.
          </h2>
          <p className={styles.heroDescription}>
            El módulo ahora prioriza flujo real: seleccionar persona, revisar alertas, ajustar
            contrato, calcular y guardar la liquidación sin perder contexto.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.heroPill}>Periodo: {selectedPeriod}</span>
          <span className={styles.heroPill}>Trabajadores: {employees.length}</span>
          <span className={styles.heroPill}>Historial: {payrolls.length} docs</span>
        </div>
      </section>

      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard} data-reveal>
          <span className={styles.smallLabel}>Liquidado en {selectedPeriod}</span>
          <strong className={styles.summaryValue}>{formatCurrency(totalLiquid)}</strong>
          <p className={styles.summaryHint}>Suma de líquidos guardados en el periodo.</p>
        </article>
        <article className={styles.summaryCard} data-reveal>
          <span className={styles.smallLabel}>Costo empresa</span>
          <strong className={styles.summaryValue}>{formatCurrency(totalCompanyCost)}</strong>
          <p className={styles.summaryHint}>Incluye AFC empleador del cálculo base.</p>
        </article>
        <article className={styles.summaryCard} data-reveal>
          <span className={styles.smallLabel}>Trabajadores</span>
          <strong className={styles.summaryValue}>{employees.length}</strong>
          <p className={styles.summaryHint}>Base activa de personas disponibles para liquidar.</p>
        </article>
        <article className={styles.summaryCard} data-reveal>
          <span className={styles.smallLabel}>Documentos</span>
          <strong className={styles.summaryValue}>{payrolls.length}</strong>
          <p className={styles.summaryHint}>Historial acumulado listo para revisión y PDF.</p>
        </article>
      </section>

      <div className={styles.payrollShell}>
        <aside className={styles.payrollSidebar} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Equipo y alertas</h2>
              <p className={styles.sectionDescription}>
                El lado izquierdo filtra el trabajo real del mes: quién necesita atención primero.
              </p>
            </div>
          </div>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Periodo</span>
            <input
              className={styles.input}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              type="month"
              value={selectedPeriod}
            />
          </label>

          <div className={styles.payrollEmployeeList}>
            {employeeStatuses.length ? (
              employeeStatuses.map((item) => {
                const isActive = item.employee.id === selectedEmployee?.id;

                return (
                  <button
                    className={`${styles.priorityCard} ${isActive ? styles.priorityCardActive : ""}`}
                    key={item.employee.id}
                    onClick={() => setSelectedEmployeeId(item.employee.id)}
                    type="button"
                  >
                    <div className={styles.priorityCardHeader}>
                      <div>
                        <strong className={styles.cardTitle}>{item.employee.name}</strong>
                        <p className={styles.cardMeta}>
                          {item.employee.rut?.trim() || "Sin RUT"} · {item.employee.role}
                        </p>
                      </div>
                      <span className={styles.arrowHint}>{item.payrollCount} docs</span>
                    </div>

                    <div className={styles.rowMetrics}>
                      <span className={styles.miniPill}>
                        {item.activeContract ? item.activeContract.tipoContrato : "Sin contrato"}
                      </span>
                      <span className={styles.miniPill}>{item.alerts.length} alertas</span>
                    </div>

                    <p className={styles.cardMeta}>
                      {item.alerts.length
                        ? item.alerts[0].title
                        : "Sin alertas críticas para el periodo seleccionado."}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className={styles.emptyCard}>
                No hay trabajadores cargados. Crea al menos una ficha en Empleados para activar
                liquidaciones.
              </div>
            )}
          </div>
        </aside>

        <section className={styles.payrollMain} data-reveal>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Generador de liquidación</h2>
              <p className={styles.sectionDescription}>
                Diseño de trabajo continuo: contrato y variables arriba, preview y guardado abajo.
              </p>
            </div>
          </div>

          {selectedEmployee && contractDraft ? (
            <div className={styles.stack}>
              <div className={styles.payrollBuilderGrid}>
                <section className={styles.spotlightCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3 className={styles.sectionTitle}>Contrato activo</h3>
                      <p className={styles.sectionDescription}>
                        Define el líquido objetivo del periodo y el motor calcula base imponible,
                        descuentos legales y total final.
                      </p>
                    </div>
                  </div>

                  <div className={styles.payrollIdentityGrid}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Trabajador</span>
                      <input className={styles.input} disabled value={selectedEmployee.name} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>RUT</span>
                      <input
                        className={styles.input}
                        disabled
                        value={selectedEmployee.rut ?? "Completar en Empleados"}
                      />
                    </label>
                  </div>

                  <div className={styles.payrollContractGrid}>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Tipo de contrato</span>
                      <select
                        className={styles.select}
                        onChange={(event) =>
                          updateContractField(
                            "tipoContrato",
                            event.target.value as Contract["tipoContrato"],
                          )
                        }
                        value={contractDraft.tipoContrato}
                      >
                        <option value="indefinido">Indefinido</option>
                        <option value="plazo-fijo">Plazo fijo</option>
                      </select>
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Líquido objetivo</span>
                      <input
                        className={styles.input}
                        min="0"
                        onChange={(event) =>
                          updateContractField("sueldoBase", Number(event.target.value) || 0)
                        }
                        type="number"
                        value={contractDraft.sueldoBase}
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Fecha inicio</span>
                      <input
                        className={styles.input}
                        onChange={(event) => updateContractField("fechaInicio", event.target.value)}
                        type="date"
                        value={contractDraft.fechaInicio}
                      />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>Fecha fin</span>
                      <input
                        className={styles.input}
                        onChange={(event) => updateContractField("fechaFin", event.target.value)}
                        type="date"
                        value={contractDraft.fechaFin ?? ""}
                      />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Gratificación</span>
                    <select
                      className={styles.select}
                      onChange={(event) =>
                        updateContractField(
                          "gratificacionTipo",
                          event.target.value as Contract["gratificacionTipo"],
                        )
                      }
                      value={contractDraft.gratificacionTipo}
                    >
                      <option value="articulo-50">Legal 25% con tope</option>
                      <option value="sin-gratificacion">Sin gratificación</option>
                    </select>
                  </label>

                  <div className={styles.buttonRow}>
                    <button
                      className={styles.primaryButton}
                      disabled={saveContract.isPending}
                      onClick={() => void handleSaveContract()}
                      type="button"
                    >
                      {saveContract.isPending ? "Guardando..." : "Guardar contrato"}
                    </button>
                  </div>
                </section>

                <section className={styles.spotlightCard}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <h3 className={styles.sectionTitle}>Haberes y descuentos variables</h3>
                      <p className={styles.sectionDescription}>
                        Este bloque ya no queda aplastado: ahora funciona como una tabla/form limpia.
                      </p>
                    </div>
                  </div>

                  <div className={styles.payrollItemList}>
                    {payrollItems.map((item, index) => (
                      <div className={styles.payrollItemGrid} key={`item-${index}`}>
                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Tipo</span>
                          <select
                            className={styles.select}
                            onChange={(event) =>
                              updatePayrollItem(index, {
                                tipo: event.target.value as PayrollItem["tipo"],
                              })
                            }
                            value={item.tipo}
                          >
                            <option value="haber">Haber</option>
                            <option value="descuento">Descuento</option>
                          </select>
                        </label>
                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Nombre</span>
                          <input
                            className={styles.input}
                            onChange={(event) =>
                              updatePayrollItem(index, { nombre: event.target.value })
                            }
                            value={item.nombre}
                          />
                        </label>
                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Monto</span>
                          <input
                            className={styles.input}
                            min="0"
                            onChange={(event) =>
                              updatePayrollItem(index, {
                                monto: Number(event.target.value) || 0,
                              })
                            }
                            type="number"
                            value={item.monto}
                          />
                        </label>
                        <label className={styles.field}>
                          <span className={styles.fieldLabel}>Imponible</span>
                          <select
                            className={styles.select}
                            onChange={(event) =>
                              updatePayrollItem(index, {
                                imponible: event.target.value === "si",
                              })
                            }
                            value={item.imponible ? "si" : "no"}
                          >
                            <option value="si">Sí</option>
                            <option value="no">No</option>
                          </select>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className={styles.buttonRow}>
                    <button
                      className={styles.secondaryButton}
                      onClick={() =>
                        setPayrollItemsByContext((currentState) => ({
                          ...currentState,
                          [contextKey]: [
                            ...(currentState[contextKey] ?? []),
                            createEmptyPayrollItem(),
                          ],
                        }))
                      }
                      type="button"
                    >
                      Agregar item
                    </button>
                  </div>
                </section>
              </div>

              <section className={styles.spotlightCard}>
                <div className={styles.payrollPreviewHeader}>
                  <div>
                    <h3 className={styles.sectionTitle}>Preview tipo liquidación</h3>
                    <p className={styles.sectionDescription}>
                      Documento central del módulo, con foco en lectura rápida y salida a PDF.
                    </p>
                  </div>

                  {preview ? (
                    <div className={styles.payrollPreviewMetrics}>
                      <div className={styles.metaCard}>
                        <span className={styles.smallLabel}>Líquido</span>
                        <strong className={styles.metaValue}>{formatCurrency(preview.liquido)}</strong>
                      </div>
                      <div className={styles.metaCard}>
                        <span className={styles.smallLabel}>Imponible</span>
                        <strong className={styles.metaValue}>
                          {formatCurrency(preview.imponible)}
                        </strong>
                      </div>
                      <div className={styles.metaCard}>
                        <span className={styles.smallLabel}>Descuentos</span>
                        <strong className={styles.metaValue}>
                          {formatCurrency(preview.descuentos)}
                        </strong>
                      </div>
                    </div>
                  ) : null}
                </div>

                {selectedEmployeeStatus?.alerts.length ? (
                  <div className={styles.rowMetrics}>
                    {selectedEmployeeStatus.alerts.map((alert) => (
                      <span
                        className={`${styles.miniPill} ${getAlertPillClass(alert, styles)}`}
                        key={alert.id}
                      >
                        {alert.title}
                      </span>
                    ))}
                  </div>
                ) : null}

                {preview ? (
                  <div className={styles.payrollPreviewCard}>
                    <article className={styles.payrollPrintSheet}>
                      <header className={styles.payrollPrintHeader}>
                        <div>
                          <span className={styles.smallLabel}>Liquidacion de sueldo</span>
                          <h4 className={styles.payrollPrintTitle}>Resumen mensual</h4>
                        </div>
                        <div className={styles.payrollPrintMeta}>
                          <div className={styles.payrollPrintMetaItem}>
                            <span className={styles.smallLabel}>Periodo</span>
                            <strong>{selectedPeriod}</strong>
                          </div>
                          <div className={styles.payrollPrintMetaItem}>
                            <span className={styles.smallLabel}>Contrato</span>
                            <strong>{contractDraft.tipoContrato}</strong>
                          </div>
                        </div>
                      </header>

                      <section className={styles.payrollPrintIdentity}>
                        <div className={styles.payrollPrintIdentityItem}>
                          <span className={styles.smallLabel}>Trabajador</span>
                          <strong>{selectedEmployee.name}</strong>
                        </div>
                        <div className={styles.payrollPrintIdentityItem}>
                          <span className={styles.smallLabel}>RUT</span>
                          <strong>{selectedEmployee.rut ?? "Pendiente"}</strong>
                        </div>
                        <div className={styles.payrollPrintIdentityItem}>
                          <span className={styles.smallLabel}>Líquido objetivo</span>
                          <strong>{formatCurrency(contractDraft.sueldoBase)}</strong>
                        </div>
                        <div className={styles.payrollPrintIdentityItem}>
                          <span className={styles.smallLabel}>Sueldo base calculado</span>
                          <strong>{formatCurrency(preview.sueldoBaseCalculado)}</strong>
                        </div>
                        <div className={styles.payrollPrintIdentityItem}>
                          <span className={styles.smallLabel}>Gratificacion</span>
                          <strong>{contractDraft.gratificacionTipo}</strong>
                        </div>
                      </section>

                      <div className={styles.payrollPrintTables}>
                        <section className={styles.payrollPrintTableCard}>
                          <div className={styles.payrollPrintTableHeader}>
                            <h5 className={styles.payrollPrintSectionTitle}>Haberes</h5>
                          </div>
                          <div className={styles.payrollPrintTable}>
                            <div className={styles.payrollPrintTableHead}>
                              <span>Concepto</span>
                              <span>Base</span>
                              <span>Monto</span>
                            </div>
                            {earningItems.map((item) => (
                              <div className={styles.payrollPrintTableRow} key={`earning-${item.codigo}-${item.nombre}`}>
                                <span>{item.nombre}</span>
                                <span>{item.imponible ? "Imponible" : "No imponible"}</span>
                                <span>{formatCurrency(item.monto)}</span>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className={styles.payrollPrintTableCard}>
                          <div className={styles.payrollPrintTableHeader}>
                            <h5 className={styles.payrollPrintSectionTitle}>Descuentos</h5>
                          </div>
                          <div className={styles.payrollPrintTable}>
                            <div className={styles.payrollPrintTableHead}>
                              <span>Concepto</span>
                              <span>Tipo</span>
                              <span>Monto</span>
                            </div>
                            {discountItems.map((item) => (
                              <div className={styles.payrollPrintTableRow} key={`discount-${item.codigo}-${item.nombre}`}>
                                <span>{item.nombre}</span>
                                <span>Legal</span>
                                <span>{formatCurrency(item.monto)}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      <section className={styles.payrollPrintTotals}>
                        <div className={styles.payrollPrintTotalItem}>
                          <span>Líquido objetivo</span>
                          <strong>{formatCurrency(preview.liquidoObjetivo)}</strong>
                        </div>
                        <div className={styles.payrollPrintTotalItem}>
                          <span>Total imponible</span>
                          <strong>{formatCurrency(preview.imponible)}</strong>
                        </div>
                        <div className={styles.payrollPrintTotalItem}>
                          <span>Total no imponible</span>
                          <strong>{formatCurrency(preview.noImponible)}</strong>
                        </div>
                        <div className={styles.payrollPrintTotalItem}>
                          <span>Base tributable</span>
                          <strong>{formatCurrency(preview.baseTributable)}</strong>
                        </div>
                        <div className={styles.payrollPrintTotalItem}>
                          <span>Descuentos</span>
                          <strong>{formatCurrency(preview.descuentos)}</strong>
                        </div>
                        <div className={`${styles.payrollPrintTotalItem} ${styles.payrollPrintNet}`}>
                          <span>Liquido a pagar</span>
                          <strong>{formatCurrency(preview.liquido)}</strong>
                        </div>
                      </section>
                    </article>
                  </div>
                ) : (
                  <div className={styles.emptyCard}>
                    Selecciona un trabajador con contrato para previsualizar la liquidación.
                  </div>
                )}

                <div className={styles.buttonRow}>
                  <button
                    className={styles.primaryButton}
                    disabled={!preview || savePayroll.isPending}
                    onClick={() => void handleSavePayroll()}
                    type="button"
                  >
                    {savePayroll.isPending ? "Guardando..." : "Guardar liquidación"}
                  </button>
                  <button
                    className={styles.secondaryButton}
                    disabled={!preview}
                    onClick={() => window.print()}
                    type="button"
                  >
                    Imprimir / PDF
                  </button>
                </div>

                {feedback ? <p className={styles.summaryHint}>{feedback}</p> : null}
              </section>
            </div>
          ) : (
            <div className={styles.emptyCard}>
              Primero carga un trabajador para habilitar contratos y liquidaciones.
            </div>
          )}
        </section>
      </div>

      <section className={styles.tableCard} data-reveal>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Historial de liquidaciones</h2>
            <p className={styles.sectionDescription}>
              Cierre documental del flujo, con tabla más limpia y legible por trabajador.
            </p>
          </div>
          {selectedEmployeePayrolls.length ? (
            <div className={styles.metaCard}>
              <span className={styles.smallLabel}>Costo empresa acumulado</span>
              <strong className={styles.metaValue}>
                {formatCurrency(selectedEmployeeCompanyCost)}
              </strong>
            </div>
          ) : null}
        </div>

        {selectedEmployeePayrolls.length ? (
          <div className={styles.table}>
            <div className={styles.tableHeadSix}>
              <span>Periodo</span>
              <span>Imponible</span>
              <span>Descuentos</span>
              <span>Líquido</span>
              <span>Costo empresa</span>
              <span>Alertas</span>
            </div>
            {selectedEmployeePayrolls.map((payroll) => (
              <div className={styles.tableRowSix} key={payroll.id}>
                <span>{payroll.periodo}</span>
                <span>{formatCurrency(payroll.imponible)}</span>
                <span>{formatCurrency(payroll.descuentos)}</span>
                <span>{formatCurrency(payroll.liquido)}</span>
                <span>{formatCurrency(payroll.costoEmpresa ?? payroll.liquido)}</span>
                <span>{payroll.legalAlerts.length}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyCard}>
            No hay liquidaciones guardadas para{" "}
            {selectedEmployee?.name ?? "el trabajador seleccionado"}.
          </div>
        )}
      </section>
    </div>
  );
}
