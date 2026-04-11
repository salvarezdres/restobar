import AppShell from "@/components/app-shell";
import EmployeeManager from "@/components/employee-manager";

export default function EmployeesPage() {
  return (
    <AppShell
      description="Gestion basica de empleados, roles y sueldos para ampliar operacion mas adelante."
      title="Empleados"
    >
      <EmployeeManager />
    </AppShell>
  );
}
