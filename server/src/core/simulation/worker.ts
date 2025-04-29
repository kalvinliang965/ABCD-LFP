import { parentPort, isMainThread } from "worker_threads";
import { execute_single_simulation } from "./SimulationRunner";
import { SimulationTaskData } from "./SimulationWorkerPool";
import { SimulationEnvironment } from "./ LoadSimulationEnvironment";
import { TaxFilingStatus } from "../Enums";
import { TaxBracket } from "../tax/TaxBrackets";
import { parse } from "superjson";

if (!isMainThread) {
    parentPort?.on("message", async(message) => {
        try {
            if (message.type === "run") {
                // const taskData: SimulationTaskData = JSON.parse(message.data);

                // const federal_tax_service_taxable_income_bracket_raw = new Map<TaxFilingStatus, TaxBracket[]>(
                //     taskData.federal_tax_service_taxable_income_bracket_raw_serialize.map(
                //         ([key, value]) => [key as TaxFilingStatus, value]
                //     )
                // );
                // const federal_tax_service_capital_gains_bracket_raw = new Map<TaxFilingStatus, TaxBracket[]>(
                //     taskData.federal_tax_service_capital_gains_bracket_raw_serialize.map(
                //         ([key, value]) => [key as TaxFilingStatus, value]
                //     )
                // );

                // const federal_tax_service_standard_deductions_bracket_raw = new Map<TaxFilingStatus, number>(
                //     taskData.federal_tax_service_standard_deductions_raw_serialize.map(
                //         ([key, value]) => [key as TaxFilingStatus, value]
                //     )
                // );

                // const state_tax_service_taxable_income_bracket_raw = new Map<TaxFilingStatus, TaxBracket[]>(
                //     taskData.state_tax_service_taxable_income_bracket_raw_serialize.map(
                //         ([key, value]) => [key as TaxFilingStatus, value]
                //     )
                // );

                // const simulation_environment: SimulationEnvironment = {
                //     federal_tax_service_taxable_income_bracket_raw: federal_tax_service_taxable_income_bracket_raw,
                //     federal_tax_service_capital_gains_bracket_raw: federal_tax_service_capital_gains_bracket_raw,
                //     federal_tax_service_standard_deductions_raw: federal_tax_service_standard_deductions_bracket_raw,
                //     state_tax_service_taxable_income_bracket_raw: state_tax_service_taxable_income_bracket_raw,
                //     rmd_table: new Map(taskData.rmd_table_serialize),
                //     scenario_raw: taskData.scenario_raw_serialize,
                // };
                // console.log(simulation_environment);
                // const result = await execute_single_simulation(simulation_environment);
                const result = await execute_single_simulation(parse(message.data));
                // send result back to parent thread
                parentPort?.postMessage({status: "success", data: result});
            } else {
                parentPort?.postMessage({
                    status: "error",
                    error: `Worker recieve invalid type ${message.type}`,
                })
            }
        } catch(error) {
            parentPort?.postMessage({
                status: "error",
                error: error instanceof Error? error.message: String(error)
            })
        }
    })
}

// async function simulate_year_parallel(simulation_environment: SimulationEnvironment): Promise<SimulationYearlyResult> {
//     const { scenario, federal_tax_service, state_tax_service, rmd_table} = simulation_environment;
//     const simulation_state = await create_simulation_state(scenario, federal_tax_service, state_tax_service);
//     const simulation_result = create_simulation_yearly_result();
//      while (simulation_state.user.is_alive()) {
//         simulation_state.setup();
//         try {
//             run_income_event(simulation_state);
//             if (simulation_state.user.get_age() >= 74) {
//                 process_rmd(simulation_state, rmd_table);
//             }
//             update_investment(simulation_state);
//             if (simulation_state.roth_conversion_opt) {
//                 process_roth_conversion(simulation_state);
//             }
//             if (!pay_mandatory_expenses(simulation_state)) {
//                 return simulation_result;
//             }
//             pay_discretionary_expenses(simulation_state);
//             run_invest_event(simulation_state);
//             run_rebalance_investment(simulation_state);
//             simulation_result.update(simulation_state);
//         } catch (error) {
//             throw new Error(`simulate_year failed: ${error instanceof Error? error.message: String(error)}`)
//         }
//      }
//      return simulation_result;
// }