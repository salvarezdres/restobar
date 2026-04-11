import type { Employee, EmployeeLegalEvaluation } from "@/lib/kitchen/types";

export type EmployeeFeatureGateway = {
  activeAlertsCount: number;
  compliancePercent: number;
  employees: Employee[];
  evaluations: EmployeeLegalEvaluation[];
  isDeleting: boolean;
  isSaving: boolean;
  ownerId: string;
  deleteEmployee: (employeeId: string) => Promise<void>;
  saveEmployee: (employee: Employee) => Promise<void>;
};
