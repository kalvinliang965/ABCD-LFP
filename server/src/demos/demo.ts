// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "../core/tax/FederalTaxService";
// import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { create_simulation_environment, create_simulation_environment_parallel } from "../core/simulation/ LoadSimulationEnvironment";
import { Profiler } from "../utils/Profiler";
import { delete_all_federal_brackets_from_db } from "../db/repositories/TaxBracketRepository";
import { delete_all_rmd_factors_from_db } from "../db/repositories/RMDFactorRepository";
import { delete_all_standard_deduction_from_db } from "../db/repositories/StandardDeductionRepository";
import { generate_seed } from "../utils/ValueGenerator";

async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 

// make sure it scrapse later
async function clear_tax_data_before_scraping() {
  await delete_all_federal_brackets_from_db();
  await delete_all_rmd_factors_from_db();
  await delete_all_standard_deduction_from_db();
}

async function simulation_engine_demo(N: number) {
  await clear_tax_data_before_scraping();
  const profiler = new Profiler();
  
  const random_base_seed = generate_seed();
  // set up the environment
  profiler.start("create_simulation_environment");
  const simulation_environment = await create_simulation_environment_parallel("680d5df88650c1b31ef2604f", random_base_seed);
  profiler.end("create_simulation_environment");

  const simulation_engine_parallel = await create_simulation_engine(simulation_environment);
  profiler.start("run_parallel");
  await simulation_engine_parallel.run(N);
  profiler.end("run_parallel");
  
  profiler.export_to_CSV();
}

async function optimize_scenario_environment_initialization_demo(N: number) { 

  const random_base_seed = generate_seed();
  const profiler = new Profiler();
  for (let i = 0; i < N; ++i) {
    await clear_tax_data_before_scraping();
    profiler.start("create_simulation_environment");
    await create_simulation_environment("680d5df88650c1b31ef2604f", random_base_seed);
    profiler.end("create_simulation_environment");

    await clear_tax_data_before_scraping();
    profiler.start("create_simulation_environment_parallel");
    await create_simulation_environment_parallel("680d5df88650c1b31ef2604f", random_base_seed);
    profiler.end("create_simulation_environment_parallel");
    
  }
  profiler.printSummary();
}
export async function run_demo() {
  await simulation_engine_demo(1);
  // await optimize_scenario_environment_initialization_demo(1);
}