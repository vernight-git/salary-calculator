import { describe, expect, it } from 'vitest';
import configJson from '../public/data/config.json';
import { calculateMonthlyGrosses, calculateSalary, computeIncomeTax } from '../src/utils/salaryCalculator';
import type { ConfigData } from '../src/types/config';
import type { SalaryInput } from '../src/types/salary';

const config = configJson as ConfigData;

describe('salary calculator helpers', () => {
  it('distributes bonuses to the correct months', () => {
    const { monthlyGrosses, annualBonuses } = calculateMonthlyGrosses(3000, 12, [
      { id: 'one', month: 6, type: 'amount', value: 1200 },
      { id: 'two', month: 12, type: 'percent', value: 50 }
    ]);

    expect(annualBonuses).toBeCloseTo(1200 + 0.5 * 3000 * 12, 2);
    expect(monthlyGrosses[5]).toBeCloseTo(3000 + 1200, 2);
    expect(monthlyGrosses[11]).toBeCloseTo(3000 + 0.5 * 3000 * 12, 2);
    expect(monthlyGrosses[0]).toBe(3000);
  });

  it('computes progressive income tax using configured brackets', () => {
    const taxClass = config.taxClasses['I'];
    const taxLow = computeIncomeTax(20000, taxClass);
    const taxHigh = computeIncomeTax(85000, taxClass);

    expect(taxLow).toBeGreaterThan(0);
    expect(taxHigh).toBeGreaterThan(taxLow);
    expect(taxHigh).toBeGreaterThan(20000);
  });
});

describe('calculateSalary', () => {
  const baseInput: SalaryInput = {
    baseMonthlyGross: 6500,
    taxClass: 'I',
    churchTax: false,
    solidarityTax: true,
    includeVoluntaryInsurance: false,
    months: 12,
    bonuses: [
      { id: 'june', month: 6, type: 'amount', value: 1000 },
      { id: 'nov', month: 11, type: 'percent', value: 20 }
    ],
    homeOfficeDaysPerYear: 60,
    commuteDaysPerMonth: 12,
    commuteDistanceKm: 18,
    hasChildren: true,
    age: 35,
    federalState: 'NW',
    healthInsuranceAdditionalRate: 1.5,
    privateHealthInsurance: false,
    companyCarBenefit: 0,
    capitalGainsAllowance: 0,
    mealVouchers: 0,
    companyPension: 0
  };

  it('returns a consistent breakdown', () => {
    const breakdown = calculateSalary(baseInput, config);

    expect(breakdown.annualGross).toBeGreaterThan(baseInput.baseMonthlyGross * 12);
    expect(breakdown.annualBonuses).toBeGreaterThan(0);
    expect(breakdown.incomeTax).toBeGreaterThan(0);
    expect(breakdown.totalDeductions).toBeCloseTo(
      breakdown.incomeTax +
        breakdown.solidarityTax +
        breakdown.churchTax +
        breakdown.socialContributions.health +
        breakdown.socialContributions.pension +
        breakdown.socialContributions.unemployment +
        breakdown.socialContributions.longTermCare +
        breakdown.socialContributions.voluntary,
      2
    );
    expect(breakdown.annualNet).toBeCloseTo(
      breakdown.annualGross - breakdown.totalDeductions,
      2
    );
  });

  it('adds voluntary insurance when requested', () => {
    const breakdownWithout = calculateSalary(baseInput, config);
    const breakdownWith = calculateSalary(
      { ...baseInput, includeVoluntaryInsurance: true },
      config
    );

    expect(breakdownWith.socialContributions.voluntary).toBeGreaterThan(
      breakdownWithout.socialContributions.voluntary
    );
    expect(breakdownWith.totalDeductions).toBeGreaterThan(breakdownWithout.totalDeductions);
  });

  it('applies company car benefit to taxable income', () => {
    const withoutCar = calculateSalary(baseInput, config);
    const withCar = calculateSalary(
      { ...baseInput, companyCarBenefit: 30000 },
      config
    );

    expect(withCar.taxableIncome).toBeGreaterThan(withoutCar.taxableIncome);
    expect(withCar.incomeTax).toBeGreaterThan(withoutCar.incomeTax);
    expect(withCar.annualNet).toBeLessThan(withoutCar.annualNet);
  });

  it('reduces taxable income with company pension', () => {
    const withoutPension = calculateSalary(baseInput, config);
    const withPension = calculateSalary(
      { ...baseInput, companyPension: 200 },
      config
    );

    expect(withPension.taxableIncome).toBeLessThan(withoutPension.taxableIncome);
    expect(withPension.incomeTax).toBeLessThan(withoutPension.incomeTax);
  });

  it('applies private health insurance exemption', () => {
    const statutory = calculateSalary(baseInput, config);
    const privateInsurance = calculateSalary(
      { ...baseInput, privateHealthInsurance: true },
      config
    );

    expect(privateInsurance.socialContributions.health).toBe(0);
    expect(privateInsurance.totalDeductions).toBeLessThan(statutory.totalDeductions);
  });

  it('uses federal state-specific church tax rate', () => {
    const badenWuerttemberg = calculateSalary(
      { ...baseInput, churchTax: true, federalState: 'BW' },
      config
    );
    const northRhine = calculateSalary(
      { ...baseInput, churchTax: true, federalState: 'NW' },
      config
    );

    expect(badenWuerttemberg.churchTax).toBeLessThan(northRhine.churchTax);
  });

  it('applies custom health insurance additional rate', () => {
    const standard = calculateSalary(
      { ...baseInput, healthInsuranceAdditionalRate: 1.5 },
      config
    );
    const higher = calculateSalary(
      { ...baseInput, healthInsuranceAdditionalRate: 2.5 },
      config
    );

    expect(higher.socialContributions.health).toBeGreaterThan(standard.socialContributions.health);
  });
});
