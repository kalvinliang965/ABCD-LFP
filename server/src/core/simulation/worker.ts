import { parentPort, isMainThread } from "worker_threads";
import { execute_single_simulation } from "./SimulationRunner";

if (!isMainThread) {
    parentPort?.on("message", async(message) => {
        try {
            if (message.type === "run") {
                const result = await execute_single_simulation(message.data);
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