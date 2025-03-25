import { StatisticType } from "../../../core/Enums";
import { InvestmentTypeRaw } from "../../../core/domain/scenario/Scenario";
import { create_investment_type } from "../../../core/domain/investment/InvestmentType";

// following code are generate by AI
// it is really bad tho because it mess up some of the constant. e.g returnAmtorPct it gave me fixed for one of them

// the prompt i gave is passing my ValueGenerator file to AI and ask them to write the test case

// 枚举到字符串的转换函数
const statisticTypeToString = (type: StatisticType): string => {
    return StatisticType[type].toLowerCase();
  };
  
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
  
        // 2. 执行创建
        const result = create_investment_type(rawData);
  
        // 3. 验证参数
        // 验证收益生成器参数
        expect(result.expect_annual_return._params).toEqual(
          new Map<StatisticType, number>(config.returnParams)
        );
  
        // 验证收入生成器参数
        expect(result.expect_annual_income._params).toEqual(
          new Map<StatisticType, number>(config.incomeParams)
        );
      });
    };
  
    // 测试用例组
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
    expect(result.expect_annual_return._params).toEqual(
      new Map([[StatisticType.VALUE, 0]])
    );
    expect(result.expect_annual_return.sample()).toBe(0);
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