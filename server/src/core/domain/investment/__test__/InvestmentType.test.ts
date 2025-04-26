import { create_investment_type_raw } from "../../raw/investment_type_raw";
import { 
    cash_investment_type_one, 
    s_and_p_500_investment_type_one, 
    tax_exempt_bonds_investment_type_one 
} from "../../raw/investment_type_raw";

import { create_investment_type, parse_investment_type_distribution, parse_change_type } from "../InvestmentType";
import { ChangeType } from "../../../Enums";
import { InvestmentTypeRaw } from "../../raw/investment_type_raw";
import { StatisticType } from "../../../Enums";

describe("investment type raw initialization", () => {
  describe("create_investment_type_raw function test", () => {
    it("should_create_investment_type_with_correct_properties", () => {
      const name = "Test Investment";
      const description = "Test Description";
      const returnAmtOrPct = "percent";
      const returnDistribution = new Map<string, any>([
        ["type", "fixed"],
        ["value", 0.05],
      ]);
      const expenseRatio = 0.003;
      const incomeAmtOrPct = "amount";
      const incomeDistribution = new Map<string, any>([
        ["type", "normal"],
        ["mean", 1000],
        ["stdev", 200],
      ]);
      const taxability = true;

      const result = create_investment_type_raw(
        name,
        description,
        returnAmtOrPct,
        returnDistribution,
        expenseRatio,
        incomeAmtOrPct,
        incomeDistribution,
        taxability
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(name);
      expect(result.description).toBe(description);
      expect(result.returnAmtOrPct).toBe(returnAmtOrPct);
      expect(result.returnDistribution).toEqual(returnDistribution);
      expect(result.expenseRatio).toBe(expenseRatio);
      expect(result.incomeAmtOrPct).toBe(incomeAmtOrPct);
      expect(result.incomeDistribution).toEqual(incomeDistribution);
      expect(result.taxability).toBe(taxability);
    });
  });

  describe("predefined investment type raw test", () => {
    it("should_verify_cash_investment_type_properties", () => {
      expect(cash_investment_type_one).toBeDefined();
      expect(cash_investment_type_one.name).toBe("cash");
      expect(cash_investment_type_one.description).toBe("cash");
      expect(cash_investment_type_one.returnAmtOrPct).toBe("amount");
      expect(cash_investment_type_one.returnDistribution.get("type")).toBe(
        "fixed"
      );
      expect(cash_investment_type_one.returnDistribution.get("value")).toBe(0);
      expect(cash_investment_type_one.expenseRatio).toBe(0);
      expect(cash_investment_type_one.incomeAmtOrPct).toBe("percent");
      expect(cash_investment_type_one.incomeDistribution.get("type")).toBe(
        "fixed"
      );
      expect(cash_investment_type_one.incomeDistribution.get("value")).toBe(0);
      expect(cash_investment_type_one.taxability).toBe(true);
    });

    it("should_verify_s_and_p_500_investment_type_properties", () => {
      // Assert
      expect(s_and_p_500_investment_type_one).toBeDefined();
      expect(s_and_p_500_investment_type_one.name).toBe("S&P 500");
      expect(s_and_p_500_investment_type_one.description).toBe(
        "S&P 500 index fund"
      );
      expect(s_and_p_500_investment_type_one.returnAmtOrPct).toBe("percent");
      expect(
        s_and_p_500_investment_type_one.returnDistribution.get("type")
      ).toBe("normal");
      expect(
        s_and_p_500_investment_type_one.returnDistribution.get("mean")
      ).toBe(0.06);
      expect(
        s_and_p_500_investment_type_one.returnDistribution.get("stdev")
      ).toBe(0.02);
      expect(s_and_p_500_investment_type_one.expenseRatio).toBe(0.001);
      expect(s_and_p_500_investment_type_one.incomeAmtOrPct).toBe("percent");
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.get("type")
      ).toBe("normal");
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.get("mean")
      ).toBe(0.01);
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.get("stdev")
      ).toBe(0.005);
      expect(s_and_p_500_investment_type_one.taxability).toBe(true);
    });

    it("should_verify_tax_exempt_bonds_investment_type_properties", () => {
      // Assert
      expect(tax_exempt_bonds_investment_type_one).toBeDefined();
      expect(tax_exempt_bonds_investment_type_one.name).toBe(
        "tax-exempt bonds"
      );
      expect(tax_exempt_bonds_investment_type_one.description).toBe(
        "NY tax-exempt bonds"
      );
      expect(tax_exempt_bonds_investment_type_one.returnAmtOrPct).toBe(
        "amount"
      );
      expect(
        tax_exempt_bonds_investment_type_one.returnDistribution.get("type")
      ).toBe("fixed");
      expect(
        tax_exempt_bonds_investment_type_one.returnDistribution.get("value")
      ).toBe(0);
      expect(tax_exempt_bonds_investment_type_one.expenseRatio).toBe(0.004);
      expect(tax_exempt_bonds_investment_type_one.incomeAmtOrPct).toBe(
        "percent"
      );
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.get("type")
      ).toBe("normal");
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.get("mean")
      ).toBe(0.03);
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.get("stdev")
      ).toBe(0.01);
      expect(tax_exempt_bonds_investment_type_one.taxability).toBe(false);
    });
  });


})

