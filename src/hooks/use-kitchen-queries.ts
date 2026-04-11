'use client'

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CostCatalogItem,
  Employee,
  Menu,
  Recipe,
  ScheduleEvent,
} from "@/lib/kitchen/types";
import { normalizeName } from "@/lib/kitchen/units";
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

export function useScheduleEvents(ownerId: string | undefined) {
  return useQuery({
    enabled: Boolean(ownerId),
    queryKey: ["workspace", ownerId, "schedule"],
    queryFn: () => listScheduleEvents(ownerId as string),
  });
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
      const payload = {
        name: input.name,
        email: input.email,
        role: input.role,
        salary: input.salary,
      };

      if (input.id) {
        await updateEmployee(input.id, payload);
        return;
      }

      await createEmployee({
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

export function useDeleteEmployee(ownerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      if (ownerId) {
        invalidateWorkspace(queryClient, ownerId);
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
