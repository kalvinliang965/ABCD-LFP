import process_rmds from '../ProcessRMD';
import { SimulationState } from '../SimulationState';
import { TaxStatus } from '../../Enums';
import * as RMDScraper from '../../../services/RMDScraper';

//how to run this test
// cd server 
// npm test -- src/core/simulation/__test__/ProcessRMD.test.ts

/**
 * Test Case 1: Process RMDs Correctly for User Over RMD Age
Scenario:
Age 75 → IRS factor mocked as 22.9
Pre-tax: IRA1 ($100,000), IRA2 ($200,000)
Cash starts at $50,000
Pass Criteria:
Total RMD = ~$13,100.44
IRA balances decrease
Cash account increases by RMD
Ordinary income updated
rmd_triggered flag set

Test Case 2: Skip RMDs for User Below RMD Age
Scenario:
User age 65
Pass Criteria:
No balance changes
RMD amount = 0
incr_ordinary_income not called
rmd_triggered false

Test Case 3: Skip RMDs for Deceased User
Scenario:
Age 75, but user is dead
Pass Criteria:
No balance changes
No income update
rmd_triggered false
Test Case 4: Handle Empty Pre-Tax Accounts
Goal: Verify RMD gracefully skips when no pre-tax accounts exist.
Scenario:
Age 75
Pre-tax accounts empty
Pass Criteria:
RMD = 0
Cash account unchanged
No income update
rmd_triggered false

Test Case 5: Handle Missing Cash Account Gracefully
Scenario:
Age 75
Only ira1 exists, no cash account
Pass Criteria:
RMD > 0
IRA balance reduced
Cash created or increased
incr_ordinary_income called
rmd_triggered true

 */

