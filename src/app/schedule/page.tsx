import AppShell from "@/components/app-shell";
import ScheduleManager from "@/components/schedule-manager";

export default function SchedulePage() {
  return (
    <AppShell
      description="Planifica reuniones, turnos o coordinaciones y crea la cita en Google Calendar."
      title="Agenda"
    >
      <ScheduleManager />
    </AppShell>
  );
}
