// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "./core/tax/FederalTaxService";
import { getRMDFactorForAge } from "./services/RMDScraper"; // Import the RMD function

async function scrapping_demo() {
    console.log("Scrapping demo");
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
    
    // Test RMD Scraper
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
 
export {
    scrapping_demo,
}