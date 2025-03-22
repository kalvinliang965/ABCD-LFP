import {
  DistributionType,
  Taxability,
  ChangeType,
  StatisticType,
} from "../../Enums";
import ValueGenerator, {
  RandomGenerator,
} from "../../../utils/math/ValueGenerator";
import { InvestmentTypeRaw } from "../scenario/Scenario";

/**
 * 用于向外部返回的投资类型公共信息
 */
export interface InvestmentTypePublicInfo {
  name: string;
  description: string;
  expectAnnualReturn: number;
  expenseRatio: number;
  expectAnnualIncome: number;
  taxability: Taxability;
}

/**
 * Represents an investment type in the retirement planning system
 * 处理从Scenario接收的原始投资类型数据，并提供计算功能
 */
export class InvestmentType {
  name: string;
  description: string;
  private _returnAmtOrPct: ChangeType;
  private _returnDistributionType: DistributionType;
  private _returnDistributionParams: Map<StatisticType, number>;
  expenseRatio: number;
  private _incomeAmtOrPct: ChangeType;
  private _incomeDistributionType: DistributionType;
  private _incomeDistributionParams: Map<StatisticType, number>;
  taxability: Taxability;

  /**
   * 解析分布类型和参数
   * @param distributionData 包含分布信息的Map
   * @returns 包含分布类型和参数的对象
   */
  private static parseDistribution(distributionData: Map<string, any>): {
    type: DistributionType;
    params: Map<StatisticType, number>;
  } {
    // 解析分布类型
    const distType =
      distributionData.get("type") === "fixed"
        ? DistributionType.FIXED
        : distributionData.get("type") === "normal"
        ? DistributionType.NORMAL
        : DistributionType.UNIFORM;

    // 创建参数Map
    const params = new Map<StatisticType, number>();

    // 根据分布类型添加相关参数
    switch (distType) {
      case DistributionType.FIXED:
        if (distributionData.get("value") !== undefined) {
          params.set(StatisticType.VALUE, distributionData.get("value"));
        }
        break;
      case DistributionType.NORMAL:
        if (distributionData.get("mean") !== undefined) {
          params.set(StatisticType.MEAN, distributionData.get("mean"));
        }
        if (distributionData.get("stdev") !== undefined) {
          params.set(StatisticType.STDDEV, distributionData.get("stdev"));
        }
        break;
      case DistributionType.UNIFORM:
        if (distributionData.get("lower") !== undefined) {
          params.set(StatisticType.LOWER, distributionData.get("lower"));
        }
        if (distributionData.get("upper") !== undefined) {
          params.set(StatisticType.UPPER, distributionData.get("upper"));
        }
        break;
    }

    return { type: distType, params };
  }

  /**
   * 将字符串转换为ChangeType枚举
   */
  private static convertAmtOrPct(value: string): ChangeType {
    return value === "amount" ? ChangeType.FIXED : ChangeType.PERCENTAGE;
  }

  /**
   * 构造函数 - 接受来自Scenario的InvestmentTypeRaw数据
   */
  constructor(data: InvestmentTypeRaw) {
    // 设置基本属性
    this.name = data.name;
    this.description = data.description;

    // 验证expense ratio非负
    if (data.expenseRatio < 0) {
      throw new Error("Expense ratio cannot be negative");
    }
    this.expenseRatio = data.expenseRatio;

    // 处理returnAmtOrPct - 从string转换为ChangeType枚举
    this._returnAmtOrPct = InvestmentType.convertAmtOrPct(data.returnAmtOrPct);

    // 处理returnDistribution - 解析分布类型和参数
    const returnDist = InvestmentType.parseDistribution(
      data.returnDistribution
    );
    this._returnDistributionType = returnDist.type;
    this._returnDistributionParams = returnDist.params;

    // 处理incomeAmtOrPct - 从string转换为ChangeType枚举
    this._incomeAmtOrPct = InvestmentType.convertAmtOrPct(data.incomeAmtOrPct);

    // 处理incomeDistribution - 解析分布类型和参数
    const incomeDist = InvestmentType.parseDistribution(
      data.incomeDistribution
    );
    this._incomeDistributionType = incomeDist.type;
    this._incomeDistributionParams = incomeDist.params;

    // 处理taxability - 从boolean转换为Taxability枚举
    this.taxability = data.taxability
      ? Taxability.TAXABLE
      : Taxability.TAX_EXEMPT;
  }

  /**
   * 生成预期年度回报
   * @param baseAmount 基础金额，用于计算百分比回报
   * @returns 预期年度回报金额
   */
  //todo:这里需要的是valueGenerator 而不是sample，不应该是个数字而是一个ValueGenerator
  generateExpectedAnnualReturn(baseAmount?: number): RandomGenerator {
    const returnValue = ValueGenerator(
      this._returnDistributionType,
      this._returnDistributionParams
    );

    return returnValue;
  }

  /**
   * 生成预期年度收入
   * @param baseAmount 基础金额，用于计算百分比收入
   * @returns 预期年度收入金额
   */
  //todo:这里需要的是valueGenerator 而不是sample，不应该是个数字而是一个ValueGenerator
  generateExpectedAnnualIncome(baseAmount?: number): RandomGenerator {
    const incomeValue = ValueGenerator(
      this._incomeDistributionType,
      this._incomeDistributionParams
    );
    return incomeValue;
  }
}
