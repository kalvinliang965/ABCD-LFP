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
                const data: {environment: SimulationEnvironment, index: number} = parse(message.data);
                const result = await execute_single_simulation(data.environment, data.index);
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