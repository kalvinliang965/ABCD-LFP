import { StateTaxService } from "../StateTaxService";
import { create_tax_brackets } from "../TaxBrackets";
import { TaxFilingStatus } from "../../Enums";
import { create_state_tax_service_wo, create_state_tax_service } from "../StateTaxService";
import { StateType } from "../../Enums";
import { state_taxbrackets_exist_in_db, get_state_taxbrackets_by_state, create_state_taxbracket_in_db } from "../../../db/repositories/StateTaxBracketRepository";

jest.mock("../../../db/repositories/StateTaxBracketRepository", () => ({
    create_state_taxbracket_in_db: jest.fn(),
    state_taxbrackets_exist_in_db: jest.fn(),
    get_state_taxbrackets_by_state: jest.fn(),
}));

describe('StateTaxService', () => {
    describe('Basic Functionality', () => {
        let service: StateTaxService
        const mockBrackets = create_tax_brackets()
      
        beforeEach(() => {
            mockBrackets.add_bracket(0, 50000, 0.1, TaxFilingStatus.INDIVIDUAL)
            mockBrackets.add_bracket(50001, Infinity, 0.2, TaxFilingStatus.INDIVIDUAL)
            service = create_state_tax_service_wo(mockBrackets)
        })
  
        it('should find correct tax rate', () => {
            expect(service.find_rate(30000, TaxFilingStatus.INDIVIDUAL)).toBe(0.1)
            expect(service.find_rate(60000, TaxFilingStatus.INDIVIDUAL)).toBe(0.2)
        })
  
        it('should handle income at bracket boundaries', () => {
            expect(service.find_rate(50000, TaxFilingStatus.INDIVIDUAL)).toBe(0.1)
            expect(service.find_rate(50001, TaxFilingStatus.INDIVIDUAL)).toBe(0.2)
        })
        describe('Inflation Adjustment', () => {
            it('should adjust bracket ranges with inflation', () => {
                service.adjust_for_inflation(0.1) // 10% inflation
                expect(service.find_rate(55000, TaxFilingStatus.INDIVIDUAL)).toBe(0.1)
                expect(service.find_rate(55500, TaxFilingStatus.INDIVIDUAL)).toBe(0.2)
            })
        })
    })
    describe('Service Cloning', () => {
      it('should create independent instances when cloned', () => {
        const tax_brackets = create_tax_brackets();
        tax_brackets.add_bracket(0, 100, 0.1, TaxFilingStatus.INDIVIDUAL);
        tax_brackets.add_bracket(101, Infinity, 0.2, TaxFilingStatus.INDIVIDUAL);
        const original = create_state_tax_service_wo(tax_brackets)
        const clone = original.clone();
        expect(clone.find_bracket_with_rate(0.1, TaxFilingStatus.INDIVIDUAL)).toEqual(original.find_bracket_with_rate(0.1, TaxFilingStatus.INDIVIDUAL))
        
        tax_brackets.adjust_for_inflation(0.1);
        
        const original_bracket = original.find_bracket_with_rate(0.1, TaxFilingStatus.INDIVIDUAL);
        const cloned_bracket = clone.find_bracket_with_rate(0.1, TaxFilingStatus.INDIVIDUAL);
        
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
    
    describe("DB initialization", () => {
        beforeEach(() => {
            // clear mock data
            jest.clearAllMocks();
        });
        it("should retrieve data from database correctly", async ()=> {
            // say there are data in database
            (state_taxbrackets_exist_in_db as jest.Mock).mockResolvedValue(true);
            (get_state_taxbrackets_by_state as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.CT,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.CT,
                },
                {
                    min: 0,
                    max: 5000,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.CT,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.4,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.CT,
                }
            ]);
            const service = await create_state_tax_service(StateType.CT);
            expect(service.find_rate(200, TaxFilingStatus.INDIVIDUAL)).toBe(0.1)
            expect(service.find_rate(5000000, TaxFilingStatus.INDIVIDUAL)).toBe(0.2);
            expect(service.find_rate(200, TaxFilingStatus.COUPLE)).toBe(0.2)
            expect(service.find_rate(5000000, TaxFilingStatus.COUPLE)).toBe(0.4);
            expect(create_state_taxbracket_in_db).not.toHaveBeenCalled();
        });
        it("should throw an error if data base don't contain data for couple", async ()=> {
            // say there are data in database
            (state_taxbrackets_exist_in_db as jest.Mock).mockResolvedValue(true);
            (get_state_taxbrackets_by_state as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.CT,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.CT,
                }
                
            ]);
            await expect(create_state_tax_service(StateType.CT))
            .rejects
            .toThrow(/couple/i);
            expect(create_state_taxbracket_in_db).not.toHaveBeenCalled();
        });
        it("should throw an error if data base don't contain data for couple", async ()=> {
            // say there are data in database
            (state_taxbrackets_exist_in_db as jest.Mock).mockResolvedValue(true);
            (get_state_taxbrackets_by_state as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.CT,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.CT,
                }
                
            ]);
            await expect(create_state_tax_service(StateType.CT))
            .rejects
            .toThrow(/individual/i);
            expect(create_state_taxbracket_in_db).not.toHaveBeenCalled();
        });
        it("should throw error if database contain no data", async () => {
            (state_taxbrackets_exist_in_db as jest.Mock).mockResolvedValue(false);
            expect(create_state_tax_service(StateType.CT)).not.toBeNull();
        });
        it("should throw error if data return does not match data ask for", async ()=> {
            // say there are data in database
            let exitSpy = jest.spyOn(process, "exit").mockImplementation(()=> {
                throw new Error("process.exit called");
            });
            (state_taxbrackets_exist_in_db as jest.Mock).mockResolvedValue(true);
            (get_state_taxbrackets_by_state as jest.Mock).mockResolvedValue([
                {
                    min: 0,
                    max: 5000,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                },
                {
                    min: 0,
                    max: 5000,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                }, {
                    min: 5001,
                    max: Infinity,
                    rate: 0.4,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                }
                
            ]);
            await expect(create_state_tax_service(StateType.CT))
                .rejects.toThrow("process.exit called");
            expect(exitSpy).toHaveBeenCalled();
            exitSpy.mockRestore();
        });
    })

  
  });