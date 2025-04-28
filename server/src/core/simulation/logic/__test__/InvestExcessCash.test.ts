import { run_invest_event } from '../InvestExcessCash';
import { SimulationState } from '../../SimulationState';
import { simulation_logger } from '../../../../utils/logger/logger';

//mock the logger to avoid console output during tests
jest.mock('../../../../utils/logger/logger', () => ({
  simulation_logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

interface InvestEvent {
  start: number;
  duration: number;
  max_cash: number;
  asset_allocation: Map<string, number>;
  asset_allocation2: Map<string, number>;
  glide_path: boolean;
  name: string;
  type: string;
}

class MockInvestment {
  private value: number;
  private costBasis: number;

  constructor(initialValue: number, initialCostBasis: number) {
    this.value = initialValue;
    this.costBasis = initialCostBasis;
  }

  get_value() {
    return this.value;
  }

  get_cost_basis() {
    return this.costBasis;
  }

  incr_value(amount: number) {
    this.value += amount;
  }

  incr_cost_basis(amount: number) {
    this.costBasis += amount;
  }
}

describe('invest_excess_cash', () => {
  let mockState: SimulationState;

  beforeEach(() => {
    const investmentA = new MockInvestment(1000, 1000);
    const investmentB = new MockInvestment(1000, 1000);
    const cash = new MockInvestment(10000, 10000);

    const investEvent: InvestEvent = {
      start: 2025,
      duration: 1,
      max_cash: 1000,
      asset_allocation: new Map([
        ['Stock A', 0.6],
        ['Stock B', 0.4]
      ]),
      asset_allocation2: new Map([
        ['Stock A', 0.6],
        ['Stock B', 0.4]
      ]),
      glide_path: false,
      name: 'invest1',
      type: 'invest'
    };

    mockState = {
      get_current_year: () => 2025,
      get_after_tax_contribution_limit: () => 6000,
      account_manager: {
        cash: cash,
        non_retirement: new Map([['Stock A', investmentA]]),
        pre_tax: new Map(),
        after_tax: new Map([['Stock B', investmentB]])
      },
      event_manager: {
        get_active_invest_event: jest.fn().mockReturnValue([investEvent])
      }
    } as unknown as SimulationState;
  });

  it('invests excess cash according to fixed allocation', () => {
    run_invest_event(mockState);

    const investedA = mockState.account_manager.non_retirement.get('Stock A')!.get_value();
    const investedB = mockState.account_manager.after_tax.get('Stock B')!.get_value();
    const expectedExcess = 10000 - 1000;

    expect(investedA).toBeCloseTo(1000 + expectedExcess * 0.6);
    expect(investedB).toBeCloseTo(1000 + expectedExcess * 0.4);
    expect(mockState.account_manager.cash.get_value()).toBeCloseTo(1000);
  });

  it('handles glide path interpolation correctly', () => {
    //get the event and update its settings
    const investEvent = mockState.event_manager.get_active_invest_event(2025)[0];
    investEvent.glide_path = true;
    investEvent.asset_allocation2 = new Map([
      ['Stock A', 0.3],
      ['Stock B', 0.7]
    ]);

    run_invest_event(mockState);

    //since we're at the start of the glide path aka 0% progress, it should use the initial allocation
    const expectedExcess = 10000 - 1000;
    expect(mockState.account_manager.non_retirement.get('Stock A')!.get_value()).toBeCloseTo(1000 + expectedExcess * 0.6);
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBeCloseTo(1000 + expectedExcess * 0.4);
  });

  it('correctly interpolates values midway through glide path', () => {
    //get the event and update its settings
    const investEvent = mockState.event_manager.get_active_invest_event(2025)[0];
    investEvent.glide_path = true;
    investEvent.start = 2023;
    investEvent.duration = 4; //2023-2027
    investEvent.asset_allocation = new Map([
      ['Stock A', 0.8],
      ['Stock B', 0.2]
    ]);
    investEvent.asset_allocation2 = new Map([
      ['Stock A', 0.4],
      ['Stock B', 0.6]
    ]);

    //now in 2025, which is 2 years into a 4 year duration aka 50% progress 
    mockState.get_current_year = jest.fn().mockReturnValue(2025);

    run_invest_event(mockState);

    const expectedExcess = 10000 - 1000;
    //should be halfway between initial and final values
    //Stock A: 0.8 -> 0.4, midpoint is 0.6
    //Stock B: 0.2 -> 0.6, midpoint is 0.4
    expect(mockState.account_manager.non_retirement.get('Stock A')!.get_value()).toBeCloseTo(1000 + expectedExcess * 0.6);
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBeCloseTo(1000 + expectedExcess * 0.4);
  });

  it('skips investment if allocation percentages do not sum to 1', () => {
    //get the event and update its settings
    const investEvent = mockState.event_manager.get_active_invest_event(2025)[0];
    investEvent.asset_allocation = new Map([
      ['Stock A', 0.8],
      ['Stock B', 0.3] //sum is 1.1, should warn and skip
    ]);

    run_invest_event(mockState);

    //values should remain unchanged
    expect(mockState.account_manager.non_retirement.get('Stock A')!.get_value()).toBe(1000);
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBe(1000);
    expect(mockState.account_manager.cash.get_value()).toBe(10000);
    
    //should have warned about incorrect allocation
    expect(simulation_logger.warn).toHaveBeenCalledWith(expect.stringContaining('Allocation percentages sum'));
  });

  it('respects after-tax contribution limits', () => {
    //set a lower after-tax contribution limit
    mockState.get_after_tax_contribution_limit = jest.fn().mockReturnValue(2000);
    
    //create an allocation where all goes to after-tax
    const investEvent = mockState.event_manager.get_active_invest_event(2025)[0];
    investEvent.asset_allocation = new Map([
      ['Stock B', 1.0] //all to after-tax account
    ]);
    investEvent.asset_allocation2 = new Map([
      ['Stock B', 1.0]
    ]);

    run_invest_event(mockState);

    //should only contribute up to the limit to after-tax
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBeCloseTo(1000 + 2000);
    expect(mockState.account_manager.cash.get_value()).toBeCloseTo(10000 - 2000);
  });

  it('redistributes excess after-tax contributions to non-retirement accounts', () => {
    //set a lower after-tax contribution limit
    mockState.get_after_tax_contribution_limit = jest.fn().mockReturnValue(2000);
    
    //create an allocation with a mix of after-tax and non-retirement
    const investEvent = mockState.event_manager.get_active_invest_event(2025)[0];
    investEvent.asset_allocation = new Map([
      ['Stock A', 0.4], //non-ret
      ['Stock B', 0.6]  //after-tax
    ]);
    investEvent.asset_allocation2 = new Map([
      ['Stock A', 0.4],
      ['Stock B', 0.6]
    ]);

    run_invest_event(mockState);

    const expectedExcess = 10000 - 1000; //= 9000
    //after-tax is limited to 2000
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBeCloseTo(1000 + 2000);
    
    //the remaining 7000 should go to non-retirement
    expect(mockState.account_manager.non_retirement.get('Stock A')!.get_value()).toBeCloseTo(1000 + (expectedExcess - 2000));
    
    //cash should be at max_cash
    expect(mockState.account_manager.cash.get_value()).toBeCloseTo(1000);
  });
});
