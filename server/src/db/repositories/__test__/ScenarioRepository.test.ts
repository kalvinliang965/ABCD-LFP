import { IScenario } from "../../models/Scenario";
import { ExpenseEventRaw, food_expense_one, IncomeEventRaw, my_investments_investment_one, rebalance_one, salary_income_event_one, streaming_services_expense_one, vacation_expense_one } from "../../../core/domain/raw/event_raw/event_raw";
import { Types } from "mongoose";
import { cash_investment_type_one, s_and_p_500_investment_type_one, tax_exempt_bonds_investment_type_one } from "../../../core/domain/raw/investment_type_raw";
import { cash_investment_one, s_and_p_500_investment_non_retirement_one, s_and_p_500_investment_after_tax_one, s_and_p_500_investment_pre_tax_one, tax_exempt_bonds_investment_one } from "../../../core/domain/raw/investment_raw";
import { convert_db_to_scenario_raw } from "../ScenarioRepository";

export function create_mock_scenario_db(overrides: Partial<IScenario> = {}): IScenario {
  const base_scenario = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId,
    isDraft: false,
    name: "Retirement Planning Scenario",
    maritalStatus: "couple",
    birthYears: [1985, 1987],
    lifeExpectancy: [
        { type: "fixed", value: 80 },
        { type: "normal", mean: 82, stdev: 3}
    ],
    investmentTypes: [
        cash_investment_type_one,
        s_and_p_500_investment_type_one,
        tax_exempt_bonds_investment_type_one,
    ],
    investments: [
        cash_investment_one,
        s_and_p_500_investment_non_retirement_one,
        tax_exempt_bonds_investment_one,
        s_and_p_500_investment_pre_tax_one,
        s_and_p_500_investment_after_tax_one,
    ],
    eventSeries: [
        salary_income_event_one,
        food_expense_one,
        vacation_expense_one,
        streaming_services_expense_one,
        my_investments_investment_one,
        rebalance_one,
    ],
    inflationAssumption: { type: "fixed", value: 0.03 },
    afterTaxContributionLimit: 7000,
    spendingStrategy: [vacation_expense_one.name, streaming_services_expense_one.name],
    expenseWithdrawalStrategy: [
        s_and_p_500_investment_non_retirement_one.id,
        tax_exempt_bonds_investment_one.id,
        s_and_p_500_investment_after_tax_one.id,
    ],
    RMDStrategy: [s_and_p_500_investment_pre_tax_one.id],
    RothConversionOpt: true,
    RothConversionStart: 2050,
    RothConversionEnd: 2060,
    RothConversionStrategy: [s_and_p_500_investment_pre_tax_one.id],
    financialGoal: 10000,
    residenceState: "NY",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  } as unknown as IScenario;

  return base_scenario;
}

describe("ScenarioRepository", () => {
    it("should parse from db scenario to scenario raw correctly", () => {
      const base_scenario_from_db = create_mock_scenario_db();
      const scenario_raw = convert_db_to_scenario_raw(base_scenario_from_db);
  
      // check the value
      expect(scenario_raw.name).toBe("Retirement Planning Scenario");
      expect(scenario_raw.maritalStatus).toBe("couple");
      expect(scenario_raw.birthYears).toEqual([1985, 1987]);
      expect(scenario_raw.financialGoal).toBe(10000);
      expect(scenario_raw.residenceState).toBe("NY");
  
      // make sure it is set
      expect(scenario_raw.investmentTypes).toBeInstanceOf(Set);
      expect(scenario_raw.investmentTypes.size).toBe(3); // make sure we are reading three
      expect(scenario_raw.investments).toBeInstanceOf(Set);
      expect(scenario_raw.investments.size).toBe(5); // 5 invetments
      expect(scenario_raw.eventSeries).toBeInstanceOf(Set);
      expect(scenario_raw.eventSeries.size).toBe(6); // 6 event series
  
      // check the string value
      expect(scenario_raw.spendingStrategy).toEqual([
        vacation_expense_one.name,
        streaming_services_expense_one.name
      ]);
      expect(scenario_raw.RothConversionStrategy).toEqual([
        s_and_p_500_investment_pre_tax_one.id
      ]);
  
      // check for distribution
      expect(scenario_raw.inflationAssumption).toEqual({
        type: "fixed",
        value: 0.03
      });
      expect(scenario_raw.lifeExpectancy).toEqual([
        { type: "fixed", value: 80 },
        { type: "normal", mean: 82, stdev: 3 }
      ]);
  
      // check for investment types
      Array.from(scenario_raw.investmentTypes).forEach(investmentType => {
        expect(investmentType).toMatchObject({
          name: expect.any(String),
          description: expect.any(String),
          returnAmtOrPct: expect.stringMatching(/amount|percent/),
          expenseRatio: expect.any(Number),
          taxability: expect.any(Boolean)
        });
      });
  
      // check for investments
      Array.from(scenario_raw.investments).forEach(investment => {
        expect(investment).toMatchObject({
          investmentType: expect.any(String),
          value: expect.any(Number),
          taxStatus: expect.stringMatching(/non-retirement|pre-tax|after-tax/),
          id: expect.any(String)
        });
      });
  
      // check for event series conversion
      Array.from(scenario_raw.eventSeries).forEach(event => {
        expect(event).toMatchObject({
          name: expect.any(String),
          type: expect.stringMatching(/income|expense|invest|rebalance/),
          start: expect.any(Object),
          duration: expect.any(Object)
        });
  
        if (event.type === "expense") {
          const expense = event as ExpenseEventRaw;
          expect(expense).toHaveProperty("discretionary");
        } else if (event.type === "income") {
          const income = event as IncomeEventRaw;
          expect(income).toHaveProperty("socialSecurity");
        }
      });
  
      expect(scenario_raw.afterTaxContributionLimit).toBe(7000);
      expect(scenario_raw.RothConversionOpt).toBe(true);
      expect(scenario_raw.RothConversionStart).toBe(2050);
      expect(scenario_raw.RothConversionEnd).toBe(2060);
    });
  
    it("should handle empty arrays in db scenario", () => {
      const empty_scenario = create_mock_scenario_db({
        investments: [],
        investmentTypes: [],
        eventSeries: []
      });
  
      const scenario_raw = convert_db_to_scenario_raw(empty_scenario);
  
      expect(scenario_raw.investments.size).toBe(0);
      expect(scenario_raw.investmentTypes.size).toBe(0);
      expect(scenario_raw.eventSeries.size).toBe(0);
    });
  
    it("should convert individual marital status correctly", () => {
      const individual_scenario = create_mock_scenario_db({
        maritalStatus: "individual",
        birthYears: [1990]
      });
  
      const scenario_raw = convert_db_to_scenario_raw(individual_scenario);
      
      expect(scenario_raw.maritalStatus).toBe("individual");
      expect(scenario_raw.birthYears).toEqual([1990]);
    });
  
    it("should preserve all distribution types", () => {
      const uniform_scenario = create_mock_scenario_db({
        inflationAssumption: { type: "uniform", lower: 0.02, upper: 0.05 }
      });
  
      const scenario_raw = convert_db_to_scenario_raw(uniform_scenario);
      
      expect(scenario_raw.inflationAssumption).toEqual({
        type: "uniform",
        lower: 0.02,
        upper: 0.05
      });
    });
  });