import { create_simulation_state } from "../SimulationState";
import { Scenario } from "../../domain/scenario/Scenario";
import { TaxFilingStatus, TaxStatus } from "../../Enums";
import { Investment } from "../../domain/investment/Investment";

const baseScenario: Scenario = {
    tax_filing_status: TaxFilingStatus.MARRIED,
    user_birth_year: 1980,
    user_life_expectancy: 85,
    spouse_birth_year: 1982,
    spouse_life_expectancy: 85,
    inflation_assumption: { sample: () => 0.03 },
    investments: [] as any,
    event_series: [],
  } as unknown as Scenario;
  
  describe('Simulation State Methods', () => {
    let state: any;
  
    beforeEach(async () => {
      state = await create_simulation_state(baseScenario);
      state.federal_tax_service.find_deduction = jest.fn().mockReturnValue(25000);
      state.federal_tax_service.find_rate = jest.fn().mockReturnValue(0.22);
      state.state_tax_service.find_rate = jest.fn().mockReturnValue(0.05);
    });
  
    describe('advance_year', () => {
      test('should incr current year by one', () => {
        // check current year
        expect(state.get_current_year()).toBe(2024);
        expect(state.inflation_factor).toEqual(0.03);
  
        state.advance_year();
  
        // check it is incr by 1
        expect(state.get_current_year()).toBe(2025);
        
        // check inflation factor
        expect(state.inflation_factor).not.toEqual(0.03);
      });
  
      test('check for spouse die', () => {
        // spouse die in 2025
        state.spouse!.year_of_death = 2025;
  
        state.advance_year(); // 2025
        state.advance_year(); // 2026
  
        // update tax filling status
        expect(state.get_tax_filing_status()).toBe(TaxFilingStatus.SINGLE);
      });
    });
  
    describe('process_tax', () => {
      test('calculate tax', () => {
        // initialize the income
        state.incr_ordinary_income(80000);
        state.incr_capital_gains_income(20000);
        state.incr_social_security_income(30000);
  
        const initialCash = state.cash.get_value();
  
        state.process_tax();
  
        // taxable income formula
        const expectedTaxableIncome = 80000 + 20000 - (0.15 * 30000) - 25000;
        const expectedFederalTax = expectedTaxableIncome * 0.22;
        const expectedStateTax = expectedTaxableIncome * 0.05;
        const expectedNetIncome = expectedTaxableIncome - expectedFederalTax - expectedStateTax;
  
        expect(state.cash.incr_value).toHaveBeenCalledWith(expectedNetIncome);
        expect(state.cash.get_value()).toBeCloseTo(initialCash + expectedNetIncome);
      });
  
      test('no income', () => {
        state.incr_ordinary_income(0);
        state.incr_capital_gains_income(0);
        state.incr_social_security_income(0);
        state.process_tax();
        expect(state.cash.incr_value).toHaveBeenCalledWith(0);
      });
  
    });
  });