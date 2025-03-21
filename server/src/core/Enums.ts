
export const enum TaxFilingStatus {
    SINGLE = "SINGLE",
    MARRIED = "MARRIED",
}

export const enum IncomeType {
    TAXABLE_INCOME = "TAXABLE_INCOME",
    CAPITAL_GAINS = "CAPITAL_GAINS"
}

export enum DistributionType {
    NORMAL = "NORMAL",
    UNIFORM = "UNIFORM",
    GBM = "GEOMETRIC_BROWNIAN",
}

export enum ChangeType {
    FIXED = "FIXED_AMOUNT",
    PERCENTAGE = "PERCENTAGE",
}