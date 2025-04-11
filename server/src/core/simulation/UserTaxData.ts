export interface UserTaxData {
  incr_cur_year_income(amt: number): void;
  incr_cur_capital_gains(amt: number): void;
  incr_social_security(amt: number): void;
  incr_after_tax_contribution(amt: number): void
  incr_early_withdrawal(amt: number): void;

  get_cur_year_income(): number;
  get_cur_capital_gains(): number;
  get_cur_social_security(): number;
  get_cur_after_tax_contribution(): number;
  get_cur_early_withdrawal(): number;

  get_prev_year_income(): number;
  get_prev_capital_gains(): number;
  get_prev_social_security(): number;
  get_prev_after_tax_contribution(): number;
  get_prev_early_withdrawal(): number;

  advance_year(): void;
}

export default UserTaxData;

export const create_user_tax_data = (): UserTaxData => {
  let cur_income = 0;
  let cur_capital_gains = 0;
  let cur_social_security = 0;
  let cur_after_tax_contribution = 0;
  let cur_early_withdrawal = 0;

  let prev_income = 0;
  let prev_capital_gains = 0;
  let prev_social_security = 0;
  let prev_after_tax_contribution = 0;
  let prev_early_withdrawal = 0;
  return {
    incr_cur_year_income: (amt: number): number => cur_income+= amt,
    incr_cur_capital_gains: (amt: number): number => cur_capital_gains += amt,
    incr_social_security: (amt: number): number => cur_social_security += amt,
    incr_after_tax_contribution: (amt: number): number => cur_after_tax_contribution += amt,
    incr_early_withdrawal: (amt: number): number => cur_early_withdrawal += amt,

    get_cur_year_income: () => cur_income,
    get_cur_capital_gains: () => cur_capital_gains,
    get_cur_social_security: () => cur_social_security,
    get_cur_after_tax_contribution: () => cur_after_tax_contribution,
    get_cur_early_withdrawal: () => cur_early_withdrawal,

    get_prev_year_income: () => prev_income,
    get_prev_capital_gains: () => prev_capital_gains,
    get_prev_social_security: () => prev_social_security,
    get_prev_after_tax_contribution: () => prev_after_tax_contribution,
    get_prev_early_withdrawal: () => prev_early_withdrawal,

    advance_year: () => {
      prev_income = cur_income;
      prev_capital_gains = cur_capital_gains;
      prev_social_security = cur_social_security;
      prev_after_tax_contribution = cur_after_tax_contribution;
      prev_early_withdrawal = cur_early_withdrawal;

      cur_income = 0;
      cur_capital_gains = 0;
      cur_social_security = 0;
      cur_after_tax_contribution = 0;
      cur_early_withdrawal = 0;
    }
  };
};