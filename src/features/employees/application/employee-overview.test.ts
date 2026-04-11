import { describe, expect, it } from "vitest";

import type { EmployeeLegalEvaluation } from "@/lib/kitchen/types";

import { buildEmployeeOverview } from "./employee-overview";

describe("employee overview", () => {
  it("builds summary metrics from evaluations and alerts", () => {
    const evaluations = [
      { overallRisk: "OK" },
      { overallRisk: "RIESGO ALTO" },
      { overallRisk: "INCUMPLIMIENTO GRAVE" },
    ] as EmployeeLegalEvaluation[];

    expect(
      buildEmployeeOverview({
        activeAlertsCount: 7,
        compliancePercent: 83,
        evaluations,
      }),
    ).toEqual({
      activeAlertsCount: 7,
      compliancePercent: 83,
      criticalCount: 2,
      totalEmployees: 3,
    });
  });
});
