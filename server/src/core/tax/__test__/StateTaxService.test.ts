import { StateTaxService } from "../StateTaxService";
import { create_tax_brackets } from "../TaxBrackets";
import { TaxFilingStatus } from "../../Enums";
import { create_state_tax_service_wo, create_state_tax_service_yaml, create_state_tax_service_db } from "../StateTaxService";
import { StateType } from "../../Enums";
import { has_state_data, load_state_taxable_income_brackets, save_state_tax_bracket } from "../../../db/repositories/StateTaxBracketRepository";

jest.mock("../../../db/repositories/StateTaxBracketRepository", () => ({
    save_state_tax_bracket: jest.fn(),
    has_state_data: jest.fn(),
    load_state_taxable_income_brackets: jest.fn(),
}));

describe('StateTaxService', () => {
    describe('Basic Functionality', () => {
        let service: StateTaxService
        const mockBrackets = create_tax_brackets()
      
        beforeEach(() => {
            mockBrackets.add_bracket(0, 50000, 0.1, TaxFilingStatus.SINGLE)
            mockBrackets.add_bracket(50001, Infinity, 0.2, TaxFilingStatus.SINGLE)
            service = create_state_tax_service_wo(mockBrackets)
        })
  
        it('should find correct tax rate', () => {
            expect(service.find_rate(30000, TaxFilingStatus.SINGLE)).toBe(0.1)
            expect(service.find_rate(60000, TaxFilingStatus.SINGLE)).toBe(0.2)
        })
  
        it('should handle income at bracket boundaries', () => {
            expect(service.find_rate(50000, TaxFilingStatus.SINGLE)).toBe(0.1)
            expect(service.find_rate(50001, TaxFilingStatus.SINGLE)).toBe(0.2)
        })
        describe('Inflation Adjustment', () => {
            it('should adjust bracket ranges with inflation', () => {
                service.adjust_for_inflation(0.1) // 10% inflation
                expect(service.find_rate(55000, TaxFilingStatus.SINGLE)).toBe(0.1)
                expect(service.find_rate(55500, TaxFilingStatus.SINGLE)).toBe(0.2)
            })
        })
    })
    describe('Service Cloning', () => {
      it('should create independent instances when cloned', () => {
        const tax_brackets = create_tax_brackets();
        tax_brackets.add_bracket(0, 100, 0.1, TaxFilingStatus.SINGLE);
        const original = create_state_tax_service_wo(tax_brackets)
        const clone = original.clone()
        expect(clone.find_bracket_with_rate(0.1, TaxFilingStatus.SINGLE)).not.toBe(original.find_bracket_with_rate(0.1, TaxFilingStatus.SINGLE))
        tax_brackets.adjust_for_inflation(0.1);
        const original_bracket = original.find_bracket_with_rate(0.1, TaxFilingStatus.SINGLE);
        const cloned_bracket = clone.find_bracket_with_rate(0.1, TaxFilingStatus.SINGLE);
        // check orginal
        expect(original_bracket.min).toBe(0);
        expect(original_bracket.max).toBe(110);
        expect(original_bracket.rate).toBe(0.1)
        // check cloned
        expect(cloned_bracket.min).toBe(0);
        expect(cloned_bracket.max).toBe(100);
        expect(cloned_bracket.rate).toBe(0.1)
      })
    })
    
    // DB
    describe("DB initialization", () => {
        beforeEach(() => {
            // clear mock data
            jest.clearAllMocks();
        });
        it("should retrieve data from database correctly", async ()=> {
            // say there are data in database
            (has_state_data as jest.Mock).mockResolvedValue(true);
            (load_state_taxable_income_brackets as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.SINGLE,
                    resident_state: StateType.CT,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.SINGLE,
                    resident_state: StateType.CT,
                }
                
            ]);
            const service = await create_state_tax_service_db(StateType.CT);
            expect(service.find_rate(200, TaxFilingStatus.SINGLE)).toBe(0.1)
            expect(service.find_rate(5000000, TaxFilingStatus.SINGLE)).toBe(0.2);
            expect(save_state_tax_bracket).not.toHaveBeenCalled();
        });
        it("should throw error if database contain no data", async () => {
            (has_state_data as jest.Mock).mockResolvedValue(false);
            await expect(create_state_tax_service_db(StateType.CT))
                .rejects.toThrow();
        });
        it("should throw error if data return does not match data ask for", async ()=> {
            // say there are data in database
            let exitSpy = jest.spyOn(process, "exit").mockImplementation(()=> {
                throw new Error("process.exit called");
            });
            (has_state_data as jest.Mock).mockResolvedValue(true);
            (load_state_taxable_income_brackets as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.SINGLE,
                    resident_state: StateType.NY,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.SINGLE,
                    resident_state: StateType.NY,
                }
                
            ]);
            await expect(create_state_tax_service_db(StateType.CT))
                .rejects.toThrow("process.exit called");
            expect(exitSpy).toHaveBeenCalled();
            exitSpy.mockRestore();
        });
    }),

    // YAML
    describe('YAML Initialization', () => {
        beforeEach(() => {
            // clear mock state
            jest.clearAllMocks();
        });
        const validYAML = `
            resident_state: "NY"
            tax_brackets:
              - min: 0
                max: 50000
                rate: 0.1
                taxpayer_type: "SINGLE"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "SINGLE"
      `
        it('should create service from valid YAML', async () => {
            const service = await create_state_tax_service_yaml(StateType.NY, validYAML)
            expect(service.find_rate(30000, TaxFilingStatus.SINGLE)).toBe(0.1)
            expect(save_state_tax_bracket).toHaveBeenCalledTimes(2);
        })
  
  
        describe('Error Handling', () => {
            const invalidYAML = `
                resident_state: "NY"
                tax_brackets:
                - min: "invalid"
                    max: 50000
                    rate: 0.1
                    taxpayer_type: "SINGLE"
            `
            it('should reject mismatched state', async () => {
                await expect(create_state_tax_service_yaml(StateType.NJ, validYAML))
                .rejects.toThrow("YAML file resident state does not match");
                expect(save_state_tax_bracket).not.toHaveBeenCalled();
            })
            it('should handle invalid YAML format', async () => {
                await expect(create_state_tax_service_yaml(StateType.NY, invalidYAML))
                .rejects.toThrow("Failed to parse state tax");
                expect(save_state_tax_bracket).not.toHaveBeenCalled();
            })
            it('should handle missing tax brackets', async () => {
                const emptyYAML = `
                resident_state: "NY"
                tax_brackets: []
                `
                await expect(create_state_tax_service_yaml(StateType.NY, emptyYAML))
                .rejects.toThrow("state.yaml is empty");
                expect(save_state_tax_bracket).not.toHaveBeenCalled();
            })
        })
    })
  
  })