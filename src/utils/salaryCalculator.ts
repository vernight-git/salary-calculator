import type { ConfigData, SocialContributionConfig, TaxBracket, TaxClassConfig } from '../types/config';
import type { BonusEntry, CompanyCarType, SalaryBreakdown, SalaryInput } from '../types/salary';

const MONTHS_PER_YEAR = 12;

function clampMonth(month: number): number {
  if (Number.isNaN(month)) return 0;
  return Math.min(Math.max(month - 1, 0), MONTHS_PER_YEAR - 1);
}

function calculateBonusValue(entry: BonusEntry, baseAnnualGross: number): number {
  if (entry.type === 'percent') {
    return (entry.value / 100) * baseAnnualGross;
  }
  return entry.value;
}

export function calculateMonthlyGrosses(
  baseMonthlyGross: number,
  months: number,
  bonuses: BonusEntry[]
): { monthlyGrosses: number[]; annualBonuses: number } {
  const effectiveMonths = months > 0 ? Math.min(months, MONTHS_PER_YEAR) : MONTHS_PER_YEAR;
  const monthlyGrosses = Array.from({ length: MONTHS_PER_YEAR }, (_, index) =>
    index < effectiveMonths ? baseMonthlyGross : 0
  );
  const baseAnnualGross = baseMonthlyGross * effectiveMonths;

  let annualBonuses = 0;

  bonuses.forEach((bonus) => {
    const monthIndex = clampMonth(bonus.month);
    const bonusValue = calculateBonusValue(bonus, baseAnnualGross);
    annualBonuses += bonusValue;
    if (monthIndex < MONTHS_PER_YEAR) {
      monthlyGrosses[monthIndex] += bonusValue;
    }
  });

  return { monthlyGrosses, annualBonuses };
}

function computeAllowanceHomeOffice(days: number, allowanceConfig: ConfigData['allowances']): number {
  const amount = days * allowanceConfig.homeOfficeDailyRate;
  return Math.min(amount, allowanceConfig.homeOfficeMax);
}

function computeAllowanceCommute(
  distanceKm: number,
  daysPerMonth: number,
  months: number,
  allowanceConfig: ConfigData['allowances']
): number {
  if (distanceKm <= 0 || daysPerMonth <= 0) {
    return 0;
  }
  const annualTrips = daysPerMonth * Math.min(months, MONTHS_PER_YEAR);
  const firstSegment = Math.min(distanceKm, 20) * allowanceConfig.commuteRateFirst20 * annualTrips;
  const beyond = Math.max(distanceKm - 20, 0) * allowanceConfig.commuteRateBeyond * annualTrips;
  return firstSegment + beyond;
}

function applyMonthlyCap(value: number, config: SocialContributionConfig): number {
  const cappedBase = Math.min(value, config.capMonthly);
  const baseContribution = cappedBase * config.employeeRate;
  const additionalRate = config.additionalRate ?? 0;
  return baseContribution + cappedBase * additionalRate;
}

function computeLongTermCareContribution(
  monthlyGross: number,
  config: SocialContributionConfig,
  hasChildren: boolean
): number {
  const cappedBase = Math.min(monthlyGross, config.capMonthly);
  const surcharge = !hasChildren ? config.surchargeWithoutChildren ?? 0 : 0;
  return cappedBase * (config.employeeRate + surcharge);
}

export function computeIncomeTax(taxableIncome: number, taxClassConfig: TaxClassConfig): number {
  const allowance = taxClassConfig.basicAllowance + taxClassConfig.additionalAllowance;
  const adjustedIncome = Math.max(0, taxableIncome - allowance);

  for (const bracket of taxClassConfig.brackets) {
    const limit = bracket.upTo ?? Number.POSITIVE_INFINITY;
    if (adjustedIncome <= limit) {
      const taxablePortion = Math.max(0, adjustedIncome - bracket.baseIncome);
      return Math.max(0, bracket.baseTax + taxablePortion * bracket.rate);
    }
  }

  const lastBracket: TaxBracket = taxClassConfig.brackets[taxClassConfig.brackets.length - 1];
  const taxablePortion = Math.max(0, adjustedIncome - lastBracket.baseIncome);
  return Math.max(0, lastBracket.baseTax + taxablePortion * lastBracket.rate);
}

function computeSolidarityTax(
  taxableIncome: number,
  incomeTax: number,
  config: ConfigData['solidarityTax']
): number {
  if (incomeTax <= 0 || taxableIncome <= config.freeAllowance) {
    return 0;
  }
  return incomeTax * config.rate;
}

function computeChurchTax(
  incomeTax: number, 
  config: ConfigData['churchTax'], 
  enabled: boolean,
  federalState: string
): number {
  if (!enabled || incomeTax <= 0) {
    return 0;
  }
  const rate = config.rateByState[federalState] ?? config.rate;
  return incomeTax * rate;
}

function computeVoluntaryInsurance(
  monthlyGross: number,
  months: number,
  includeVoluntary: boolean,
  allowanceConfig: ConfigData['allowances']
): number {
  if (!includeVoluntary) {
    return 0;
  }
  const { thresholdMonthly, additionalRate } = allowanceConfig.voluntaryInsurance;
  const applicableMonths = Math.min(months, MONTHS_PER_YEAR);
  const monthlyContribution = Math.max(0, monthlyGross - thresholdMonthly) * additionalRate;
  return monthlyContribution * applicableMonths;
}

function computeCompanyCarBenefit(
  listPrice: number,
  carType: CompanyCarType,
  benefitRates: ConfigData['companyCarBenefitRates']
): number {
  if (listPrice <= 0 || carType === 'none') {
    return 0;
  }
  const benefitRate = benefitRates[carType];
  return listPrice * benefitRate * MONTHS_PER_YEAR;
}

