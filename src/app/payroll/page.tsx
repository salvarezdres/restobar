import AppShell from "@/components/app-shell";
import PayrollCalculator from "@/components/payroll-calculator";

export default function PayrollPage() {
  return (
    <AppShell
      description="Calcula liquidaciones estimadas, costo total de nomina y carga mensual por empleado."
      title="Liquidaciones"
    >
      <PayrollCalculator />
    </AppShell>
  );
}
