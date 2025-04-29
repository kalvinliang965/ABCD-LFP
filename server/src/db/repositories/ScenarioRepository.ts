import { simulation_logger } from "../../utils/logger/logger";
import ScenarioModel from "../models/Scenario";
import { create_scenario, Scenario } from "../../core/domain/scenario/Scenario";
import { create_scenario_raw, ScenarioRaw } from "../../core/domain/raw/scenario_raw";
import { IScenario } from "../models/Scenario";

export function convert_db_to_scenario_raw(scenario_from_db: IScenario) {
    const scenario_raw = create_scenario_raw(
        scenario_from_db.name,
        scenario_from_db.maritalStatus,
        scenario_from_db.birthYears,
        scenario_from_db.lifeExpectancy,
        new Set(scenario_from_db.investmentTypes),
        new Set(scenario_from_db.investments),
        new Set(scenario_from_db.eventSeries),
        scenario_from_db.inflationAssumption,
        scenario_from_db.afterTaxContributionLimit,
        scenario_from_db.spendingStrategy,
        scenario_from_db.expenseWithdrawalStrategy,
        scenario_from_db.RMDStrategy,
        scenario_from_db.RothConversionOpt,
        scenario_from_db.RothConversionStart,
        scenario_from_db.RothConversionEnd,
        scenario_from_db.RothConversionStrategy,
        scenario_from_db.financialGoal,
        scenario_from_db.residenceState,
    );
    return scenario_raw;
}

export async function get_scenario_from_db(scenario_id: string): Promise<ScenarioRaw> {
    try {
        const scenario_from_db = await ScenarioModel.findOne({
            _id: scenario_id,
        });

        if (!scenario_from_db) {
            simulation_logger.error("scenario not found", {
                scenario_id: scenario_id
            });
            throw new Error("scenario not found");
        }
        const scenario_raw = convert_db_to_scenario_raw(scenario_from_db);
        simulation_logger.info("Sucessfully converted to scenario raw");
        return scenario_raw;
    } catch(error) {
        simulation_logger.error("Error in finding the scenario");
        throw new Error("Internel Service Error");
    }
}