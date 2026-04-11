import AppShell from "@/components/app-shell";
import SalesProjectionCalculator from "@/components/sales-projection-calculator";

export default function ProjectionsPage() {
  return (
    <AppShell
      description="Proyecta ventas mensuales, punto de equilibrio y aporte estimado despues de costos fijos."
      title="Proyecciones"
    >
      <SalesProjectionCalculator />
    </AppShell>
  );
}
