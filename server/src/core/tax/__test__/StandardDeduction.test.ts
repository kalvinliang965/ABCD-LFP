import exp from "constants";
import { TaxFilingStatus } from "../../Enums";
import { create_standard_deductions, StandardDeduction } from "../StandardDeduction";


describe("Standard deduction", () => {

    let base_deduction: StandardDeduction;
    beforeEach(() => {
        base_deduction = create_standard_deductions();
        base_deduction.add_deduction(2000, TaxFilingStatus.SINGLE);
        base_deduction.add_deduction(5000, TaxFilingStatus.MARRIED);
    });

    describe("Basic functionality", () => {
        it("should find correct deduction", ()=> {
            expect(base_deduction.find_deduction(TaxFilingStatus.SINGLE)).toBe(2000);
            expect(base_deduction.find_deduction(TaxFilingStatus.MARRIED)).toBe(5000);
        });

        it("Should stop user from adding deduction more than once", () => {
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
                throw new Error(`process.exit(${code})`);
            });
            try {
                base_deduction.add_deduction(0.663, TaxFilingStatus.SINGLE);
                base_deduction.add_deduction(0.663, TaxFilingStatus.MARRIED);
            }catch(error){
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toMatch("process.exit(1)");
                }
            } finally {
                exitSpy.mockRestore();
            }
        });

        it("should clone correctly", () => {
            const cloned_deduction = base_deduction.clone();
            cloned_deduction.adjust_for_inflation(0.02);
            expect(cloned_deduction.find_deduction(TaxFilingStatus.SINGLE)).not.toBe(2000);
            expect(cloned_deduction.find_deduction(TaxFilingStatus.MARRIED)).not.toBe(5000);
            
        });

        it("should adjust for inflation", () => {
            const cloned_deduction = base_deduction.clone();
            cloned_deduction.adjust_for_inflation(0.02);
            expect(cloned_deduction.find_deduction(TaxFilingStatus.SINGLE)).toBe(Math.round(2000 * (1.02)));
            expect(cloned_deduction.find_deduction(TaxFilingStatus.MARRIED)).toBe(Math.round(5000 * (1.02)));
        })
    })
})