export enum DistributionType {
  NORMAL = 'normal',
  UNIFORM = 'uniform',
  FIXED = 'fixed',
}

export enum ChangeType {
  FIXED = 'fixed_amount',
  PERCENTAGE = 'percentage',
}

export enum Taxability {
  TAXABLE = 'taxable',
  TAX_EXEMPT = 'tax_exempt',
}

export enum StatisticType {
  MEAN = 'mean',
  STDEV = 'stdev',
  VALUE = 'value',
  LOWER = 'lower',
  UPPER = 'upper',
}

export enum StateType {
  NY = 'NY',
  NJ = 'NJ',
  CT = 'CT',
}

export enum TaxStatus {
  NON_RETIREMENT = 'non-retirement',
  PRE_TAX = 'pre-tax',
  AFTER_TAX = 'after-tax',
}

export enum TaxFilingStatus {
  INDIVIDUAL = 'individual',
  COUPLE = 'couple',
}
