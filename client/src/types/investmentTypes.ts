import { InvestmentTypeRaw } from "./Scenarios";



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
