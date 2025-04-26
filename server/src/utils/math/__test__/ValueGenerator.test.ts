import { StatisticType } from "../../../core/Enums";
import { create_investment_type } from "../../../core/domain/investment/InvestmentType";
import { InvestmentTypeRaw } from "../../../core/domain/raw/investment_type_raw";
import { ValueGenerator, create_value_generator } from "../ValueGenerator";
import { DistributionType } from "../../../core/Enums";
import { Distribution } from "../../../core/domain/raw/common";

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
    const gen2 = create_value_generator(DistributionType.UNIFORM, params);
    expect(gen1.equal(gen2)).toBe(false);
  });
  it("should detect extra parameters", () => {
    const params1 = new Map([[StatisticType.LOWER, 0]]);         
    const params2 = new Map([[StatisticType.LOWER, 0], [StatisticType.UPPER, 1]]);
    const gen1 = create_value_generator(DistributionType.UNIFORM, params1);
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
    const params1 = new Map([[StatisticType.VALUE, 0.1 + 0.2]]);
    const params2 = new Map([[StatisticType.VALUE, 0.3]]);
    const gen1 = create_value_generator(DistributionType.FIXED, params1);
    const gen2 = create_value_generator(DistributionType.FIXED, params2);
    expect(gen1.equal(gen2)).toBe(false); 
  });
  it("should ignore parameter order", () => {
    const params1 = new Map([[StatisticType.MEAN, 10], [StatisticType.STDEV, 2]]);
    const params2 = new Map([[StatisticType.STDEV, 2], [StatisticType.MEAN, 10]]);
    const gen1 = create_value_generator(DistributionType.NORMAL, params1);
    const gen2 = create_value_generator(DistributionType.NORMAL, params2);
    expect(gen1.equal(gen2)).toBe(true);
  });

})