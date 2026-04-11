import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { createGoogleProvider, getFirebaseAuth } from "@/lib/auth";

type CalendarEventInput = {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  attendees: string[];
};

export async function createGoogleCalendarEvent(input: CalendarEventInput) {
  const auth = getFirebaseAuth();
  const provider = createGoogleProvider([
    "https://www.googleapis.com/auth/calendar.events",
  ]);
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error("No se pudo obtener autorizacion para Google Calendar.");
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description,
        start: {
          dateTime: input.startDateTime,
          timeZone: timezone,
        },
        end: {
          dateTime: input.endDateTime,
          timeZone: timezone,
        },
        attendees: input.attendees.map((email) => ({ email })),
      }),
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo crear el evento en Google Calendar.");
  }

  const payload = (await response.json()) as {
    id?: string;
    htmlLink?: string;
  };

  return {
    id: payload.id,
    htmlLink: payload.htmlLink,
  };
}
