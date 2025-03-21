// src/core/domain/Scenario.ts
// we will use this function to read data read from front end and call other function to parse the data

function Scenario(params: {
    name: string,
    martialStatus: string,
    brithYears: Array<number>,
    lifeExpectancy: Array<Map<string, any>>,
    investmentts: Set<{
        investmentType: {
            name: string,
            description: string,
            returnAmtOrPct: string, // amount or percent
            returnDistribution: Map<string, any> 
            expenseRatio: 0,
            incomeAmtOrPct: string,
            incomeDistribution: Map<string, any>,
            taxability: boolean,
        },
        value: number,
        taxStatus: string, // "non-retirement", "pre-tax", "after-tax"
        id: string, 
    }>,
    eventSeries: Set<{
        name: string,
        start: Map<string, any>,
        type: number,
        initialAmount: number,
        changeAmtOrPct: string,
        changeDistribution: Map<string, any>,
        inflationAdjusted: boolean,
        userFraction: number,
        socialSecurity: boolean, 
    }>,
    inflationAssumption: Map<string, number>,
    afterTaxContributionLimit: number,
    spendingStrategy: Array<string>,
    expenseWithdrawalStrategy: Array<string>,
    RMDStrategy: Array<string>,
    RothConversionOpt: boolean,
    RothConversionStart: number, 
    RothConversionEnd: number,
    RothConversionStrategy: Array<string>,
    financialGoal: number,
    residenceState: string, 
}) {
    return params;
}

export default Scenario;