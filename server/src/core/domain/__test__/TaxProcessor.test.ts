import { IncomeType, TaxFilingStatus } from "../../Enums";
import { FederalTaxService } from "../../tax/FederalTaxService";
import { StateTaxService } from "../../tax/StateTaxService";
import { AccountManager } from "../AccountManager";
import { TaxProcessor } from "../TaxProcessor";
import UserTaxData from "../UserTaxData";
import { WithdrawalProcessor } from "../WithdrawalProcessor";

// tax-processor.test.ts
describe("TaxProcessor", () => {
    let mock_tax_data: jest.Mocked<UserTaxData>;
    let mock_federal_service: jest.Mocked<FederalTaxService>;
    let mock_state_service: jest.Mocked<StateTaxService>;
    let tax_processor: TaxProcessor;
  
    beforeEach(() => {
      mock_tax_data = {
        incr_cur_year_income: jest.fn(),
        incr_cur_year_gains: jest.fn(),
        incr_cur_year_ss: jest.fn(),
        incr_after_tax_contribution: jest.fn(),
        incr_year_early_withdrawal: jest.fn(),

        // this function uses data from previous year
        get_cur_fed_taxable_income: jest.fn(),
        get_cur_year_income: jest.fn(), 
        get_cur_year_gains: jest.fn(),
        get_cur_year_ss: jest.fn(),
        get_cur_after_tax_contribution: jest.fn(),
        get_cur_year_early_withdrawal: jest.fn(),

        get_prev_year_income: jest.fn(),
        get_prev_year_gains: jest.fn(),
        get_prev_year_ss: jest.fn(),
        get_prev_after_tax_contribution: jest.fn(),
        get_prev_year_early_withdrawal: jest.fn(),

        advance_year: jest.fn(),
      } as unknown as jest.Mocked<UserTaxData>;
  
      mock_federal_service = {
        find_deduction: jest.fn(),
        find_rate: jest.fn(),
      } as unknown as jest.Mocked<FederalTaxService>;
  
      mock_state_service = {
        find_rate: jest.fn(),
      } as unknown as jest.Mocked<StateTaxService>;
  
      tax_processor = new TaxProcessor(
        mock_tax_data,
        mock_federal_service,
        mock_state_service,
        () => TaxFilingStatus.INDIVIDUAL
      );
    });
  
    describe("calculateTaxes", () => {
      test("should calculate minimum tax when income is below threshold", () => {
        const fed_taxable_income = 5000;
        const prev_year_income = 5000;
        const prev_year_gains = 0;
        const prev_year_early_withdrawal = 0;

        const federal_rate = 0.1;
        const state_rate = 0.03;

        mock_tax_data.get_cur_fed_taxable_income.mockReturnValue(fed_taxable_income);
        mock_tax_data.get_prev_year_income.mockReturnValue(prev_year_income);
        mock_tax_data.get_prev_year_gains.mockReturnValue(prev_year_gains);
        mock_tax_data.get_prev_year_early_withdrawal.mockReturnValue(prev_year_early_withdrawal);

        mock_federal_service.find_rate.mockReturnValue(federal_rate);
        mock_state_service.find_rate.mockReturnValue(state_rate);
  
        const result = tax_processor.calculate_taxes();
        
        // 5000 * (1  - 0.1) + 5000 * (1 - 0.03)
        const exp = fed_taxable_income * federal_rate + prev_year_income * state_rate + prev_year_early_withdrawal * 0.1 + prev_year_gains * federal_rate;
        expect(result).toBe(exp); 
      });
  
      test("should handle capital gains loss", () => {
        const fed_taxable_income = 5000;
        const prev_year_income = 5000;
        const prev_year_gains = -100000;
        const prev_year_early_withdrawal = 0;

        const federal_rate = 0.1;
        const state_rate = 0.03;

        mock_tax_data.get_cur_fed_taxable_income.mockReturnValue(fed_taxable_income);
        mock_tax_data.get_prev_year_income.mockReturnValue(prev_year_income);
        mock_tax_data.get_prev_year_gains.mockReturnValue(prev_year_gains);
        mock_tax_data.get_prev_year_early_withdrawal.mockReturnValue(prev_year_early_withdrawal);

        mock_federal_service.find_rate.mockReturnValue(federal_rate);
        mock_state_service.find_rate.mockReturnValue(state_rate);
  
        const result = tax_processor.calculate_taxes();
        
        // 5000 * (1  - 0.1) + 5000 * (1 - 0.03)
        const exp = fed_taxable_income * federal_rate + prev_year_income * state_rate + prev_year_early_withdrawal * 0.1 + 0 * federal_rate;
        expect(result).toBe(exp); 
      });
  
    });
  });
  