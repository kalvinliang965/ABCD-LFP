import { InvestmentType } from "./investment/InvestmentType";
import { create_investment_type } from "./investment/InvestmentType";
import { InvestmentTypeRaw } from "./raw/investment_type_raw";
import { dev } from "../../config/environment";

export type InvestmentTypeMap = Map<string, InvestmentType>;


export interface InvestmentTypeManager {
    get: (key: string) => undefined | InvestmentType;
    has: (key: string) => boolean;
    set: (key: string, value: InvestmentType) => void;
    clone: () => InvestmentTypeManager;
    resample_all: () => void;
}

export function create_investment_type_manager(investmentTypes: Set<InvestmentTypeRaw>): InvestmentTypeManager {
  const investment_type_manager = new Map<string, InvestmentType>();

  for (const investment_type of investmentTypes) {
    investment_type_manager.set(investment_type.name, create_investment_type(investment_type));
  }
  
  return {
    get: (key: string) => investment_type_manager.get(key),
    has: (key: string) => investment_type_manager.has(key),
    set: (key: string, value: InvestmentType) => investment_type_manager.set(key, value),
    clone: () => create_investment_type_manager(investmentTypes),
    resample_all: () => {
        investment_type_manager.forEach(investment => {
            investment.resample_annual_values();
        })
    },
  }
}


