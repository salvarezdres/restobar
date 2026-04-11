import AppShell from "@/components/app-shell";
import DashboardOverview from "@/components/dashboard-overview";

export default function DashboardPage() {
  return (
    <AppShell
      description="Resumen del sistema, estado de los modulos y accesos principales."
      title="Dashboard"
    >
      <DashboardOverview />
    </AppShell>
  );
}
