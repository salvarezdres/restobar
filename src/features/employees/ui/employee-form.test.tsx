import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createEmptyEmployeeDraft } from "../domain/employee-draft";
import { EmployeeForm } from "./employee-form";

describe("EmployeeForm", () => {
  it("renders validation feedback and calls save", () => {
    const onSave = vi.fn();

    render(
      <EmployeeForm
        draft={{
          ...createEmptyEmployeeDraft("owner-1", new Date("2026-04-11T00:00:00.000Z")),
          name: "Ana",
          salary: 900000,
        }}
        error="Nombre y sueldo son obligatorios."
        isSaving={false}
        onDraftFieldChange={vi.fn()}
        onLegalProfileChange={vi.fn()}
        onReset={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByText("Nombre y sueldo son obligatorios.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Crear trabajador" }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables the primary action while saving", () => {
    render(
      <EmployeeForm
        draft={createEmptyEmployeeDraft("owner-1", new Date("2026-04-11T00:00:00.000Z"))}
        error={null}
        isSaving
        onDraftFieldChange={vi.fn()}
        onLegalProfileChange={vi.fn()}
        onReset={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
  });
});
