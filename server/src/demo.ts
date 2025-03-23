// src/demo.ts

// This file should contain functions demonstrating our parts
import { create_federal_tax_service } from "./core/tax/FederalTaxService";

async function scrapping_demo() {
    const federal_tax_data = await create_federal_tax_service();
    federal_tax_data.print_taxable_income_bracket();
    federal_tax_data.print_capital_gains_bracket();
    federal_tax_data.print_standard_deductions_info();
} 
 
export {
    scrapping_demo,
}