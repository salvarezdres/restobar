import { describe, expect, it } from "vitest";

import type { Employee } from "@/lib/kitchen/types";

import { evaluateEmployeeCompliance } from "./legal-compliance";

const baseEmployee: Employee = {
  id: "emp-1",
  ownerId: "owner-1",
  name: "Ana Perez",
  rut: "12.345.678-5",
  email: "ana@example.com",
  role: "administracion",
  salary: 900000,
  legalProfile: {
    employmentStartDate: "2026-04-10",
    contractSignedDate: "2026-04-10",
    contractType: "indefinido",
    lastContributionPaidMonth: "",
    weeklyHours: 44,
    dailyWorkingHours: 9,
    breakMinutes: 60,
    overtimeHoursPerDay: 0,
    isMutualAffiliated: true,
    mutualName: "ACHS",
  },
};

describe("evaluateEmployeeCompliance contributions", () => {
  it("does not flag late contributions before the first due month", () => {
    const evaluation = evaluateEmployeeCompliance(
      baseEmployee,
      new Date("2026-04-20T12:00:00.000Z"),
    );

    const contributionCheck = evaluation.checks.find(
      (check) => check.checkType === "cotizaciones",
    );

    expect(contributionCheck?.riskLevel).toBe("OK");
    expect(contributionCheck?.summary).toContain("Aun no corresponde exigir cotizaciones");
  });
});
