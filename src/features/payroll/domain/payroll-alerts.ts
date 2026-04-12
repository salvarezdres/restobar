import type {
  Contract,
  Employee,
  Payroll,
  PayrollAlert,
} from "@/lib/kitchen/types";

function parseDate(dateString?: string) {
  if (!dateString) {
    return null;
  }

  const parsed = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthStart(period: string) {
  return parseDate(`${period}-01`);
}

function monthEnd(period: string) {
  const start = monthStart(period);

  if (!start) {
    return null;
  }

  return new Date(start.getFullYear(), start.getMonth() + 1, 0);
}

export function findActiveContract(
  contracts: Contract[],
  employeeId: string,
  period: string,
) {
  const start = monthStart(period);
  const end = monthEnd(period);

  if (!start || !end) {
    return null;
  }

  return (
    contracts.find((contract) => {
      if (contract.employeeId !== employeeId || contract.active === false) {
        return false;
      }

      const contractStart = parseDate(contract.fechaInicio);
      const contractEnd = parseDate(contract.fechaFin);

      if (!contractStart) {
        return false;
      }

      return contractStart <= end && (!contractEnd || contractEnd >= start);
    }) ?? null
  );
}

export function buildPayrollAlerts(params: {
  contracts: Contract[];
  employee: Employee;
  payrolls: Payroll[];
  period: string;
}) {
  const { contracts, employee, payrolls, period } = params;
  const alerts: PayrollAlert[] = [];
  const activeContract = findActiveContract(contracts, employee.id, period);

  if (!employee.rut?.trim()) {
    alerts.push({
      id: `${employee.id}-missing-rut`,
      employeeId: employee.id,
      title: "Falta RUT del trabajador",
      description: "La ficha del trabajador debe incluir RUT para emitir liquidaciones completas.",
      severity: "warning",
    });
  }

  if (!activeContract) {
    alerts.push({
      id: `${employee.id}-missing-contract`,
      employeeId: employee.id,
      title: "Empleado sin contrato activo",
      description: `No existe contrato activo para ${period}.`,
      severity: "critical",
    });

    return { activeContract: null, alerts };
  }

  if (activeContract.fechaFin) {
    const contractEnd = parseDate(activeContract.fechaFin);
    const selectedMonthEnd = monthEnd(period);

    if (contractEnd && selectedMonthEnd && contractEnd < selectedMonthEnd) {
      alerts.push({
        id: `${employee.id}-expired-contract`,
        employeeId: employee.id,
        title: "Contrato vencido",
        description: `El contrato termino el ${activeContract.fechaFin}.`,
        severity: "critical",
      });
    }
  }

  const payrollExists = payrolls.some(
    (payroll) => payroll.employeeId === employee.id && payroll.periodo === period,
  );

  if (!payrollExists) {
    alerts.push({
      id: `${employee.id}-missing-payroll-${period}`,
      employeeId: employee.id,
      title: "Falta generar liquidacion este mes",
      description: `No existe liquidacion guardada para ${period}.`,
      severity: "warning",
    });
  }

  return { activeContract, alerts };
}
