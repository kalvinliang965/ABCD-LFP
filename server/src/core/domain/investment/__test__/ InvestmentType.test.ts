import { create_investment_type_raw } from "../../raw/investment_type_raw";
import { 
    cash_investment_type_one, 
    s_and_p_500_investment_type_one, 
    tax_exempt_bonds_investment_type_one 
} from "../../raw/investment_type_raw";

import { create_investment_type, parse_taxability, parse_distribution, parse_change_type } from "../InvestmentType";
import { ChangeType } from "../../../Enums";
import { InvestmentTypeRaw } from "../../scenario/Scenario";
import { StatisticType } from "../../../Enums";
import { Taxability } from "../../../Enums";
import ValueGenerator from "../../../../utils/math/ValueGenerator";

describe("investment type raw initialization", () => {
  describe("create_investment_type_raw function test", () => {
    test("should_create_investment_type_with_correct_properties", () => {
      // Arrange
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

      // Act
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

  describe("predefined investment types test", () => {
    test("should_verify_cash_investment_type_properties", () => {
      // Assert
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

    test("should_verify_s_and_p_500_investment_type_properties", () => {
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

    test("should_verify_tax_exempt_bonds_investment_type_properties", () => {
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
        expect(parse_change_type("amount")).toBe(ChangeType.FIXED);
      });

      test("should parse 'percent' to PERCENTAGE", () => {
        expect(parse_change_type("percent")).toBe(ChangeType.PERCENTAGE);
      });

      test("should throw error for invalid change type", () => {
        expect(() => parse_change_type("invalid")).toThrow("Invalid change type");
      });
    });

    describe("parse_distribution", () => {
      test("should parse fixed distribution", () => {
        const dist = new Map<string, any>([["type", "fixed"], ["value", 0.05]]);
        const result = parse_distribution(dist);
        
        expect(result._params.get(StatisticType.VALUE)).toBe(0.05);
      });

      test("should parse normal distribution", () => {
        const dist = new Map<string, any>([["type", "normal"], ["mean", 0.06], ["stdev", 0.02]]);
        const result = parse_distribution(dist);
        
        expect(result._params.get(StatisticType.MEAN)).toBe(0.06);
        expect(result._params.get(StatisticType.STDEV)).toBe(0.02);
      });

      test("should throw error for invalid distribution type", () => {
        const dist = new Map([["type", "invalid"]]);
        expect(() => parse_distribution(dist)).toThrow("Invalid change distribution type");
      });
    });

    describe("parse_taxability", () => {
      test("should parse true to TAXABLE", () => {
        expect(parse_taxability(true)).toBe(Taxability.TAXABLE);
      });

      test("should parse false to TAX_EXEMPT", () => {
        expect(parse_taxability(false)).toBe(Taxability.TAX_EXEMPT);
      });
    });
  });

  // 测试主函数
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

    test("should create valid investment type", () => {
      const result = create_investment_type(baseRaw);
      expect(result).toMatchObject({
        name: "Test",
        description: "Test Type",
        return_change_type: ChangeType.PERCENTAGE,
        expense_ratio: 0.001,
        income_change_type: ChangeType.FIXED,
        taxability: Taxability.TAXABLE
      });
      expect(result.expect_annual_return._params).toEqual(
        new Map([[StatisticType.VALUE, 0.05]])
      );
      expect(result.expect_annual_income._params).toEqual(
        new Map([
          [StatisticType.MEAN, 1000],
          [StatisticType.STDEV, 200]
        ])
      );
    });

    test("should handle error in return distribution parsing", () => {
      const invalidRaw = { ...baseRaw, returnDistribution: new Map([["type", "invalid"]]) };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    test("should handle error in income distribution parsing", () => {
      const invalidRaw = { ...baseRaw, incomeDistribution: new Map([["type", "invalid"]]) };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    test("should handle error in return change type parsing", () => {
      const invalidRaw = { ...baseRaw, returnAmtOrPct: "invalid" };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });

    test("should handle error in income change type parsing", () => {
      const invalidRaw = { ...baseRaw, incomeAmtOrPct: "invalid" };
      expect(() => create_investment_type(invalidRaw)).toThrow("Failed to initialize InvestmentType");
    });
  });

  // 测试预定义类型
  describe("Predefined Investment Types", () => {
    const verifyCommonProperties = (type: any) => {
      expect(type.return_change_type).toBeDefined();
      expect(type.income_change_type).toBeDefined();
      
      // 改为检查对象结构
      expect(type.expect_annual_return).toEqual(
        expect.objectContaining({
          sample: expect.any(Function),
          _params: expect.any(Map)
        })
      );
      
      expect(type.taxability).toBeDefined();
    };
    test("cash_investment_type_one", () => {
      const result = create_investment_type(cash_investment_type_one);
      verifyCommonProperties(result);
      
      expect(result.return_change_type).toBe(ChangeType.FIXED);
      expect(result.expect_annual_return._params.get(StatisticType.VALUE)).toBe(0);
      expect(result.taxability).toBe(Taxability.TAXABLE);
    });

    test("s_and_p_500_investment_type_one", () => {
      const result = create_investment_type(s_and_p_500_investment_type_one);
      verifyCommonProperties(result);
      expect(result.return_change_type).toBe(ChangeType.PERCENTAGE);
      expect(result.taxability).toBe(Taxability.TAXABLE);
    });

    test("tax_exempt_bonds_investment_type_one", () => {
      const result = create_investment_type(tax_exempt_bonds_investment_type_one);
      verifyCommonProperties(result);
      expect(result.income_change_type).toBe(ChangeType.PERCENTAGE);
      expect(result.taxability).toBe(Taxability.TAX_EXEMPT);
    });
  });
});