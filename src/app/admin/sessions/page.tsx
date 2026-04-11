import AppShell from "@/components/app-shell";
import AdminSessionAudit from "@/components/admin-session-audit";

export default function AdminSessionsPage() {
  return (
    <AppShell
      description="Vista restringida de usuarios que iniciaron sesion y sus datos basicos."
      title="Sesiones"
    >
      <AdminSessionAudit />
    </AppShell>
  );
}
