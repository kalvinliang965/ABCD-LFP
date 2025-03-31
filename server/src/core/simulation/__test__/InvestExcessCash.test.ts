import { investExcessCash } from '../logic/InvestExcessCash';
import { SimulationState } from '../SimulationState';
import { Scenario } from '../../domain/scenario/Scenario';
import { TaxStatus } from '../../Enums';

interface InvestEvent {
  start: number;
  duration: number;
  max_cash: number;
  asset_allocation: Map<string, number>;
  asset_allocation2?: Map<string, number>;
  glide_path: boolean;
  name: string;
  type: string;
}

class MockInvestment {
  private value: number;
  private costBasis: number;
  public taxStatus: TaxStatus;

  constructor(initialValue: number, initialCostBasis: number, taxStatus: TaxStatus) {
    this.value = initialValue;
    this.costBasis = initialCostBasis;
    this.taxStatus = taxStatus;
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

describe('investExcessCash', () => {
  let mockState: SimulationState;
  let mockScenario: Scenario;

  beforeEach(() => {
    const investmentA = new MockInvestment(1000, 1000, TaxStatus.NON_RETIREMENT);
    const investmentB = new MockInvestment(1000, 1000, TaxStatus.AFTER_TAX);
    const cash = new MockInvestment(10000, 10000, TaxStatus.NON_RETIREMENT);

    const investEvent = {
      start: 2025,
      duration: 1,
      max_cash: 1000,
      asset_allocation: new Map([
        ['Stock A', 60],
        ['Stock B', 40]
      ]),
      glide_path: false,
      name: 'invest1',
      type: 'invest'
    };

    mockState = {
      cash,
      get_current_year: () => 2025,
      accounts: {
        non_retirement: new Map([['Stock A', investmentA]]),
        pre_tax: new Map(),
        after_tax: new Map([['Stock B', investmentB]])
      },
      events_by_type: {
        invest: new Map([['invest1', investEvent]]),
        income: new Map(),
        expense: new Map(),
        rebalance: new Map()
      }
    } as unknown as SimulationState;

    mockScenario = {} as Scenario;
  });

  it('invests excess cash according to fixed allocation', () => {
    investExcessCash(mockState, mockScenario);

    const investedA = mockState.accounts.non_retirement.get('Stock A')!.get_value();
    const investedB = mockState.accounts.after_tax.get('Stock B')!.get_value();
    const expectedExcess = 10000 - 1000;

    expect(investedA).toBeCloseTo(1000 + expectedExcess * 0.6);
    expect(investedB).toBeCloseTo(1000 + expectedExcess * 0.4);
    expect(mockState.cash.get_value()).toBeCloseTo(1000);
  });

  it('handles glide path interpolation correctly', () => {
    const investEvent = mockState.events_by_type.invest.get('invest1')! as InvestEvent;
    investEvent.glide_path = true;
    investEvent.asset_allocation2 = new Map([
      ['Stock A', 30],
      ['Stock B', 70]
    ]);

    investExcessCash(mockState, mockScenario);

    const expectedA = (60 / 100) * (10000 - 1000);
    const expectedB = (40 / 100) * (10000 - 1000);

    expect(mockState.accounts.non_retirement.get('Stock A')!.get_value()).toBeCloseTo(1000 + expectedA);
    expect(mockState.accounts.after_tax.get('Stock B')!.get_value()).toBeCloseTo(1000 + expectedB);
  });

  it('skips investment if allocation does not sum to 100', () => {
    const investEvent = mockState.events_by_type.invest.get('invest1')! as InvestEvent;
    investEvent.asset_allocation.set('Stock A', 80);
    investEvent.asset_allocation.set('Stock B', 30); // 110 total

    const logSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    investExcessCash(mockState, mockScenario);

    expect(mockState.accounts.non_retirement.get('Stock A')!.get_value()).toBe(1000);
    expect(mockState.accounts.after_tax.get('Stock B')!.get_value()).toBe(1000);
    expect(mockState.cash.get_value()).toBe(10000);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Allocation percentages sum'));

    logSpy.mockRestore();
  });
});
