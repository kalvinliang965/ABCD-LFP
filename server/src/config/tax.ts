// src/config/tax.ts

export const tax_config = {
    FEDERAL_TAX_URL: process.env.FEDERAL_TAX_URL || "https://www.irs.gov/filing/federal-income-tax-rates-and-brackets",
    STD_DEDUCTION_URL: process.env.STD_DEDUCTION_URL || "https://www.irs.gov/publications/p17",
    CAPITAL_GAINS_URL: process.env.CAPITAL_GAINS_URL || "https://www.irs.gov/taxtopics/tc409",
    RMD_URL: process.env.RMD_URL || 'https://www.irs.gov/publications/p590b',
    MAX_RMD_AGE: parseInt(process.env.MAX_RMD_AGE || "120", 10),
    RMD_START_AGE: parseInt(process.env.RMD_START_AGE || "73", 10),
}