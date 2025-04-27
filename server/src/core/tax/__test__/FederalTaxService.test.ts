// FederalTaxService.test.ts
import { create_standard_deductions, StandardDeduction } from '../StandardDeduction';
import { get_standard_deduction } from '../../../db/repositories/StandardDeductionRepository';
import { create_tax_brackets, TaxBrackets } from '../TaxBrackets';
import { TaxFilingStatus, IncomeType } from '../../Enums';
import { FederalTaxService, create_federal_tax_service } from '../FederalTaxService';
import { get_capital_gains_brackets, get_taxable_income_brackets } from '../../../db/repositories/TaxBracketRepository';
import { create_federal_service_wo } from '../FederalTaxService';

jest.mock('../../../db/repositories/TaxBracketRepository');
jest.mock("../../../db/repositories/StandardDeductionRepository");
jest.mock("../../../services/FederalTaxScraper");

describe("FederalTaxService", () => {
  
    describe("Initialization without database", () => {
        let service: FederalTaxService;
        const mock_taxable_income_bracket = {
            find_bracket_with_rate: jest.fn(),
            find_bracket_with_income: jest.fn(),
            find_rate: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock Taxable income Bracket",
            clone: jest.fn(),
        } as unknown as TaxBrackets;

        const mock_capital_gains_bracket = {
            find_bracket_with_rate: jest.fn(),
            find_bracket_with_income: jest.fn(),
            find_rate: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock capital gains Bracket",
            clone: jest.fn(),
        } as unknown as TaxBrackets;

        const mockStandardDeduction = {
            add_deduction: jest.fn(),
            find_deduction: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock Standard Deduction",
            clone: jest.fn(),
        } as unknown as StandardDeduction;
        beforeEach(async() => {
            service = create_federal_service_wo(mock_taxable_income_bracket, mock_capital_gains_bracket, mockStandardDeduction);
        })
        describe("Core Functionality", () => {
            it("should adjust all components for inflation", () => {
                service.adjust_for_inflation(0.02);
                expect(mock_taxable_income_bracket.adjust_for_inflation).toHaveBeenCalledWith(0.02);
                expect(mock_capital_gains_bracket.adjust_for_inflation).toHaveBeenCalledWith(0.02);
                expect(mockStandardDeduction.adjust_for_inflation).toHaveBeenCalledWith(0.02);
            });

            describe("find_bracket with rate", () => {
                it("should handle taxable income type", () => {
                    service.find_bracket_with_rate(0.05, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL);
                    expect(mock_taxable_income_bracket.find_bracket_with_rate).toHaveBeenCalledWith(0.05, TaxFilingStatus.INDIVIDUAL);
                });

                it("should handle capital gains type", () => {
                    service.find_bracket_with_rate(0.10, IncomeType.CAPITAL_GAINS, TaxFilingStatus.COUPLE);
                    expect(mock_capital_gains_bracket.find_bracket_with_rate).toHaveBeenCalledWith(0.10, TaxFilingStatus.COUPLE);
                });

                it("should throw for invalid income type", () => {
                    expect(() => service.find_bracket_with_rate(0.3, "INVALID" as IncomeType, TaxFilingStatus.INDIVIDUAL))
                    .toThrow("invalid income type");
                });
            });
        });

        describe("Edge Cases", () => {
            it("should clone service with independent instances", async () => {
                const clone = service.clone();
                expect(mock_taxable_income_bracket.clone).toHaveBeenCalled();
                expect(mock_capital_gains_bracket.clone).toHaveBeenCalled();
                expect(mockStandardDeduction.clone).toHaveBeenCalled();
            });

        });
    });

    describe("Initialization from database", () => {
        let service: FederalTaxService;
        beforeEach(async () => {
            // Mock database responses
            (get_taxable_income_brackets as jest.Mock)
                .mockResolvedValue([
                    {
                        min: 0,
                        max: 3000,
                        rate: 0.05,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.INDIVIDUAL
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.10,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    },{
                        min: 0,
                        max: 3000,
                        rate: 0.10,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.COUPLE,
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.2,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.COUPLE
                    }
                ]);
            (get_capital_gains_brackets as jest.Mock)
                .mockResolvedValue([
                    {
                        min: 0,
                        max: 3000,
                        rate: 0.05,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.INDIVIDUAL
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.10,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    },{
                        min: 0,
                        max: 3000,
                        rate: 0.10,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.COUPLE,
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.20,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.COUPLE
                    }
                ]);
            (get_standard_deduction as jest.Mock)
            .mockResolvedValue([{ amount: 1000, taxpayer_type: TaxFilingStatus.INDIVIDUAL }, {amount: 2000, taxpayer_type: TaxFilingStatus.COUPLE}]);

            // Create service instance
            service = await create_federal_tax_service();
        });
        it("should initialize with database data", async () => {
            expect(get_taxable_income_brackets).toHaveBeenCalled();
            expect(get_capital_gains_brackets).toHaveBeenCalled();
            expect(get_standard_deduction).toHaveBeenCalled();
        });
        describe("find_deduction", () => {
            it("should return correct deduction amount", () => {
                const single_deduction = service.find_deduction(TaxFilingStatus.INDIVIDUAL);
                expect(single_deduction).toEqual(1000);
                const double_deduction = service.find_deduction(TaxFilingStatus.COUPLE);
                expect(double_deduction).toEqual(2000);
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Initialization General", () => {
        it("should handle initialization failures", async () => {
            (get_taxable_income_brackets as jest.Mock)
                .mockResolvedValue([]);
            
            (get_capital_gains_brackets as jest.Mock)
                .mockResolvedValue([]);
        
            (get_standard_deduction as jest.Mock)
                .mockResolvedValue([]);
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
                throw new Error(`process.exit(${code})`);
            });
            try {
                create_federal_tax_service();
            }catch(error){
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toMatch("process.exit(1)");
                }
            } finally {
                exitSpy.mockRestore();
            }
        });

    })
    describe("FederalTaxService Year-over-Year Tests", () => {
        let service: FederalTaxService;
        
        beforeEach(async () => {
          const mock_taxable_brackets = create_tax_brackets();
          mock_taxable_brackets.add_bracket(0, 10000, 0.10, TaxFilingStatus.INDIVIDUAL);
          mock_taxable_brackets.add_bracket(10001, 40000, 0.20, TaxFilingStatus.INDIVIDUAL);
          mock_taxable_brackets.add_bracket(40001, Infinity, 0.30, TaxFilingStatus.INDIVIDUAL);

          const mock_capital_gains_brackets = create_tax_brackets();
          mock_capital_gains_brackets.add_bracket(0, 5000, 0.05, TaxFilingStatus.INDIVIDUAL);
          mock_capital_gains_brackets.add_bracket(5001, Infinity, 0.15, TaxFilingStatus.INDIVIDUAL);
          

          const mock_deductions = create_standard_deductions();
          mock_deductions.add_deduction(12000, TaxFilingStatus.INDIVIDUAL);
          mock_deductions.add_deduction(24000, TaxFilingStatus.COUPLE);
          
          service = create_federal_service_wo(
            mock_taxable_brackets,
            mock_capital_gains_brackets,
            mock_deductions
          )
        });
      
        describe("Inflation Adjustment and Previous Year Data", () => {
          it("should retain previous year's brackets after inflation adjustment", () => {
            const pre_adjustment_rate = service.find_rate(5000, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL);
            
            service.adjust_for_inflation(0.03);
            
            expect(service.find_rate(5000, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL)).toBeCloseTo(pre_adjustment_rate * (1 + 0.03));
            const prev_rate = service.find_prev_rate(5000, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL);
            expect(prev_rate).toEqual(pre_adjustment_rate);
          });
      
          it("should calculate capital gains using previous year's brackets", () => {
            const initialRate = service.find_rate(3000, IncomeType.CAPITAL_GAINS, TaxFilingStatus.INDIVIDUAL);
            service.adjust_for_inflation(0.05);
            expect(service.find_prev_rate(3000, IncomeType.CAPITAL_GAINS, TaxFilingStatus.INDIVIDUAL)).toEqual(initialRate);
          });
      
          it("should maintain independent brackets after cloning", () => {
            const clonedService = service.clone();
            service.adjust_for_inflation(0.05);
            expect(clonedService.find_bracket_with_rate(0.3, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL))
              .not.toEqual(service.find_bracket_with_rate(0.3, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL));
          });
        });
      
        describe("Boundary Conditions", () => {
          it("should handle income at bracket boundaries", () => {
            expect(service.find_rate(10000, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL)).toEqual(0.10);
            expect(service.find_rate(10001, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL)).toEqual(0.20);
          });
      
          it("should handle infinite upper bounds", () => {
            expect(service.find_rate(100000, IncomeType.TAXABLE_INCOME, TaxFilingStatus.INDIVIDUAL)).toEqual(0.30);
          });
        });
      
        describe("Error Handling", () => {
          it("should throw when accessing previous data without adjustment", () => {
            expect(() => service.find_prev_deduction(TaxFilingStatus.INDIVIDUAL))
              .toThrow("Previous year data not available");
          });
      
          it("should validate income type during bracket lookup", () => {
            expect(() => service.find_bracket_with_rate(0.1, "INVALID_TYPE" as IncomeType, TaxFilingStatus.INDIVIDUAL))
              .toThrow("invalid income type");
          });
        });
      });
      
      describe("Database Initialization Edge Cases", () => {
        it("should handle corrupted database entries", async () => {
          (get_taxable_income_brackets as jest.Mock).mockResolvedValueOnce([
            { income_type: "INVALID_TYPE", taxpayer_type: TaxFilingStatus.INDIVIDUAL }
          ]);
          const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
          const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
          await create_federal_tax_service();
          expect(exitSpy).toHaveBeenCalledWith(1);
        });
      });
});