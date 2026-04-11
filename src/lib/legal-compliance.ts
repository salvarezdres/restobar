import type {
  Employee,
  EmployeeLegalProfile,
  EmployeeLegalEvaluation,
  LegalAlert,
  LegalCheck,
  LegalCheckStatus,
  LegalCheckType,
  LegalRiskLevel,
  LegalTimelineEvent,
} from "@/lib/kitchen/types";

function defaultLegalProfile(referenceDate = new Date()): EmployeeLegalProfile {
  return {
    employmentStartDate: referenceDate.toISOString().slice(0, 10),
    contractSignedDate: "",
    contractType: "indefinido",
    lastContributionPaidMonth: referenceDate.toISOString().slice(0, 7),
    weeklyHours: 44,
    dailyWorkingHours: 9,
    breakMinutes: 60,
    overtimeHoursPerDay: 0,
    isMutualAffiliated: false,
    mutualName: "",
  };
}

export function normalizeEmployeeLegalProfile(employee: Employee, referenceDate = new Date()) {
  return {
    ...employee,
    legalProfile: {
      ...defaultLegalProfile(referenceDate),
      ...(employee.legalProfile ?? {}),
    },
  };
}

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function differenceInDays(later: Date, earlier: Date) {
  return Math.floor(
    (startOfDay(later).getTime() - startOfDay(earlier).getTime()) / 86_400_000,
  );
}

function monthIndex(value?: string) {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month] = value.split("-").map(Number);
  return year * 12 + (month - 1);
}

