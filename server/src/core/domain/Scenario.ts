// src/core/domain/Scenario.ts
// we will use this function to read data read from front end and call other function to parse the data
import {
  create_value_source,
  ValueGenerator,
  ValueSource,
} from "../../utils/ValueGenerator";
import {
  StateType,
  TaxFilingStatus,
} from "../Enums";
import { create_investment, Investment } from "./investment/Investment";
import { ScenarioRaw } from "./raw/scenario_raw";
import { InvestmentRaw } from "./raw/investment_raw";
import { TaxStatus, parse_state_type, parse_taxpayer_type } from "../Enums";
import { AccountManager, create_account_manager } from "./AccountManager";
import { AccountMap } from "./AccountManager";
import { create_investment_type_manager, InvestmentTypeManager } from "./InvestmentTypeManager";
import { dev } from "../../config/environment";
import { create_event_manager, EventManager } from "./EventManager";
import { Distribution, parse_distribution } from "./raw/common";
import { simulation_logger } from "../../utils/logger/logger";
import { ExpenseEvent } from "./event/ExpenseEvent";

function parse_birth_years(birthYears: Array<number>): Array<number> {
  if (birthYears.length > 2 || birthYears.length == 0) {
    throw new Error(`Invalid number of birth year ${birthYears}`);
  }
  const user_birth_year = birthYears[0];
  // -1 to indicate no spouse
  const spouse_birth_year = birthYears.length >= 2 ? birthYears[1] : -1;
  return [user_birth_year, spouse_birth_year];
}

function parse_life_expectancy(
  lifeExpectancy: Array<Distribution>,
  value_source: ValueSource,
): Array<number> {
  if (lifeExpectancy.length > 2 || lifeExpectancy.length == 0) {
    throw new Error(`Invalid number of lifeExpectancy ${lifeExpectancy}`);
  }
  const parse = (distribution: Distribution): number => {
    if (distribution.type != "fixed" && distribution.type != "normal") {
      simulation_logger.error(`Invalid life expectancy distribution ${distribution.type}`);
      throw new Error(`Invalid life expectancy distribution ${distribution.type}`);
    }
    return parse_distribution(distribution, value_source).sample();
  };
  try {
    const user_life_expectancy = parse(lifeExpectancy[0]);
    const spouse_life_expectancy =
      lifeExpectancy.length == 2 ? parse(lifeExpectancy[1]) : -1;
    return [user_life_expectancy, spouse_life_expectancy];
  } catch (error) {
    throw error;
  }
}


export interface Scenario {
  seed: string;
  name: string;
  tax_filing_status: TaxFilingStatus;
  user_birth_year: number;
  spouse_birth_year?: number;
  user_life_expectancy: number;
  spouse_life_expectancy?: number;
  investment_type_manager: InvestmentTypeManager;
  event_manager: EventManager;
  inflation_assumption: ValueGenerator;
  after_tax_contribution_limit: number;
  spending_strategy: Array<string>;
  expense_withdrawal_strategy: Array<string>;
  rmd_strategy: Array<string>;
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
  financialGoal: number;
  residence_state: StateType;
  account_manager: AccountManager
}

