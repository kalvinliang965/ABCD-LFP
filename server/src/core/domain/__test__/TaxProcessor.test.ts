import { IncomeType, TaxFilingStatus } from "../../Enums";
import { FederalTaxService } from "../../tax/FederalTaxService";
import { StateTaxService } from "../../tax/StateTaxService";
import { TaxBracket } from "../../tax/TaxBrackets";
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
 
    const mock_federal_brackets: TaxBracket[] = [
        { min: 0, max: 10000, rate: 0.1 },
        { min: 10001, max: 40000, rate: 0.12 },
        { min: 40001, max: Infinity, rate: 0.22 }
    ];

    const mock_state_brackets: TaxBracket[] = [
        { min: 0, max: 5000, rate: 0.01 },
        { min: 5001, max: Infinity, rate: 0.05 }
    ];

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
        __taxable_income_bracket: {
            __brackets: new Map([
                [TaxFilingStatus.INDIVIDUAL, mock_federal_brackets]
            ]),
        },
        __capital_gains_bracket: {
            __brackets: new Map([
                [TaxFilingStatus.INDIVIDUAL, mock_federal_brackets]
            ])
        },
      } as unknown as jest.Mocked<FederalTaxService>;
  
      mock_state_service = {
        find_rate: jest.fn(),
        __taxable_income_brackets: {
            __brackets: new Map([[TaxFilingStatus.INDIVIDUAL, mock_state_brackets]])
          },
      } as unknown as jest.Mocked<StateTaxService>;
  
      tax_processor = new TaxProcessor(
        mock_tax_data,
        mock_federal_service,
        mock_state_service,
        () => TaxFilingStatus.INDIVIDUAL
      );
    });
  
    describe("calculateTaxes", () => {
      test("general", () => {

        const calculateTaxSpy = jest
        .spyOn<any, any>(tax_processor as any, 'calculate_tax')
        .mockReturnValue(42);

        mock_tax_data.get_prev_year_early_withdrawal.mockReturnValue(100);

        const total = tax_processor.calculate_taxes();
        
        // calculate_tax is called three times (fed, state, capital gains)
        expect(calculateTaxSpy).toHaveBeenCalledTimes(3);

        // total_tax = 42 + 42 + 42 + 100 * 0.1 = 136
        expect(total).toBe(136);

        calculateTaxSpy.mockRestore(); 
      });
  
      test("calculate income based on taxbracket", () => {
        const tax = (tax_processor as any).calculate_tax(86150, [
            { min: 0, max: 11_000, rate: 0.10 },
            { min: 11_001, max: 44_725, rate: 0.12 },
            { min: 44_726, max: 95_375, rate: 0.22 },
            { min: 95_376, max: 182_100, rate: 0.24 },
            { min: 182_101, max: 231_250, rate: 0.32 },
            { min: 231_251, max: 578_125, rate: 0.35 },
            { min: 578_126, max: Infinity, rate: 0.37 }
        ]);

        const one = 11000 * 0.1; // after paying 11000 -> 75150 left

        // (44725-11001) = 33724 and is less than 75150
        const two = 33724 * 0.12;
        // 75150 - 33724 = 41426

        // (95375 - 44726) = 50649 > 41426
        const three = 41426 * 0.22

        // done with tax...

        expect(tax).toBe(one + two + three);
      })
  
    });
  });
  