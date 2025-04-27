// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "../core/tax/FederalTaxService";
// import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { state_tax_yaml_string } from "../services/StateYamlParser";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";

async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 


async function simulation_engine_demo() {
  const simulation_environment = await create_simulation_environment("680d5df88650c1b31ef2604f");
  const simulation_engine = await create_simulation_engine(simulation_environment);
  simulation_engine.run(1);

}
export {
    scrapping_demo,
    simulation_engine_demo
}