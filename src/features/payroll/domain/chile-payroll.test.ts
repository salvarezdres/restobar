import { describe, expect, it } from "vitest";

import type { Contract, Employee, PayrollItem } from "@/lib/kitchen/types";

import {
  DEFAULT_CHILE_PAYROLL_CONFIG,
  calculateChilePayroll,
} from "./chile-payroll";

const employee: Employee = {
  id: "emp-1",
  ownerId: "owner-1",
  name: "Ana Perez",
  rut: "12.345.678-5",
  email: "ana@example.com",
  role: "administracion",
  salary: 750000,
  legalProfile: {
    employmentStartDate: "2026-04-01",
    contractSignedDate: "2026-04-01",
    contractType: "indefinido",
    lastContributionPaidMonth: "2026-04",
    weeklyHours: 44,
    dailyWorkingHours: 8,
    breakMinutes: 60,
    overtimeHoursPerDay: 0,
    isMutualAffiliated: true,
    mutualName: "ACHS",
  },
};

const contract: Contract = {
  id: "contract-1",
  ownerId: "owner-1",
  employeeId: "emp-1",
  employeeName: "Ana Perez",
  employeeRut: "12.345.678-5",
  tipoContrato: "indefinido",
  sueldoBase: 750000,
  fechaInicio: "2026-04-01",
  gratificacionTipo: "articulo-50",
  active: true,
};

describe("calculateChilePayroll", () => {
  it("calculates legal deductions for an indefinite contract", () => {
    const result = calculateChilePayroll({
      contract,
      employee,
      period: "2026-04",
      additionalItems: [],
      config: {
        ingresoMinimoMensual: 529000,
        utmValue: 68923,
      },
    });

    expect(result.imponible).toBeGreaterThan(750000);
    expect(result.descuentos).toBeGreaterThan(0);
    expect(result.liquido).toBeLessThan(result.imponible);
    expect(result.detalleItems.some((item) => item.codigo === "afp")).toBe(true);
    expect(result.detalleItems.some((item) => item.codigo === "salud")).toBe(true);
    expect(result.detalleItems.some((item) => item.codigo === "seguro-cesantia")).toBe(true);
  });

  it("caps monthly gratification using proportional annual cap", () => {
    const result = calculateChilePayroll({
      contract: {
        ...contract,
        sueldoBase: 4000000,
      },
      employee: {
        ...employee,
        salary: 4000000,
      },
      period: "2026-04",
      additionalItems: [],
      config: {
        ingresoMinimoMensual: 529000,
      },
    });

    const gratificationItem = result.detalleItems.find(
      (item) => item.codigo === "gratificacion-legal",
    );

    expect(gratificationItem?.monto).toBe(
      Math.round((4.75 * 529000) / 12),
    );
  });

  it("does not discount unemployment from fixed-term worker", () => {
    const result = calculateChilePayroll({
      contract: {
        ...contract,
        tipoContrato: "plazo-fijo",
      },
      employee,
      period: "2026-04",
      additionalItems: [],
    });

    expect(
      result.detalleItems.some((item) => item.codigo === "seguro-cesantia"),
    ).toBe(false);
  });

  it("includes imponible and non-imponible custom items", () => {
    const additionalItems: PayrollItem[] = [
      {
        tipo: "haber",
        codigo: "bono",
        nombre: "Bono produccion",
        monto: 80000,
        imponible: true,
      },
      {
        tipo: "haber",
        codigo: "movilizacion",
        nombre: "Movilizacion",
        monto: 40000,
        imponible: false,
      },
    ];

    const result = calculateChilePayroll({
      contract,
      employee,
      period: "2026-04",
      additionalItems,
      config: DEFAULT_CHILE_PAYROLL_CONFIG,
    });

    expect(result.imponible).toBeGreaterThan(contract.sueldoBase);
    expect(result.noImponible).toBe(40000);
  });
});
