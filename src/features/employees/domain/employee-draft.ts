import { normalizeEmployeeLegalProfile } from "@/lib/legal-compliance";
import type {
  Employee,
  EmployeeRole,
} from "@/lib/kitchen/types";

export const ROLE_OPTIONS: EmployeeRole[] = [
  "chef",
  "ayudante",
  "garzon",
  "administracion",
];

function currentDateInput(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, 10);
}

function currentMonthInput(referenceDate = new Date()) {
  return referenceDate.toISOString().slice(0, 7);
}

export function createEmptyEmployeeDraft(ownerId: string, referenceDate = new Date()): Employee {
  return {
    id: "",
    ownerId,
    name: "",
    email: "",
    role: "chef",
    salary: 0,
    legalProfile: {
      employmentStartDate: currentDateInput(referenceDate),
      contractSignedDate: "",
      contractType: "indefinido",
      lastContributionPaidMonth: currentMonthInput(referenceDate),
      weeklyHours: 44,
      dailyWorkingHours: 9,
      breakMinutes: 60,
      overtimeHoursPerDay: 0,
      isMutualAffiliated: false,
      mutualName: "",
    },
  };
}

export function validateEmployeeDraft(draft: Employee) {
  if (!draft.name.trim() || draft.salary <= 0) {
    return "Nombre y sueldo son obligatorios.";
  }

  if (!draft.legalProfile.employmentStartDate) {
    return "La fecha de ingreso es obligatoria para el seguimiento legal.";
  }

  if (
    draft.legalProfile.contractSignedDate &&
    draft.legalProfile.contractSignedDate < draft.legalProfile.employmentStartDate
  ) {
    return "La fecha de firma del contrato no puede ser anterior al ingreso.";
  }

  return null;
}

export function sanitizeEmployeeDraft(draft: Employee, ownerId: string): Employee {
  return normalizeEmployeeLegalProfile({
    ...draft,
    ownerId,
    email: draft.email?.trim(),
    name: draft.name.trim(),
    legalProfile: {
      ...draft.legalProfile,
      mutualName: draft.legalProfile.mutualName?.trim(),
    },
  });
}
