import { Investment } from "./investment/Investment";
import { TaxStatus } from "../Enums";
import { InvestmentRaw } from "./raw/investment_raw";
import { create_investment } from "./investment/Investment";
import { simulation_logger } from "../../utils/logger/logger";

export type AccountMap = Map<string, Investment>;

// Parse investments by tax status
function parse_investments(
  investments: Investment[]
): [Investment, AccountMap, AccountMap, AccountMap] {
  let cash_account = undefined;
  const non_retirement_account = new Map<string, Investment>();
  const pre_tax_account = new Map<string, Investment>();
  const after_tax_account = new Map<string, Investment>();

  for (const investment of investments) {
    switch (investment.taxStatus) {
      case TaxStatus.NON_RETIREMENT:
        if (investment.id == "cash") {
          cash_account = investment;
        } else {
          non_retirement_account.set(investment.id, investment);
        }
        break;
      case TaxStatus.PRE_TAX:
        pre_tax_account.set(investment.id, investment);
        break;
      case TaxStatus.AFTER_TAX:
        after_tax_account.set(investment.id, investment);
        break;
      default:
        throw new Error(`Invalid tax status: ${investment.taxStatus}`);
    }
  }

  if (!cash_account) {
    console.log("cash investment not found");
    process.exit(1);
  }

  return [
    cash_account,
    non_retirement_account,
    pre_tax_account,
    after_tax_account,
  ];
}

export interface AccountManager {
    readonly cash: Investment,
    readonly non_retirement: AccountMap;
    readonly pre_tax: AccountMap;
    readonly after_tax: AccountMap;
    clone(): AccountManager;
} 

function create_account_manager_clone(cash: Investment, non_retirement: AccountMap, pre_tax: AccountMap, after_tax: AccountMap): AccountManager {
    return {
        cash,
        non_retirement,
        pre_tax,
        after_tax,
        clone: () => create_account_manager_clone(
            cash.clone(),
            clone_account_map(non_retirement),
            clone_account_map(pre_tax),
            clone_account_map(after_tax)
        )
    }
}

export function create_account_manager(investments_raw: Set<InvestmentRaw>): AccountManager {

    try {
        const investments: Array<Investment> = Array.from(investments_raw).map(
            (investment: InvestmentRaw): Investment => create_investment(investment)
        );
        const [cash, non_retirement, pre_tax, after_tax] = parse_investments(investments);

        simulation_logger.info("Successfully created account manager");
        return create_account_manager_clone(
            cash,
            non_retirement,
            pre_tax, 
            after_tax
        );
    } catch(error) {
        simulation_logger.info("Failed to create account manager", {
            error: error instanceof Error? error.stack: error,
            investment_raw: investments_raw
        });
        throw new Error(`Failed to create account manager ${error instanceof Error? error.message: error}`);
    }
}

function clone_account_map(map: AccountMap): AccountMap {
    const newMap = new Map<string, Investment>();
    for (const [key, value] of map) {
      newMap.set(key, value.clone());
    }
    return newMap;
}