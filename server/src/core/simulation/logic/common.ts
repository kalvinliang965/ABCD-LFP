
import { AccountGroup, AccountMap } from "../../domain/AccountManager";
import { simulation_logger } from "../../../utils/logger/logger";
import { TaxStatus } from "../../Enums";
import { Investment } from "../../../db/models/investments";

// foo -> non retirement
export function transfer_investment_value(
    strategy: Array<string>, // ordering we do the transfering
    amt: number, 
    source_pool: AccountGroup,       
    target_pool: AccountGroup,
    withdrawal_expense_strategy: Array<string>, // newly created investment need to be added to this strategy
) {
        
    const from_type = source_pool.type;
    const to_type = target_pool.type;

    // the amount been transferred
    let transferred = 0;

    const newly_created_investment: string[] = [];

    for (let i = 0; i < strategy.length && transferred < amt; i++) {
        const from_label = strategy[i];
        const to_label = strategy[i].replace(from_type, to_type);

        const from_investment = source_pool.account_map.get(from_label);
        if (!from_investment) {
            simulation_logger.error(`Investment with label ${from_label} not exist`);
            throw new Error(`Investment with ${from_label} not exist`);
        }
        // At this point source pool must have something
        if (!target_pool.account_map.has(to_label)) {
            const cloned_investment = from_investment.clone();
            // reset the fields of the investment
            cloned_investment.incr_cost_basis(-cloned_investment.get_cost_basis());
            cloned_investment.incr_value(-cloned_investment.get_value());
            cloned_investment.tax_status = TaxStatus.AFTER_TAX;
            cloned_investment.id = to_label;
            target_pool.account_map.set(to_label, cloned_investment);
            newly_created_investment.push(to_label);
        }
        const to_investment = target_pool.account_map.get(to_label)!;
        simulation_logger.debug(`Withdrawing from ${from_investment.id}`);
        simulation_logger.debug(`transfering to ${to_investment.id}`);
        const from_investment_value = from_investment.get_value();
        if (from_investment_value === 0) {
            simulation_logger.debug(`from investment value is zero`);
            continue;
        }
        // if we have nothing in investment, nothing is transferred
        const remain = amt - transferred;
        simulation_logger.debug(`from investment value ${from_investment_value}`);
        simulation_logger.debug(`remaining amount ${remain}`);
        const transfer_amt = Math.min(from_investment_value, remain);
        simulation_logger.debug(`transfer amount ${transfer_amt}`)
        const fraction = transfer_amt / from_investment_value;
        simulation_logger.debug(`transfer fraction ${fraction}`);
        const transfer_purchase = fraction * from_investment.get_cost_basis(); 
        simulation_logger.debug(`transfer purchase ${transfer_purchase}`);
        
        // update value
        simulation_logger.debug(`value of from investment decrease by ${transfer_amt}`)
        simulation_logger.debug(`value of to investment increase by ${transfer_amt}`);
        from_investment.incr_value(-transfer_amt);
        to_investment.incr_value(transfer_amt);
        
        // update cost basis
        simulation_logger.debug(`cost basis of from investment decrease by ${transfer_purchase}`);
        simulation_logger.debug(`cost basis of to investment increase by ${transfer_purchase}`);
        from_investment.incr_cost_basis(-transfer_purchase);
        to_investment.incr_cost_basis(transfer_purchase);

        simulation_logger.debug(`from investment new value: ${from_investment.get_value()}`);
        simulation_logger.debug(`from investment new cost basis: ${from_investment.get_cost_basis()}`);
        simulation_logger.debug(`to investment new value: ${to_investment.get_value()}`);
        simulation_logger.debug(`to investment new cost basis: ${to_investment.get_cost_basis()}`);
        
        transferred += transfer_amt;
    }

    // append newly created investment to expense_strategy
    for (const label of newly_created_investment) {
        withdrawal_expense_strategy.push(label);
    }
    
    return transferred;
}