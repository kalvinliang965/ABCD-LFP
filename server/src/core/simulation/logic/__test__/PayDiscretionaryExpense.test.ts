import { get_standard_deduction_from_db } from "../../../../db/repositories/StandardDeductionRepository";
import { get_state_taxbrackets_by_state, state_taxbrackets_exist_in_db } from "../../../../db/repositories/StateTaxBracketRepository";
import { get_capital_gains_brackets, get_taxable_income_brackets } from "../../../../db/repositories/TaxBracketRepository";
import { create_scenario_raw_yaml, scenario_yaml_string } from "../../../../services/ScenarioYamlParser";
import { scenario_one } from "../../../domain/raw/scenario_raw";
import { create_scenario } from "../../../domain/Scenario";
import { IncomeType, StateType, TaxFilingStatus } from "../../../Enums";
import { create_federal_tax_service } from "../../../tax/FederalTaxService";
import { create_state_tax_service } from "../../../tax/StateTaxService";
import { create_simulation_state, SimulationState } from "../../SimulationState"
import { pay_mandatory_expenses } from "../PayMandatoryExpense";

jest.mock("../../../../db/repositories/TaxBracketRepository", () => ({
    get_capital_gains_brackets: jest.fn(),
    get_taxable_income_brackets: jest.fn(),
    create_taxbracket_in_db: jest.fn(),
}))

jest.mock("../../../../db/repositories/StateTaxBracketRepository", () => ({
    create_state_taxbracket_in_db: jest.fn(),
    state_taxbrackets_exist_in_db: jest.fn(),
    get_state_taxbrackets_by_state: jest.fn(),
}))
jest.mock("../../../../db/repositories/StandardDeductionRepository", () => ({
    get_standard_deduction_from_db: jest.fn(),
}));

describe("Pay discretionary expense", () => {

    let state: SimulationState;
    
    beforeEach(async() => {
        jest.clearAllMocks();
        // Mock database responses
        (get_taxable_income_brackets as jest.Mock)
            .mockResolvedValue([
                {
                    min: 0,
                    max: 3000,
                    rate: 0.05,
                    income_type: IncomeType.TAXABLE_INCOME,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL
                },{
                    min: 3001,
                    max: Infinity,
                    rate: 0.10,
                    income_type: IncomeType.TAXABLE_INCOME,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                },{
                    min: 0,
                    max: 3000,
                    rate: 0.10,
                    income_type: IncomeType.TAXABLE_INCOME,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                },{
                    min: 3001,
                    max: Infinity,
                    rate: 0.2,
                    income_type: IncomeType.TAXABLE_INCOME,
                    taxpayer_type: TaxFilingStatus.COUPLE
                }
            ]);
        (get_capital_gains_brackets as jest.Mock)
            .mockResolvedValue([
                {
                    min: 0,
                    max: 3000,
                    rate: 0.05,
                    income_type: IncomeType.CAPITAL_GAINS,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL
                },{
                    min: 3001,
                    max: Infinity,
                    rate: 0.10,
                    income_type: IncomeType.CAPITAL_GAINS,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                },{
                    min: 0,
                    max: 3000,
                    rate: 0.10,
                    income_type: IncomeType.CAPITAL_GAINS,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                },{
                    min: 3001,
                    max: Infinity,
                    rate: 0.20,
                    income_type: IncomeType.CAPITAL_GAINS,
                    taxpayer_type: TaxFilingStatus.COUPLE
                }
            ]);
        (get_state_taxbrackets_by_state as jest.Mock)
            .mockResolvedValue([
                {
                    min: 0,
                    max: 8500,
                    rate: 0.04,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                },{
                    min: 8501,
                    max: 11700,
                    rate: 0.045,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                },{
                    min: 11700,
                    max: 13900,
                    rate: 0.0525,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                },{
                    min: 13901,
                    max: Infinity,
                    rate: 0.0585,
                    taxpayer_type: TaxFilingStatus.INDIVIDUAL,
                    resident_state: StateType.NY,
                },
                {
                    min: 0,
                    max: 8500,
                    rate: 0.08,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                },{
                    min: 8501,
                    max: 11700,
                    rate: 0.1,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                },{
                    min: 11700,
                    max: 13900,
                    rate: 0.15,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                },{
                    min: 13901,
                    max: Infinity,
                    rate: 0.2,
                    taxpayer_type: TaxFilingStatus.COUPLE,
                    resident_state: StateType.NY,
                }
            ]);
        (state_taxbrackets_exist_in_db as jest.Mock)
            .mockResolvedValue(true);

        (get_standard_deduction_from_db as jest.Mock)
        .mockResolvedValue([{ amount: 1000, taxpayer_type: TaxFilingStatus.INDIVIDUAL }, {amount: 2000, taxpayer_type: TaxFilingStatus.COUPLE}]);

        // Create service instance
        const federal_service = await create_federal_tax_service();
        const state_tax_service = await create_state_tax_service(StateType.NY);

        const scenario = await create_scenario(scenario_one);
        state = await create_simulation_state(scenario, federal_service, state_tax_service);

        state.tax_processor.calculate_taxes = jest.fn();

        state.event_manager.update_initial_amount = jest.fn();
    });


    it("should handle general case", async() => {

        state.setup();
        const discretionary_expense = 200;
        (state.event_manager.update_initial_amount as jest.Mock).mockReturnValue(discretionary_expense);
        const prev_networth = state.account_manager.get_net_worth();
        const num_discretionary_expense = state.event_manager.get_active_discretionary_event(state.get_current_year()).length;
      
        const total_discretionary_expense = num_discretionary_expense * discretionary_expense;
        // either pay everything or partially...
        expect(prev_networth - state.account_manager.get_net_worth()).
                toBeLessThanOrEqual(prev_networth - total_discretionary_expense);
        expect(state.account_manager.get_net_worth()).toBeGreaterThanOrEqual(state.get_financial_goal());
    });

})