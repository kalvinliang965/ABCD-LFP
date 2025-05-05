import { simulation_logger } from "../../utils/logger/logger";
import { TaxStatus } from "../Enums";
import { AccountManager } from "./AccountManager";
import { Investment } from "./investment/Investment";
import UserTaxData from "./UserTaxData";

export class WithdrawalProcessor {

    constructor(
        private account_manager: AccountManager,
        private user_tax_data: UserTaxData,
        private get_age: () => number, // needed for early withdrawal
    ) {}

    public execute_withdrawal(
        strategy: string[],
        withdrawal_amount: number
    ): number {

        let withdrawaled=0;
        const investments = this.account_manager.all();
        for (const inv_id of strategy) {
          
          // withdrawaled enough money
          if (withdrawaled > withdrawal_amount) {
            simulation_logger.debug(`withdrawed enough amount`);
            return withdrawaled;
          }

          const investment = investments.get(inv_id);
          if (!investment) {
            simulation_logger.error(`Investment "${inv_id}" does not exist`);
            throw new Error(`Investment "${inv_id}" does not exist`)
          }
          
          simulation_logger.debug(`Planning to sell investment: ${inv_id}.`);
          const available = investment.get_value();
          simulation_logger.debug(`Investment still have ${available}`);
          if (available <= 0) {
            simulation_logger.debug("skip");
            continue;
          }
          simulation_logger.debug(`User purchased ${investment.get_cost_basis()}`);
          if (investment.get_cost_basis() === 0) {
            simulation_logger.debug("skip");
            continue;
          }

          const investment_value = investment.get_value();
          const to_withdraw = Math.min(withdrawal_amount - withdrawaled, available);
          simulation_logger.debug(`Withdrawed $${to_withdraw}.`);
          investment.incr_value(-to_withdraw);
          withdrawaled += to_withdraw
          simulation_logger.debug(`still have ${withdrawal_amount - withdrawaled} to be paid`);

          this.process_tax_implication(
            investment,
            to_withdraw,
            investment_value,
          );

        }
        return withdrawaled;
    }


    private process_tax_implication(
        investment: Investment,
        withdrawed_amount: number,
        original_amount: number,
    ) {
        const cost_basis = investment.get_cost_basis();

        const fraction = withdrawed_amount / original_amount;
        // step) f.i
        // if sold investment from non-retirement accont
        // we have to calculate capital gains
        if (investment.tax_status === TaxStatus.NON_RETIREMENT) {
            simulation_logger.debug("processing capital gains");
            simulation_logger.debug(`original amount: ${original_amount}`);
            simulation_logger.debug(`purchase amount: ${cost_basis}`);
            const gains = original_amount - cost_basis;
            simulation_logger.debug(`investment gains: ${gains}`);
            const capital_gains = fraction * gains;
            simulation_logger.debug(`capital gains for this year increased by ${capital_gains} (${fraction} of the total gains).`)
            this.user_tax_data.incr_cur_year_gains(capital_gains);
        } 
        
        investment.incr_cost_basis(-(fraction * cost_basis));
        if (investment.tax_status === TaxStatus.PRE_TAX) {
            this.user_tax_data.incr_cur_year_income(withdrawed_amount);
        }
        
        // update withrawal
        if (
            this.get_age() < 59 && (
            investment.tax_status === TaxStatus.PRE_TAX || 
            investment.tax_status === TaxStatus.AFTER_TAX
        )) {
            this.user_tax_data.incr_year_early_withdrawal(withdrawed_amount);
        }
    }
}