// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "./core/tax/FederalTaxService";
import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function
import process_rmds from "./core/simulation/logic/ProcessRMD";
import { SimulationState } from "./core/simulation/SimulationState";
import { TaxStatus } from "./core/Enums";

async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
    
    //Test RMD Scraper
    // console.log("\n--- Testing RMD Scraper ---");
    // try {
    //     const age72Factor = await getRMDFactorForAge(80);
    //     console.log(`RMD Factor for age 80: ${age72Factor}`);
        
    //     const age75Factor = await getRMDFactorForAge(92);
    //     console.log(`RMD Factor for age 92: ${age75Factor}`);
        
    //     const age85Factor = await getRMDFactorForAge(97);
    //     console.log(`RMD Factor for age 97: ${age85Factor}`);
    // } catch (error) {
    //     console.error("Error testing RMD Scraper:", error);
    // }
    // console.log("--- End RMD Scraper Test ---\n");
} 

async function testProcessRMD() {
  console.log("\n=== Testing Process RMD ===");
  
  // Create a mock simulation state
  const mockState: any = {
    user: {
      get_age: () => 75, // Age that requires RMD
      is_alive: () => true
    },
    accounts: {
      pre_tax: new Map([
        ['ira1', { value: 100000, tax_status: TaxStatus.PRE_TAX }],
        ['ira2', { value: 200000, tax_status: TaxStatus.PRE_TAX }]
      ]),
      non_retirement: new Map([
        ['cash', { value: 50000, tax_status: TaxStatus.PRE_TAX }]
      ])
    },
    rmd_strategy: ['ira1', 'ira2'],
    incr_ordinary_income: (amount: number) => {
      console.log(`Added ${amount} to ordinary income`);
    }
  };
  
  try {
    // Process RMDs
    const rmdAmount = await process_rmds(mockState);
    
    console.log(`Total RMD processed: $${rmdAmount.toFixed(2)}`);
    console.log("Updated account values:");
    console.log(`IRA 1: $${mockState.accounts.pre_tax.get('ira1').value.toFixed(2)}`);
    console.log(`IRA 2: $${mockState.accounts.pre_tax.get('ira2').value.toFixed(2)}`);
    console.log(`Cash: $${mockState.accounts.non_retirement.get('cash').value.toFixed(2)}`);
    console.log(`RMD triggered: ${mockState.rmd_triggered}`);
  } catch (error) {
    console.error("Error testing ProcessRMD:", error);
  }
  
  console.log("=== End Process RMD Test ===\n");
}

export {
    scrapping_demo,
    testProcessRMD
}