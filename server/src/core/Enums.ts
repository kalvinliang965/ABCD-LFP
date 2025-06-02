
export function parse_taxpayer_type(type: string) {
    switch(type) {
        case "individual":
            return TaxFilingStatus.INDIVIDUAL;
        case "couple":
            return TaxFilingStatus.COUPLE;
        default:
            console.error("Invalid tax payer type");
            process.exit(1);
    }
}
export enum TaxFilingStatus {
    INDIVIDUAL = "individual",
    COUPLE = "couple",
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
    NORMAL = "normal",
    UNIFORM = "uniform",
    FIXED = "fixed",
}

export enum ChangeType {
    AMOUNT = "amount",
    PERCENT = "percent",
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
    OTHER = "other",
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
        return StateType.OTHER;    
    }
}

export enum TaxStatus {
    NON_RETIREMENT = "non-retirement",
    PRE_TAX = "pre-tax",
    AFTER_TAX = "after-tax",
}


