// src/demo.ts

// This file should contain functions demonstrating our parts
import FederalTaxData from "./core/tax/federal/FederalTaxData";

async function scrapping_demo() {
    const federal_tax_data = await FederalTaxData();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 
 
export {
    scrapping_demo,
}