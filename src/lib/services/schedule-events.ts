import type { ScheduleEvent } from "@/lib/kitchen/types";
import {
  createCollectionDocument,
  deleteCollectionDocument,
  listCollectionByOwner,
  updateCollectionDocument,
} from "@/lib/services/firestore-utils";

const COLLECTION_NAME = "schedule_events";

export async function listScheduleEvents(ownerId: string) {
  const events = await listCollectionByOwner<Omit<ScheduleEvent, "id">>(
    COLLECTION_NAME,
    ownerId,
  );

  return events.sort((left, right) => {
    const leftKey = `${left.date}T${left.startTime}`;
    const rightKey = `${right.date}T${right.startTime}`;

    return leftKey.localeCompare(rightKey);
  });
}

export async function createScheduleEvent(
  event: Omit<ScheduleEvent, "id" | "createdAt" | "updatedAt">,
) {
  await createCollectionDocument(COLLECTION_NAME, event);
}

export async function updateScheduleEvent(
  eventId: string,
  event: Partial<Omit<ScheduleEvent, "id" | "ownerId" | "createdAt" | "updatedAt">>,
) {
  await updateCollectionDocument(COLLECTION_NAME, eventId, event);
}

export async function deleteScheduleEvent(eventId: string) {
  await deleteCollectionDocument(COLLECTION_NAME, eventId);
}
