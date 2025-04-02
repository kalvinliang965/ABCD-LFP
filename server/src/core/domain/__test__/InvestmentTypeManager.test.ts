import { InvestmentTypeRaw, tax_exempt_bonds_investment_type_one } from "../raw/investment_type_raw";
import { create_investment_type_manager } from "../InvestmentTypeManager";
import { cash_investment_type_one, s_and_p_500_investment_type_one} from "../raw/investment_type_raw";
import { create_investment_type } from "../investment/InvestmentType";

describe("InvestmentTypeManager clone", () => {
    const mockRawData: InvestmentTypeRaw[] = [
        cash_investment_type_one,
        s_and_p_500_investment_type_one,
    ];
    describe("basic functionality", () => {
        
        it("should tell if it contain the element", () => {
            const data = create_investment_type_manager(new Set(mockRawData));
            expect(data.has(cash_investment_type_one.name)).toBe(true)
            expect(data.has(s_and_p_500_investment_type_one.name)).toBe(true);
        });
    });
    it("clone shouldn't impact orginal data", () => {
        const original = create_investment_type_manager(new Set(mockRawData));
        const cloned = original.clone();
        cloned.set(tax_exempt_bonds_investment_type_one.name, create_investment_type(tax_exempt_bonds_investment_type_one));
        expect(original.has(tax_exempt_bonds_investment_type_one.name)).toBe(false);
        expect(cloned.has(tax_exempt_bonds_investment_type_one.name)).toBe(true);
    });
  
    it("should clone and return independent object", () => {
        const original = create_investment_type_manager(new Set(mockRawData));
        const cloned = original.clone();
        const originalTypeA = original.get(cash_investment_type_one.name);
        const clonedTypeA = cloned.get(cash_investment_type_one.name);
        // different reference
        expect(originalTypeA).not.toBe(clonedTypeA);
    });
  
    it("should clone and return independent object from empty", () => {
        const original = create_investment_type_manager(new Set());
        const cloned = original.clone();
        expect(cloned.has("AnyType")).toBe(false);
        cloned.set("TypeD", create_investment_type(cash_investment_type_one));
        expect(original.has("TypeD")).toBe(false);
    });
  
  });