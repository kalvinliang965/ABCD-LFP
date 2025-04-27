// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "../core/tax/FederalTaxService";
// import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { state_tax_yaml_string } from "../services/StateYamlParser";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import { create_simulation_result } from "../core/simulation/SimulationResult";
import { save_simulation_result } from "../db/repositories/SimulationResultRepository";
async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 


async function simulation_engine_demo() {
  const simulation_environment = await create_simulation_environment("680d7e3057f1cf67b95a5fa8", state_tax_yaml_string);
  const simulation_engine = await create_simulation_engine(simulation_environment);
  //simulation_engine.run(1);
   // Get simulation results
   const simulationResults = await simulation_engine.run(20);
  
   // Create formatted result object
   const primaryResult = simulationResults[0];
   const simulationResult = create_simulation_result(primaryResult, "680d7e3057f1cf67b95a5fa8", simulationResults);
   
   // Format results for database
   const formattedResults = simulationResult.formatResults();
   
   // Save to database (do notneed a valid user ID)
   
   await save_simulation_result(formattedResults);

}
export {
    scrapping_demo,
    simulation_engine_demo
}