describe("Investment Type Factory", () => {
  describe("Parser Functions", () => {
    describe("parse_change_type", () => {
      test("should parse 'amount' to FIXED", () => {
        expect(parse_change_type("amount")).toBe(ChangeType.AMOUNT);
      });

      test("should parse 'percent' to PERCENTAGE", () => {
        expect(parse_change_type("percent")).toBe(ChangeType.PERCENT);
      });

      test("should throw error for invalid change type", () => {
        expect(() => parse_change_type("invalid")).toThrow("Invalid change type");
      });
    });

    describe("parse_distribution", () => {
      test("should parse fixed distribution", () => {
        const dist = new Map<string, any>([["type", "fixed"], ["value", 0.05]]);
        const result = parse_investment_type_distribution(dist);
        
        expect(result._params.get(StatisticType.VALUE)).toBe(0.05);
      });

      test("should parse normal distribution", () => {
        const dist = new Map<string, any>([["type", "normal"], ["mean", 0.06], ["stdev", 0.02]]);
        const result = parse_investment_type_distribution(dist);
        
        expect(result._params.get(StatisticType.MEAN)).toBe(0.06);
        expect(result._params.get(StatisticType.STDEV)).toBe(0.02);
      });

      test("should throw error for invalid distribution type", () => {
        const dist = new Map([["type", "invalid"]]);
        expect(() => parse_investment_type_distribution(dist)).toThrow("Invalid change distribution type");
      });
    });

  });


  describe("create_investment_type", () => {
    const baseRaw: InvestmentTypeRaw = {
      name: "Test",
      description: "Test Type",
      returnAmtOrPct: "percent",
      returnDistribution: new Map<string, any>([["type", "fixed"], ["value", 0.05]]),
      expenseRatio: 0.001,
      incomeAmtOrPct: "amount",
      incomeDistribution: new Map<string, any>([["type", "normal"], ["mean", 1000], ["stdev", 200]]),
      taxability: true
    };

    it("should create valid investment type", () => {
      const result = create_investment_type(baseRaw);
      expect(result).toMatchObject({
        name: "Test",
        description: "Test Type",
        return_change_type: ChangeType.PERCENT,
        expense_ratio: 0.001,
        income_change_type: ChangeType.AMOUNT,
        taxability: true
      });
      expect(result._expected_annual_return._params).toEqual(
        new Map([[StatisticType.VALUE, 0.05]])
      );
      expect(result._expected_annual_income._params).toEqual(
        new Map([
          [StatisticType.MEAN, 1000],
          [StatisticType.STDEV, 200]
        ])
      );
    });

    it("should handle error in return distribution parsing", () => {
      const invalidRaw = { ...baseRaw, returnDistribution: new Map([["type", "invalid"]]) };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    it("should handle error in income distribution parsing", () => {
      const invalidRaw = { ...baseRaw, incomeDistribution: new Map([["type", "invalid"]]) };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    it("should handle error in return change type parsing", () => {
      const invalidRaw = { ...baseRaw, returnAmtOrPct: "invalid" };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    it("should handle error in income change type parsing", () => {
      const invalidRaw = { ...baseRaw, incomeAmtOrPct: "invalid" };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    it("should be able to be cloned properly", () => {
      const investment_type = create_investment_type(baseRaw);
      const cloned_investment_type = investment_type.clone();
    
      // Verify initial equality
      expect(cloned_investment_type.name).toBe(investment_type.name);
      expect(cloned_investment_type.description).toBe(investment_type.description);
      expect(cloned_investment_type._expected_annual_return.equal(investment_type._expected_annual_return)).toBe(true);
      expect(cloned_investment_type.return_change_type).toBe(investment_type.return_change_type);
      expect(cloned_investment_type._expected_annual_income.equal(investment_type._expected_annual_income)).toBe(true);
      expect(cloned_investment_type.income_change_type).toBe(investment_type.income_change_type);
      expect(cloned_investment_type.taxability).toBe(investment_type.taxability);
      expect(cloned_investment_type.expense_ratio).toBe(investment_type.expense_ratio);
    
      // Modify cloned properties
      const originalName = investment_type.name;
      const originalDescription = investment_type.description;
      const originalReturnChangeType = investment_type.return_change_type;
      const originalIncomeChangeType = investment_type.income_change_type;
      const originalTaxability = investment_type.taxability;
      const originalExpenseRatio = investment_type.expense_ratio;
    
      // Modify all cloned properties
      cloned_investment_type.name = "changed name";
      cloned_investment_type.description = "changed description";
      cloned_investment_type.return_change_type = cloned_investment_type.return_change_type === ChangeType.PERCENT 
        ? ChangeType.AMOUNT 
        : ChangeType.PERCENT;
      cloned_investment_type.income_change_type = cloned_investment_type.income_change_type === ChangeType.PERCENT
        ? ChangeType.AMOUNT
        : ChangeType.PERCENT;
      cloned_investment_type.taxability = !cloned_investment_type.taxability;
      cloned_investment_type.expense_ratio += 0.1;
      // Verify original remains unchanged
      expect(investment_type.name).toBe(originalName);
      expect(investment_type.description).toBe(originalDescription);
      expect(investment_type.return_change_type).toBe(originalReturnChangeType);
      expect(investment_type.income_change_type).toBe(originalIncomeChangeType);
      expect(investment_type.taxability).toBe(originalTaxability);
      expect(investment_type.expense_ratio).toBe(originalExpenseRatio);
    
      // Verify complex objects are truly cloned (not reference-equal)
      expect(cloned_investment_type._expected_annual_return.equal(investment_type._expected_annual_return)).toBe(true);
      expect(cloned_investment_type._expected_annual_income.equal(investment_type._expected_annual_income)).toBe(true);
    });

    // Test annual income/return sampling
    test("should sample annual values correctly", () => {
      const investment_type = create_investment_type(baseRaw);
      expect(typeof investment_type._expected_annual_income.sample()).toBe("number");
      expect(typeof investment_type._expected_annual_return.sample()).toBe("number");
    });
  });


  describe("Predefined Investment Types", () => {
    const verifyCommonProperties = (type: any) => {
      expect(type.return_change_type).toBeDefined();
      expect(type.income_change_type).toBeDefined();
      
      expect(typeof type.get_annual_return()).toBe("number");
      
      expect(type.taxability).toBeDefined();
    };
    test("cash_investment_type_one", () => {
      const result = create_investment_type(cash_investment_type_one);
      verifyCommonProperties(result);
      
      expect(result.return_change_type).toBe(ChangeType.AMOUNT);
      expect(result._expected_annual_return._params.get(StatisticType.VALUE)).toBe(0);
      expect(result.taxability).toBe(true);
    });

    test("s_and_p_500_investment_type_one", () => {
      const result = create_investment_type(s_and_p_500_investment_type_one);
      verifyCommonProperties(result);
      expect(result.return_change_type).toBe(ChangeType.PERCENT);
      expect(result.taxability).toBe(true);
    });

    test("tax_exempt_bonds_investment_type_one", () => {
      const result = create_investment_type(tax_exempt_bonds_investment_type_one);
      verifyCommonProperties(result);
      expect(result.income_change_type).toBe(ChangeType.PERCENT);
      expect(result.taxability).toBe(false);
    });
  });
});