import { Worker, isMainThread } from "worker_threads";
import { cpus } from "os";
import { SimulationYearlyResult } from "./SimulationYearlyResult";
import { SimulationEnvironment } from "./ LoadSimulationEnvironment";
import { TaxBracket, TaxBracketSet } from "../tax/TaxBrackets";
import { ScenarioRaw } from "../domain/raw/scenario_raw";
import { fileURLToPath } from "url";
import path from "path";
import { stringify } from "superjson";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SimulationTaskData {
    federal_tax_service_taxable_income_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    federal_tax_service_capital_gains_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    federal_tax_service_standard_deductions_raw_serialize: Array<[string, number]>;
    state_tax_service_taxable_income_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    rmd_table_serialize: Array<[number, number]>;
    scenario_raw_serialize: ScenarioRaw;
}

export class SimulationWorkerPool {
    private workers: Worker[] = [];
    private task_queue: Array<{ task: any; resolve: Function; reject: Function}> = [];
    private active_workers = 0;

    constructor(pool_size = cpus().length) {
        if (!isMainThread) {
            throw new Error("attempt to spawn worker to run sumlation on none main thread");
        }
        const worker_path = path.join(__dirname, "worker.ts");

        // spawning "pool_size" amt of workers
        // spwan worker and keep them waiting
        for (let i = 0; i < pool_size; ++i) {
            const worker = new Worker(worker_path, {
                execArgv: [
                    "--import", "tsx/esm",
                    "--no-warnings",
                ],

            });
            worker.on('error', (err) => {
                this.handle_worker_error(worker, err);
            });
            this.workers.push(worker);
        }
    }

    public async run_simulation(
        simulation_environment: SimulationEnvironment
    ): Promise<SimulationYearlyResult> {
        // const task: SimulationTaskData = {
        //     federal_tax_service_taxable_income_bracket_raw_serialize: Array.from(
        //         simulation_environment.federal_tax_service_taxable_income_bracket_raw.entries()
        //     ).map(([status, brackets]) => [
        //         status.valueOf(),
        //         brackets,
        //     ]),
        //     federal_tax_service_capital_gains_bracket_raw_serialize: Array.from(
        //         simulation_environment.federal_tax_service_capital_gains_bracket_raw.entries()
        //     ).map(([status, brackets]) => [
        //         status.valueOf(),
        //         brackets,
        //     ]),
        //     federal_tax_service_standard_deductions_raw_serialize: Array.from(
        //         simulation_environment.federal_tax_service_standard_deductions_raw.entries()
        //     ).map(([status, number]) => [
        //         status.valueOf(),
        //         number,
        //     ]),
        //     state_tax_service_taxable_income_bracket_raw_serialize: Array.from(
        //         simulation_environment.state_tax_service_taxable_income_bracket_raw.entries()
        //     ).map(([status, brackets]) => [
        //         status.valueOf(),
        //         brackets,
        //     ]),
        //     rmd_table_serialize: Array.from(
        //         simulation_environment.rmd_table.entries()
        //     ),
        //     scenario_raw_serialize: deep_serialize(simulation_environment.scenario_raw),
        // }


        return new Promise((resolve, reject) => {
            this.task_queue.push({
                task: stringify(simulation_environment), 
                resolve, 
                reject
            });
            this.process_queue();
        });
    }

    private process_queue() {
        // while there are worker that is not working and there are work to do 
        while (this.active_workers < this.workers.length && this.task_queue.length > 0) {
            // get first task
            const { task, resolve, reject } = this.task_queue.shift()!;

            const worker = this.workers[this.active_workers];
            
            // tell worker to run
            worker.postMessage({type: "run", data: task});

            // if worker respond with message we output "resolve"
            const messageHandler = (result: any) => {
                // turn off the message handler
                worker.off("message", messageHandler); // dont really need this as below we are using "once", but ill keep it in case
                resolve(result),
                // this worker is done and we can work on another queue
                this.active_workers--;
                this.process_queue();
            }

            // if worker repsond with error we output "reject"
            const errorHandler = (error: Error) => {
                worker.off("error", errorHandler);
                reject(error);
                this.active_workers--;
                this.process_queue();
            }

            worker.once("message", messageHandler);
            worker.once("error", errorHandler);
            this.active_workers++;
        }
    }

    /**
     * remove bad worker, and append new worker to our array
     * @param worker web worker
     * @param error error message
     */
    private handle_worker_error(worker: Worker, error: Error) {
        console.error(`Worker error: ${error.message}`);
        const index = this.workers.indexOf(worker);
        if (index !== -1) {
            this.workers.splice(index, 1)[0].terminate();
            const new_worker = new Worker("./worker.ts");
            this.workers.push(new_worker);
        }
    } 

    /**
     * Terminate all workers
     */
    public async shutdown() {
        await Promise.all(this.workers.map(worker => worker.terminate()));
    }
}

