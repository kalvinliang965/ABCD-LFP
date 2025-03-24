import {
  create_investment_type_raw,
  cash_investment_type_one,
  s_and_p_500_investment_type_one,
  tax_exempt_bonds_investment_type_one,
} from "../../investment/investment_type_raw";
import { InvestmentRaw } from "../../scenario/Scenario";
import { TaxStatus } from "../../../Enums";
import { create_investment, Investment } from "../Investment";
import { create_investment_type } from "../InvestmentType";

describe("create_investment", () => {
    const baseRawData: InvestmentRaw = {
      investmentType: cash_investment_type_one,
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
      const investment = create_investment({ ...baseRawData, taxStatus: input });
      expect(investment.taxStatus).toBe(expected);
    });
  
    // Test invalid tax status handling
    test("should throw error for invalid tax status", () => {
      const invalidRaw = { ...baseRawData, taxStatus: "invalid" };
      expect(() => create_investment(invalidRaw)).toThrow("Error creating investment");
    });
  
    // Test value initialization
    test.each([0, 100, -500])("should handle value %d correctly", (value) => {
      const investment = create_investment({ ...baseRawData, value });
      expect(investment.get_value()).toBe(value);
    });
  
    // Test cost basis initialization
    test("should initialize cost basis to 0", () => {
      const investment = create_investment(baseRawData);
      expect(investment.get_cost_basis()).toBe(0);
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
      expect(investment.get_cost_basis()).toBe(300);
    });
  
    // Test retirement status
    test.each([
      ["non-retirement", false],
      ["pre-tax", true],
      ["after-tax", true]
    ])("should detect retirement status for %s", (status, expected) => {
      const investment = create_investment({ ...baseRawData, taxStatus: status });
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
  
  
    // Test tax exempt status
    test("should reflect tax exempt status from investment type", () => {
      const taxExemptType = { ...cash_investment_type_one, taxability: false };
      const investment = create_investment({
        investmentType: taxExemptType,
        value: 0,
        taxStatus: "non-retirement",
        id: "mock"
      });
      expect(investment.is_tax_exempt()).toBe(true);
    });
  
    // Test annual income/return sampling
    test("should sample annual values correctly", () => {
      const investment: Investment = create_investment(baseRawData);
      expect(typeof investment.get_annual_income()).toBe("number");
      expect(typeof investment.get_annual_return()).toBe("number");
    });
  });