import { simulation_logger } from "../../utils/logger/logger";
import { IncomeType, TaxFilingStatus } from "../Enums";
import { FederalTaxService } from "../tax/FederalTaxService";
import { StateTaxService } from "../tax/StateTaxService";
import UserTaxData from "./UserTaxData";

export class TaxProcessor {

    constructor(
        private user_tax_data: UserTaxData,
        private federal_tax_service: FederalTaxService,
        private state_tax_service: StateTaxService,
        private get_tax_filing_status: () => TaxFilingStatus,
    ) {}

    public calculate_taxes(): number {

        simulation_logger.debug("Processing tax...");

        // step a: calculate previous year's federal and state income tax
        // using data from preivous year
        // in our application, 85 percent of SS are only subject to federal tax
        const fed_taxable_income = this.user_tax_data.get_cur_fed_taxable_income();
        simulation_logger.debug(`previous year total income: ${this.user_tax_data.get_prev_year_income()}`);
        simulation_logger.debug(`previous year early withdrawal: ${this.user_tax_data.get_prev_year_early_withdrawal()}`);
        simulation_logger.debug(`federal taxable income: ${fed_taxable_income}`);

        console.log(`previous year total income: ${this.user_tax_data.get_prev_year_income()}`);
        console.log(`previous year early withdrawal: ${this.user_tax_data.get_prev_year_early_withdrawal()}`);
        console.log(`federal taxable income: ${fed_taxable_income}`);
        
        const state_taxable_income = this.user_tax_data.get_prev_year_income();
        simulation_logger.debug(`state taxable income: ${state_taxable_income}`);

        const standard_deduction = this.federal_tax_service.find_deduction(
            this.get_tax_filing_status()
        );
        simulation_logger.debug(`Standard deduction: ${standard_deduction}`)

        const fed_tax = Math.max(
            fed_taxable_income * this.federal_tax_service.find_rate(
                fed_taxable_income - standard_deduction, 
                IncomeType.TAXABLE_INCOME, 
                this.get_tax_filing_status()
            ), 0
        );

        const state_tax = Math.max(
            state_taxable_income * this.state_tax_service.find_rate(
                state_taxable_income, 
                this.get_tax_filing_status()
            ), 0
        );
        simulation_logger.debug(`federal tax: ${fed_tax}`);
        simulation_logger.debug(`state tax: ${state_tax}`);

        // step b: calculate previous year's capital gains
        // if capital gains is negative, we move on
        let capital_gain_tax = Math.max(
          this.user_tax_data.get_prev_year_gains(),
          0,
        );

        simulation_logger.debug(`capital gains: ${capital_gain_tax}`);
        if (capital_gain_tax != 0) {
          const capital_gain_rate = this.federal_tax_service.find_rate(
            capital_gain_tax, 
            IncomeType.CAPITAL_GAINS, 
            this.get_tax_filing_status()
        );
          capital_gain_tax *= capital_gain_rate; 
        }
        simulation_logger.debug(`capital gains tax: ${capital_gain_tax}`);

        // step c: calculate previous year withdrawal tax 
        // we assume 10% early withdrawal
        const withdrawal_tax = this.user_tax_data.get_prev_year_early_withdrawal() * 0.10;
        simulation_logger.debug(`withdrawal tax: ${withdrawal_tax}`);

        const total_tax = Math.max(fed_tax + state_tax + withdrawal_tax + capital_gain_tax, 0);
        return total_tax;
    }
}