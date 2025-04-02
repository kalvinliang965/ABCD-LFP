import { rebalanceInvestments } from '../RebalanceInvestments';
import { SimulationState } from '../../SimulationState';
import { Scenario } from '../../../domain/scenario/Scenario';
import { TaxStatus } from '../../../Enums';

interface RebalanceEvent {
  start: number;
  duration: number;
  asset_allocation: Map<string, number>;
  glide_path: boolean;
  name: string;
  type: string;
}

class MockInvestment {
  private value: number;
  private costBasis: number;
  constructor(
    initialValue: number,
    initialCostBasis: number,
    public taxStatus: TaxStatus,
    public id: string = ''
  ) {
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
  is_tax_exempt(): boolean {
    return false;
  }
}

describe('rebalanceInvestments', () => {
  let mockState: SimulationState;
  let mockScenario: Scenario;

  beforeEach(() => {
    const investmentA = new MockInvestment(6000, 5000, TaxStatus.AFTER_TAX, 'Stock A');
    const investmentB = new MockInvestment(4000, 3000, TaxStatus.AFTER_TAX, 'Stock B');
    const cash = new MockInvestment(1000, 1000, TaxStatus.NON_RETIREMENT);

    const rebalanceEvent = {
      start: 2025,
      duration: 1,
      asset_allocation: new Map([
        ['Stock A', 50],
        ['Stock B', 50]
      ]),
      glide_path: false,
      name: 'reb1',
      type: 'rebalance'
    };

    mockState = {
      get_current_year: () => 2025,
      cash,
      incr_capital_gains_income: jest.fn(),
      accounts: {
        non_retirement: new Map(),
        pre_tax: new Map(),
        after_tax: new Map([
          ['Stock A', investmentA],
          ['Stock B', investmentB]
        ])
      },
      events_by_type: {
        invest: new Map(),
        income: new Map(),
        expense: new Map(),
        rebalance: new Map([['reb1', rebalanceEvent]])
      }
    } as unknown as SimulationState;

    mockScenario = {} as Scenario;
  });

  it('correctly rebalances investments to target allocation', () => {
    rebalanceInvestments(mockState, mockScenario);

    const totalValue = 6000 + 4000;
    const targetA = totalValue * 0.5;
    const targetB = totalValue * 0.5;

    expect(mockState.account_manager.after_tax.get('Stock A')!.get_value()).toBeCloseTo(targetA);
    expect(mockState.account_manager.after_tax.get('Stock B')!.get_value()).toBeCloseTo(targetB);
  });

  it('computes capital gains correctly when selling', () => {
    rebalanceInvestments(mockState, mockScenario);

    expect(mockState.incr_capital_gains_income).toHaveBeenCalled();
  });

  it('skips rebalance when allocation sum != 100', () => {
    const event = mockState.events_by_type.rebalance.get('reb1')! as RebalanceEvent;
    event.asset_allocation.set('Stock A', 80);
    event.asset_allocation.set('Stock B', 30); // now total = 110

    console.error = jest.fn();
    rebalanceInvestments(mockState, mockScenario);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Allocation percentages sum'));
  });
});
