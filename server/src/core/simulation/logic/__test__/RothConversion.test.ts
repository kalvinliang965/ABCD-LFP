
import process_roth_conversion from '../RothConversion';
import { SimulationState } from '../../SimulationState';
import { TaxStatus, TaxFilingStatus, IncomeType, ChangeType } from '../../../Enums';
import { create_investment, Investment } from '../../../domain/investment/Investment';
import { InvestmentType } from '../../../domain/investment/InvestmentType';
import { incr_300_init_300_investment_one, incr_600_init_600_investment_one } from '../../../domain/raw/investment_raw';

const pre_tax_1 = create_investment(incr_300_init_300_investment_one);
const pre_tax_2 = create_investment(incr_600_init_600_investment_one);
pre_tax_1.incr_value = jest.fn();
pre_tax_1.clone = function() {
    return {
        ...this,
        TaxStatus: TaxStatus.AFTER_TAX,
        incr_value: jest.fn(),
    }
  }
pre_tax_2.incr_value = jest.fn();
pre_tax_2.clone = function() {
    return {
        ...this,
        TaxStatus: TaxStatus.AFTER_TAX,
        incr_value: jest.fn(),
    }
  }

const createBaseState = (): SimulationState => ({
  account_manager: {
    pre_tax: new Map<string, Investment>([
        ['pre_tax_1', pre_tax_1],
        ['pre_tax_2', pre_tax_2],
    ]),
    after_tax: new Map<string, Investment>(),
    non_retirement: new Map()
  },
  get_tax_filing_status: () => TaxFilingStatus.INDIVIDUAL,
  federal_tax_service: {
    find_bracket_with_income: jest.fn().mockReturnValue({ min: 0, max: 100000, rate: 0.24 }),
    find_deduction: jest.fn().mockReturnValue(0),
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
  roth_conversion_strategy: ['pre_tax_1', 'pre_tax_2'],
  user_tax_data: {
    get_cur_year_income: jest.fn().mockReturnValue(80000),
    get_cur_year_gains: jest.fn().mockReturnValue(20000),
    get_cur_year_ss: jest.fn().mockReturnValue(30000),
    get_cur_fed_taxable_income: () => 80000 - 0.15 * 30000,
    incr_cur_year_income: jest.fn(),
    incr_cur_year_gains: jest.fn(),
    incr_cur_year_ss: jest.fn(),
  }
} as unknown as SimulationState);

describe('Roth Conversion Process', () => {
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
  
  describe('transfer_investment', () => {
    test('transfer to itself', () => {
      const state = createBaseState();
      process_roth_conversion(state);
      const source = state.account_manager.pre_tax;
      const target = state.account_manager.after_tax;
      
      const sourceInv = source.get('pre_tax_1')!;
      const targetInv = target.get('pre_tax_1')!;
      
      expect(sourceInv.incr_value).toHaveBeenCalledWith(-300);
      expect(targetInv.incr_value).toHaveBeenCalledWith(300);
    });

  });

  describe('process_roth_conversion', () => {
    test('transfer in valid window', () => {
      const state = createBaseState();
      
      state.get_current_year = jest.fn().mockReturnValue(2025);
      process_roth_conversion(state);
      expect(state.user_tax_data.incr_cur_year_income).toHaveBeenCalled();

      state.get_current_year = jest.fn().mockReturnValue(2032);
      process_roth_conversion(state);
      expect(state.user_tax_data.incr_cur_year_income).toHaveBeenCalledTimes(1);
    });

    test('nothing is transfer', () => {
      const state = createBaseState();
      state.federal_tax_service.find_bracket_with_income = jest.fn().mockReturnValue({
        min: 0,
        max: 50000,
        rate: 0.12
      });
      // cur year income: 80000
      // social security benefit 30000
      // taxable income = 795500
      // 795500 - 0 = 75500
      // exceed the current bracket
      process_roth_conversion(state);
      expect(state.user_tax_data.incr_cur_year_income).not.toHaveBeenCalled();
    });
  });

  describe('boundarie test', () => {
    it('should transfter nothing on empty roth conversion strategy', () => {
      const state = createBaseState();
      state.roth_conversion_strategy = [];
      
      process_roth_conversion(state);
      expect(state.account_manager.after_tax.size).toBe(0  );
    });
    it('should error on account not exist', () => {
        const state = createBaseState();
        state.roth_conversion_strategy = ['non_existent'];
      
        expect(() => process_roth_conversion(state)).toThrow(/Investment with/);
     
      });
  });
});