function computeMealVoucherTaxablePortion(
  monthlyVoucherValue: number,
  taxFreeLimit: number,
  months: number
): number {
  if (monthlyVoucherValue <= 0) {
    return 0;
  }
  const taxablePortion = Math.max(0, monthlyVoucherValue - taxFreeLimit);
  return taxablePortion * Math.min(months, MONTHS_PER_YEAR);
}

function computeCapitalGainsAllowance(
  monthlyAmount: number,
  maxEmployer: number,
  months: number
): number {
  if (monthlyAmount <= 0) {
    return 0;
  }
  const cappedMonthly = Math.min(monthlyAmount, maxEmployer);
  return cappedMonthly * Math.min(months, MONTHS_PER_YEAR);
}

function computeCompanyPensionDeduction(
  monthlyPension: number,
  maxTaxFree: number,
  months: number
): number {
  if (monthlyPension <= 0) {
    return 0;
  }
  const cappedMonthly = Math.min(monthlyPension, maxTaxFree);
  return cappedMonthly * Math.min(months, MONTHS_PER_YEAR);
}

function applyMonthlyCapWithCustomRate(
  value: number, 
  config: SocialContributionConfig,
  customAdditionalRate?: number
): number {
  const cappedBase = Math.min(value, config.capMonthly);
  const baseContribution = cappedBase * config.employeeRate;
  const additionalRate = customAdditionalRate ?? config.additionalRate ?? 0;
  return baseContribution + cappedBase * additionalRate;
}


export function calculateSalary(
  input: SalaryInput,
  config: ConfigData
): SalaryBreakdown {
  const months = input.months && input.months > 0 ? Math.min(input.months, MONTHS_PER_YEAR) : MONTHS_PER_YEAR;
  const { monthlyGrosses, annualBonuses } = calculateMonthlyGrosses(
    input.baseMonthlyGross,
    months,
    input.bonuses
  );

  const annualGross = monthlyGrosses.reduce((sum, value) => sum + value, 0);
  const monthlyGross = months > 0 ? annualGross / months : 0;
  
  const companyCarBenefit = computeCompanyCarBenefit(input.companyCarBenefit, input.companyCarType, config.companyCarBenefitRates);
  const mealVoucherTaxable = computeMealVoucherTaxablePortion(
    input.mealVouchers,
    config.allowances.mealVoucherTaxFreeLimit,
    months
  );

  const homeOfficeAllowance = computeAllowanceHomeOffice(input.homeOfficeDaysPerYear, config.allowances);
  const commuteAllowance = computeAllowanceCommute(
    input.commuteDistanceKm,
    input.commuteDaysPerMonth,
    months,
    config.allowances
  );
  
  const companyPensionDeduction = computeCompanyPensionDeduction(
    input.companyPension,
    config.companyPensionMaxTaxFree,
    months
  );
  
  const capitalGainsAllowance = computeCapitalGainsAllowance(
    input.capitalGainsAllowance,
    config.allowances.capitalGainsAllowanceMaxEmployer,
    months
  );

  const taxableIncome = Math.max(
    0, 
    annualGross + companyCarBenefit + mealVoucherTaxable - homeOfficeAllowance - commuteAllowance - companyPensionDeduction - capitalGainsAllowance
  );
  const taxClass = config.taxClasses[input.taxClass];
  const incomeTax = computeIncomeTax(taxableIncome, taxClass);

  const solidarityTax = input.solidarityTax
    ? computeSolidarityTax(taxableIncome, incomeTax, config.solidarityTax)
    : 0;
  const churchTax = computeChurchTax(incomeTax, config.churchTax, input.churchTax, input.federalState);

  const effectiveHealthRate = input.privateHealthInsurance ? 0 : input.healthInsuranceAdditionalRate / 100;
  
  const healthAnnual = input.privateHealthInsurance ? 0 : monthlyGrosses
    .map((value) => applyMonthlyCapWithCustomRate(value, config.socialContributions.health, effectiveHealthRate))
    .reduce((sum, value) => sum + value, 0);

  const pensionAnnual = monthlyGrosses
    .map((value) => applyMonthlyCap(value, config.socialContributions.pension))
    .reduce((sum, value) => sum + value, 0);

  const unemploymentAnnual = monthlyGrosses
    .map((value) => applyMonthlyCap(value, config.socialContributions.unemployment))
    .reduce((sum, value) => sum + value, 0);

  const longTermCareAnnual = monthlyGrosses
    .map((value) => computeLongTermCareContribution(value, config.socialContributions.longTermCare, input.hasChildren))
    .reduce((sum, value) => sum + value, 0);

  const voluntaryAnnual = computeVoluntaryInsurance(
    monthlyGross,
    months,
    input.includeVoluntaryInsurance,
    config.allowances
  );

  const socialContributions = {
    health: healthAnnual,
    pension: pensionAnnual,
    unemployment: unemploymentAnnual,
    longTermCare: longTermCareAnnual,
    voluntary: voluntaryAnnual
  };

  const totalSocialContributions = Object.values(socialContributions).reduce((sum, value) => sum + value, 0);

  const totalDeductions =
    incomeTax + solidarityTax + churchTax + totalSocialContributions;

  const annualNet = Math.max(0, annualGross - totalDeductions);
  const monthlyNet = months > 0 ? annualNet / months : 0;

  return {
    monthlyGross,
    annualGross,
    annualBonuses,
    taxableIncome,
    incomeTax,
    solidarityTax,
    churchTax,
    socialContributions,
    totalDeductions,
    annualNet,
    monthlyNet
  };
}
