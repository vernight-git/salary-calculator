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
    companyCarType: 'none',
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
      { ...baseInput, companyCarBenefit: 30000, companyCarType: 'combustion' },
      config
    );

    expect(withCar.taxableIncome).toBeGreaterThan(withoutCar.taxableIncome);
    expect(withCar.incomeTax).toBeGreaterThan(withoutCar.incomeTax);
    expect(withCar.annualNet).toBeLessThan(withoutCar.annualNet);
  });

  it('applies different benefit rates for combustion, hybrid, and electric cars', () => {
    const withoutCar = calculateSalary(baseInput, config);
    const withCombustion = calculateSalary(
      { ...baseInput, companyCarBenefit: 40000, companyCarType: 'combustion' },
      config
    );
    const withHybrid = calculateSalary(
      { ...baseInput, companyCarBenefit: 40000, companyCarType: 'hybrid' },
      config
    );
    const withElectric = calculateSalary(
      { ...baseInput, companyCarBenefit: 40000, companyCarType: 'electric' },
      config
    );

    // Combustion should have the highest taxable income (1%)
    expect(withCombustion.taxableIncome).toBeGreaterThan(withHybrid.taxableIncome);
    expect(withHybrid.taxableIncome).toBeGreaterThan(withElectric.taxableIncome);
    expect(withElectric.taxableIncome).toBeGreaterThan(withoutCar.taxableIncome);

    // Check the actual benefit amounts are calculated correctly
    // Combustion: 40000 * 0.01 * 12 = 4800
    const combustionBenefit = withCombustion.taxableIncome - withoutCar.taxableIncome;
    expect(combustionBenefit).toBeCloseTo(4800, 0);

    // Hybrid: 40000 * 0.005 * 12 = 2400
    const hybridBenefit = withHybrid.taxableIncome - withoutCar.taxableIncome;
    expect(hybridBenefit).toBeCloseTo(2400, 0);

    // Electric: 40000 * 0.0025 * 12 = 1200
    const electricBenefit = withElectric.taxableIncome - withoutCar.taxableIncome;
    expect(electricBenefit).toBeCloseTo(1200, 0);
  });

  it('does not apply company car benefit when type is none', () => {
    const withoutCar = calculateSalary(baseInput, config);
    const withCarNone = calculateSalary(
      { ...baseInput, companyCarBenefit: 40000, companyCarType: 'none' },
      config
    );

    expect(withCarNone.taxableIncome).toBe(withoutCar.taxableIncome);
    expect(withCarNone.incomeTax).toBe(withoutCar.incomeTax);
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
