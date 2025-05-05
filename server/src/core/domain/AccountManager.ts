import { Investment } from "./investment/Investment";
import { TaxStatus } from "../Enums";
import { InvestmentRaw } from "./raw/investment_raw";
import { create_investment } from "./investment/Investment";
import { simulation_logger } from "../../utils/logger/logger";
import { clone_map } from "../../utils/CloneUtil";

export type AccountMap = Map<string, Investment>;

export type AccountGroup = {
  type: "after-tax" | "non-retirement" | "pre-tax";
  account_map: AccountMap;
}

// Parse investments by tax status
function parse_investments(
  investments: Investment[]
): [Investment, AccountMap, AccountMap, AccountMap] {
  let cash_account = undefined;
  const non_retirement_account = new Map<string, Investment>();
  const pre_tax_account = new Map<string, Investment>();
  const after_tax_account = new Map<string, Investment>();

  for (const investment of investments) {
    switch (investment.tax_status) {
      case TaxStatus.NON_RETIREMENT:
        if (
          investment.investment_type === "cash"
        ) {
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
    simulation_logger.error("cash investment of non retirement status not found");
    throw new Error("cash investment not found");
  }

  return [
    cash_account,
    non_retirement_account,
    pre_tax_account,
    after_tax_account,
  ];
}

export interface AccountManager {
  legacy_id_registry: Map<string, string>;
  cash: Investment;
  non_retirement: AccountMap;
  pre_tax: AccountMap;
  after_tax: AccountMap;
  all: () => AccountMap;
  non_retirement_group: AccountGroup;
  after_tax_group: AccountGroup;
  pre_tax_group: AccountGroup;
  get_net_worth: () => number;
  get_total_non_retirement_value: () => number;
  get_total_pre_tax_value: () => number;
  get_total_after_tax_value: () => number;
  clone(): AccountManager;
}

export function create_account_manager(
  investments_raw: Set<InvestmentRaw>
): AccountManager {
  try {
    let seen = new Set();
    for (const inv of investments_raw) {
      const id = inv.id;
      if (id in seen) {
        simulation_logger.error(`Failed to create account manager. Duplicate old id ${id}`);
        throw new Error(`Failed to create account manager. Duplicate old id ${id}`);
      }
      seen.add(id);
    }

    const investments: Array<Investment> = Array.from(investments_raw).map(
      (investment: InvestmentRaw): Investment => create_investment(investment)
    );

    const legacy_id_registry: Map<string, string> = new Map();
    for (const inv of investments.values()) {
      if (legacy_id_registry.has(inv.old_id)) {
        simulation_logger.error(`Failed to create account manager. Duplicate old id ${inv.old_id}`);
        throw new Error(`Failed to create account manager. Duplicate old id ${inv.old_id}`);
      }
      legacy_id_registry.set(inv.old_id, inv.id);
    }

    seen = new Set();
    for (const new_id of legacy_id_registry.values()) {
      if (seen.has(new_id)) {
        simulation_logger.error(`Failed to create account manager. Duplicate new id ${new_id}`);
        throw new Error(`Failed to create account manager. Duplicate new id ${new_id}`);
      }
      seen.add(new_id);
    }

    const [cash, non_retirement, pre_tax, after_tax] =
      parse_investments(investments);


    simulation_logger.info("Successfully created account manager");

    const all = () => {
        const res = new Map()

        for (const [key, val] of non_retirement) {
          res.set(key,val);
        }
        for (const [key, val] of pre_tax) {
          if (res.has(key)) {
            throw new Error(`Duplicate key ${key}`);
          }
          res.set(key,val);
        }
        for (const [key, val] of after_tax) {
          if (res.has(key)) {
            throw new Error(`Duplicate key ${key}`);
          }
          res.set(key,val);
        }
        if (res.has(cash.id)) {
          throw new Error(`Duplicate key ${cash.id}`);
        }
        res.set(cash.id, cash);
        return res;
    };

    return {
      legacy_id_registry,
      cash,
      non_retirement,
      pre_tax,
      after_tax,
      all,
      non_retirement_group: {
        type: "non-retirement",
        account_map: non_retirement
      },
      after_tax_group: {
        type: "after-tax",
        account_map: after_tax
      },
      pre_tax_group: {
        type: "pre-tax",
        account_map: pre_tax
      },
      // Chen removed cash.get_value() at 2025-04-30
      get_net_worth: () => {
        let res = 0;
        Array.from(all().values()).forEach((inv: Investment) => {
          res += inv.get_value();
        });
        return res;
      },
      get_total_non_retirement_value: (): number => {
        let tot = 0;
        for (const investment of non_retirement.values()) {
          if (investment.get_cost_basis() > 0) {
            tot += investment.get_value();
          }
        }
        return tot;
      },
      get_total_pre_tax_value: (): number => {
        let tot = 0;
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
      clone: () => create_account_manager(investments_raw),
    };
  } catch (error) {
    simulation_logger.info("Failed to create account manager", {
      error: error instanceof Error ? error.stack : error,
      investment_raw: investments_raw,
    });
    throw new Error(
      `Failed to create account manager ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}
