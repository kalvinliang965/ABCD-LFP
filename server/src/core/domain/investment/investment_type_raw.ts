import { InvestmentTypeRaw } from "../scenario/Scenario";


export const cash_investment_type_one = create_investment_type_raw(
    "cash",
    "cash",
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 0],
    ]),
    0,
    "percent",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 0],
    ]),
    true
);

export const s_and_p_500_investment_type_one = create_investment_type_raw(
    "S&P 500",
    "S&P 500 index fund",
    "percent",
    new Map<string, any>([
        ["type", "normal"],
        ["mean", 0.06],
        ["stdev", 0.02],
    ]),
    0.001,
    "percent",
    new Map<string, any>([
        ["type", "normal"],
        ["mean", 0.01],
        ["stdev", 0.005],
    ]),
    true
);


export const tax_exempt_bonds_investment_type_one = create_investment_type_raw(
    "tax-exempt bonds",
    "NY tax-exempt bonds",
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 0],
    ]),
    0.004,
    "percent",
    new Map<string, any>([
        ["type", "normal"],
        ["mean", 0.03],
        ["stdev", 0.01],
    ]),
    false
);


export const incr_300_investment_type_one = create_investment_type_raw(
    "fixed investment",
    "increase by 300 on everything",
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 300],
    ]),
    0.004,
    "percent",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 300],
    ]),
    false
);

export const incr_600_investment_type_one = create_investment_type_raw(
    "fixed investment",
    "increase by 600 on everything",
    "amount",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 600],
    ]),
    0.004,
    "percent",
    new Map<string, any>([
        ["type", "fixed"],
        ["value", 600],
    ]),
    false
);

export function create_investment_type_raw(
    name: string,
    description: string,
    returnAmtOrPct: string,
    returnDistribution: Map<string, any>,
    expenseRatio: number,
    incomeAmtOrPct: string,
    incomeDistribution: Map<string, any>,
    taxability: boolean,
): InvestmentTypeRaw {

    return {
        name, 
        description,
        returnAmtOrPct,
        returnDistribution,
        expenseRatio,
        incomeAmtOrPct,
        incomeDistribution,
        taxability,
    }
}