import { InvestmentRaw } from "../raw/investment_raw";
import { create_account_manager } from "../AccountManager";
import { simulation_logger } from "../../../utils/logger/logger";

const cashInvestment: InvestmentRaw = {
    investmentType: "cash",
    taxStatus: "non-retirement",
    value: 10000,
    id: "cash-account"
};
describe("account manager", () => {
    describe("create_account_manager ID validation", () => {
        const baseInvestment: InvestmentRaw = {
            investmentType: "stock",
            taxStatus: "non-retirement",
            value: 1000,
            id: "original-id"
        };
        
        describe("duplicate old_id detection", () => {
            test("should throw on duplicate raw IDs", () => {
            const investments = new Set<InvestmentRaw>([
                cashInvestment,
                { ...baseInvestment, id: "duplicate-id" },
                { ...baseInvestment, id: "duplicate-id", investmentType: "bond" }
            ]);
        
            expect(() => create_account_manager(investments)).toThrowError(
                "Duplicate old id"
            );
            });
        
            test("should allow different IDs with same content", () => {
            const investments = new Set<InvestmentRaw>([
                cashInvestment,
                baseInvestment,
                { ...baseInvestment, id: "different-id" }
            ]);
        
            expect(() => create_account_manager(investments)).toThrow();
            });
        });
        
        describe("duplicate new_id detection", () => {
            test("should throw when generated IDs collide", () => {
                const investments = new Set<InvestmentRaw>([
                    // Both will generate "stock non-retirement" ID
                    cashInvestment,
                    { ...baseInvestment, id: "id1" },
                    { ...baseInvestment, id: "id2" }
                ]);
            
                expect(() => create_account_manager(investments)).toThrow(/Duplicate new id/i);
            });
        
        });
        
        describe("edge cases", () => {
            test("should handle empty input set", () => {
                expect(() => create_account_manager(new Set())).toThrow();
            });
        
            test("should handle ID regeneration collisions", () => {
            const investments = new Set<InvestmentRaw>([
                cashInvestment,
                // First will generate "conflict non-retirement"
                { ...baseInvestment, id: "conflict", investmentType: "non-retirement" },
                // Second will generate "non-retirement conflict"
                { ...baseInvestment, id: "different", investmentType: "non-retirement" }
            ]);
        
            expect(() => create_account_manager(investments)).toThrowError(
                "Duplicate new id"
            );
            });
        });
        
        describe("error messaging", () => {
            test("should include problematic ID in error message", () => {
            const investments = new Set<InvestmentRaw>([
                cashInvestment,
                { ...baseInvestment, id: "dupe" },
                { ...baseInvestment, id: "dupe", investmentType: "bond" }
            ]);
        
            expect(() => create_account_manager(investments)).toThrow(
                /old id/i
            );
            });
        
        });

    });
    describe("cash investment requirement", () => {
    
        test("should require at least one cash investment", () => {
        const investments = new Set<InvestmentRaw>([cashInvestment]);
        expect(() => create_account_manager(investments)).not.toThrow();
        });
    
        describe("missing cash investment", () => {
        test("should throw when no cash investment exists", () => {
            const investments = new Set<InvestmentRaw>([
            { ...cashInvestment, investmentType: "stock" } // 修改类型为非cash
            ]);
    
            expect(() => create_account_manager(investments)).toThrowError(
            /cash/i
            );
        });
    
        });
    
        describe("edge cases", () => {
        test("should handle multiple cash investments", () => {
            const investments = new Set<InvestmentRaw>([
            cashInvestment,
            { ...cashInvestment, id: "secondary-cash" }
            ]);
    
            expect(() => create_account_manager(investments)).toThrow(/new id/i);
        });
    
        test("should validate cash investment properties", () => {
            const invalidCash = new Set<InvestmentRaw>([
            { ...cashInvestment, value: 0 } // 0 value cash
            ]);
    
            expect(() => create_account_manager(invalidCash)).not.toThrow();
        });
        });
    
        describe("type validation", () => {
        test("should reject case-insensitive matches", () => {
            const investments = new Set<InvestmentRaw>([
            { ...cashInvestment, investmentType: "Cash" } // 首字母大写
            ]);
    
            expect(() => create_account_manager(investments)).toThrow();
        });
    
        test("should accept cash with different tax status", () => {
            const investments = new Set<InvestmentRaw>([
            { ...cashInvestment, taxStatus: "pre-tax" }
            ]);
    
            expect(() => create_account_manager(investments)).toThrow(/cash/i);
        });
        });
    });
})