import { InvestmentTypeRaw } from "./Scenarios";

// Define investmentType interface
/**
 * 现在investmentType的完整的样子是
 * InvestmentType = {
 *  name: string; 
 *  description: string;
 *  returnAmtOrPct: string; // amount or percent
 *  returnDistribution: Map<string, any>;
 *  expenseRatio: number;
 *  incomeAmtOrPct: string;
 *  incomeDistribution: Map<string, any>;
 *  taxability: boolean;
 * 
 * 加上这里的就是
 * _id: string;
 * createdAt: string;
 * updatedAt: string;
 * }
 */


export interface InvestmentType extends InvestmentTypeRaw {
  _id?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Props for the investment card component
export interface InvestmentCardProps {
  investmentType: InvestmentType;
  onClick?: () => void;
}

// Props for the investment detail modal
export interface InvestmentTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentType: InvestmentType | null;
}

// Props for the investment list component
export interface InvestmentTypeListProps {
  investmentTypes: InvestmentType[];
  onOpenInvestmentTypeModal: () => void;
}
