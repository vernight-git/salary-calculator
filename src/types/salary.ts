import type { ConfigData, TaxClassConfig } from './config';

export type CompanyCarType = 'combustion' | 'hybrid' | 'electric' | 'none';

export interface BonusEntry {
  id: string;
  month: number;
  type: 'amount' | 'percent';
  value: number;
  description?: string;
}

export interface SalaryInput {
  baseMonthlyGross: number;
  taxClass: keyof ConfigData['taxClasses'];
  churchTax: boolean;
  solidarityTax: boolean;
  includeVoluntaryInsurance: boolean;
  months?: number;
  bonuses: BonusEntry[];
  homeOfficeDaysPerYear: number;
  commuteDaysPerMonth: number;
  commuteDistanceKm: number;
  childAllowanceFactors: number;
  childrenUnder25: number;
  age: number;
  federalState: string;
  healthInsuranceAdditionalRate: number;
  privateHealthInsurance: boolean;
  companyCarBenefit: number;
  companyCarType: CompanyCarType;
  capitalGainsAllowance: number;
  mealVouchers: number;
  companyPension: number;
}

export interface SalaryBreakdown {
  monthlyGross: number;
  annualGross: number;
  annualBonuses: number;
  taxableIncome: number;
  incomeTax: number;
  solidarityTax: number;
  churchTax: number;
  socialContributions: {
    health: number;
    pension: number;
    unemployment: number;
    longTermCare: number;
    voluntary: number;
  };
  totalDeductions: number;
  annualNet: number;
  monthlyNet: number;
  monthlyNetAmounts: number[];
}

export interface SalaryCalculatorContextValue {
  config: ConfigData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export interface TaxComputationInput {
  taxableIncome: number;
  taxClassConfig: TaxClassConfig;
}
