// FederalTaxService.test.ts
import { StandardDeduction } from '../StandardDeduction';
import { load_standard_deduction } from '../../../db/repositories/StandardDeductionRepository';
import { TaxBrackets } from '../TaxBrackets';
import { TaxFilingStatus, IncomeType } from '../../Enums';
import { FederalTaxService, create_federal_tax_service } from '../FederalTaxService';
import { load_capital_gains_brackets, load_taxable_income_brackets } from '../../../db/repositories/TaxBracketRepository';
import { create_federal_service_wo } from '../FederalTaxService';

jest.mock('../../../db/repositories/TaxBracketRepository');
jest.mock("../../../db/repositories/StandardDeductionRepository");
jest.mock("../../../services/FederalTaxScraper");

describe("FederalTaxService", () => {
  
    describe("Initialization without database", () => {
        let service: FederalTaxService;
        const mock_taxable_income_bracket = {
            find_bracket: jest.fn(),
            find_rate: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock Taxable income Bracket"
        } as unknown as TaxBrackets;

        const mock_capital_gains_bracket = {
            find_bracket: jest.fn(),
            find_rate: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock capital gains Bracket"
        } as unknown as TaxBrackets;

        const mockStandardDeduction = {
            add_deduction: jest.fn(),
            find_deduction: jest.fn(),
            adjust_for_inflation: jest.fn(),
            to_string: () => "Mock Standard Deduction"
        } as unknown as StandardDeduction;
        beforeEach(async() => {
            service = await create_federal_service_wo(mock_taxable_income_bracket, mock_capital_gains_bracket, mockStandardDeduction);
        })
        describe("Core Functionality", () => {
            it("should adjust all components for inflation", () => {
                service.adjust_for_inflation(0.02);
                expect(mock_taxable_income_bracket.adjust_for_inflation).toHaveBeenCalledWith(0.02);
                expect(mock_capital_gains_bracket.adjust_for_inflation).toHaveBeenCalledWith(0.02);
                expect(mockStandardDeduction.adjust_for_inflation).toHaveBeenCalledWith(0.02);
            });

            describe("find_bracket", () => {
                it("should handle taxable income type", () => {
                    service.find_bracket(0.05, IncomeType.TAXABLE_INCOME, TaxFilingStatus.SINGLE);
                    expect(mock_taxable_income_bracket.find_bracket).toHaveBeenCalledWith(0.05, TaxFilingStatus.SINGLE);
                });

                it("should handle capital gains type", () => {
                    service.find_bracket(0.10, IncomeType.CAPITAL_GAINS, TaxFilingStatus.MARRIED);
                    expect(mock_capital_gains_bracket.find_bracket).toHaveBeenCalledWith(0.10, TaxFilingStatus.MARRIED);
                });

                it("should throw for invalid income type", () => {
                    expect(() => service.find_bracket(0.3, "INVALID" as IncomeType, TaxFilingStatus.SINGLE))
                    .toThrow("invalid income type");
                });
            });

            describe("find_rate", () => {
                it("should calculate capital gains rate", () => {
                    (mock_capital_gains_bracket.find_rate as jest.Mock).mockReturnValue(0.15);
                    const rate = service.find_rate(3000, IncomeType.CAPITAL_GAINS, TaxFilingStatus.SINGLE);
                    expect(rate).toEqual(0.15);
                });
            });

        });

        describe("Edge Cases", () => {
            it("should clone service with independent instances", async () => {
              const clone = await service.clone();
              clone.adjust_for_inflation(0.03);
              expect(mock_taxable_income_bracket.adjust_for_inflation).toHaveBeenCalledTimes(1);
            });

        });
    });

    describe("Initialization from database", () => {
        let service: FederalTaxService;
        beforeEach(async () => {
            // Mock database responses
            (load_taxable_income_brackets as jest.Mock)
                .mockResolvedValue([
                    {
                        min: 0,
                        max: 3000,
                        rate: 0.05,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.SINGLE
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.10,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.SINGLE,
                    },{
                        min: 0,
                        max: 3000,
                        rate: 0.10,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.MARRIED,
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.2,
                        income_type: IncomeType.TAXABLE_INCOME,
                        taxpayer_type: TaxFilingStatus.MARRIED
                    }
                ]);
            (load_capital_gains_brackets as jest.Mock)
                .mockResolvedValue([
                    {
                        min: 0,
                        max: 3000,
                        rate: 0.05,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.SINGLE
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.10,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.SINGLE,
                    },{
                        min: 0,
                        max: 3000,
                        rate: 0.10,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.MARRIED,
                    },{
                        min: 3001,
                        max: Infinity,
                        rate: 0.20,
                        income_type: IncomeType.CAPITAL_GAINS,
                        taxpayer_type: TaxFilingStatus.MARRIED
                    }
                ]);
            (load_standard_deduction as jest.Mock)
            .mockResolvedValue([{ amount: 1000, taxpayer_type: TaxFilingStatus.SINGLE }, {amount: 2000, taxpayer_type: TaxFilingStatus.MARRIED}]);

            // Create service instance
            service = await create_federal_tax_service();
        });
        it("should initialize with database data", async () => {
            expect(load_taxable_income_brackets).toHaveBeenCalled();
            expect(load_capital_gains_brackets).toHaveBeenCalled();
            expect(load_standard_deduction).toHaveBeenCalled();
        });
        describe("find_deduction", () => {
            it("should return correct deduction amount", () => {
                const single_deduction = service.find_deduction(TaxFilingStatus.SINGLE);
                expect(single_deduction).toEqual(1000);
                const double_deduction = service.find_deduction(TaxFilingStatus.MARRIED);
                expect(double_deduction).toEqual(2000);
            });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Initialization General", () => {
        it("should handle initialization failures", async () => {
            (load_taxable_income_brackets as jest.Mock)
                .mockResolvedValue([]);
            
            (load_capital_gains_brackets as jest.Mock)
                .mockResolvedValue([]);
        
            (load_standard_deduction as jest.Mock)
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
});