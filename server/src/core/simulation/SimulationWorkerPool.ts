import { Worker, isMainThread } from "worker_threads";
import { cpus } from "os";
import { SimulationYearlyResult } from "./SimulationYearlyResult";
import { SimulationEnvironment } from "./ LoadSimulationEnvironment";
import { TaxBracket, TaxBracketSet } from "../tax/TaxBrackets";
import { ScenarioRaw } from "../domain/raw/scenario_raw";
import { fileURLToPath } from "url";
import path from "path";
import { stringify } from "superjson";


export interface SimulationTaskData {
    federal_tax_service_taxable_income_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    federal_tax_service_capital_gains_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    federal_tax_service_standard_deductions_raw_serialize: Array<[string, number]>;
    state_tax_service_taxable_income_bracket_raw_serialize: Array<[string, TaxBracket[]]>;
    rmd_table_serialize: Array<[number, number]>;
    scenario_raw_serialize: ScenarioRaw;
}

export class SimulationWorkerPool {
    private task_queue: Array<{ task: any; resolve: Function; reject: Function}> = [];
    private available_workers: Worker[] = [];
    private workers: Worker[] = [];

    constructor(pool_size = cpus().length) {
        if (!isMainThread) {
            throw new Error("attempt to spawn worker to run sumlation on none main thread");
        }
        const worker_path = path.join(__dirname, "worker.ts");

        // spawning "pool_size" amt of workers
        // spwan worker and keep them waiting
        for (let i = 0; i < pool_size; ++i) {
            const worker = new Worker(worker_path, { eval: false});
            worker.on('error', (err) => {
                this.handle_worker_error(worker, err);
            });
            // console.log('Message listeners:', worker.listenerCount('message'));
            // console.log('Error listeners:', worker.listenerCount('error'));
            // worker.setMaxListeners(20);
            this.workers.push(worker);
        }
        // All of them are avaible at beginning
        this.available_workers = [...this.workers];
        console.log("Successfully initialize worker pool");
    }

    public async run_simulation(
        simulation_environment: SimulationEnvironment,
        index: number
    ): Promise<SimulationYearlyResult> {
        return new Promise((resolve, reject) => {
            this.task_queue.push({
                task: {environment: stringify(simulation_environment), index: index}, 
                resolve, 
                reject
            });
            this.process_queue();
        });
    }

    private process_queue() {
        // while there are worker that is not working and there are work to do 
        console.log("process_queue");
        console.log("available worker", this.available_workers.length);
        console.log("task", this.task_queue.length);
        while (this.available_workers.length > 0 && this.task_queue.length > 0) {
            // get first task
            const { task, resolve, reject } = this.task_queue.shift()!;
            const worker = this.available_workers.shift()!;
            
            // console.log('Message listeners:', worker.listenerCount('message'));
            // console.log('Error listeners:', worker.listenerCount('error'));

            // if worker respond with message we output "resolve"
            const messageHandler = (result: any) => {
                // turn off the message handler;
                worker.off("message", messageHandler)
                worker.off("error", errorHandler);
                resolve(result),
                // this worker is done and we can work on another queue
                this.available_workers.push(worker);
                this.process_queue();
            }

            // if worker repsond with error we output "reject"
            const errorHandler = (error: Error) => {
                worker.off("message", messageHandler)
                worker.off("error", errorHandler);
                reject(error);
                this.available_workers.push(worker);
                this.process_queue();
            }

            worker.once("message", messageHandler);
            worker.once("error", errorHandler);
            // tell worker to run
            console.log(`${this.workers.length - this.available_workers.length} working!`)
            worker.postMessage({type: "run", data: task});
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
            worker.removeAllListeners();
            this.workers.splice(index, 1)[0].terminate();
            
            const availableIndex = this.available_workers.indexOf(worker);
            if (availableIndex !== -1) {
                this.available_workers.splice(availableIndex, 1);
            }

            const new_worker = new Worker("./worker.ts");
            new_worker.setMaxListeners(20);
            new_worker.on("error", (err) => this.handle_worker_error(new_worker, err));
            this.workers.push(new_worker);
            this.available_workers.push(new_worker); // 新 worker 标记为可用
        }
    }
    /**
     * Terminate all workers
     */
    public async shutdown() {
        await Promise.all(this.workers.map(worker => worker.terminate()));
    }
}

