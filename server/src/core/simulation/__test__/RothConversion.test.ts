
import process_roth_conversion from '../logic/RothConversion';
import { SimulationState } from '../SimulationState';
import { AccountMap } from '../../domain/scenario/Scenario';
import { TaxStatus, TaxFilingStatus, IncomeType, ChangeType } from '../../Enums';
import { create_investment, Investment } from '../../domain/investment/Investment';
import { InvestmentType } from '../../domain/investment/InvestmentType';
import { incr_300_init_300_investment_one, incr_600_init_600_investment_one } from '../../domain/raw/investment_raw';

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
  accounts: {
    pre_tax: new Map<string, Investment>([
        ['pre_tax_1', pre_tax_1],
        ['pre_tax_2', pre_tax_2],
    ]),
    after_tax: new Map<string, Investment>(),
    non_retirement: new Map()
  },
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
  roth_conversion_strategy: ['pre_tax_1', 'pre_tax_2'],
  get_ordinary_income: jest.fn().mockReturnValue(80000),
  get_capital_gains_income: jest.fn().mockReturnValue(20000),
  get_social_security_income: jest.fn().mockReturnValue(30000),
  get_after_tax_contribution: jest.fn().mockReturnValue(0),
  get_after_tax_contribution_limit: jest.fn().mockReturnValue(6500),
  incr_ordinary_income: jest.fn(),
  incr_after_tax_contribution: jest.fn(),
} as unknown as SimulationState);

describe('Roth Conversion Process', () => {

    beforeEach(() => {
        // clear error and proces.exit
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
            throw new Error(`process.exit(${code})`);
        });
    });
    
    afterEach(() => {
        jest.restoreAllMocks();
    });
  
  describe('transfer_investment', () => {
    test('transfer to itself', () => {
      const state = createBaseState();
      process_roth_conversion(state);
      const source = state.accounts.pre_tax;
      const target = state.accounts.after_tax;
      
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
      expect(state.incr_ordinary_income).toHaveBeenCalled();

      state.get_current_year = jest.fn().mockReturnValue(2032);
      process_roth_conversion(state);
      expect(state.incr_ordinary_income).toHaveBeenCalledTimes(1);
    });

    test('nothing is transfer', () => {
      const state = createBaseState();
      state.federal_tax_service.find_bracket = jest.fn().mockReturnValue({
        min: 0,
        max: 50000,
        rate: 0.12
      });
      // Ordinary income: 80000
      // capital gains income 20000
      // social security benefit 30000
      // taxable income = 95500
      // exceed the current bracket
      process_roth_conversion(state);
      expect(state.incr_ordinary_income).not.toHaveBeenCalled();
    });
  });

  describe('boundarie test', () => {
    test('empty roth conversion strategy', () => {
      const state = createBaseState();
      state.roth_conversion_strategy = [];
      
      process_roth_conversion(state);
      expect(state.accounts.after_tax.size).toBe(0  );
    });
    test('account not exist', () => {
        const state = createBaseState();
        state.roth_conversion_strategy = ['non_existent'];
        
        try {
            process_roth_conversion(state);
        }catch(error) {
            expect(error).toBeInstanceOf(Error);
            if (error instanceof Error) {
                expect(error.message).toMatch("process.exit(1)");
            }
        }
      });
  });
});