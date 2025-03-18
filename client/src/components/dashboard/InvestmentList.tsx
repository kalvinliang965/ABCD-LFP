import React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import InvestmentCard from "./InvestmentCard";
import AddInvestmentCard from "./AddInvestmentCard";

// Define investment type
type ReturnType = "fixed" | "normal";
type AccountType =
  | "non-retirement"
  | "pre-tax-retirement"
  | "after-tax-retirement";

interface Investment {
  id: string | number;
  name: string;
  description: string;
  date: string;
  icon: React.ReactElement;
  value: string;
  returnRate: number;
  returnType: ReturnType;
  expenseRatio: number;
  dividendType: ReturnType;
  dividendRate: number;
  taxability: "taxable" | "tax-exempt";
  accountType: AccountType;
}

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onOpenInvestmentModal,
}) => {
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Box mb={10} width="100%">
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4, "2xl": 5 }}
        spacing={{ base: 4, md: 5, lg: 6 }}
        width="100%"
        autoRows="1fr"
      >
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}

        <AddInvestmentCard onClick={onOpenInvestmentModal} />
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList;
