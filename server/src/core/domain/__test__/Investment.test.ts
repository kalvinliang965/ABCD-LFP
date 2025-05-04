import {
  create_investment_type_raw,
  cash_investment_type_one,
  s_and_p_500_investment_type_one,
  tax_exempt_bonds_investment_type_one,
} from "../raw/investment_type_raw";
import { InvestmentRaw } from "../raw/investment_raw";
import { TaxStatus } from "../../Enums";
import { create_investment, Investment } from "../investment/Investment";
import { create_investment_type } from "../investment/InvestmentType";

describe("create_investment", () => {
    const baseRawData: InvestmentRaw = {
      investmentType: cash_investment_type_one.name,
      value: 1000,
      taxStatus: "non-retirement",
      id: "test-investment"
    };
  
    // Test tax status conversions
    test.each([
      ["non-retirement", TaxStatus.NON_RETIREMENT],
      ["pre-tax", TaxStatus.PRE_TAX],
      ["after-tax", TaxStatus.AFTER_TAX]
    ])("should convert %s tax status correctly", (input, expected) => {
      const investment = create_investment({ ...baseRawData, taxStatus: input as "non-retirement" | "pre-tax" | "after-tax"
  
       });
      expect(investment.tax_status).toBe(expected);
    });
  
    // Test value initialization
    test.each([0, 100, -500])("should handle value %d correctly", (value) => {
      const investment = create_investment({ ...baseRawData, value });
      expect(investment.get_value()).toBe(value);
    });
  
    // Test cost basis initialization
    test("should initialize cost basis to original value", () => {
      const investment = create_investment(baseRawData);
      expect(investment.get_cost_basis()).toBe(baseRawData.value);
    });
  
    // Test value increment
    test("should increment value correctly", () => {
      const investment = create_investment(baseRawData);
      investment.incr_value(500);
      expect(investment.get_value()).toBe(1500);
    });
  
    // Test cost basis increment
    test("should increment cost basis correctly", () => {
      const investment = create_investment(baseRawData);
      investment.incr_cost_basis(300);
      expect(investment.get_cost_basis()).toBe(300 + baseRawData.value);
    });
  
    // Test retirement status
    test.each([
      ["non-retirement", false],
      ["pre-tax", true],
      ["after-tax", true]
    ])("should detect retirement status for %s", (status, expected) => {
      const investment = create_investment({ ...baseRawData, taxStatus: status as "non-retirement" | "pre-tax" | "after-tax" });
      expect(investment.is_retirement()).toBe(expected);
    });
  
    // Test clone functionality
    test("should create independent clone", () => {
      const original = create_investment(baseRawData);
      const clone = original.clone();
      
      original.incr_value(100);
      expect(clone.get_value()).toBe(baseRawData.value);
      expect(original.get_value()).toBe(baseRawData.value + 100);
    });
    
    describe("investment ID formatting", () => {
      const testInvestmentType = "test-investment";
      const testTaxStatus = "non-retirement";
      
      describe("ID validation rules", () => {
        // Basic validation
        test("should require both investment type and tax status in ID", () => {
          const raw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: "invalid-id",
            value: 1000
          };
          
          const result = create_investment(raw);
          expect(result.id).toMatch(new RegExp(`${testInvestmentType}.*${testTaxStatus}|${testTaxStatus}.*${testInvestmentType}`));
        });
    
        // Position variations
        test("should accept either order of components", () => {
          const frontRaw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: `${testInvestmentType} ${testTaxStatus}`,
            value: 1000
          };
          
          const backRaw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: `${testTaxStatus} ${testInvestmentType}`,
            value: 1000
          };
    
          expect(create_investment(frontRaw).id).toBe(frontRaw.id);
          expect(create_investment(backRaw).id).toBe(backRaw.id);
        });
    
      });
    
      describe("edge cases", () => {
    
        // Multiple spaces
        test("should normalize whitespace", () => {
          const raw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: "  test-investment   non-retirement  ",
            value: 1000
          };
    
          expect(create_investment(raw).id).toBe(raw.id);
        });
    
      });
    
      describe("ID construction scenarios", () => {
        // Partial matches
        test("should add missing component to partial ID", () => {
          const missingTaxStatus: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: testInvestmentType,
            value: 1000
          };
    
          expect(create_investment(missingTaxStatus).id).toBe(`${testInvestmentType} ${testTaxStatus}`);
        });
    
        // Existing extra components
        test("should preserve additional ID components", () => {
          const raw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: `${testInvestmentType} extra-component ${testTaxStatus}`,
            value: 1000
          };
    
          expect(create_investment(raw).id).toBe(raw.id);
        });
    
        // Empty ID handling
        test("should build ID from scratch when empty", () => {
          const raw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: "",
            value: 1000
          };
    
          expect(create_investment(raw).id).toBe(`${testInvestmentType} ${testTaxStatus}`);
        });
      });
    
      describe("validation failures", () => {
        // Mismatched components
        test("should detect wrong tax status in ID", () => {
          const raw: InvestmentRaw = {
            investmentType: testInvestmentType,
            taxStatus: testTaxStatus,
            id: `${testInvestmentType} roth-ira`,
            value: 1000
          };
    
          expect(create_investment(raw).id).toContain(testTaxStatus);
        });
    
      });
    });
  
  });