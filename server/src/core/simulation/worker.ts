import { parentPort, isMainThread } from "worker_threads";
import { execute_single_simulation } from "./SimulationRunner";
import { SimulationEnvironment } from "./ LoadSimulationEnvironment";
import { parse, stringify } from "superjson";

if (!isMainThread) {
    parentPort?.on("message", async(message) => {
        try {
            if (message.type === "run") {
                const environment: SimulationEnvironment = parse(message.data.environment);
                const index = message.data.index;
                const result = await execute_single_simulation(environment, index);
                // send result back to parent thread
                parentPort?.postMessage({status: "success", data: stringify(result.yearly_results)});
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