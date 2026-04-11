import AppShell from "@/components/app-shell";
import OperationsCalculator from "@/components/operations-calculator";

export default function OperationsPage() {
  return (
    <AppShell
      description="Registra costos operacionales fijos y variables para entender la base real del negocio."
      title="Operacion"
    >
      <OperationsCalculator />
    </AppShell>
  );
}
