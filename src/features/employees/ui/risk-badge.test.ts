import { describe, expect, it } from "vitest";

import { getRiskBadgeClass } from "./risk-badge";

const styles = {
  riskHigh: "riskHigh",
  riskLow: "riskLow",
  riskMedium: "riskMedium",
  riskOk: "riskOk",
};

describe("risk badge mapping", () => {
  it("maps legal risks to the expected style token", () => {
    expect(getRiskBadgeClass("OK", styles)).toBe("riskOk");
    expect(getRiskBadgeClass("RIESGO BAJO", styles)).toBe("riskLow");
    expect(getRiskBadgeClass("RIESGO MEDIO", styles)).toBe("riskMedium");
    expect(getRiskBadgeClass("RIESGO ALTO", styles)).toBe("riskHigh");
    expect(getRiskBadgeClass("INCUMPLIMIENTO GRAVE", styles)).toBe("riskHigh");
  });
});
