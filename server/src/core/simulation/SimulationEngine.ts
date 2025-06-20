import { SimulationYearlyResult } from './SimulationYearlyResult';
import { simulation_logger } from '../../utils/logger/logger';
import { SimulationEnvironment } from './ LoadSimulationEnvironment';
import { Profiler } from '../../utils/Profiler';
import { SimulationWorkerPool } from './SimulationWorkerPool';
import { execute_single_simulation } from './SimulationRunner';
import { parse } from "superjson";

export interface SimulationEngine {
    run: (num_simulations: number) => Promise<SimulationYearlyResult[]>;
    run_parallel: (num_simulation: number) => Promise<SimulationYearlyResult[]>;
    run_linear: (num_simulation: number) => Promise<SimulationYearlyResult[]>;
}

export async function create_simulation_engine(simulation_environment: SimulationEnvironment): Promise<SimulationEngine> {

    simulation_logger.info("Initializing the simulation engine...");
    async function run_parallel(num_simulation: number): Promise<SimulationYearlyResult[]> {
        const pool = new SimulationWorkerPool();
        simulation_logger.info("Successfully initialize worker pool");
        try {
            const promise = Array(num_simulation).fill(null).map((_, i) => 
                pool.run_simulation(simulation_environment, i)
            );
            const worker_result: SimulationYearlyResult[] = (await Promise.all(promise)).map((from_worker: any) => ({ yearly_results: parse(from_worker.data) }) as SimulationYearlyResult);
            simulation_logger.info("All worker completed assigned tasks");
            return worker_result.filter(result => result !== null);
        } catch(error) {
            simulation_logger.error(`Error occure running simulation in parallel: ${error instanceof Error? error.message: String(error)}`);
            throw new Error(`Error occure running simulation in parallel: ${error instanceof Error? error.message: String(error)}`);
        } finally {
            await pool.shutdown();
        }
    }

    // not optimize
    async function run_linear(num_simulations: number): Promise<SimulationYearlyResult[]> {
        const res: SimulationYearlyResult[] = [];
        let i = 0
        try {
            for (; i < num_simulations; i++) {
                const simulation_result = await execute_single_simulation(simulation_environment, i);
                simulation_logger.info(
                    `${i + 1} simulation completed`,
                    {
                        simulaiton_result: simulation_result,
                    }
                )
                res.push(simulation_result);
            }
        } catch (error) {
            simulation_logger.error(`Error occurred running ${i}th simulation: ${error instanceof Error? error.message: String(error)}`)
        }        
        simulation_logger.info("Successfully running all simulation")
        return res;
    }

    return {
        run: run_parallel,
        run_parallel,
        run_linear,
    }
}
