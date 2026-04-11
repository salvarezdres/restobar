import AppShell from "@/components/app-shell";
import MarginCalculator from "@/components/margin-calculator";

export default function MarginPage() {
  return (
    <AppShell
      description="Cruza ventas, costo directo, nomina y operacion para calcular margen bruto y liquido."
      title="Margen"
    >
      <MarginCalculator />
    </AppShell>
  );
}
