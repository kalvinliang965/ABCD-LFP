import { simulation_logger } from "../../utils/logger/logger";
import { IncomeType, TaxFilingStatus } from "../Enums";
import { FederalTaxService } from "../tax/FederalTaxService";
import { StateTaxService } from "../tax/StateTaxService";
import { TaxBracket } from "../tax/TaxBrackets";
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
        
        const state_taxable_income = this.user_tax_data.get_prev_year_income();
        simulation_logger.debug(`state taxable income: ${state_taxable_income}`);

        const standard_deduction = this.federal_tax_service.find_deduction(
            this.get_tax_filing_status()
        );
        simulation_logger.debug(`Standard deduction: ${standard_deduction}`)

        const fed_tax = this.calculate_tax(
            Math.max(fed_taxable_income - standard_deduction, 0),
            this.federal_tax_service.__taxable_income_bracket.__brackets.get(this.get_tax_filing_status())!
        );
        if (Number.isNaN(fed_tax)) {
            throw new Error("fed tax turn NaN");
        }

        const state_tax = this.calculate_tax(
            Math.max(state_taxable_income, 0),
            this.state_tax_service.__taxable_income_brackets.__brackets.get(this.get_tax_filing_status())!,
        )
        if (Number.isNaN(state_tax)) {
            throw new Error("state tax turn NaN");
        }
        
        simulation_logger.debug(`federal tax: ${fed_tax}`);
        simulation_logger.debug(`state tax: ${state_tax}`);

        // step b: calculate previous year's capital gains
        // if capital gains is negative, we move on
        simulation_logger.debug(`capital gains: ${this.user_tax_data.get_prev_year_gains()}`);
        let capital_gain_tax = this.calculate_tax(
            Math.max(this.user_tax_data.get_prev_year_gains(), 0),
            this.federal_tax_service.__capital_gains_bracket.__brackets.get(this.get_tax_filing_status())!,
        )
        if (Number.isNaN(capital_gain_tax)) {
            throw new Error("capital gain tax turn NaN");
        }
        simulation_logger.debug(`capital gains tax: ${capital_gain_tax}`);

        // step c: calculate previous year withdrawal tax 
        // we assume 10% early withdrawal
        const withdrawal_tax = this.user_tax_data.get_prev_year_early_withdrawal() * 0.10;
        if (Number.isNaN(withdrawal_tax)) {
            throw new Error("withdrawal tax turn NaN");
        }
        simulation_logger.debug(`withdrawal tax: ${withdrawal_tax}`);

        const total_tax = Math.max(fed_tax + state_tax + withdrawal_tax + capital_gain_tax, 0);
        return total_tax;
    }


    /**
     * Progressive tax. Calculate specific tax. e.g. capital gain tax
     * @param income this is the taxable income after any deductions
     * @param brackets all brackets of this income type
     */
    private calculate_tax(income: number, brackets: TaxBracket[]) {

        let tax = 0;
        let remaining_income = income;

        for (const bracket of brackets) {
            if (remaining_income == 0) break;

            const bracket_range = bracket.max ? bracket.max - bracket.min: Infinity;
            const taxable_in_bracket = Math.min(remaining_income, bracket_range);

            tax += taxable_in_bracket * bracket.rate;
            remaining_income -= taxable_in_bracket
        }
        return tax;
    }
}