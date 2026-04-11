import type { Employee, Menu } from "@/lib/kitchen/types";
import { calculateMenuCosts } from "@/lib/kitchen/calculations";
import type { CostCatalogItem, Recipe } from "@/lib/kitchen/types";

export function calculatePayrollTotals(
  employees: Employee[],
  legalBurdenRate: number,
  bonusRate: number,
) {
  const items = employees.map((employee) => {
    const burden = employee.salary * legalBurdenRate;
    const bonus = employee.salary * bonusRate;
    const total = employee.salary + burden + bonus;

    return {
      ...employee,
      burden,
      bonus,
      total,
    };
  });

  return {
    items,
    grossSalaries: items.reduce((sum, item) => sum + item.salary, 0),
    burdenTotal: items.reduce((sum, item) => sum + item.burden, 0),
    bonusTotal: items.reduce((sum, item) => sum + item.bonus, 0),
    totalPayroll: items.reduce((sum, item) => sum + item.total, 0),
  };
}

export function calculateOperationalCosts(input: {
  rent: number;
  utilities: number;
  logistics: number;
  maintenance: number;
  software: number;
  miscellaneous: number;
  salesVariableRate: number;
  projectedSales: number;
}) {
  const fixedTotal =
    input.rent +
    input.utilities +
    input.logistics +
    input.maintenance +
    input.software +
    input.miscellaneous;
  const variableTotal = input.projectedSales * input.salesVariableRate;

  return {
    fixedTotal,
    variableTotal,
    totalOperationalCost: fixedTotal + variableTotal,
  };
}

export function calculateMenuMargin(input: {
  menu: Menu | null;
  recipes: Recipe[];
  costs: CostCatalogItem[];
  sellingPricePerService: number;
  payrollCost: number;
  operationalCost: number;
}) {
  const directCost = input.menu
    ? calculateMenuCosts(input.menu, input.recipes, input.costs).totalCost
    : 0;
  const revenue = input.menu ? input.menu.serviceCount * input.sellingPricePerService : 0;
  const grossMargin = revenue - directCost;
  const grossMarginRate = revenue > 0 ? grossMargin / revenue : 0;
  const netMargin = grossMargin - input.payrollCost - input.operationalCost;
  const netMarginRate = revenue > 0 ? netMargin / revenue : 0;

  return {
    revenue,
    directCost,
    grossMargin,
    grossMarginRate,
    netMargin,
    netMarginRate,
  };
}

export function calculateSalesProjection(input: {
  averageTicket: number;
  coversPerDay: number;
  openDaysPerMonth: number;
  growthRate: number;
  payrollCost: number;
  operationalCost: number;
}) {
  const baseSales =
    input.averageTicket * input.coversPerDay * input.openDaysPerMonth;
  const projectedSales = baseSales * (1 + input.growthRate);
  const breakEvenSales = input.payrollCost + input.operationalCost;
  const contributionAfterFixed = projectedSales - breakEvenSales;

  return {
    baseSales,
    projectedSales,
    breakEvenSales,
    contributionAfterFixed,
  };
}
