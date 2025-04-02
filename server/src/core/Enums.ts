
export enum TaxFilingStatus {
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

export enum TaxStatus {
    NON_RETIREMENT = "NON_RETIREMENT",
    PRE_TAX = "PRE_TAX",
    AFTER_TAX = "AFTER_TAX",
}