function currentMonthKey(referenceDate: Date) {
  return `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
}

function addAlert(
  employee: Employee,
  checkType: LegalCheckType,
  severity: LegalAlert["severity"],
  title: string,
  description: string,
  dueDate?: string,
): LegalAlert {
  return {
    id: `${employee.id}-${checkType}-${title.toLowerCase().replace(/\s+/g, "-")}`,
    employeeId: employee.id,
    severity,
    title,
    description,
    dueDate,
    checkType,
  };
}

function riskToStatus(risk: LegalRiskLevel): LegalCheckStatus {
  switch (risk) {
    case "OK":
      return "ok";
    case "RIESGO BAJO":
      return "warning";
    case "RIESGO MEDIO":
      return "risk";
    case "RIESGO ALTO":
      return "critical";
    case "INCUMPLIMIENTO GRAVE":
      return "severe";
    default:
      return "risk";
  }
}

function legalLimitWeeklyHours(referenceDate: Date) {
  const effectiveDate = new Date("2026-04-26T00:00:00");
  return referenceDate >= effectiveDate ? 42 : 44;
}

function buildTimeline(): LegalTimelineEvent[] {
  return [
    {
      dayOffset: 0,
      label: "Ingreso",
      riskLevel: "OK",
      description: "Seguimiento legal activado con advertencia inicial.",
    },
    {
      dayOffset: 5,
      label: "Aviso preventivo",
      riskLevel: "RIESGO BAJO",
      description: "El contrato sigue pendiente y ya corresponde aviso preventivo.",
    },
    {
      dayOffset: 10,
      label: "Alerta media",
      riskLevel: "RIESGO MEDIO",
      description: "La ventana legal se esta agotando y el riesgo ya no es menor.",
    },
    {
      dayOffset: 14,
      label: "Alerta critica",
      riskLevel: "RIESGO ALTO",
      description: "Ultimo dia util antes del incumplimiento grave.",
    },
    {
      dayOffset: 15,
      label: "Incumplimiento grave",
      riskLevel: "INCUMPLIMIENTO GRAVE",
      description: "Se excedio el maximo de 15 dias sin contrato firmado.",
    },
  ];
}

function calculateCompletionScore(checks: LegalCheck[]) {
  const weights = {
    ok: 1,
    warning: 0.75,
    risk: 0.45,
    critical: 0.2,
    severe: 0,
  } as const;

  const total = checks.reduce((sum, check) => sum + weights[check.status], 0);
  return Math.round((total / checks.length) * 100);
}

function rankRiskLevel(risk: LegalRiskLevel) {
  switch (risk) {
    case "OK":
      return 0;
    case "RIESGO BAJO":
      return 1;
    case "RIESGO MEDIO":
      return 2;
    case "RIESGO ALTO":
      return 3;
    case "INCUMPLIMIENTO GRAVE":
      return 4;
    default:
      return 0;
  }
}

function createCheck(input: {
  employee: Employee;
  checkType: LegalCheckType;
  riskLevel: LegalRiskLevel;
  summary: string;
  alerts: LegalAlert[];
  lastEvaluationDate: string;
  nextEvaluationDate: string;
}): LegalCheck {
  return {
    id: `${input.employee.id}-${input.checkType}`,
    ownerId: input.employee.ownerId,
    employeeId: input.employee.id,
    employeeName: input.employee.name,
    checkType: input.checkType,
    status: riskToStatus(input.riskLevel),
    riskLevel: input.riskLevel,
    summary: input.summary,
    alerts: input.alerts,
    lastEvaluationDate: input.lastEvaluationDate,
    nextEvaluationDate: input.nextEvaluationDate,
  };
}

function evaluateContract(employee: Employee, referenceDate: Date) {
  const startDate = parseDate(employee.legalProfile.employmentStartDate);
  const signedDate = parseDate(employee.legalProfile.contractSignedDate);
  const alerts: LegalAlert[] = [];
  const lastEvaluationDate = referenceDate.toISOString();
  const nextEvaluationDate = new Date(
    referenceDate.getTime() + 86_400_000,
  ).toISOString();

  if (!startDate) {
    alerts.push(
      addAlert(
        employee,
        "contract",
        "critica",
        "Fecha de ingreso faltante",
        "Sin fecha de ingreso no existe control legal confiable sobre el contrato.",
      ),
    );

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "RIESGO ALTO",
      summary: "Falta la fecha de ingreso del trabajador.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  const daysWithoutContract = differenceInDays(referenceDate, startDate);

  if (signedDate) {
    const signedDelay = differenceInDays(signedDate, startDate);

    if (signedDelay > 15) {
      alerts.push(
        addAlert(
          employee,
          "contract",
          "critica",
          "Contrato firmado fuera de plazo",
          "El contrato fue regularizado, pero fuera del limite de 15 dias desde el ingreso.",
        ),
      );

      return createCheck({
        employee,
        checkType: "contract",
        riskLevel: "RIESGO ALTO",
        summary: `Contrato firmado con ${signedDelay} dias de desfase respecto al ingreso.`,
        alerts,
        lastEvaluationDate,
        nextEvaluationDate,
      });
    }

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "OK",
      summary: "Contrato firmado dentro del plazo legal de 15 dias.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  if (daysWithoutContract >= 15) {
    alerts.push(
      addAlert(
        employee,
        "contract",
        "critica",
        "Incumplimiento grave por contrato",
        "Se superaron los 15 dias desde el ingreso sin contrato firmado.",
      ),
    );

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "INCUMPLIMIENTO GRAVE",
      summary: `Trabajador con ${daysWithoutContract} dias desde su ingreso sin contrato firmado.`,
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  if (daysWithoutContract >= 14) {
    alerts.push(
      addAlert(
        employee,
        "contract",
        "critica",
        "Contrato por vencer",
        "Falta un dia para exceder el plazo legal de firma de contrato.",
      ),
    );

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "RIESGO ALTO",
      summary: "El contrato sigue pendiente y esta a un dia del incumplimiento grave.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  if (daysWithoutContract >= 10) {
    alerts.push(
      addAlert(
        employee,
        "contract",
        "riesgo",
        "Contrato pendiente",
        "Han transcurrido 10 dias o mas y el contrato sigue sin firmarse.",
      ),
    );

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "RIESGO MEDIO",
      summary: "Contrato pendiente con ventana legal cada vez mas estrecha.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  if (daysWithoutContract >= 5) {
    alerts.push(
      addAlert(
        employee,
        "contract",
        "preventiva",
        "Contrato pendiente en seguimiento",
        "A los 5 dias desde el ingreso corresponde aviso preventivo de firma.",
      ),
    );

    return createCheck({
      employee,
      checkType: "contract",
      riskLevel: "RIESGO BAJO",
      summary: "Contrato aun dentro de plazo, pero ya requiere seguimiento preventivo.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  alerts.push(
    addAlert(
      employee,
      "contract",
      "preventiva",
      "Seguimiento legal activado",
      "Trabajador creado sin contrato firmado. El sistema inicia el monitoreo automatico.",
    ),
  );

  return createCheck({
    employee,
    checkType: "contract",
    riskLevel: "OK",
    summary: "Contrato aun dentro de plazo legal, con seguimiento preventivo activo.",
    alerts,
    lastEvaluationDate,
    nextEvaluationDate,
  });
}

function evaluateContributions(employee: Employee, referenceDate: Date) {
  const alerts: LegalAlert[] = [];
  const currentIndex = monthIndex(currentMonthKey(referenceDate));
  const paidIndex = monthIndex(employee.legalProfile.lastContributionPaidMonth);
  const lastEvaluationDate = referenceDate.toISOString();
  const nextEvaluationDate = new Date(
    referenceDate.getTime() + 86_400_000,
  ).toISOString();

  if (paidIndex === null || currentIndex === null) {
    alerts.push(
      addAlert(
        employee,
        "cotizaciones",
        "riesgo",
        "Cotizaciones sin respaldo",
        "No existe un periodo de cotizacion pagada registrado para el trabajador.",
      ),
    );

    return createCheck({
      employee,
      checkType: "cotizaciones",
      riskLevel: "RIESGO ALTO",
      summary: "No hay registro de pago previsional para el trabajador.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  const monthsLate = currentIndex - paidIndex;

  if (monthsLate <= 0) {
    return createCheck({
      employee,
      checkType: "cotizaciones",
      riskLevel: "OK",
      summary: "Cotizaciones declaradas al dia para el periodo actual.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  if (monthsLate === 1) {
    alerts.push(
      addAlert(
        employee,
        "cotizaciones",
        "riesgo",
        "Cotizacion con atraso mensual",
        "Existe al menos un mes sin pago registrado. El trabajador queda en riesgo legal.",
      ),
    );

    return createCheck({
      employee,
      checkType: "cotizaciones",
      riskLevel: "RIESGO MEDIO",
      summary: "Cotizaciones atrasadas por un mes.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  alerts.push(
    addAlert(
      employee,
      "cotizaciones",
      "critica",
      "Cotizaciones morosas",
      "Existen dos o mas meses sin pago previsional registrado.",
    ),
  );

  return createCheck({
    employee,
    checkType: "cotizaciones",
    riskLevel: "RIESGO ALTO",
    summary: `Cotizaciones con ${monthsLate} meses de atraso.`,
    alerts,
    lastEvaluationDate,
    nextEvaluationDate,
  });
}

function evaluateWorkday(employee: Employee, referenceDate: Date) {
  const alerts: LegalAlert[] = [];
  const legalWeeklyLimit = legalLimitWeeklyHours(referenceDate);
  const {
    weeklyHours,
    dailyWorkingHours,
    breakMinutes,
    overtimeHoursPerDay,
  } = employee.legalProfile;
  const permanenceHours = dailyWorkingHours + breakMinutes / 60;
  const lastEvaluationDate = referenceDate.toISOString();
  const nextEvaluationDate = new Date(
    referenceDate.getTime() + 86_400_000,
  ).toISOString();

  let riskLevel: LegalRiskLevel = "OK";
  const notes: string[] = [];

  if (weeklyHours > legalWeeklyLimit) {
    riskLevel = "RIESGO ALTO";
    notes.push(
      `La jornada semanal declarada (${weeklyHours}h) supera el maximo legal vigente (${legalWeeklyLimit}h).`,
    );
    alerts.push(
      addAlert(
        employee,
        "jornada",
        "critica",
        "Exceso de jornada semanal",
        `La jornada declarada supera el maximo legal vigente de ${legalWeeklyLimit} horas semanales.`,
      ),
    );
  }

  if (overtimeHoursPerDay > 2) {
    riskLevel = rankRiskLevel(riskLevel) < 2 ? "RIESGO MEDIO" : riskLevel;
    notes.push("Las horas extra exceden el maximo recomendado de 2 horas diarias.");
    alerts.push(
      addAlert(
        employee,
        "jornada",
        "riesgo",
        "Horas extra excesivas",
        "El trabajador supera 2 horas extraordinarias por dia.",
      ),
    );
  }

  if (breakMinutes < 30) {
    riskLevel = rankRiskLevel(riskLevel) < 1 ? "RIESGO BAJO" : riskLevel;
    notes.push("El descanso de colacion declarado es inferior a 30 minutos.");
    alerts.push(
      addAlert(
        employee,
        "jornada",
        "preventiva",
        "Descanso insuficiente",
        "La colacion declarada es menor al minimo esperado para una jornada continua.",
      ),
    );
  }

  if (permanenceHours > 12) {
    riskLevel = "RIESGO ALTO";
    notes.push("La permanencia diaria total supera 12 horas.");
    alerts.push(
      addAlert(
        employee,
        "jornada",
        "critica",
        "Permanencia diaria excesiva",
        "La combinacion de trabajo y descanso supera 12 horas diarias.",
      ),
    );
  }

  return createCheck({
    employee,
    checkType: "jornada",
    riskLevel,
    summary: notes.length
      ? notes.join(" ")
      : "Jornada declarada dentro de parametros de control configurados.",
    alerts,
    lastEvaluationDate,
    nextEvaluationDate,
  });
}

function evaluateSafety(employee: Employee, referenceDate: Date) {
  const alerts: LegalAlert[] = [];
  const lastEvaluationDate = referenceDate.toISOString();
  const nextEvaluationDate = new Date(
    referenceDate.getTime() + 86_400_000,
  ).toISOString();

  if (!employee.legalProfile.isMutualAffiliated || !employee.legalProfile.mutualName?.trim()) {
    alerts.push(
      addAlert(
        employee,
        "seguridad",
        "critica",
        "Falta afiliacion a mutual",
        "Todo trabajador debe estar asociado a una mutual o administrador del seguro de accidentes.",
      ),
    );

    return createCheck({
      employee,
      checkType: "seguridad",
      riskLevel: "RIESGO ALTO",
      summary: "No existe afiliacion de seguridad laboral registrada.",
      alerts,
      lastEvaluationDate,
      nextEvaluationDate,
    });
  }

  return createCheck({
    employee,
    checkType: "seguridad",
    riskLevel: "OK",
    summary: `Afiliacion registrada en ${employee.legalProfile.mutualName}.`,
    alerts,
    lastEvaluationDate,
    nextEvaluationDate,
  });
}

export function evaluateEmployeeCompliance(
  employee: Employee,
  referenceDate = new Date(),
): EmployeeLegalEvaluation {
  const safeEmployee = normalizeEmployeeLegalProfile(employee, referenceDate);
  const checks = [
    evaluateContract(safeEmployee, referenceDate),
    evaluateContributions(safeEmployee, referenceDate),
    evaluateWorkday(safeEmployee, referenceDate),
    evaluateSafety(safeEmployee, referenceDate),
  ];

  const alerts = checks.flatMap((check) => check.alerts);
  const overallRisk = checks.reduce<LegalRiskLevel>((highest, check) => {
    return rankRiskLevel(check.riskLevel) > rankRiskLevel(highest)
      ? check.riskLevel
      : highest;
  }, "OK");

  return {
    employeeId: safeEmployee.id,
    employeeName: safeEmployee.name,
    overallRisk,
    legalState: overallRisk,
    completionScore: calculateCompletionScore(checks),
    checks,
    alerts,
    timeline: buildTimeline(),
  };
}

export function buildComplianceOverview(employees: Employee[], referenceDate = new Date()) {
  const evaluations = employees.map((employee) =>
    evaluateEmployeeCompliance(employee, referenceDate),
  );

  const activeAlerts = evaluations.flatMap((item) => item.alerts);
  const riskWorkers = evaluations.filter((item) => item.overallRisk !== "OK");
  const severeWorkers = evaluations.filter(
    (item) =>
      item.overallRisk === "INCUMPLIMIENTO GRAVE" ||
      item.overallRisk === "RIESGO ALTO",
  );
  const compliancePercent = evaluations.length
    ? Math.round(
        evaluations.reduce((sum, item) => sum + item.completionScore, 0) /
          evaluations.length,
      )
    : 100;

  return {
    evaluations,
    activeAlerts,
    riskWorkers,
    severeWorkers,
    compliancePercent,
  };
}
