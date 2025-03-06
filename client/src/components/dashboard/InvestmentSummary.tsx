import React from 'react';
import {
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaChartLine, 
  FaMoneyBillWave 
} from 'react-icons/fa';
import InvestmentCard from '../InvestmentCard';

interface InvestmentSummaryProps {
  totalInvestments: number;
  totalInvestmentReturn: number;
  totalValue: string;
  totalExpenses: string;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  totalInvestments,
  totalInvestmentReturn,
  totalValue,
  totalExpenses
}) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
      <InvestmentCard
        title="Total Investments"
        value={totalInvestments.toString()}
        change={totalInvestmentReturn}
        icon={FaChartLine}
      />
      <InvestmentCard
        title="Total Expenses"
        value={totalExpenses}
        change={-0.03}
        icon={FaMoneyBillWave}
      />
    </SimpleGrid>
  );
};

export default InvestmentSummary; 