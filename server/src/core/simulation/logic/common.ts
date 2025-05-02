
import { AccountMap } from "../../domain/AccountManager";
import { simulation_logger } from "../../../utils/logger/logger";
import { TaxStatus } from "../../Enums";
import { Investment } from "../../../db/models/investments";

// foo -> non retirement
export function transfer_investment_value(
    strategy: string[], 
    amt: number, 
    source_pool: AccountMap,       
    target_pool: AccountMap) {
    
    // the amount been transferred
    let transferred = 0;
    for (let i = 0; i < strategy.length && transferred < amt; i++) {
        const label = strategy[i];
        const from_investment = source_pool.get(label);
        if (!from_investment) {
            simulation_logger.error(`Investment with label ${label} not exist`);
            throw new Error(`Investment with ${label} not exist`);
        }
        if (!target_pool.has(label)) {
            const cloned_investment = from_investment.clone();
            cloned_investment.tax_status = TaxStatus.AFTER_TAX
            target_pool.set(label, cloned_investment);
        }
        const to_investment = target_pool.get(label)!;
        // if we have nothing in investment, nothing is transferred
        const transfer_amt = Math.min(from_investment.get_value(), amt);
        simulation_logger.debug(`value of from investment decrease by ${transfer_amt}`)
        simulation_logger.debug(`value of to investment increase by ${transfer_amt}`);
        from_investment.incr_value(-transfer_amt);
        to_investment.incr_value(transfer_amt);
        
        // update cost basis
        const fraction = transfer_amt / from_investment.get_value();
        const transfer_purchase = fraction * from_investment.get_cost_basis(); 
        simulation_logger.debug(`cost basis of from investment decrease by ${transfer_purchase}`);
        simulation_logger.debug(`cost basis of to investment increase by ${transfer_purchase}`);
        from_investment.incr_cost_basis(-transfer_purchase);
        to_investment.incr_cost_basis(transfer_purchase);

        transferred += transfer_amt;
    }
    
    return transferred;
}