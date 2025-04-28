// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "../core/tax/FederalTaxService";
// import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { state_tax_yaml_string } from "../services/StateYamlParser";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import { create_simulation_result } from "../core/simulation/SimulationResult";
import { save_simulation_result } from "../db/repositories/SimulationResultRepository";
import { createConsolidatedSimulationResult } from "../core/simulation/SimulationResult";

async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 


async function simulation_engine_demo() {
  try {
    const simulation_environment = await create_simulation_environment("680d7e3057f1cf67b95a5fa8", state_tax_yaml_string);
    const simulation_engine = await create_simulation_engine(simulation_environment);
    
    // Run multiple simulations
    console.log("Running simulations...");
    const simulationResults = await simulation_engine.run(20);
    console.log(`Completed ${simulationResults.length} simulations`);
    
    // Create a single consolidated result from all simulations
    console.log("Creating consolidated simulation result...");
    const consolidatedResult = createConsolidatedSimulationResult(
      simulationResults,
      "680d7e3057f1cf67b95a5fa8"
    );
    
    // Save the consolidated result to database
    console.log("Saving result to database...");
    const savedResult = await save_simulation_result(consolidatedResult);
    
    console.log("✅ Saved consolidated simulation result to database");
    console.log("Result ID:", savedResult._id);
    console.log("Years:", consolidatedResult.startYear, "to", consolidatedResult.endYear);
    console.log("Success probability:", consolidatedResult.successProbability);
    console.log("Data for frontend charts is properly formatted and saved");
  } catch (error) {
    console.error("Error in simulation demo:", error);
  }
}

export {
    scrapping_demo,
    simulation_engine_demo
}