describe('ProcessRMD', () => {
  // Mock the RMD factor function
  beforeEach(() => {
    jest.spyOn(RMDScraper, 'getRMDFactorForAge').mockImplementation(async (age) => {
      // Return mock RMD factors based on age
      if (age < 72) return 0;
      if (age === 72) return 25.6;
      if (age === 75) return 22.9;
      if (age === 80) return 18.7;
      if (age === 85) return 14.8;
      if (age === 90) return 11.4;
      if (age >= 95) return 8.6;
      return 20.0; // Default for other ages
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should process RMDs correctly for a person over RMD age', async () => {
    // Arrange
    const mockState: any = {
      user: {
        get_age: () => 75, // Age that requires RMD
        is_alive: () => true
      },
      accounts: {
        pre_tax: new Map([
          ['ira1', { value: 100000, tax_status: TaxStatus.PRE_TAX }],
          ['ira2', { value: 200000, tax_status: TaxStatus.PRE_TAX }]
        ]),
        non_retirement: new Map([
          ['cash', { value: 50000, tax_status: TaxStatus.NON_RETIREMENT }]
        ])
      },
      rmd_strategy: ['ira1', 'ira2'], // Accounts to withdraw from
      incr_ordinary_income: jest.fn()
    };

    // Act
    const rmdAmount = await process_rmds(mockState);

    // Assert
    // For age 75, RMD factor is 22.9
    // IRA1 RMD: 100000 / 22.9 = ~4,366.81
    // IRA2 RMD: 200000 / 22.9 = ~8,733.62
    // Total RMD: ~13,100.44

    // Check that the RMD amount is correct
    expect(rmdAmount).toBeCloseTo(13100.44, 1);

    // Check that the IRA values were reduced by the RMD amount
    expect(mockState.accounts.pre_tax.get('ira1').value).toBeCloseTo(95633.19, 1);
    expect(mockState.accounts.pre_tax.get('ira2').value).toBeCloseTo(191266.38, 1);

    // Check that the cash account was increased by the RMD amount
    expect(mockState.accounts.non_retirement.get('cash').value).toBeCloseTo(63100.44, 1);

    // Check that ordinary income was increased by the RMD amount
    expect(mockState.incr_ordinary_income.mock.calls[0][0]).toBeCloseTo(13100.44, 2);

    // Check that the RMD triggered flag was set
    expect(mockState.rmd_triggered).toBe(true);
  });

  test('should not process RMDs for a person under RMD age', async () => {
    // Arrange
    const mockState: any = {
      user: {
        get_age: () => 65, // Age below RMD requirement
        is_alive: () => true
      },
      accounts: {
        pre_tax: new Map([
          ['ira1', { value: 100000, tax_status: TaxStatus.PRE_TAX }],
          ['ira2', { value: 200000, tax_status: TaxStatus.PRE_TAX }]
        ]),
        non_retirement: new Map([
          ['cash', { value: 50000, tax_status: TaxStatus.NON_RETIREMENT }]
        ])
      },
      rmd_strategy: ['ira1', 'ira2'],
      incr_ordinary_income: jest.fn()
    };

    // Act
    const rmdAmount = await process_rmds(mockState);

    // Assert
    // No RMDs should be processed for someone under 72
    expect(rmdAmount).toBe(0);

    // Check that the IRA values were not changed
    expect(mockState.accounts.pre_tax.get('ira1').value).toBe(100000);
    expect(mockState.accounts.pre_tax.get('ira2').value).toBe(200000);

    // Check that the cash account was not changed
    expect(mockState.accounts.non_retirement.get('cash').value).toBe(50000);

    // Check that ordinary income was not increased
    expect(mockState.incr_ordinary_income).not.toHaveBeenCalled();

    // Check that the RMD triggered flag was not set
    expect(mockState.rmd_triggered).toBeFalsy();
  });

  test('should not process RMDs for a deceased person', async () => {
    // Arrange
    const mockState: any = {
      user: {
        get_age: () => 75, // Age that would require RMD
        is_alive: () => false // But person is deceased
      },
      accounts: {
        pre_tax: new Map([
          ['ira1', { value: 100000, tax_status: TaxStatus.PRE_TAX }],
          ['ira2', { value: 200000, tax_status: TaxStatus.PRE_TAX }]
        ]),
        non_retirement: new Map([
          ['cash', { value: 50000, tax_status: TaxStatus.NON_RETIREMENT }]
        ])
      },
      rmd_strategy: ['ira1', 'ira2'],
      incr_ordinary_income: jest.fn()
    };

    // Act
    const rmdAmount = await process_rmds(mockState);

    // Assert
    // No RMDs should be processed for a deceased person
    expect(rmdAmount).toBe(0);

    // Check that the IRA values were not changed
    expect(mockState.accounts.pre_tax.get('ira1').value).toBe(100000);
    expect(mockState.accounts.pre_tax.get('ira2').value).toBe(200000);

    // Check that the cash account was not changed
    expect(mockState.accounts.non_retirement.get('cash').value).toBe(50000);

    // Check that ordinary income was not increased
    expect(mockState.incr_ordinary_income).not.toHaveBeenCalled();

    // Check that the RMD triggered flag was not set
    expect(mockState.rmd_triggered).toBeFalsy();
  });

  test('should handle empty pre-tax accounts gracefully', async () => {
    // Arrange
    const mockState: any = {
      user: {
        get_age: () => 75, // Age that requires RMD
        is_alive: () => true
      },
      accounts: {
        pre_tax: new Map(), // No pre-tax accounts
        non_retirement: new Map([
          ['cash', { value: 50000, tax_status: TaxStatus.NON_RETIREMENT }]
        ])
      },
      rmd_strategy: [],
      incr_ordinary_income: jest.fn()
    };

    // Act
    const rmdAmount = await process_rmds(mockState);

    // Assert
    // No RMDs should be processed if there are no pre-tax accounts
    expect(rmdAmount).toBe(0);

    // Check that the cash account was not changed
    expect(mockState.accounts.non_retirement.get('cash').value).toBe(50000);

    // Check that ordinary income was not increased
    expect(mockState.incr_ordinary_income).not.toHaveBeenCalled();

    // Check that the RMD triggered flag was not set
    expect(mockState.rmd_triggered).toBeFalsy();
  });

  test('should handle missing cash account gracefully', async () => {
    // Arrange
    const mockState: any = {
      user: {
        get_age: () => 75, // Age that requires RMD
        is_alive: () => true
      },
      accounts: {
        pre_tax: new Map([
          ['ira1', { value: 100000, tax_status: TaxStatus.PRE_TAX }]
        ]),
        non_retirement: new Map() // No cash account
      },
      rmd_strategy: ['ira1'],
      incr_ordinary_income: jest.fn()
    };

    // Act
    const rmdAmount = await process_rmds(mockState);

    // Assert
    // RMDs should still be processed even without a cash account
    // The function should create a cash account or handle this case
    expect(rmdAmount).toBeGreaterThan(0);

    // Check that the IRA value was reduced
    expect(mockState.accounts.pre_tax.get('ira1').value).toBeLessThan(100000);

    // Check that ordinary income was increased
    expect(mockState.incr_ordinary_income).toHaveBeenCalled();

    // Check that the RMD triggered flag was set
    expect(mockState.rmd_triggered).toBe(true);
  });
}); 