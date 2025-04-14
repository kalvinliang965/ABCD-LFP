
import update_investment from '../UpdateInvestment';
import { ChangeType, TaxStatus } from '../../../Enums';
import { SimulationState } from '../../SimulationState';
import { create_investment } from '../../../domain/investment/Investment';
import { incr_300_init_300_investment_one, incr_300_init_300_investment_two } from '../../../domain/raw/investment_raw';
import { Investment } from '../../../domain/investment/Investment';
import { TaxFilingStatus } from '../../../Enums';
import { incr_300_investment_type_one, incr_300_investment_type_two } from '../../../domain/raw/investment_type_raw';
import { InvestmentType } from '../../../domain/investment/InvestmentType';
import { create_investment_type_manager } from '../../../domain/InvestmentTypeManager';

const non_retirement_300_non_tax_exempt = create_investment(incr_300_init_300_investment_one);
non_retirement_300_non_tax_exempt.tax_status = TaxStatus.NON_RETIREMENT;
non_retirement_300_non_tax_exempt.incr_value = jest.fn()

const non_retirement_300_tax_exempt = create_investment(incr_300_init_300_investment_two);
non_retirement_300_tax_exempt.tax_status = TaxStatus.NON_RETIREMENT;
non_retirement_300_tax_exempt.incr_value = jest.fn()

const pre_tax_300_non_tax_exempt = create_investment(incr_300_init_300_investment_one);
pre_tax_300_non_tax_exempt.tax_status = TaxStatus.PRE_TAX;
pre_tax_300_non_tax_exempt.incr_value = jest.fn()


const createBaseState = (): SimulationState => ({
  account_manager: {
    all: new Map<string, Investment>([
        ['non_retirment_tax_exempt', non_retirement_300_tax_exempt],
        ['non_retirment_non_tax_exempt', non_retirement_300_non_tax_exempt],
        ['pre_tax_300_non_tax_exempt', pre_tax_300_non_tax_exempt],
    ]),
  },
  investment_type_manager: create_investment_type_manager(new Set([incr_300_investment_type_two, incr_300_investment_type_one])),
  get_tax_filing_status: () => TaxFilingStatus.SINGLE,
  federal_tax_service: {
    find_bracket: jest.fn().mockReturnValue({ min: 0, max: 100000, rate: 0.24 }),
    find_deduction: jest.fn().mockReturnValue(12500),
    adjust_for_inflation: jest.fn()
  },
  state_tax_service: {
    find_rate: jest.fn().mockReturnValue(0.05),
    adjust_for_inflation: jest.fn()
  },
  get_current_year: jest.fn().mockReturnValue(2024),
  roth_conversion_opt: true,
  roth_conversion_start: 2024,
  roth_conversion_end: 2030,
  roth_conversion_strategy: [],
  user_tax_data: {
    get_cur_year_income: jest.fn().mockReturnValue(80000),
    get_cur_year_gains: jest.fn().mockReturnValue(20000),
    get_cur_year_ss: jest.fn().mockReturnValue(30000),
    get_cur_fed_taxable_income: () => 80000 - 0.15 * 20000,
    incr_cur_year_income: jest.fn(),
    incr_cur_year_gains: jest.fn(),
    incr_cur_year_ss: jest.fn(),
  }
} as unknown as SimulationState); 

describe('updateInvestment', () => {
  it('should update ordinary income if tax-exempt and non-retirment account', () => {
    const simulation_state = createBaseState();
    update_investment(simulation_state);

    // only non_retirement_300_non_tax_exempt is updated
    expect(simulation_state.user_tax_data.incr_cur_year_income).toHaveBeenCalledWith(300);

    // avg = (300(prev) + 600(added)) // 2 * 0.004 = 1.8
    // but with mocking, 300 + 300 // 2 * 0.004 = 1.2
    expect(non_retirement_300_non_tax_exempt.incr_value).toHaveBeenCalledWith(300);
    expect(non_retirement_300_non_tax_exempt.incr_value).toHaveBeenCalledWith(-1.2);
    expect(pre_tax_300_non_tax_exempt.incr_value).toHaveBeenCalledWith(300);
    expect(pre_tax_300_non_tax_exempt.incr_value).toHaveBeenCalledWith(-1.2);
    expect(non_retirement_300_tax_exempt.incr_value).toHaveBeenCalledWith(300);
    expect(non_retirement_300_tax_exempt.incr_value).toHaveBeenCalledWith(-1.2);
  });
});