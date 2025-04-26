// src/core/domain/Scenario.ts
// we will use this function to read data read from front end and call other function to parse the data
import {
  create_value_generator,
  ValueGenerator,
} from "../../../utils/math/ValueGenerator";
import {
  DistributionType,
  StateType,
  StatisticType,
  TaxFilingStatus,
} from "../../Enums";
import { create_investment, Investment } from "../investment/Investment";
import { ScenarioRaw } from "../raw/scenario_raw";
import { InvestmentRaw } from "../raw/investment_raw";
import { TaxStatus, parse_state_type, parse_taxpayer_type } from "../../Enums";
import { AccountManager, create_account_manager } from "../AccountManager";
import { AccountMap } from "../AccountManager";
import { create_investment_type_manager, InvestmentTypeManager } from "../InvestmentTypeManager";
import { dev } from "../../../config/environment";
import { create_event_manager, EventManager } from "../EventManager";
import { Distribution, parse_distribution } from "../raw/common";
import { simulation_logger } from "../../../utils/logger/logger";

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
  lifeExpectancy: Array<Distribution>
): Array<number> {
  if (lifeExpectancy.length > 2 || lifeExpectancy.length == 0) {
    throw new Error(`Invalid number of lifeExpectancy ${lifeExpectancy}`);
  }
  const parse = (distribution: Distribution): number => {
    if (distribution.type != "fixed" && distribution.type != "normal") {
      simulation_logger.error(`Invalid life expectancy distribution ${distribution.type}`);
      throw new Error(`Invalid life expectancy distribution ${distribution.type}`);
    }
    return parse_distribution(distribution).sample();
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
  expense_withrawal_strategy: Array<string>;
  rmd_strategy: Array<string>;
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
  financialGoal: number;
  residence_state: StateType;
  account_manager: AccountManager
}

export async function create_scenario(scenario_raw: ScenarioRaw): Promise<Scenario> {
  try {
    const taxfilingStatus: TaxFilingStatus = parse_taxpayer_type(
      scenario_raw.maritalStatus
    );
    const [user_birth_year, spouse_birth_year] = parse_birth_years(
      scenario_raw.birthYears
    );
    const [user_life_expectancy, spouse_life_expectancy] = parse_life_expectancy(scenario_raw.lifeExpectancy);

    const inflation_assumption: ValueGenerator = parse_distribution(
      scenario_raw.inflationAssumption
    );
    const after_tax_contribution_limit: number =
      scenario_raw.afterTaxContributionLimit;
    const spending_strategy: Array<string> = scenario_raw.spendingStrategy;
    const expense_withrawal_strategy: Array<string> =
      scenario_raw.expenseWithdrawalStrategy;
    const rmd_strategy: Array<string> = scenario_raw.RMDStrategy;
    const roth_conversion_opt: boolean = scenario_raw.RothConversionOpt;
    const roth_conversion_start: number = scenario_raw.RothConversionStart;
    const roth_conversion_end: number = scenario_raw.RothConversionEnd;
    const roth_conversion_strategy: Array<string> =
      scenario_raw.RothConversionStrategy;
    const financialGoal: number = scenario_raw.financialGoal;
    const residenceState: StateType = parse_state_type(scenario_raw.residenceState);

    const event_manager = create_event_manager(scenario_raw.eventSeries);
    const investment_type_manager = create_investment_type_manager(scenario_raw.investmentTypes);
    const account_manager = create_account_manager(scenario_raw.investments);

    // Sanity check
    if (dev.is_dev) {
        const investments: Array<Investment> = Array.from(scenario_raw.investments).map(
            (investment: InvestmentRaw): Investment => create_investment(investment)
        );
        for (const investment of investments) {
            if (!investment_type_manager.has(investment.investment_type)) {
                console.log(`investment type ${investment.investment_type} does not exist`);
                process.exit(1);
            }
        }
    }

    return {
      event_manager,
      account_manager,
      investment_type_manager,
      name: scenario_raw.name,
      tax_filing_status: taxfilingStatus,
      user_birth_year,
      spouse_birth_year,
      user_life_expectancy,
      spouse_life_expectancy,
      inflation_assumption,
      after_tax_contribution_limit,
      spending_strategy,
      expense_withrawal_strategy,
      rmd_strategy,
      roth_conversion_opt,
      roth_conversion_start,
      roth_conversion_end,
      roth_conversion_strategy,
      financialGoal,
      residence_state: residenceState,
    };
  } catch (error) {
    throw new Error(
      `An error occured while creating Scenario instance: ${error}`
    );
  }
}
