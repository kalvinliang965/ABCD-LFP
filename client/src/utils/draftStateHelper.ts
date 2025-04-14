import { ScenarioRaw } from "../types/Scenarios"; //using scenario raw since it matches the db 
import { map_form_to_scenario_raw } from "./scenarioMapper"; //matches 
import { ScenarioDetails } from "../components/scenarios/ScenarioDetailsForm";
import { LifeExpectancyConfig } from "../components/scenarios/LifeExpectancyForm";
import { InvestmentsConfig } from "../components/scenarios/InvestmentsForm";
import { AdditionalSettingsConfig } from "../components/scenarios/AdditionalSettingsForm";
import { RMDSettings } from "../components/scenarios/RMDSettingsForm";
import { SpendingStrategy } from "../components/scenarios/SpendingStrategyForm";
import { WithdrawalStrategy } from "../components/scenarios/WithdrawalStrategyForm";
import { RothConversionStrategy } from "../components/scenarios/RothConversionForm";
import { AddedEvent } from "../components/event_series/EventSeriesSection";

export interface DraftState {
  scenario_details: ScenarioDetails;
  life_expectancy_config: LifeExpectancyConfig;
  investments_config: InvestmentsConfig;
  additional_settings: AdditionalSettingsConfig;
  rmd_settings: RMDSettings;
  spending_strategy: SpendingStrategy;
  withdrawal_strategy: WithdrawalStrategy;
  roth_conversion_strategy: RothConversionStrategy;
  added_events: AddedEvent[];
}

// helper function that returns the current draft state
//when called returns the current state as a scenario raw object
export function create_draft_state_helper(state: DraftState): () => ScenarioRaw {
  return () => 
    map_form_to_scenario_raw(
      state.scenario_details,
      state.life_expectancy_config,
      state.investments_config,
      state.additional_settings,
      state.rmd_settings,
      state.spending_strategy,
      state.withdrawal_strategy,
      state.roth_conversion_strategy,
      state.added_events
    );
} 