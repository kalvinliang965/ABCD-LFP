import process_income from '../ProcessIncome';
import { SimulationState } from '../SimulationState';
import { TaxStatus } from '../../Enums';

//how to run this test
// cd server 
// npm test -- src/core/simulation/__test__/ProcessIncome.test.ts

/**
 * Test Case 1: Process All Investment Types Correctly
Scenario:
cash: 2% interest
stocks: 3% dividend
IRA (pre-tax): 4% growth
Pass Criteria:
Cash, stock, and IRA values increase correctly
Correct taxable income and qualified dividends are recorded
Total income returned matches expected (5700)

Test Case 2: Process Fixed Amount Income Correctly
Goal: Test fixed amount income handling (non-percent-based)
Scenario:
Bond generates $1000 fixed
Pass Criteria:
Bond value updated properly
Ordinary income incremented by $1000
Function returns total income $1000

Test Case 3: Handle Tax-Exempt Investments
Scenario:
muni_bonds: 3% interest, tax-exempt
Pass Criteria:
Bond value increases by $900
No taxable income is recorded
Function returns $900

Test Case 4: Handle Empty Accounts Gracefully
Scenario:
No investments
Pass Criteria:
No changes to income
Returns total income of 0

 */

describe('ProcessIncome', () => {
  // Test basic income processing
  test('should process income correctly for all investment types', async () => {
    // Arrange
    const mockState: any = {
      get_current_year: () => 2023,
      user: {
        is_alive: () => true
      },
      spouse: {
        is_alive: () => true
      },
      events_by_type: {
        income: new Map()
      },
      accounts: {
        non_retirement: new Map([
          ['cash', { 
            value: 10000, 
            tax_status: TaxStatus.NON_RETIREMENT,
            investment_type: {
              name: 'cash',
              incomeAmtOrPct: 'percent',
              incomeDistribution: new Map<string, string | number>([
                ['type', 'fixed'],
                ['value', 0.02] // 2% interest
              ]),
              taxability: true
            }
          }],
          ['stocks', { 
            value: 50000, 
            tax_status: TaxStatus.NON_RETIREMENT,
            investment_type: {
              name: 'stocks',
              incomeAmtOrPct: 'percent',
              incomeDistribution: new Map<string, string | number>([
                ['type', 'fixed'],
                ['value', 0.03] // 3% dividend
              ]),
              taxability: true
            }
          }]
        ]),
        pre_tax: new Map([
          ['ira', { 
            value: 100000, 
            tax_status: TaxStatus.PRE_TAX,
            investment_type: {
              name: 'bonds',
              incomeAmtOrPct: 'percent',
              incomeDistribution: new Map<string, string | number>([
                ['type', 'fixed'],
                ['value', 0.04] // 4% interest
              ]),
              taxability: true
            }
          }]
        ])
      },
      incr_ordinary_income: jest.fn(),
      incr_qualified_dividends: jest.fn()
    };

    // Act
    const result = await process_income(mockState);

    // Assert
    // Cash should generate $200 (10000 * 0.02)
    // Stocks should generate $1500 (50000 * 0.03)
    // IRA should generate $4000 (100000 * 0.04) but stays in the account
    
    // Check that cash value increased by its own interest
    expect(mockState.accounts.non_retirement.get('cash').value).toBeCloseTo(10200);
    
    // Check that stocks value increased by its dividend
    expect(mockState.accounts.non_retirement.get('stocks').value).toBeCloseTo(51500);
    
    // Check that IRA value increased by its interest
    expect(mockState.accounts.pre_tax.get('ira').value).toBeCloseTo(104000);
    
    // Check that ordinary income was increased for taxable interest
    expect(mockState.incr_ordinary_income).toHaveBeenCalledWith(200);
    
    // Check that qualified dividends were increased for stock dividends
    expect(mockState.incr_qualified_dividends).toHaveBeenCalledWith(1500);
    
    // Check the total income returned
    expect(result).toBeCloseTo(5700); // 200 + 1500 + 4000
  });

  // Test with fixed amount income
  test('should process fixed amount income correctly', async () => {
    // Arrange
    const mockState: any = {
      get_current_year: () => 2023,
      user: {
        is_alive: () => true
      },
      spouse: {
        is_alive: () => true
      },
      events_by_type: {
        income: new Map()
      },
      accounts: {
        non_retirement: new Map([
          ['bonds', { 
            value: 20000, 
            tax_status: TaxStatus.NON_RETIREMENT,
            investment_type: {
              name: 'bonds',
              incomeAmtOrPct: 'amount', // Fixed amount
              incomeDistribution: new Map<string, string | number>([
                ['type', 'fixed'],
                ['value', 1000] // $1000 interest
              ]),
              taxability: true
            }
          }]
        ]),
        pre_tax: new Map()
      },
      incr_ordinary_income: jest.fn(),
      incr_qualified_dividends: jest.fn()
    };

    // Act
    const result = await process_income(mockState);

    // Assert
    // Bonds should generate $1000 fixed amount
    expect(mockState.accounts.non_retirement.get('bonds').value).toBeCloseTo(21000);
    expect(mockState.incr_ordinary_income).toHaveBeenCalledWith(1000);
    expect(result).toBeCloseTo(1000);
  });

  // Test with tax-exempt investments
  test('should handle tax-exempt investments correctly', async () => {
    // Arrange
    const mockState: any = {
      get_current_year: () => 2023,
      user: {
        is_alive: () => true
      },
      spouse: {
        is_alive: () => true
      },
      events_by_type: {
        income: new Map()
      },
      accounts: {
        non_retirement: new Map([
          ['muni_bonds', { 
            value: 30000, 
            tax_status: TaxStatus.NON_RETIREMENT,
            investment_type: {
              name: 'muni bonds',
              incomeAmtOrPct: 'percent',
              incomeDistribution: new Map<string, string | number>([
                ['type', 'fixed'],
                ['value', 0.03] // 3% interest
              ]),
              taxability: false // Tax exempt
            }
          }]
        ]),
        pre_tax: new Map()
      },
      incr_ordinary_income: jest.fn(),
      incr_qualified_dividends: jest.fn()
    };

    // Act
    const result = await process_income(mockState);

    // Assert
    // Muni bonds should generate $900 (30000 * 0.03) but it's tax exempt
    expect(mockState.accounts.non_retirement.get('muni_bonds').value).toBeCloseTo(30900);
    expect(mockState.incr_ordinary_income).not.toHaveBeenCalled();
    expect(result).toBeCloseTo(900);
  });

  // Test with empty accounts
  test('should handle empty accounts gracefully', async () => {
    // Arrange
    const mockState: any = {
      get_current_year: () => 2023,
      user: {
        is_alive: () => true
      },
      spouse: {
        is_alive: () => true
      },
      events_by_type: {
        income: new Map()
      },
      accounts: {
        non_retirement: new Map(),
        pre_tax: new Map()
      },
      incr_ordinary_income: jest.fn(),
      incr_qualified_dividends: jest.fn()
    };

    // Act
    const result = await process_income(mockState);

    // Assert
    expect(result).toBe(0);
    expect(mockState.incr_ordinary_income).not.toHaveBeenCalled();
    expect(mockState.incr_qualified_dividends).not.toHaveBeenCalled();
  });
}); 