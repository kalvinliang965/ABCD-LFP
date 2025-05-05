import { TaxStatus } from "../../Enums";
import { AccountManager } from "../AccountManager";
import { Investment } from "../investment/Investment";
import UserTaxData from "../UserTaxData";
import { WithdrawalProcessor } from "../WithdrawalProcessor";

  // withdrawal-processor.test.ts
  describe("WithdrawalProcessor", () => {
    let mockAccountManager: jest.Mocked<AccountManager>;
    let mockTaxData: jest.Mocked<UserTaxData>;
    let withdrawalProcessor: WithdrawalProcessor;
  
    beforeEach(() => {
      mockAccountManager = {
        all: jest.fn().mockReturnValue(new Map([
          ["cash", mockInvestment(5000, 5000, TaxStatus.NON_RETIREMENT)],
          ["stock-pre", mockInvestment(10000, 8000, TaxStatus.PRE_TAX)],
          ["stock-after", mockInvestment(8000, 8000, TaxStatus.AFTER_TAX)],
        ])),
      } as unknown as jest.Mocked<AccountManager>;
  
      mockTaxData = {
        incr_cur_year_gains: jest.fn(),
        incr_year_early_withdrawal: jest.fn(),
      } as unknown as jest.Mocked<UserTaxData>;
  
      withdrawalProcessor = new WithdrawalProcessor(
        mockAccountManager,
        mockTaxData,
        () => 55, // 55 years old
      );
    });
  
    describe("executeWithdrawal", () => {
      test("should withdraw from multiple investments in order", () => {
        // Arrange
        const strategy = ["cash", "stock-pre"];
        const amount = 7000;
  
        // Act
        const result = withdrawalProcessor.execute_withdrawal(strategy, amount);
  
        // Assert
        expect(result).toBe(7000);
        expect(getInvestmentValue("cash")).toBe(0);
        expect(getInvestmentValue("stock-pre")).toBe(10000 - 2000);
        expect(mockTaxData.incr_cur_year_gains).toHaveBeenCalledWith(0); // cash has no gains
        expect(mockTaxData.incr_year_early_withdrawal).not.toHaveBeenCalled(); // Age > 59
      });
  
      test("should handle early withdrawal penalties", () => {
        // Arrange
        withdrawalProcessor = new WithdrawalProcessor(
          mockAccountManager,
          mockTaxData,
          () => 58, // Below 59
        );
        const strategy = ["stock-pre"];
  
        // Act
        withdrawalProcessor.execute_withdrawal(strategy, 5000);
  
        // Assert
        expect(mockTaxData.incr_year_early_withdrawal).toHaveBeenCalledWith(5000);
      });
  
      test("should create new investment when needed", () => {
        // Arrange
        const strategy = ["non-existing-id"];
        
        // Act/Assert
        expect(() => withdrawalProcessor.execute_withdrawal(strategy, 1000))
          .toThrowError('Investment "non-existing-id" not found');
      });
  
      test("should handle partial withdrawals correctly", () => {
        // Arrange
        const strategy = ["stock-after"];
        const amount = 3000;
  
        // Act
        const result = withdrawalProcessor.execute_withdrawal(strategy, amount);
  
        // Assert
        expect(result).toBe(3000);
        expect(getInvestmentValue("stock-after")).toBe(5000);
        expect(mockTaxData.incr_year_early_withdrawal).toHaveBeenCalledWith(3000);
      });
    });
  
    function getInvestmentValue(id: string): number {
      return mockAccountManager.all().get(id)!.get_value();
    }
  
    function mockInvestment(value: number, costBasis: number, taxStatus: TaxStatus): Investment {
      return {
        get_value: () => value,
        get_cost_basis: () => costBasis,
        tax_status: taxStatus,
        incr_value: jest.fn((delta) => value += delta),
        incr_cost_basis: jest.fn(),
      } as unknown as Investment;
    }
  });