export function create_scenario(scenario_raw: ScenarioRaw, seed: string = "default"): Scenario {
  try {
    const value_source = create_value_source(seed);

    const tax_filing_status: TaxFilingStatus = parse_taxpayer_type(
      scenario_raw.maritalStatus
    );
    const [user_birth_year, spouse_birth_year] = parse_birth_years(
      scenario_raw.birthYears
    );
    const [user_life_expectancy, spouse_life_expectancy] = parse_life_expectancy(
      scenario_raw.lifeExpectancy, 
      value_source
    );

    const inflation_assumption: ValueGenerator = parse_distribution(
      scenario_raw.inflationAssumption, value_source
    );
    const after_tax_contribution_limit: number =
      scenario_raw.afterTaxContributionLimit;

    const roth_conversion_opt: boolean = scenario_raw.RothConversionOpt;
    const roth_conversion_start: number = scenario_raw.RothConversionStart;
    const roth_conversion_end: number = scenario_raw.RothConversionEnd;
    const financialGoal: number = scenario_raw.financialGoal;
    const residence_state: StateType = parse_state_type(scenario_raw.residenceState);

    const event_manager = create_event_manager(scenario_raw.eventSeries, value_source);
    const investment_type_manager = create_investment_type_manager(scenario_raw.investmentTypes, value_source);
    const account_manager = create_account_manager(scenario_raw.investments);

    // rename the strategies...
    const rmd_strategy: Array<string> = scenario_raw.RMDStrategy
      .map(strat => {
        if (!account_manager.legacy_id_registry.has(strat)) {
          simulation_logger.error(`Failed to parse rmd strategy. Investment ${strat} does not exist`);
          throw new Error(`Failed to parse rmd strategy. Investment ${strat} does not exist`);
        }
        return account_manager.legacy_id_registry.get(strat)!
      });
    // append more in rmd
    const in_rmd = new Set(rmd_strategy);
    for (const inv of account_manager.pre_tax.values()) {
      const id = inv.id;
      if (!in_rmd.has(id)) {
        rmd_strategy.push(id);
      }
    }

    const expense_withdrawal_strategy: Array<string> =
      scenario_raw.expenseWithdrawalStrategy
      .map(strat => {
        if (!account_manager.legacy_id_registry.has(strat)) {
          simulation_logger.error(`Failed to parse expense withdrawal strategy. Investment ${strat} does not exist`);
          throw new Error(`Failed to parse expense withdrawal strategy Investment ${strat} does not exist`);
        }
        return account_manager.legacy_id_registry.get(strat)!
      });
    // append more to withdrawal strategy
    const in_expense_withdrawal = new Set(expense_withdrawal_strategy);
    for (const inv of account_manager.all().values()) {
      const id = inv.id;
      if (!in_expense_withdrawal.has(id)) {
        expense_withdrawal_strategy.push(id);
      }
    }

    const roth_conversion_strategy: Array<string> = Array.from(
      scenario_raw.RothConversionStrategy
      .map(strat => {
        if (!account_manager.legacy_id_registry.has(strat)) {
          simulation_logger.error(`Failed to parse roth conversion strategy. Investment ${strat} does not exist`);
          throw new Error(`Failed to parse roth conversion withdrawal strategy Investment ${strat} does not exist`);
        }
        return account_manager.legacy_id_registry.get(strat)!
      })
    )

    // append more in rmd
    const in_roth = new Set(roth_conversion_strategy);
    for (const inv of account_manager.pre_tax.values()) {
      const id = inv.id;
      if (!in_roth.has(id)) {
        roth_conversion_strategy.push(id);
      }
    }

    const spending_strategy: Array<string> = scenario_raw.spendingStrategy;
    const in_spending = new Set(spending_strategy);
    for (const event of event_manager.expense_event.values()) {
      if (event.discretionary && !in_spending.has(event.name)) {
        spending_strategy.push(event.name);
      }
    }

    // update the asset allocation field inside event series

    for (const event of event_manager.rebalance_event.values()) {
      event.asset_allocation = update_asset_allocation_key(event.asset_allocation, account_manager.legacy_id_registry);
    }
    for (const event of event_manager.invest_event.values()) {
      event.asset_allocation = update_asset_allocation_key(event.asset_allocation, account_manager.legacy_id_registry);
      event.asset_allocation2 = update_asset_allocation_key(event.asset_allocation2, account_manager.legacy_id_registry);
    }

    // Sanity check
    for (const investment of account_manager.all().values()) {
        if (!investment_type_manager.has(investment.investment_type)) {
            simulation_logger.error(`investment type ${investment.investment_type} does not exist`);
            throw new Error(`investment type ${investment.investment_type} does not exist`);
        }
    }

    return {
      seed,
      event_manager,
      account_manager,
      investment_type_manager,
      name: scenario_raw.name,
      tax_filing_status,
      user_birth_year,
      spouse_birth_year,
      user_life_expectancy,
      spouse_life_expectancy,
      inflation_assumption,
      after_tax_contribution_limit,
      spending_strategy,
      expense_withdrawal_strategy,
      rmd_strategy,
      roth_conversion_opt,
      roth_conversion_start,
      roth_conversion_end,
      roth_conversion_strategy,
      financialGoal,
      residence_state,
    };
  } catch (error) {
    throw new Error(
      `An error occured while creating Scenario instance: ${error}`
    );
  }
}

/**
 * Updates the keys of `asset_allocation` using `legacy_id_registry`.
 * For each key in `asset_allocation` that exists in `legacy_id_registry`,
 * it renames the key to the mapped value.
 *
 * @param asset_allocation The source map to modify (in-place).
 * @param legacy_id_registry A mapping from old keys to new keys.
 */
function update_asset_allocation_key(
  asset_allocation: Map<string, number>,
  legacy_id_registry: Map<string, string>
): Map<string, number> {
  const res: Map<string, number> = new Map();
  for (const [old_key, value] of asset_allocation.entries()) {
    if (legacy_id_registry.has(old_key)) {
      const newKey = legacy_id_registry.get(old_key)!;
      res.set(newKey, value);
    } else {
      simulation_logger.error(`Asset allocation key does not exist ${old_key}`);
      throw new Error(`Asset allocation key does not exist ${old_key}`);
    }
  }

  return res;
}
