import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Employee, EmployeeLegalEvaluation } from "@/lib/kitchen/types";

import { EmployeeList } from "./employee-list";

const employee: Employee = {
  id: "employee-1",
  ownerId: "owner-1",
  name: "Ana Perez",
  email: "ana@example.com",
  role: "chef",
  salary: 900000,
  legalProfile: {
    employmentStartDate: "2026-04-11",
    contractSignedDate: "2026-04-11",
    contractType: "indefinido",
    lastContributionPaidMonth: "2026-04",
    weeklyHours: 44,
    dailyWorkingHours: 9,
    breakMinutes: 60,
    overtimeHoursPerDay: 0,
    isMutualAffiliated: true,
    mutualName: "ACHS",
  },
};

const evaluation: EmployeeLegalEvaluation = {
  employeeId: "employee-1",
  employeeName: "Ana Perez",
  overallRisk: "RIESGO MEDIO",
  completionScore: 78,
  legalState: "RIESGO MEDIO",
  alerts: [
    {
      id: "alert-1",
      employeeId: "employee-1",
      severity: "riesgo",
      title: "Contrato pendiente",
      description: "Han transcurrido 10 dias o mas y el contrato sigue sin firmarse.",
      checkType: "contract",
    },
  ],
  checks: [
    {
      id: "check-1",
      ownerId: "owner-1",
      employeeId: "employee-1",
      employeeName: "Ana Perez",
      checkType: "contract",
      status: "risk",
      riskLevel: "RIESGO MEDIO",
      summary: "Contrato pendiente con ventana legal cada vez mas estrecha.",
      alerts: [],
      lastEvaluationDate: "2026-04-11T00:00:00.000Z",
      nextEvaluationDate: "2026-04-12T00:00:00.000Z",
    },
  ],
  timeline: [],
};

describe("EmployeeList", () => {
  it("renders an empty state when there are no evaluations", () => {
    render(
      <EmployeeList
        employees={[]}
        evaluations={[]}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Todavia no hay trabajadores cargados/i),
    ).toBeInTheDocument();
  });

  it("calls edit and delete actions for a rendered employee", () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <EmployeeList
        employees={[employee]}
        evaluations={[evaluation]}
        onDelete={onDelete}
        onEdit={onEdit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Borrar" }));

    expect(onEdit).toHaveBeenCalledWith(employee);
    expect(onDelete).toHaveBeenCalledWith("employee-1");
  });
});
