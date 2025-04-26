import { Distribution } from "./common";

export type InvestmentTypeRaw = {
  name: string;
  description: string;
  returnAmtOrPct: "amount" | "percent"; // amount or percent
  returnDistribution: Distribution;
  expenseRatio: number;
  incomeAmtOrPct: "amount" | "percent";
  incomeDistribution: Distribution;
  taxability: boolean;
};

export const cash_investment_type_one = create_investment_type_raw(
    "cash",
    "cash",
    "amount",
    {
        type: "fixed",
        value: 0,
    },
    0,
    "percent",
    {
        type: "fixed",
        value: 0,
    },
    true
);

export const s_and_p_500_investment_type_one = create_investment_type_raw(
    "S&P 500",
    "S&P 500 index fund",
    "percent",
    {
        type: "normal",
        mean: 0.06,
        stdev: 0.02,
    },
    0.001,
    "percent",
    {
        type: "normal",
        mean: 0.01,
        stdev: 0.005,
    },
    true
);


export const tax_exempt_bonds_investment_type_one = create_investment_type_raw(
    "tax-exempt bonds",
    "NY tax-exempt bonds",
    "amount",
    {
        type: "fixed",
        value: 0,
    },
    0.004,
    "percent",
    {
        type: "normal",
        mean: 0.03,
        stdev: 0.01,
    },
    false
);


export const incr_300_investment_type_one = create_investment_type_raw(
    "fixed investment 300 one",
    "increase by 300 on everything",
    "amount",
    { 
        type: "fixed",
        value: 300,
    },
    0.004,
    "amount",
    {
        type: "fixed",
        value:300,
    },
    false
);

export const incr_300_investment_type_two = create_investment_type_raw(
    "fixed investment 300 two",
    "increase by 300 on everything",
    "amount",
    {
        type: "fixed",
        value: 300,
    },
    0.004,
    "amount",
    {
        type: "fixed",
        value: 300,
    },
    true,
);

export const incr_600_investment_type_one = create_investment_type_raw(
    "fixed investment",
    "increase by 600 on everything",
    "amount",
    {
        type: "fixed",
        value: 600,
    },
    0.004,
    "amount",
    {
        type: "fixed",
        value: 600,
    },
    false
);

export const incr_600_investment_type_two = create_investment_type_raw(
    "fixed investment",
    "increase by 600 on everything",
    "amount",
    {
        type: "fixed",
        value: 600,
    },
    0.004,
    "amount",
    {
        type: "fixed",
        value: 600,
    },
    true
);

export function create_investment_type_raw(
    name: string,
    description: string,
    returnAmtOrPct: "amount" | "percent",
    returnDistribution: Distribution,
    expenseRatio: number,
    incomeAmtOrPct: "amount" | "percent",
    incomeDistribution: Distribution,
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