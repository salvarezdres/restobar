import type { EmployeeLegalEvaluation } from "@/lib/kitchen/types";

export function getCriticalEmployeeCount(evaluations: EmployeeLegalEvaluation[]) {
  return evaluations.filter(
    (item) =>
      item.overallRisk === "INCUMPLIMIENTO GRAVE" ||
      item.overallRisk === "RIESGO ALTO",
  ).length;
}

export function buildEmployeeOverview(input: {
  activeAlertsCount: number;
  compliancePercent: number;
  evaluations: EmployeeLegalEvaluation[];
}) {
  return {
    activeAlertsCount: input.activeAlertsCount,
    compliancePercent: input.compliancePercent,
    criticalCount: getCriticalEmployeeCount(input.evaluations),
    totalEmployees: input.evaluations.length,
  };
}
