export interface TaxBracket {
  upTo: number | null;
  rate: number;
  baseTax: number;
  baseIncome: number;
}

export interface TaxClassConfig {
  label: string;
  basicAllowance: number;
  additionalAllowance: number;
  brackets: TaxBracket[];
}

export interface SocialContributionConfig {
  employeeRate: number;
  capMonthly: number;
  additionalRate?: number;
  surchargeWithoutChildren?: number;
}

export interface AllowanceConfig {
  homeOfficeDailyRate: number;
  homeOfficeMax: number;
  commuteRateFirst20: number;
  commuteRateBeyond: number;
  voluntaryInsurance: {
    thresholdMonthly: number;
    additionalRate: number;
  };
}

export interface ConfigData {
  meta: {
    country: string;
    currency: string;
    taxYear: number;
  };
  taxClasses: Record<string, TaxClassConfig>;
  socialContributions: {
    health: SocialContributionConfig;
    pension: SocialContributionConfig;
    unemployment: SocialContributionConfig;
    longTermCare: SocialContributionConfig;
  };
  solidarityTax: {
    freeAllowance: number;
    rate: number;
  };
  churchTax: {
    rate: number;
  };
  allowances: AllowanceConfig;
}
