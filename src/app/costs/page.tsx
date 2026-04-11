import AppShell from "@/components/app-shell";
import CostManager from "@/components/cost-manager";

export default function CostsPage() {
  return (
    <AppShell
      description="Carga costos base por ingrediente para calcular el costo por receta y por menu."
      title="Costos"
    >
      <CostManager />
    </AppShell>
  );
}
