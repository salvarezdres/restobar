import type { Contract } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "contracts";

export async function listContracts(ownerId: string) {
  const contracts = await listCollectionByOwner<Omit<Contract, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return contracts.sort((left, right) => {
    if (left.employeeName === right.employeeName) {
      return right.fechaInicio.localeCompare(left.fechaInicio);
    }

    return left.employeeName.localeCompare(right.employeeName, "es");
  });
}

export async function createContract(
  contract: Omit<Contract, "id" | "createdAt" | "updatedAt">,
) {
  return createCollectionDocument(COLLECTION_NAME, contract);
}

export async function updateContract(
  contractId: string,
  contract: Partial<Omit<Contract, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, contractId, contract);
}

export async function deleteContract(contractId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, contractId);
}
