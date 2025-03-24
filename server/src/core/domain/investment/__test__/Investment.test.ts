import {
  create_investment_type_raw,
  cash_investment_type_one,
  s_and_p_500_investment_type_one,
  tax_exempt_bonds_investment_type_one,
} from "../../investment/investment_type_raw";

describe("Investment initialization test", () => {
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
});
