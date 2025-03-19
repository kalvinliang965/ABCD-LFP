/**
 * Investment-related type definitions
 */

// Define return types
export enum ReturnType {
  FIXED = "fixed",
  NORMAL = "normal",
}

// Define input modes
export enum ValueInputMode {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

// Define account types
export type AccountType =
  | "non-retirement"
  | "pre-tax-retirement"
  | "after-tax-retirement";

// Define investment interface
export interface Investment {
  id: string | number;
  name: string;
  description: string;
  date?: string;
  lastUpdated?: string;
  value?: string | number;
  returnRate?: number;
  returnType: ReturnType | string;
  returnValue?: number | string;
  returnInputMode?: ValueInputMode | string;
  expenseRatio?: number;
  dividendType?: ReturnType | string;
  dividendValue?: number | string;
  dividendRate?: number;
  dividendInputMode?: ValueInputMode | string;
  taxability: "taxable" | "tax-exempt";
  accountType?: AccountType;
  returnRateStdDev?: number;
  dividendRateStdDev?: number;
  username?: string;
}

// Props for the investment card component
export interface InvestmentCardProps {
  investment: Investment;
  onClick?: () => void;
}

// Props for the investment detail modal
export interface InvestmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
}

// Props for the investment list component
export interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}
