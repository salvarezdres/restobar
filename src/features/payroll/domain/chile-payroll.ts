import type {
  Contract,
  Employee,
  PayrollItem,
} from "@/lib/kitchen/types";

export type PayrollTaxBracket = {
  fromUtm: number;
  toUtm: number | null;
  factor: number;
  rebateUtm: number;
};

export type ChilePayrollConfig = {
  afpRate: number;
  healthRate: number;
  unemploymentEmployeeRate: number;
  unemploymentEmployerIndefiniteRate: number;
  unemploymentEmployerFixedTermRate: number;
  gratificationCapImmAnnual: number;
  monthlyTaxBrackets: PayrollTaxBracket[];
  utmValue: number;
  ingresoMinimoMensual: number;
};

export type PayrollGenerationInput = {
  contract: Contract;
  employee: Employee;
  period: string;
  additionalItems: PayrollItem[];
  config?: Partial<ChilePayrollConfig>;
};

export type PayrollCalculation = {
  imponible: number;
  noImponible: number;
  descuentos: number;
  liquido: number;
  baseTributable: number;
  costoEmpresa: number;
  detalleItems: PayrollItem[];
};

export const DEFAULT_CHILE_PAYROLL_CONFIG: ChilePayrollConfig = {
  afpRate: 0.1,
  healthRate: 0.07,
  unemploymentEmployeeRate: 0.006,
  unemploymentEmployerFixedTermRate: 0.03,
  unemploymentEmployerIndefiniteRate: 0.024,
  gratificationCapImmAnnual: 4.75,
  ingresoMinimoMensual: 529000,
  monthlyTaxBrackets: [
    { fromUtm: 0, toUtm: 13.5, factor: 0, rebateUtm: 0 },
    { fromUtm: 13.5, toUtm: 30, factor: 0.04, rebateUtm: 0.54 },
    { fromUtm: 30, toUtm: 50, factor: 0.08, rebateUtm: 1.74 },
    { fromUtm: 50, toUtm: 70, factor: 0.135, rebateUtm: 4.49 },
    { fromUtm: 70, toUtm: 90, factor: 0.23, rebateUtm: 11.14 },
    { fromUtm: 90, toUtm: 120, factor: 0.304, rebateUtm: 17.8 },
    { fromUtm: 120, toUtm: 310, factor: 0.35, rebateUtm: 23.32 },
    { fromUtm: 310, toUtm: null, factor: 0.4, rebateUtm: 38.82 },
  ],
  utmValue: 68923,
};

function roundCurrency(value: number) {
  return Math.round(value);
}

function mergeConfig(config?: Partial<ChilePayrollConfig>): ChilePayrollConfig {
  return {
    ...DEFAULT_CHILE_PAYROLL_CONFIG,
    ...config,
    monthlyTaxBrackets:
      config?.monthlyTaxBrackets ?? DEFAULT_CHILE_PAYROLL_CONFIG.monthlyTaxBrackets,
  };
}

function getMonthlyGratification(
  contract: Contract,
  taxableRemuneration: number,
  config: ChilePayrollConfig,
) {
  if (contract.gratificacionTipo !== "articulo-50") {
    return 0;
  }

  const monthlyCap =
    (config.gratificationCapImmAnnual * config.ingresoMinimoMensual) / 12;

  return Math.min(taxableRemuneration * 0.25, monthlyCap);
}

function calculateSingleTax(
  taxableBase: number,
  config: ChilePayrollConfig,
) {
  const taxableBaseUtm = taxableBase / config.utmValue;
  const bracket = config.monthlyTaxBrackets.find(
    (candidate) =>
      taxableBaseUtm >= candidate.fromUtm &&
      (candidate.toUtm === null || taxableBaseUtm <= candidate.toUtm),
  );

  if (!bracket || bracket.factor === 0) {
    return 0;
  }

  return roundCurrency((taxableBaseUtm * bracket.factor - bracket.rebateUtm) * config.utmValue);
}

function sumItems(
  items: PayrollItem[],
  predicate: (item: PayrollItem) => boolean,
) {
  return items.reduce((total, item) => {
    if (!predicate(item)) {
      return total;
    }

    return total + item.monto;
  }, 0);
}

export function calculateChilePayroll(input: PayrollGenerationInput): PayrollCalculation {
  const config = mergeConfig(input.config);
  const baseSalary = roundCurrency(input.contract.sueldoBase || input.employee.salary || 0);
  const additionalItems = input.additionalItems.filter((item) => item.monto > 0);
  const additionalTaxableEarnings = sumItems(
    additionalItems,
    (item) => item.tipo === "haber" && item.imponible,
  );
  const gratification = roundCurrency(
    getMonthlyGratification(input.contract, baseSalary + additionalTaxableEarnings, config),
  );

  const detailItems: PayrollItem[] = [
    {
      tipo: "haber",
      codigo: "sueldo-base",
      nombre: "Sueldo base",
      monto: baseSalary,
      imponible: true,
    },
    ...(gratification > 0
      ? [
          {
            tipo: "haber" as const,
            codigo: "gratificacion-legal" as const,
            nombre: "Gratificacion legal art. 50",
            monto: gratification,
            imponible: true,
          },
        ]
      : []),
    ...additionalItems,
  ];

  const imponible = roundCurrency(
    sumItems(detailItems, (item) => item.tipo === "haber" && item.imponible),
  );
  const noImponible = roundCurrency(
    sumItems(detailItems, (item) => item.tipo === "haber" && !item.imponible),
  );

  const afp = roundCurrency(imponible * config.afpRate);
  const health = roundCurrency(imponible * config.healthRate);
  const unemployment =
    input.contract.tipoContrato === "indefinido"
      ? roundCurrency(imponible * config.unemploymentEmployeeRate)
      : 0;
  const taxableBase = Math.max(imponible - afp - health - unemployment, 0);
  const singleTax = calculateSingleTax(taxableBase, config);

  detailItems.push(
    {
      tipo: "descuento",
      codigo: "afp",
      nombre: "AFP",
      monto: afp,
      imponible: false,
    },
    {
      tipo: "descuento",
      codigo: "salud",
      nombre: "Salud 7%",
      monto: health,
      imponible: false,
    },
  );

  if (unemployment > 0) {
    detailItems.push({
      tipo: "descuento",
      codigo: "seguro-cesantia",
      nombre: "Seguro de cesantia trabajador",
      monto: unemployment,
      imponible: false,
    });
  }

  if (singleTax > 0) {
    detailItems.push({
      tipo: "descuento",
      codigo: "impuesto-unico",
      nombre: "Impuesto unico",
      monto: singleTax,
      imponible: false,
    });
  }

  const extraDiscounts = roundCurrency(
    sumItems(
      detailItems,
      (item) =>
        item.tipo === "descuento" &&
        !["afp", "salud", "seguro-cesantia", "impuesto-unico"].includes(item.codigo),
    ),
  );
  const descuentos = roundCurrency(afp + health + unemployment + singleTax + extraDiscounts);
  const liquido = roundCurrency(imponible + noImponible - descuentos);
  const employerUnemployment = roundCurrency(
    imponible *
      (input.contract.tipoContrato === "indefinido"
        ? config.unemploymentEmployerIndefiniteRate
        : config.unemploymentEmployerFixedTermRate),
  );
  const costoEmpresa = roundCurrency(imponible + noImponible + employerUnemployment);

  return {
    imponible,
    noImponible,
    descuentos,
    liquido,
    baseTributable: taxableBase,
    costoEmpresa,
    detalleItems: detailItems,
  };
}
