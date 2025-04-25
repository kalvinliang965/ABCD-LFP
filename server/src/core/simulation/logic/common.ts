
import { AccountMap } from "../../domain/AccountManager";
import { simulation_logger } from "../../../utils/logger/logger";
import { TaxStatus } from "../../Enums";

export function transfer_investment_value(
    roth_conversion_strategy: string[], 
    amt: number, 
    source_pool: AccountMap, 
    target_pool: AccountMap) {
    
    // the amount been transferred
    let transferred = 0;

    for (let i = 0; i < roth_conversion_strategy.length && transferred < amt; i++) {
        const label = roth_conversion_strategy[i];
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
        const to_investment = target_pool.get(label);
        // if we have nothing in investment, nothing is transferred
        const transfer_amt = Math.min(from_investment.get_value(), amt);
        from_investment.incr_value(-transfer_amt);
        to_investment?.incr_value(transfer_amt);
        transferred += transfer_amt;
    }
}