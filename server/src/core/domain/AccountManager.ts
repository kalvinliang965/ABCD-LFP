import { Investment } from "./investment/Investment";
import { TaxStatus } from "../Enums";
import { InvestmentRaw } from "./raw/investment_raw";
import { create_investment } from "./investment/Investment";
import { simulation_logger } from "../../utils/logger/logger";
import { clone_map } from "../../utils/helper";

export type AccountMap = Map<string, Investment>;

// Parse investments by tax status
function parse_investments(
  investments: Investment[]
): [Investment, AccountMap, AccountMap, AccountMap, AccountMap] {
  let cash_account = undefined;
  const non_retirement_account = new Map<string, Investment>();
  const pre_tax_account = new Map<string, Investment>();
  const after_tax_account = new Map<string, Investment>();
  const all = new Map<string, Investment>();

  for (const investment of investments) {
    all.set(investment.id, investment);
    switch (investment.tax_status) {
      case TaxStatus.NON_RETIREMENT:
        if (investment.id === "cash") {
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
        throw new Error(`Invalid tax status: ${investment.tax_status}`);
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
    all,
  ];
}

export interface AccountManager {
    cash: Investment,
    non_retirement: AccountMap;
    pre_tax: AccountMap;
    after_tax: AccountMap;
    all: AccountMap;
    get_net_worth: () => number;
    get_total_non_retirement_value: () => number;
    get_total_pre_tax_value: () => number;
    get_total_after_tax_value: () => number;
    clone(): AccountManager;
} 

function create_account_manager_clone(cash: Investment, non_retirement: AccountMap, pre_tax: AccountMap, after_tax: AccountMap, all: AccountMap): AccountManager {
    return {
        cash,
        non_retirement,
        pre_tax,
        after_tax,
        all,
        get_net_worth: () => {
          let res = 0;
          all.forEach((inv: Investment) => {
            res += inv.get_cost_basis();
          })
          return res + cash.get_value();
        },
        get_total_non_retirement_value: (): number => {
          let tot = 0
          for (const investment of non_retirement.values()) {
            if (investment.get_cost_basis() > 0) {
              tot += investment.get_value();
            }
          }
          return tot;
        },
        get_total_pre_tax_value:():number => {
          let tot = 0
          for (const investment of pre_tax.values()) {
            if (investment.get_cost_basis() > 0) {
              tot += investment.get_value();
            }
          }
          return tot;
        },
        get_total_after_tax_value: (): number => {
          let tot = 0;
          for (const investment of after_tax.values()) {
            if (investment.get_cost_basis() > 0) {
              tot += investment.get_value();
            }
          }
          return tot;
        },
        clone: () => create_account_manager_clone(
            cash.clone(),
            clone_map(non_retirement),
            clone_map(pre_tax),
            clone_map(after_tax),
            clone_map(all),
        )
    }
}

export function create_account_manager(investments_raw: Set<InvestmentRaw>): AccountManager {

    try {
        const investments: Array<Investment> = Array.from(investments_raw).map(
            (investment: InvestmentRaw): Investment => create_investment(investment)
        );
        const [cash, non_retirement, pre_tax, after_tax, all] = parse_investments(investments);

        simulation_logger.info("Successfully created account manager");
        return create_account_manager_clone(
            cash,
            non_retirement,
            pre_tax, 
            after_tax,
            all
        );
    } catch(error) {
        simulation_logger.info("Failed to create account manager", {
            error: error instanceof Error? error.stack: error,
            investment_raw: investments_raw
        });
        throw new Error(`Failed to create account manager ${error instanceof Error? error.message: error}`);
    }
}
