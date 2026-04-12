'use client'

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  Contract,
  CostCatalogItem,
  Employee,
  Menu,
  Payroll,
  Recipe,
  ScheduleEvent,
} from "@/lib/kitchen/types";
import { buildComplianceOverview } from "@/lib/legal-compliance";
import { normalizeName } from "@/lib/kitchen/units";
import {
  createContract,
  deleteContract,
  listContracts,
  updateContract,
} from "@/lib/services/contracts";
import {
  createCostItem,
  deleteCostItem,
  listCostCatalog,
  updateCostItem,
} from "@/lib/services/cost-catalog";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from "@/lib/services/employees";
import {
  deleteEmployeeLegalChecks,
  listLegalChecks,
  syncEmployeeLegalChecks,
} from "@/lib/services/legal-checks";
import {
  createPayroll,
  deletePayroll,
  listPayrolls,
  updatePayroll,
} from "@/lib/services/payrolls";
import {
  createScheduleEvent,
  deleteScheduleEvent,
  listScheduleEvents,
  updateScheduleEvent,
} from "@/lib/services/schedule-events";
import { listSessionAuditUsers } from "@/lib/services/session-audit";
import { createMenu, deleteMenu, listMenus, updateMenu } from "@/lib/services/menus";
import {
  createRecipe,
  deleteRecipe,
  listRecipes,
  updateRecipe,
} from "@/lib/services/recipes";

function stripUndefinedFields<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  ) as T;
}

function invalidateWorkspace(queryClient: ReturnType<typeof useQueryClient>, ownerId: string) {
  void queryClient.invalidateQueries({ queryKey: ["workspace", ownerId] });
}

export function useRecipes(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "recipes"],
    queryFn: () => listRecipes(ownerId as string),
  });
}

export function useMenus(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "menus"],
    queryFn: () => listMenus(ownerId as string),
  });
}

export function useCostCatalog(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "costs"],
    queryFn: () => listCostCatalog(ownerId as string),
  });
}

export function useEmployees(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "employees"],
    queryFn: () => listEmployees(ownerId as string),
  });
}

export function useContracts(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "contracts"],
    queryFn: () => listContracts(ownerId as string),
  });
}

export function usePayrolls(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "payrolls"],
    queryFn: () => listPayrolls(ownerId as string),
  });
}

export function useScheduleEvents(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "schedule"],
    queryFn: () => listScheduleEvents(ownerId as string),
  });
}

export function useLegalChecks(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "legal-checks"],
    queryFn: () => listLegalChecks(ownerId as string),
  });
}

export function useComplianceOverview(ownerId: string | undefined) {
  const employeesQuery = useEmployees(ownerId);

  return {
    ...employeesQuery,
    data: buildComplianceOverview(employeesQuery.data ?? []),
  };
}

export function useSessionAuditUsers(enabled: boolean) {
  return useQuery({
    enabled,
    queryKey: ["admin", "session-audit-users"],
    queryFn: listSessionAuditUsers,
  });
}

export function useSaveRecipe(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Recipe) => {
      if (input.id) {
        await updateRecipe(input.id, {
          alias: input.alias,
          baseServings: input.baseServings,
          ingredients: input.ingredients,
          name: input.name,
        });
        return;
      }

      await createRecipe({
        ownerId: ownerId as string,
        name: input.name,
        alias: input.alias,
        baseServings: input.baseServings,
        ingredients: input.ingredients,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteRecipe(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecipe,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useSaveMenu(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Menu) => {
      if (input.id) {
        await updateMenu(input.id, {
          name: input.name,
          notes: input.notes,
          recipes: input.recipes,
          serviceCount: input.serviceCount,
        });
        return;
      }

      await createMenu({
        ownerId: ownerId as string,
        name: input.name,
        notes: input.notes,
        recipes: input.recipes,
        serviceCount: input.serviceCount,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteMenu(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMenu,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useSaveCostItem(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CostCatalogItem) => {
      const payload = {
        ingredientName: input.ingredientName,
        normalizedName: normalizeName(input.ingredientName),
        unit: input.unit,
        costPerUnit: input.costPerUnit,
      };

      if (input.id) {
        await updateCostItem(input.id, payload);
        return;
      }

      await createCostItem({
        ownerId: ownerId as string,
        ...payload,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteCostItem(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCostItem,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useSaveEmployee(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Employee) => {
      const payload = stripUndefinedFields({
        name: input.name,
        rut: input.rut,
        email: input.email,
        role: input.role,
        salary: input.salary,
        legalProfile: input.legalProfile,
      });

      if (input.id) {
        await updateEmployee(input.id, payload);
        await syncEmployeeLegalChecks({
          ...input,
          ownerId: ownerId as string,
        });
        return;
      }

      const createdEmployeeId = await createEmployee({
        ownerId: ownerId as string,
        ...payload,
      });

      await syncEmployeeLegalChecks({
        ...input,
        id: createdEmployeeId,
        ownerId: ownerId as string,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
        void queryClient.invalidateQueries({
          queryKey: ["workspace", ownerId, "legal-checks"],
        });
      }
    },
  });
}

export function useSaveContract(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Contract) => {
      const payload = stripUndefinedFields({
        active: input.active ?? true,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        employeeRut: input.employeeRut,
        fechaFin: input.fechaFin,
        fechaInicio: input.fechaInicio,
        gratificacionTipo: input.gratificacionTipo,
        sueldoBase: input.sueldoBase,
        tipoContrato: input.tipoContrato,
      });

      if (input.id) {
        await updateContract(input.id, payload);
        return;
      }

      await createContract({
        ownerId: ownerId as string,
        ...payload,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteContract(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useSavePayroll(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Payroll) => {
      const payload = stripUndefinedFields({
        contractId: input.contractId,
        costoEmpresa: input.costoEmpresa,
        descuentos: input.descuentos,
        detalleItems: input.detalleItems,
        employeeId: input.employeeId,
        employeeName: input.employeeName,
        employeeRut: input.employeeRut,
        imponible: input.imponible,
        legalAlerts: input.legalAlerts,
        liquido: input.liquido,
        noImponible: input.noImponible,
        periodo: input.periodo,
      });

      if (input.id) {
        await updatePayroll(input.id, payload);
        return;
      }

      await createPayroll({
        ownerId: ownerId as string,
        ...payload,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeletePayroll(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayroll,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteEmployee(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId: string) => {
      await deleteEmployee(employeeId);

      if (ownerId) {
        await deleteEmployeeLegalChecks(ownerId, employeeId);
      }
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
        void queryClient.invalidateQueries({
          queryKey: ["workspace", ownerId, "legal-checks"],
        });
      }
    },
  });
}

export function useSaveScheduleEvent(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ScheduleEvent) => {
      const payload = {
        title: input.title,
        collaboratorIds: input.collaboratorIds,
        collaboratorNames: input.collaboratorNames,
        collaboratorEmails: input.collaboratorEmails,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes,
        googleCalendarEventId: input.googleCalendarEventId,
        googleCalendarLink: input.googleCalendarLink,
      };

      if (input.id) {
        await updateScheduleEvent(input.id, payload);
        return;
      }

      await createScheduleEvent({
        ownerId: ownerId as string,
        ...payload,
      });
    },
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}

export function useDeleteScheduleEvent(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteScheduleEvent,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
      }
    },
  });
}
