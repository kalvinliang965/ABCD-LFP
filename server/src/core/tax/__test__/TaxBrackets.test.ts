// src/core/tax/TaxBrackets.test.ts
import exp from "constants";
import { TaxFilingStatus } from "../../Enums";
import { create_tax_brackets, TaxBracket, TaxBrackets } from "../TaxBrackets";

describe("TaxBrackets", () => {

    let base_bracket: TaxBrackets;

    beforeEach(() => {
        base_bracket = create_tax_brackets();
        
        base_bracket.add_rate(0, 3000, 0.10, TaxFilingStatus.SINGLE);
        base_bracket.add_rate(0, 3000, 0.20, TaxFilingStatus.MARRIED);
        
        base_bracket.add_rate(3001, 7000, 0.13, TaxFilingStatus.SINGLE);
        base_bracket.add_rate(3001, 7000, 0.23, TaxFilingStatus.MARRIED);

        base_bracket.add_rate(7001, 10000, 0.23, TaxFilingStatus.SINGLE);
        base_bracket.add_rate(7001, 10000, 0.33, TaxFilingStatus.MARRIED);

        base_bracket.add_rate(10001, Infinity, 0.4, TaxFilingStatus.SINGLE);
        base_bracket.add_rate(10001, Infinity, 0.5, TaxFilingStatus.MARRIED);
    });

    describe("Basic functionalty", () => {
        it("should be able to get the highest rate in table", () => {
            let bracket: TaxBracket | undefined = base_bracket.find_highest_bracket(TaxFilingStatus.SINGLE);
            expect(bracket).not.toBe(undefined);
            expect((bracket as TaxBracket).rate).toBe(0.4);
            bracket = base_bracket.find_highest_bracket(TaxFilingStatus.MARRIED);
            expect(bracket).not.toBe(undefined);
            expect((bracket as TaxBracket).rate).toBe(0.5);
        })
        it ("should be able to adjust for inflation", () => {
            const cloned_bracket = base_bracket.clone();
            cloned_bracket.adjust_for_inflation(0.05);
            let bracket;
            bracket = cloned_bracket.find_bracket(0.1, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBeCloseTo(0);
            expect(bracket.max).toBeCloseTo(3150);
            expect(bracket.rate).toBeCloseTo(0.1);

            bracket = cloned_bracket.find_bracket(0.2, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBeCloseTo(0);
            expect(bracket.max).toBeCloseTo(3150);
            expect(bracket.rate).toBeCloseTo(0.2);


            bracket = cloned_bracket.find_bracket(0.13, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBeCloseTo(3151);
            expect(bracket.max).toBeCloseTo(7350);
            expect(bracket.rate).toBeCloseTo(0.13);

            bracket = cloned_bracket.find_bracket(0.23, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBeCloseTo(3151);
            expect(bracket.max).toBeCloseTo(7350);
            expect(bracket.rate).toBeCloseTo(0.23);

            bracket = cloned_bracket.find_bracket(0.23, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBeCloseTo(7351);
            expect(bracket.max).toBeCloseTo(10500);
            expect(bracket.rate).toBeCloseTo(0.23);

            bracket = cloned_bracket.find_bracket(0.33, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBeCloseTo(7351);
            expect(bracket.max).toBeCloseTo(10500);
            expect(bracket.rate).toBeCloseTo(0.33);
            
            bracket = cloned_bracket.find_bracket(0.4, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBeCloseTo(10501);
            expect(bracket.max).toBeCloseTo(Infinity);
            expect(bracket.rate).toBeCloseTo(0.4);

            bracket = cloned_bracket.find_bracket(0.5, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBeCloseTo(10501);
            expect(bracket.max).toBeCloseTo(Infinity);
            expect(bracket.rate).toBeCloseTo(0.5);
        });
        it("should retrieve rate based on taxable income", () => {
            let rate;
            for (let i = 0; i < 3000; ++i) {
                rate = base_bracket.find_rate(i, TaxFilingStatus.SINGLE);
                expect(rate).toBe(0.1);
                rate = base_bracket.find_rate(i, TaxFilingStatus.MARRIED);
                expect(rate).toBe(0.2);
            }
            for (let i = 3001; i < 7000; ++i) {
                rate = base_bracket.find_rate(i, TaxFilingStatus.SINGLE);
                expect(rate).toBe(0.13);
                rate = base_bracket.find_rate(i, TaxFilingStatus.MARRIED);
                expect(rate).toBe(0.23);
            }
            for (let i = 7001; i < 10000; ++i) {
                rate = base_bracket.find_rate(i, TaxFilingStatus.SINGLE);
                expect(rate).toBe(0.23);
                rate = base_bracket.find_rate(i, TaxFilingStatus.MARRIED);
                expect(rate).toBe(0.33);
            }
            for (let i = 10001; i < 20000; ++i) {
                rate = base_bracket.find_rate(i, TaxFilingStatus.SINGLE);
                expect(rate).toBe(0.4);
                rate = base_bracket.find_rate(i, TaxFilingStatus.MARRIED);
                expect(rate).toBe(0.5);
            }
            rate = base_bracket.find_rate(50000000, TaxFilingStatus.SINGLE);
            expect(rate).toBe(0.4);
            rate = base_bracket.find_rate(50000000, TaxFilingStatus.MARRIED);
            expect(rate).toBe(0.5);
        });

        it("should retrieve bracket correctly based on rate", ()=>{
            let bracket;
            bracket = base_bracket.find_bracket(0.1, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBe(0);
            expect(bracket.max).toBe(3000);
            expect(bracket.rate).toBe(0.1);

            bracket = base_bracket.find_bracket(0.2, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBe(0);
            expect(bracket.max).toBe(3000);
            expect(bracket.rate).toBe(0.2);


            bracket = base_bracket.find_bracket(0.13, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBe(3001);
            expect(bracket.max).toBe(7000);
            expect(bracket.rate).toBe(0.13);

            bracket = base_bracket.find_bracket(0.23, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBe(3001);
            expect(bracket.max).toBe(7000);
            expect(bracket.rate).toBe(0.23);

            bracket = base_bracket.find_bracket(0.23, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBe(7001);
            expect(bracket.max).toBe(10000);
            expect(bracket.rate).toBe(0.23);

            bracket = base_bracket.find_bracket(0.33, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBe(7001);
            expect(bracket.max).toBe(10000);
            expect(bracket.rate).toBe(0.33);
            
            bracket = base_bracket.find_bracket(0.4, TaxFilingStatus.SINGLE);
            expect(bracket.min).toBe(10001);
            expect(bracket.max).toBe(Infinity);
            expect(bracket.rate).toBe(0.4);

            bracket = base_bracket.find_bracket(0.5, TaxFilingStatus.MARRIED);
            expect(bracket.min).toBe(10001);
            expect(bracket.max).toBe(Infinity);
            expect(bracket.rate).toBe(0.5);
        });
        it("should throw an error when doesnt cover full range", () => {
            let exitSpy = jest.spyOn(process, "exit").mockImplementation(()=> {
                throw new Error("process.exit called");
            });
            for (let i = 0; i < 100; ++i) {
                const target = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                base_bracket.find_rate(target, TaxFilingStatus.SINGLE);
                base_bracket.find_rate(target, TaxFilingStatus.MARRIED);
            }
            expect(exitSpy).not.toHaveBeenCalled();

        });
        it("should handle invalid rate exits", async () => {
            const exitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number) => {
                throw new Error(`process.exit(${code})`);
            });
            try {
                base_bracket.find_bracket(0.663, TaxFilingStatus.SINGLE);
                base_bracket.find_bracket(0.663, TaxFilingStatus.MARRIED);
            }catch(error){
                expect(error).toBeInstanceOf(Error);
                if (error instanceof Error) {
                    expect(error.message).toMatch("process.exit(1)");
                }
            } finally {
                exitSpy.mockRestore();
            }
        });
    });
    describe("Test clone", ()=> {
        it("should clone correctly", () => {
            const cloned: TaxBrackets = base_bracket.clone();
            cloned.adjust_for_inflation(0.02);

            function test(rate: number, status: TaxFilingStatus) {
                const bracket = base_bracket.find_bracket(rate, status);
                const cloned_bracket = cloned.find_bracket(rate, status);
                if (bracket.min == 0) {
                    expect(cloned_bracket.min).toBe(bracket.min);
                } else {
                    expect(cloned_bracket.min).not.toBe(bracket.min);
                }
                expect(cloned_bracket.min).toBe(Math.round(bracket.min * 1.02))
                if (bracket.max ==  Infinity) {
                    expect(cloned_bracket.max).toBe(bracket.max);
                } else {
                    expect(cloned_bracket.max).not.toBe(bracket.max);
                }
                expect(cloned_bracket.max).toBe(Math.round(bracket.max * 1.02));
                expect(cloned_bracket.rate).toBe(bracket.rate);
            }
            test(0.1, TaxFilingStatus.SINGLE);
            test(0.2, TaxFilingStatus.MARRIED);

            test(0.13, TaxFilingStatus.SINGLE);
            test(0.23, TaxFilingStatus.MARRIED);

            test(0.23, TaxFilingStatus.SINGLE);
            test(0.33, TaxFilingStatus.MARRIED);

            test(0.4, TaxFilingStatus.SINGLE);
            test(0.5, TaxFilingStatus.MARRIED);
            
        });
    })


})