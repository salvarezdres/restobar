'use client'

import { useMemo } from "react";

import { useWorkspaceSession } from "@/components/workspace-session-provider";
import {
  useComplianceOverview,
  useDeleteEmployee,
  useEmployees,
  useSaveEmployee,
} from "@/hooks/use-kitchen-queries";
import type { Employee } from "@/lib/kitchen/types";

import type { EmployeeFeatureGateway } from "../application/ports";

export function useEmployeeFeatureGateway(): EmployeeFeatureGateway {
  const { ownerId } = useWorkspaceSession();
  const stableOwnerId = ownerId ?? "";
  const employeesQuery = useEmployees(ownerId);
  const complianceQuery = useComplianceOverview(ownerId);
  const saveEmployeeMutation = useSaveEmployee(ownerId);
  const deleteEmployeeMutation = useDeleteEmployee(ownerId);

  return useMemo(
    () => ({
      activeAlertsCount: complianceQuery.data?.activeAlerts.length ?? 0,
      compliancePercent: complianceQuery.data?.compliancePercent ?? 100,
      employees: employeesQuery.data ?? [],
      evaluations: complianceQuery.data?.evaluations ?? [],
      isDeleting: deleteEmployeeMutation.isPending,
      isSaving: saveEmployeeMutation.isPending,
      ownerId: stableOwnerId,
      deleteEmployee: async (employeeId: string) => {
        await deleteEmployeeMutation.mutateAsync(employeeId);
      },
      saveEmployee: async (employee: Employee) => {
        await saveEmployeeMutation.mutateAsync(employee);
      },
    }),
    [
      complianceQuery.data,
      deleteEmployeeMutation,
      employeesQuery.data,
      stableOwnerId,
      saveEmployeeMutation,
    ],
  );
}
