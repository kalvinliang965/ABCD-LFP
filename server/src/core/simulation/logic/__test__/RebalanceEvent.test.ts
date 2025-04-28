import { run_rebalance_investment } from '../RebalanceInvestments';
import { SimulationState } from '../../SimulationState';
import { TaxStatus } from '../../../Enums';

class MockInvestment {
  private value: number;
  private cost_basis: number;
  constructor(
    initial_value: number,
    initial_cost_basis: number,
    public tax_status: TaxStatus,
    public id: string = ''
  ) {
    this.value = initial_value;
    this.cost_basis = initial_cost_basis;
  }
  get_value() {
    return this.value;
  }
  get_cost_basis() {
    return this.cost_basis;
  }
  incr_value(amount: number) {
    this.value += amount;
  }
  incr_cost_basis(amount: number) {
    this.cost_basis += amount;
  }
}

class MockAccountManager {
  constructor(
    public non_retirement: Map<string, MockInvestment>,
    public pre_tax: Map<string, MockInvestment>,
    public after_tax: Map<string, MockInvestment>,
    public cash: MockInvestment
  ) {}
}

class MockEventManager {
  constructor(private rebalance_events: any[]) {}
  
  //required methods from EventManager interface
  clone() { return this; }
  get_active_income_event() { return []; }
  get_active_invest_event() { return []; }
  get_active_rebalance_event() { return this.rebalance_events; }
  get_active_mandatory_event() { return []; }
  get_active_discretionary_event() { return []; }
  get_income_breakdown() { return {}; }
  update_income_breakdown() {}
  reset_income_breakdown() {}
  get_expense_breakdown() { return {}; }
  update_expense_breakdown() {}
  reset_expense_breakdown() {}
  get_total_expenses() { return { mandatory: 0, discretionary: 0 }; }
  update_total_expenses() {}
  get_last_year_tax_totals() { return undefined; }
  update_last_year_tax_totals() {}
  update_initial_amount() { return 0; }
  income_event = new Map();
  expense_event = new Map();
  invest_event = new Map();
  rebalance_event = new Map();
}

class MockUserTaxData {
  private cur_year_gains: number = 0;
  incr_cur_year_gains(amount: number) {
    this.cur_year_gains += amount;
  }
  get_cur_year_gains() {
    return this.cur_year_gains;
  }
}

describe('run_rebalance_investment', () => {
  let mock_state: SimulationState;
  let mock_investment_a: MockInvestment;
  let mock_investment_b: MockInvestment;
  let mock_cash: MockInvestment;

  beforeEach(() => {
    //create mock investments
    mock_investment_a = new MockInvestment(6000, 5000, TaxStatus.AFTER_TAX, 'Stock A');
    mock_investment_b = new MockInvestment(4000, 3000, TaxStatus.AFTER_TAX, 'Stock B');
    mock_cash = new MockInvestment(1000, 1000, TaxStatus.NON_RETIREMENT);

    //create mock account manager
    const account_manager = new MockAccountManager(
      new Map(),
      new Map(),
      new Map([
        ['Stock A', mock_investment_a],
        ['Stock B', mock_investment_b]
      ]),
      mock_cash
    );

    //create mock event manager with a rebalance event
    const rebalance_event = {
      start: 2025,
      duration: 1,
      asset_allocation: new Map([
        ['Stock A', 0.5],
        ['Stock B', 0.5]
      ]),
      name: 'reb1',
      type: 'rebalance'
    };

    const event_manager = new MockEventManager([rebalance_event]);

    //create mock user tax data
    const user_tax_data = new MockUserTaxData();

    //create mock state
    mock_state = {
      get_current_year: () => 2025,
      account_manager,
      event_manager,
      user_tax_data
    } as unknown as SimulationState;
  });

  it('correctly rebalances investments to target allocation', () => {
    run_rebalance_investment(mock_state);

    const total_value = 6000 + 4000;
    const target_a = total_value * 0.5;
    const target_b = total_value * 0.5;

    expect(mock_investment_a.get_value()).toBeCloseTo(target_a);
    expect(mock_investment_b.get_value()).toBeCloseTo(target_b);
  });

  it('computes capital gains correctly when selling in non-retirement account', () => {
    //change investments to non-retirement to test capital gains
    mock_investment_a.tax_status = TaxStatus.NON_RETIREMENT;
    mock_investment_b.tax_status = TaxStatus.NON_RETIREMENT;

    run_rebalance_investment(mock_state);

    //calculate expected capital gains
    const total_value = 6000 + 4000;
    const target_a = total_value * 0.5;
    const target_b = total_value * 0.5;
    
    //only Stock A is being sold (6000 -> 5000)
    const sale_a = 6000 - target_a;
    const unrealized_gain_a = 6000 - 5000; //original value - cost basis
    const gain_a = unrealized_gain_a * (sale_a / 6000);
    
    expect(mock_state.user_tax_data.get_cur_year_gains()).toBeCloseTo(gain_a, 2);
  });

  it('does not compute capital gains for retirement accounts', () => {
    //keep investments as retirement accounts
    mock_investment_a.tax_status = TaxStatus.PRE_TAX;
    mock_investment_b.tax_status = TaxStatus.PRE_TAX;

    run_rebalance_investment(mock_state);

    expect(mock_state.user_tax_data.get_cur_year_gains()).toBe(0);
  });

  it('handles multiple rebalance events correctly', () => {
    //add another rebalance event
    const rebalance_event_2 = {
      start: 2025,
      duration: 1,
      asset_allocation: new Map([
        ['Stock A', 0.3],
        ['Stock B', 0.7]
      ]),
      name: 'reb2',
      type: 'rebalance'
    };

    mock_state.event_manager = new MockEventManager([rebalance_event_2]);

    run_rebalance_investment(mock_state);

    const total_value = 6000 + 4000;
    const target_a = total_value * 0.3;
    const target_b = total_value * 0.7;

    expect(mock_investment_a.get_value()).toBeCloseTo(target_a);
    expect(mock_investment_b.get_value()).toBeCloseTo(target_b);
  });
});
