export interface TaxInfo {
  get_ordinary_income: () => number;
  get_capital_gains_income: () => number;
  get_social_security_income: () => number;
  get_after_tax_contribution: () => number;
  incr_ordinary_income: (amt: number) => void;
  incr_social_security_income: (amt: number) => void;
  incr_capital_gains_income: (amt: number) => void;
  incr_after_tax_contribution: (amt: number) => void;
  reset: () => void;
}

export default TaxInfo;

export const create_tax_info = (): TaxInfo => {
  let ordinary_income = 0;
  let capital_gains = 0;
  let social_security = 0;
  let after_tax_contribution = 0;

  return {
    get_ordinary_income: () => ordinary_income,
    get_capital_gains_income: () => capital_gains,
    get_social_security_income: () => social_security,
    get_after_tax_contribution: () => after_tax_contribution,
    
    incr_ordinary_income: (amt) => { ordinary_income += amt },
    incr_capital_gains_income: (amt) => { capital_gains += amt },
    incr_social_security_income: (amt) => { social_security += amt },
    incr_after_tax_contribution: (amt) => { after_tax_contribution += amt },
    
    reset: () => {
      ordinary_income = 0;
      capital_gains = 0;
      social_security = 0;
      after_tax_contribution = 0;
    }
  };
};