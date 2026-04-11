import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { evaluateEmployeeCompliance } from "@/lib/legal-compliance";
import { db } from "@/lib/firestore";
import type { Employee, LegalCheck } from "@/lib/kitchen/types";
import { mapFirestoreDoc } from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "legal_checks";

export async function syncEmployeeLegalChecks(employee: Employee) {
  const evaluation = evaluateEmployeeCompliance(employee);

  await Promise.all(
    evaluation.checks.map((check) =>
      setDoc(
        doc(db, COLLECTION_NAME, `${employee.id}_${check.checkType}`),
        {
          ownerId: employee.ownerId,
          employeeId: employee.id,
          employeeName: employee.name,
          checkType: check.checkType,
          status: check.status,
          riskLevel: check.riskLevel,
          summary: check.summary,
          alerts: check.alerts,
          lastEvaluationDate: check.lastEvaluationDate,
          nextEvaluationDate: check.nextEvaluationDate,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true },
      ),
    ),
  );

  return evaluation;
}

export async function listLegalChecks(ownerId: string) {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where("ownerId", "==", ownerId)),
  );

  return snapshot.docs
    .map((document) =>
      mapFirestoreDoc(document.id, document.data() as Omit<LegalCheck, "id">),
    )
    .sort((left, right) => left.employeeName.localeCompare(right.employeeName, "es"));
}

export async function deleteEmployeeLegalChecks(ownerId: string, employeeId: string) {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where("ownerId", "==", ownerId),
      where("employeeId", "==", employeeId),
    ),
  );

  await Promise.all(snapshot.docs.map((document) => deleteDoc(document.ref)));
}
