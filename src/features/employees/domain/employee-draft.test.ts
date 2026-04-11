import { describe, expect, it } from "vitest";

import {
  createEmptyEmployeeDraft,
  sanitizeEmployeeDraft,
  validateEmployeeDraft,
} from "./employee-draft";

describe("employee draft domain", () => {
  it("creates a default draft with legal baseline values", () => {
    const draft = createEmptyEmployeeDraft("owner-1", new Date("2026-04-11T12:00:00.000Z"));

    expect(draft.ownerId).toBe("owner-1");
    expect(draft.role).toBe("chef");
    expect(draft.legalProfile.employmentStartDate).toBe("2026-04-11");
    expect(draft.legalProfile.lastContributionPaidMonth).toBe("2026-04");
  });

  it("validates required fields and invalid contract dates", () => {
    const emptyDraft = createEmptyEmployeeDraft("owner-1");
    expect(validateEmployeeDraft(emptyDraft)).toBe("Nombre y sueldo son obligatorios.");

    const draft = {
      ...emptyDraft,
      name: "Ana",
      salary: 900000,
      legalProfile: {
        ...emptyDraft.legalProfile,
        employmentStartDate: "2026-04-11",
        contractSignedDate: "2026-04-10",
      },
    };

    expect(validateEmployeeDraft(draft)).toBe(
      "La fecha de firma del contrato no puede ser anterior al ingreso.",
    );
  });

  it("sanitizes text fields before persistence", () => {
    const draft = {
      ...createEmptyEmployeeDraft("owner-1"),
      name: "  Ana Perez  ",
      email: "  ana@example.com  ",
      salary: 900000,
      legalProfile: {
        ...createEmptyEmployeeDraft("owner-1").legalProfile,
        mutualName: "  ACHS  ",
      },
    };

    const sanitized = sanitizeEmployeeDraft(draft, "owner-2");

    expect(sanitized.ownerId).toBe("owner-2");
    expect(sanitized.name).toBe("Ana Perez");
    expect(sanitized.email).toBe("ana@example.com");
    expect(sanitized.legalProfile.mutualName).toBe("ACHS");
  });
});
