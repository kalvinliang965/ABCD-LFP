import { InvestmentTypeRaw } from "./Scenarios";

// Define investment interface
export interface InvestmentType extends InvestmentTypeRaw {
  id: string | number;
  date: string;
  lastUpdated?: string;
  username: string;
}

// Props for the investment card component
export interface InvestmentCardProps {
  investment: InvestmentType;
  onClick?: () => void;
}

// Props for the investment detail modal
export interface InvestmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: InvestmentType | null;
}

// Props for the investment list component
export interface InvestmentListProps {
  investments: InvestmentType[];
  onOpenInvestmentModal: () => void;
}
