
import { InvestmentTypeRaw } from "./investment_type_raw";

import { 
    cash_investment_type_one, 
    s_and_p_500_investment_type_one, 
    tax_exempt_bonds_investment_type_one,
    incr_300_investment_type_one,
    incr_300_investment_type_two,
    incr_600_investment_type_one,
    incr_600_investment_type_two,
} from "./investment_type_raw";


export type InvestmentRaw = {
  investmentType: string;
  value: number;
  taxStatus: "non-retirement" | "pre-tax" | "after-tax";
  id: string;
};

export const incr_300_init_300_investment_one: InvestmentRaw = create_investment_raw(
    incr_300_investment_type_one.name,
    300,
    "pre-tax",
    "300dummy",
);

export const incr_300_init_300_investment_two: InvestmentRaw = create_investment_raw(
    incr_300_investment_type_two.name,
    300,
    "pre-tax",
    "300dummy",
);

export const incr_600_init_600_investment_one: InvestmentRaw = create_investment_raw(
    incr_600_investment_type_one.name,
    600,
    "pre-tax",
    "600dummy",
);

export const incr_600_init_600_investment_two: InvestmentRaw = create_investment_raw(
    incr_600_investment_type_two.name,
    600,
    "pre-tax",
    "600dummy",
);

export const cash_investment_one: InvestmentRaw = create_investment_raw(
    cash_investment_type_one.name,
    100,
    "non-retirement",
    "cash non-retirement",
);

export const s_and_p_500_investment_non_retirement_one: InvestmentRaw = create_investment_raw(
    s_and_p_500_investment_type_one.name, 
    100000, 
    "non-retirement", 
    "S&P 500 non-retirement"
);

export const tax_exempt_bonds_investment_one: InvestmentRaw = create_investment_raw(
    tax_exempt_bonds_investment_type_one.name,
    2000,
    "non-retirement",
    "tax-exempt bonds"
);

export const s_and_p_500_investment_pre_tax_one: InvestmentRaw = create_investment_raw(
    s_and_p_500_investment_type_one.name,
    10000,
    "pre-tax",
    "S&P 500 pre-tax",
);

export const s_and_p_500_investment_after_tax_one: InvestmentRaw = create_investment_raw(
    s_and_p_500_investment_type_one.name,
    2000,
    "after-tax",
    "S&P 500 after-tax",
);

export function create_investment_raw(
    investmentType: string,
    value: number,
    taxStatus: "non-retirement" | "pre-tax" | "after-tax",
    id: string,
): InvestmentRaw {
    return {
        investmentType,
        value,
        taxStatus,
        id,
    }
}