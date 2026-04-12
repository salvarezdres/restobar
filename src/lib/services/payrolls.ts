import type { Payroll } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "payrolls";

export async function listPayrolls(ownerId: string) {
  const payrolls = await listCollectionByOwner<Omit<Payroll, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return payrolls.sort((left, right) => {
    if (left.periodo === right.periodo) {
      return left.employeeName.localeCompare(right.employeeName, "es");
    }

    return right.periodo.localeCompare(left.periodo);
  });
}

export async function createPayroll(
  payroll: Omit<Payroll, "id" | "createdAt" | "updatedAt">,
) {
  return createCollectionDocument(COLLECTION_NAME, payroll);
}

export async function updatePayroll(
  payrollId: string,
  payroll: Partial<Omit<Payroll, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, payrollId, payroll);
}

export async function deletePayroll(payrollId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, payrollId);
}
