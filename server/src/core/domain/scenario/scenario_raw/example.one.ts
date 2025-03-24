import { Investment } from "../../../../db/models/investments";
import { InvestmentRaw } from "../Scenario";
import { cash_investment_one, s_and_p_investment_one, s_and_p_investment_three, s_and_p_investment_two, tax_exempt_bonds_investment_one } from "../../investment/example.one";
    
// a distribution is represented as a map with one of the following forms:
// {type: fixed, value: <number>}
// {type: normal, mean: <number>, stdev: <number>}
// {type: uniform, lower: <number>, upper: <number>}
// percentages are represented by their decimal value, e.g., 4% is represented as 0.04.
export default {


    name: "Retirement Planning Scenario",
    maritalStatus: "couple", // couple or individual
    birthYears: [1985, 1987],  // a list with length 1 or 2, depending on maritalStatus. if len=2, the first entry is for the user; second entry, for the spouse.
    lifeExpectancy: [ 
        {type: "fixed", value: 80}, 
        {type: "normal", mean: 82, stdev: 3} 
    ], // a list with length 1 or 2, depending on maritalStatus.

    // investment id is a unique identifier.  without it, we would need to use a pair (investment type, tax status) to identify an investment.
    investments: new Set<InvestmentRaw>([
        cash_investment_one,
        s_and_p_investment_one,
        tax_exempt_bonds_investment_one,
        s_and_p_investment_two,
        s_and_p_investment_three
    ]),

    
    eventSeries:
    - name: salary
        start: {type: fixed, value: 2025} # a fixed, normal, or uniform distribution (as above) or a map with the form {type: startWith, eventSeries: <name>} or {type: startAfter, eventSeries: <name>}
        duration: {type: fixed, value: 40}
        type: income # "income", "expense", "invest", or "rebalance"
        initialAmount: 75000
        changeAmtOrPct: amount
        changeDistribution: {type: uniform, lower: 500, upper: 2000}
        inflationAdjusted: false # boolean
        userFraction: 1.0 # fraction of the amount associated with the user.  the rest is associated with the spouse.
        socialSecurity: false  # boolean

    - name: food
        start: {type: startWith, eventSeries: salary}  # starts in same year as salary
        duration: {type: fixed, value: 200}  # lasts for the rest of the user's life
        type: expense
        initialAmount: 5000
        changeAmtOrPct: percent
        changeDistribution: {type: normal, mean: 0.02, stdev: 0.01} 
        inflationAdjusted: true
        userFraction: 0.5
        discretionary: false

    - name: vacation
        start: {type: startWith, eventSeries: salary}  # starts in same year as salary
        duration: {type: fixed, value: 40}
        type: expense
        initialAmount: 1200
        changeAmtOrPct: amount
        changeDistribution: {type: fixed, value: 0}
        inflationAdjusted: true
        userFraction: 0.6
        discretionary: true

    - name: streaming services
        start: {type: startWith, eventSeries: salary}  # starts in same year as salary
        duration: {type: fixed, value: 40}
        type: expense
        initialAmount: 500
        changeAmtOrPct: amount
        changeDistribution: {type: fixed, value: 0}
        inflationAdjusted: true
        userFraction: 1.0
        discretionary: true

    - name: my investments
        start: {type: uniform, lower: 2025, upper: 2030}
        duration: {type: fixed, value: 10}
        type: invest
        assetAllocation: {S&P 500 non-retirement: 0.6, S&P 500 after-tax: 0.4}
        glidePath: true # boolean.  false means assetAllocation is the fixed asset allocation, and assetAllocation2 is unused.  true means to glide from assetAllocation to assetAllocation2.
        assetAllocation2: {S&P 500 non-retirement: 0.8, S&P 500 after-tax: 0.2} 
        maxCash: 1000

    - name: rebalance
        start: {type: uniform, lower: 2025, upper: 2030}
        duration: {type: fixed, value: 10}
        type: rebalance
        assetAllocation: {S&P500 non-retirement: 0.7, tax-exempt bonds: 0.3}

    inflationAssumption: {type: fixed, value: 0.03}
    afterTaxContributionLimit: 7000 # annual limit on contributions to after-tax retirement accounts
    spendingStrategy: ["vacation", "streaming services"]  # list of discretionary expenses, identified by name
    expenseWithdrawalStrategy: [S&P 500 non-retirement, tax-exempt bonds, S&P 500 after-tax] # list of investments, identified by id
    RMDStrategy: [S&P 500 pre-tax] # list of pre-tax investments, identified by id
    RothConversionOpt: true   # boolean indicating whether the Roth Conversion optimizer is enabled
    RothConversionStart: 2050 # start year
    RothConversionEnd: 2060   # end year
    RothConversionStrategy: [S&P 500 pre-tax]  # list of pre-tax investments, identified by id
    financialGoal: 10000
    residenceState: NY  # states are identified by standard 2-letter abbreviations

}