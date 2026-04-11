import type { LegalRiskLevel } from "@/lib/kitchen/types";

export function getRiskBadgeClass(
  risk: LegalRiskLevel,
  styles: Record<string, string>,
) {
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
