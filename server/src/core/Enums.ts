
export function parse_taxpayer_type(type: string) {
    switch(type) {
        case "SINGLE":
            return TaxFilingStatus.SINGLE;
        case "MARRIED":
            return TaxFilingStatus.MARRIED;
        default:
            console.error("Invalid tax payer type");
            process.exit(1);
    }
}
export enum TaxFilingStatus {
    SINGLE = "SINGLE",
    MARRIED = "MARRIED",
}

export const enum IncomeType {
    TAXABLE_INCOME = "TAXABLE_INCOME",
    CAPITAL_GAINS = "CAPITAL_GAINS"
}

export function parse_income_type(type: string) {
    switch(type) {
        case "TAXABLE_INCOME":
            return IncomeType.TAXABLE_INCOME;
        case "CAPITAL_INCOME":
            return IncomeType.CAPITAL_GAINS;
        default:
            console.error("Invalid income type");
            process.exit(1)
    }
}

export enum DistributionType {
    NORMAL = "NORMAL",
    UNIFORM = "UNIFORM",
    FIXED = "FIXED",
}

export enum ChangeType {
    FIXED = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
}

export enum StatisticType {
    MEAN = "MEAN",
    STDEV = "STDEV",
    VALUE = "VALUE",
    LOWER = "LOWER",
    UPPER = "UPPER",
}

export enum StateType {
    NY = "NY",
    NJ = "NJ",
    CT = "CT",
}

export function parse_state_type(state: string) {
  switch (state) {
    case "NY":
      return StateType.NY;
    case "CT":
      return StateType.CT;
    case "NJ":
      return StateType.NJ;
    default:
      throw new Error("Invalid state");
  }
}

export enum TaxStatus {
    NON_RETIREMENT = "NON_RETIREMENT",
    PRE_TAX = "PRE_TAX",
    AFTER_TAX = "AFTER_TAX",
}


