
import { create_investment_type, parse_investment_type_distribution, parse_change_type } from "../investment/InvestmentType";
import { Distribution } from "../raw/common";
import { create_investment_type_raw } from "../raw/investment_type_raw";
import { cash_investment_type_one, s_and_p_500_investment_type_one, tax_exempt_bonds_investment_type_one } from "../raw/investment_type_raw";
import { ChangeType } from "../../Enums";
import { StatisticType } from "../../Enums";
import { InvestmentTypeRaw } from "../raw/investment_type_raw";
import { create_value_source, ValueSource } from "../../../utils/ValueGenerator";

let source: ValueSource;

describe("investment type raw initialization", () => {
  beforeAll(() => {
    source = create_value_source("random");
  })

  describe("create_investment_type_raw function test", () => {
    it("should_create_investment_type_with_correct_properties", () => {
      const name = "Test Investment";
      const description = "Test Description";
      const returnAmtOrPct = "percent";
      const returnDistribution: Distribution = { 
        type: "fixed",
        value: 0.05,
      };
      const expenseRatio = 0.003;
      const incomeAmtOrPct = "amount";
      const incomeDistribution: Distribution = {
        type:"normal",
        mean: 1000,
        stdev: 200,
      };
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
      expect(cash_investment_type_one.returnDistribution.type).toBe(
        "fixed"
      );
      expect(cash_investment_type_one.returnDistribution.value).toBe(0);
      expect(cash_investment_type_one.expenseRatio).toBe(0);
      expect(cash_investment_type_one.incomeAmtOrPct).toBe("percent");
      expect(cash_investment_type_one.incomeDistribution.type).toBe(
        "fixed"
      );
      expect(cash_investment_type_one.incomeDistribution.value).toBe(0);
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
        s_and_p_500_investment_type_one.returnDistribution.type
      ).toBe("normal");
      expect(
        s_and_p_500_investment_type_one.returnDistribution.mean
      ).toBe(0.06);
      expect(
        s_and_p_500_investment_type_one.returnDistribution.stdev
      ).toBe(0.02);
      expect(s_and_p_500_investment_type_one.expenseRatio).toBe(0.001);
      expect(s_and_p_500_investment_type_one.incomeAmtOrPct).toBe("percent");
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.type
      ).toBe("normal");
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.mean
      ).toBe(0.01);
      expect(
        s_and_p_500_investment_type_one.incomeDistribution.stdev
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
        tax_exempt_bonds_investment_type_one.returnDistribution.type
      ).toBe("fixed");
      expect(
        tax_exempt_bonds_investment_type_one.returnDistribution.value
      ).toBe(0);
      expect(tax_exempt_bonds_investment_type_one.expenseRatio).toBe(0.004);
      expect(tax_exempt_bonds_investment_type_one.incomeAmtOrPct).toBe(
        "percent"
      );
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.type
      ).toBe("normal");
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.mean
      ).toBe(0.03);
      expect(
        tax_exempt_bonds_investment_type_one.incomeDistribution.stdev
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

  });


  describe("create_investment_type", () => {
    const baseRaw: InvestmentTypeRaw = {
      name: "Test",
      description: "Test Type",
      returnAmtOrPct: "percent",
      returnDistribution: {
        type: "fixed",
        value: 0.05
      },
      expenseRatio: 0.001,
      incomeAmtOrPct: "amount",
      incomeDistribution: {
        type: "normal", 
        mean: 1000,
        stdev: 200
      },
      taxability: true
    };


    it("should be able to be cloned properly", () => {
      const investment_type = create_investment_type(baseRaw, create_value_source("random"));
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
      const investment_type = create_investment_type(baseRaw, source);
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
      const result = create_investment_type(cash_investment_type_one, source);
      verifyCommonProperties(result);
      
      expect(result.return_change_type).toBe(ChangeType.AMOUNT);
      expect(result.taxability).toBe(true);
    });

    test("s_and_p_500_investment_type_one", () => {
      const result = create_investment_type(s_and_p_500_investment_type_one, source);
      verifyCommonProperties(result);
      expect(result.return_change_type).toBe(ChangeType.PERCENT);
      expect(result.taxability).toBe(true);
    });

    test("tax_exempt_bonds_investment_type_one", () => {
      const result = create_investment_type(tax_exempt_bonds_investment_type_one, source);
      verifyCommonProperties(result);
      expect(result.income_change_type).toBe(ChangeType.PERCENT);
      expect(result.taxability).toBe(false);
    });
  });
});