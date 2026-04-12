export type IngredientUnit =
  | "g"
  | "kg"
  | "ml"
  | "l"
  | "unit"
  | "tbsp"
  | "tsp";

export type IngredientInput = {
  id: string;
  name: string;
  quantity: number;
  unit: IngredientUnit;
};

export type Recipe = {
  id: string;
  ownerId: string;
  name: string;
  alias: string;
  baseServings: number;
  ingredients: IngredientInput[];
  createdAt?: string;
  updatedAt?: string;
};

export type MenuRecipeEntry = {
  recipeId: string;
  recipeName: string;
  recipeAlias: string;
  servings: number;
};

export type Menu = {
  id: string;
  ownerId: string;
  name: string;
  serviceCount: number;
  recipes: MenuRecipeEntry[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CostCatalogItem = {
  id: string;
  ownerId: string;
  ingredientName: string;
  normalizedName: string;
  unit: IngredientUnit;
  costPerUnit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeRole = "chef" | "ayudante" | "garzon" | "administracion";

export type LegalRiskLevel =
  | "OK"
  | "RIESGO BAJO"
  | "RIESGO MEDIO"
  | "RIESGO ALTO"
  | "INCUMPLIMIENTO GRAVE";

export type LegalCheckType =
  | "contract"
  | "cotizaciones"
  | "jornada"
  | "seguridad";

export type LegalCheckStatus =
  | "ok"
  | "warning"
  | "risk"
  | "critical"
  | "severe";

export type LegalAlertSeverity = "preventiva" | "riesgo" | "critica";

export type EmployeeLegalProfile = {
  employmentStartDate: string;
  contractSignedDate?: string;
  contractType?: "indefinido" | "plazo-fijo" | "por-obra";
  lastContributionPaidMonth?: string;
  weeklyHours: number;
  dailyWorkingHours: number;
  breakMinutes: number;
  overtimeHoursPerDay: number;
  isMutualAffiliated: boolean;
  mutualName?: string;
};

export type Employee = {
  id: string;
  ownerId: string;
  name: string;
  rut?: string;
  email?: string;
  role: EmployeeRole;
  salary: number;
  legalProfile: EmployeeLegalProfile;
  createdAt?: string;
  updatedAt?: string;
};

export type ContractType = "indefinido" | "plazo-fijo";

export type GratificationType = "articulo-50" | "sin-gratificacion";

export type Contract = {
  id: string;
  ownerId: string;
  employeeId: string;
  employeeName: string;
  employeeRut?: string;
  tipoContrato: ContractType;
  sueldoBase: number;
  fechaInicio: string;
  fechaFin?: string;
  gratificacionTipo: GratificationType;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PayrollItemType = "haber" | "descuento";

export type PayrollItemCode =
  | "sueldo-base"
  | "gratificacion-legal"
  | "bono"
  | "comision"
  | "colacion"
  | "movilizacion"
  | "otro-haber"
  | "afp"
  | "salud"
  | "seguro-cesantia"
  | "impuesto-unico"
  | "anticipo"
  | "otro-descuento";

export type PayrollItem = {
  tipo: PayrollItemType;
  codigo: PayrollItemCode;
  nombre: string;
  monto: number;
  imponible: boolean;
};

export type Payroll = {
  id: string;
  ownerId: string;
  employeeId: string;
  employeeName: string;
  employeeRut?: string;
  contractId?: string;
  periodo: string;
  imponible: number;
  noImponible: number;
  descuentos: number;
  liquido: number;
  costoEmpresa?: number;
  detalleItems: PayrollItem[];
  legalAlerts: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type PayrollAlertSeverity = "info" | "warning" | "critical";

export type PayrollAlert = {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  severity: PayrollAlertSeverity;
};

export type LegalAlert = {
  id: string;
  employeeId: string;
  severity: LegalAlertSeverity;
  title: string;
  description: string;
  dueDate?: string;
  checkType: LegalCheckType;
};

export type LegalTimelineEvent = {
  dayOffset: number;
  label: string;
  riskLevel: LegalRiskLevel;
  description: string;
};

export type LegalCheck = {
  id: string;
  ownerId: string;
  employeeId: string;
  employeeName: string;
  checkType: LegalCheckType;
  status: LegalCheckStatus;
  riskLevel: LegalRiskLevel;
  summary: string;
  alerts: LegalAlert[];
  lastEvaluationDate: string;
  nextEvaluationDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeLegalEvaluation = {
  employeeId: string;
  employeeName: string;
  overallRisk: LegalRiskLevel;
  completionScore: number;
  legalState: LegalRiskLevel;
  checks: LegalCheck[];
  alerts: LegalAlert[];
  timeline: LegalTimelineEvent[];
};

export type ScheduleEvent = {
  id: string;
  ownerId: string;
  title: string;
  collaboratorIds: string[];
  collaboratorNames: string[];
  collaboratorEmails: string[];
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
  googleCalendarEventId?: string;
  googleCalendarLink?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SessionAuditUser = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerIds: string[];
  signInCount: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

export type ConsolidatedIngredient = {
  name: string;
  normalizedName: string;
  canonicalUnit: "g" | "ml" | "unit";
  quantity: number;
  sources: Array<{
    recipeId: string;
    recipeName: string;
    quantity: number;
    unit: IngredientUnit;
  }>;
};

export type CostBreakdown = {
  normalizedName: string;
  displayName: string;
  quantity: number;
  canonicalUnit: "g" | "ml" | "unit";
  unitCost?: number;
  costUnit?: IngredientUnit;
  totalCost: number;
  missingCost: boolean;
};
