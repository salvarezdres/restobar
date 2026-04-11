import type { Employee } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "employees";

export async function listEmployees(ownerId: string) {
  const employees = await listCollectionByOwner<Omit<Employee, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return employees.sort((left, right) => left.name.localeCompare(right.name, "es"));
}

export async function createEmployee(
  employee: Omit<Employee, "id" | "createdAt" | "updatedAt">,
) {
  return createCollectionDocument(COLLECTION_NAME, employee);
}

export async function updateEmployee(
  employeeId: string,
  employee: Partial<Omit<Employee, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, employeeId, employee);
}

export async function deleteEmployee(employeeId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, employeeId);
}
