import { StatisticType } from "../../../core/Enums";
import { create_investment_type } from "../../../core/domain/investment/InvestmentType";
import { InvestmentTypeRaw } from "../../../core/domain/raw/investment_type_raw";
import { ValueGenerator, create_value_generator } from "../ValueGenerator";
import { DistributionType } from "../../../core/Enums";

// following code are generate by AI
// it is really bad tho because it mess up some of the constant. e.g returnAmtorPct it gave me fixed for one of them

// the prompt i gave is passing my ValueGenerator file to AI and ask them to write the test case

// 枚举到字符串的转换函数
const statisticTypeToString = (type: StatisticType): string => {
    return StatisticType[type].toLowerCase();
  };



describe("Investment Equality", () => {
  it("should return true for identical FIXED generators", () => {
    const params = new Map<StatisticType, number>([[StatisticType.VALUE, 5]]);
    const gen1 = create_value_generator(DistributionType.FIXED, params);
    const gen2 = create_value_generator(DistributionType.FIXED, params);
    expect(gen1.equal(gen2)).toBe(true);
  });

  it("should return false for NORMAL with different means", () => {
    const params1 = new Map([[StatisticType.MEAN, 10], [StatisticType.STDEV, 2]]);
    const params2 = new Map([[StatisticType.MEAN, 20], [StatisticType.STDEV, 2]]);
    const gen1 = create_value_generator(DistributionType.NORMAL, params1);
    const gen2 = create_value_generator(DistributionType.NORMAL, params2);
    expect(gen1.equal(gen2)).toBe(false);
  });

  it("should return false for different distribution types", () => {
    const params = new Map([[StatisticType.VALUE, 5]]);
    const gen1 = create_value_generator(DistributionType.FIXED, params);
    const gen2 = create_value_generator(DistributionType.UNIFORM, params); // 错误类型
    expect(gen1.equal(gen2)).toBe(false);
  });
  it("should detect extra parameters", () => {
    const params1 = new Map([[StatisticType.LOWER, 0]]);             // 缺少 UPPER
    const params2 = new Map([[StatisticType.LOWER, 0], [StatisticType.UPPER, 1]]);
    const gen1 = create_value_generator(DistributionType.UNIFORM, params1); // 会抛错，但这里测试参数数量
    const gen2 = create_value_generator(DistributionType.UNIFORM, params2);
    expect(gen1.equal(gen2)).toBe(false);
  });

  it("should treat NaN as equal", () => {
    const params = new Map([[StatisticType.VALUE, NaN]]);
    const gen1 = create_value_generator(DistributionType.FIXED, params);
    const gen2 = create_value_generator(DistributionType.FIXED, params);
    expect(gen1.equal(gen2)).toBe(true);
  });

  it("should detect floating point differences", () => {
    const params1 = new Map([[StatisticType.VALUE, 0.1 + 0.2]]);  // ≈0.30000000000000004
    const params2 = new Map([[StatisticType.VALUE, 0.3]]);
    const gen1 = create_value_generator(DistributionType.FIXED, params1);
    const gen2 = create_value_generator(DistributionType.FIXED, params2);
    expect(gen1.equal(gen2)).toBe(false); // 预期失败，除非实现近似比较
  });
  it("should ignore parameter order", () => {
    const params1 = new Map([[StatisticType.MEAN, 10], [StatisticType.STDEV, 2]]);
    const params2 = new Map([[StatisticType.STDEV, 2], [StatisticType.MEAN, 10]]);
    const gen1 = create_value_generator(DistributionType.NORMAL, params1);
    const gen2 = create_value_generator(DistributionType.NORMAL, params2);
    expect(gen1.equal(gen2)).toBe(true);
  });

})

describe("Investment Type Parameter Validation", () => {
  // 参数化测试模板
  const testGeneratorParams = (
    description: string,
    config: {
      returnType: "fixed" | "normal";
      returnParams: [StatisticType, number][];
      incomeType: "fixed" | "normal";
      incomeParams: [StatisticType, number][];
    }
  ) => {
    test(description, () => {
      // 1. 准备测试数据
      const rawData: InvestmentTypeRaw = {
        name: "Param Test",
        description: "Parameter Validation Test",
        returnAmtOrPct: "percent",
        returnDistribution: new Map<string, any>([
          ["type", config.returnType],
          ...config.returnParams.map(
            ([k, v]): [string, number] => [statisticTypeToString(k), v]
          )
        ]),
        expenseRatio: 0.002,
        incomeAmtOrPct: "amount",
        incomeDistribution: new Map<string, any>([
          ["type", config.incomeType],
          ...config.incomeParams.map(
            ([k, v]): [string, number] => [statisticTypeToString(k), v]
          )
        ]),
        taxability: false
      };

      const result = create_investment_type(rawData);

      expect(result._expected_annual_return._params).toEqual(
        new Map<StatisticType, number>(config.returnParams)
      );

      expect(result._expected_annual_income._params).toEqual(
        new Map<StatisticType, number>(config.incomeParams)
      );
    });
  };

  testGeneratorParams(
    "should pass fixed return and normal income params",
    {
      returnType: "fixed",
      returnParams: [[StatisticType.VALUE, 0.05]],
      incomeType: "normal",
      incomeParams: [
        [StatisticType.MEAN, 1000],
        [StatisticType.STDEV, 200]
      ]
    }
  );

  testGeneratorParams(
    "should pass normal return and fixed income params",
    {
      returnType: "normal",
      returnParams: [
        [StatisticType.MEAN, 0.06],
        [StatisticType.STDEV, 0.02]
      ],
      incomeType: "fixed",
      incomeParams: [[StatisticType.VALUE, 500]]
    }
  );
});

// 补充边界测试
test("should handle edge cases", () => {
  // 测试零值
  const zeroRaw: InvestmentTypeRaw = {
    name: "Zero Test",
    description: "Zero Value Test",
    returnAmtOrPct: "amount",
    returnDistribution: new Map<string, any>([
      ["type", "fixed"],
      ["value", 0]
    ]),
    expenseRatio: 0,
    incomeAmtOrPct: "percent",
    incomeDistribution: new Map<string, any>([
      ["type", "fixed"],
      ["value", 0]
    ]),
    taxability: true
  };

  const result = create_investment_type(zeroRaw);
  
  console.log(result);
  expect(result._expected_annual_return._params).toEqual(
    new Map([[StatisticType.VALUE, 0]])
  );
  expect(result._expected_annual_return.sample()).toBe(0);
});

// 错误处理测试
test("should throw on invalid parameters", () => {
  const invalidRaw: InvestmentTypeRaw = {
    name: "Invalid Test",
    description: "Missing Parameter Test",
    returnAmtOrPct: "fixed",
    returnDistribution: new Map<string, any>([["type", "fixed"]]), // 缺少value参数
    expenseRatio: 0,
    incomeAmtOrPct: "percent",
    incomeDistribution: new Map<string, any>([
      ["type", "fixed"],
      ["value", 0]
    ]),
    taxability: true
  };

  expect(() => create_investment_type(invalidRaw)).toThrow(
    "Failed to initialize InvestmentType Invalid change type fixed"
  );
});