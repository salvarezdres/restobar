'use client'

import { useMemo, useState } from "react";

import { normalizeEmployeeLegalProfile } from "@/lib/legal-compliance";
import type { Employee } from "@/lib/kitchen/types";

import {
  createEmptyEmployeeDraft,
  sanitizeEmployeeDraft,
  validateEmployeeDraft,
} from "../domain/employee-draft";
import { buildEmployeeOverview } from "./employee-overview";
import type { EmployeeFeatureGateway } from "./ports";

export function useEmployeeManager(gateway: EmployeeFeatureGateway) {
  const [draft, setDraft] = useState<Employee>(() => createEmptyEmployeeDraft(gateway.ownerId));
  const [error, setError] = useState<string | null>(null);

  const overview = useMemo(
    () =>
      buildEmployeeOverview({
        activeAlertsCount: gateway.activeAlertsCount,
        compliancePercent: gateway.compliancePercent,
        evaluations: gateway.evaluations,
      }),
    [gateway.activeAlertsCount, gateway.compliancePercent, gateway.evaluations],
  );

  function resetDraft() {
    setDraft(createEmptyEmployeeDraft(gateway.ownerId));
    setError(null);
  }

  function updateDraftField<Key extends keyof Employee>(field: Key, value: Employee[Key]) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function updateLegalProfileField<Key extends keyof Employee["legalProfile"]>(
    field: Key,
    value: Employee["legalProfile"][Key],
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      legalProfile: {
        ...currentDraft.legalProfile,
        [field]: value,
      },
    }));
  }

  async function saveDraft() {
    const validationError = validateEmployeeDraft(draft);

    if (validationError) {
      setError(validationError);
      return false;
    }

    setError(null);

    try {
      await gateway.saveEmployee(sanitizeEmployeeDraft(draft, gateway.ownerId));
      resetDraft();
      return true;
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el trabajador.",
      );
      return false;
    }
  }

  function startEditing(employee: Employee) {
    setDraft(normalizeEmployeeLegalProfile(employee));
    setError(null);
  }

  async function removeEmployee(employeeId: string) {
    setError(null);

    try {
      await gateway.deleteEmployee(employeeId);

      if (draft.id === employeeId) {
        resetDraft();
      }
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo borrar el trabajador.",
      );
    }
  }

  return {
    draft,
    error,
    evaluations: gateway.evaluations,
    isDeleting: gateway.isDeleting,
    isSaving: gateway.isSaving,
    overview,
    employees: gateway.employees,
    removeEmployee,
    resetDraft,
    saveDraft,
    startEditing,
    updateDraftField,
    updateLegalProfileField,
  };
}
