import { simulation_logger } from "../../utils/logger/logger";

export interface UserTaxData {
  incr_cur_year_income(amt: number): void;
  incr_cur_year_gains(amt: number): void;
  incr_cur_year_ss(amt: number): void;
  incr_after_tax_contribution(amt: number): void
  incr_year_early_withdrawal(amt: number): void;

  // this function uses data from previous year
  get_cur_fed_taxable_income(): number;
  get_cur_year_income(): number;
  get_cur_year_gains(): number;
  get_cur_year_ss(): number;
  get_cur_after_tax_contribution(): number;
  get_cur_year_early_withdrawal(): number;

  get_prev_year_income(): number;
  get_prev_year_gains(): number;
  get_prev_year_ss(): number;
  get_prev_after_tax_contribution(): number;
  get_prev_year_early_withdrawal(): number;

  advance_year(): void;
}

export default UserTaxData;

export const create_user_tax_data = (): UserTaxData => {
  let cur_year_income = 0;
  let cur_year_gains = 0;
  let cur_year_ss = 0;
  let cur_year_early_withdrawal = 0;
  let cur_after_tax_contribution = 0;

  let prev_year_income = 0;
  let prev_year_gains = 0;
  let prev_year_ss = 0;
  let prev_year_early_withdrawal = 0;
  let prev_after_tax_contribution = 0;
  return {
    incr_cur_year_income: (amt: number): void => {
      cur_year_income += amt;
      if (Number.isNaN(cur_year_income)) {
        simulation_logger.error(`cur year income became NaN. Adding ${amt}`);
        throw new Error(`cur year income become NaN. Adding ${amt}`);
      }
    },
    incr_cur_year_gains: (amt: number): void => {
      cur_year_gains += amt;
      if (Number.isNaN(cur_year_gains)) {
        simulation_logger.error(`cur year gains became NaN. Adding ${amt}`);
        throw new Error(`cur year gains bcame NaN. Adding ${amt}`);
      }
    },
    incr_cur_year_ss: (amt: number): void => {
      cur_year_ss += amt
      if (Number.isNaN(cur_year_ss)) {
        simulation_logger.error(`cur year ss became NaN. Adding ${amt}`);
        throw new Error(`cur year ss become NaN. Adding ${amt}`);
      }
    },
    incr_year_early_withdrawal: (amt: number): void => {
      cur_year_early_withdrawal += amt
      if (Number.isNaN(cur_year_early_withdrawal)) {
        simulation_logger.error(`cur year early withdrawal became NaN. Adding ${amt}`);
        throw new Error(`cur year early withdrawal become NaN. Adding ${amt}`);
      }
    },
    incr_after_tax_contribution: (amt: number): void => {
      cur_after_tax_contribution += amt
      if (Number.isNaN(cur_after_tax_contribution)) {
        simulation_logger.error(`cur year after tax contribution became NaN. Adding ${amt}`);
        throw new Error(`cur year after tax contribution become NaN. Adding ${amt}`);
      }
    },


    get_cur_fed_taxable_income: () => prev_year_income - 0.15 * prev_year_ss,
    get_cur_year_income: () => cur_year_income,
    get_cur_year_gains: () => cur_year_gains,
    get_cur_year_ss: () => cur_year_ss,
    get_cur_year_early_withdrawal: () => cur_year_early_withdrawal,
    get_cur_after_tax_contribution: () => cur_after_tax_contribution,

    get_prev_year_income: () => prev_year_income,
    get_prev_year_gains: () => prev_year_gains,
    get_prev_year_ss: () => prev_year_ss,
    get_prev_year_early_withdrawal: () => prev_year_early_withdrawal,
    get_prev_after_tax_contribution: () => prev_after_tax_contribution,

    advance_year: () => {
      prev_year_income = cur_year_income;
      prev_year_gains = cur_year_gains;
      prev_year_ss = cur_year_ss;
      prev_after_tax_contribution = cur_after_tax_contribution;
      prev_year_early_withdrawal = cur_year_early_withdrawal;

      cur_year_income = 0;
      cur_year_gains = 0;
      cur_year_ss = 0;
      cur_after_tax_contribution = 0;
      cur_year_early_withdrawal = 0;
    }
  };
};