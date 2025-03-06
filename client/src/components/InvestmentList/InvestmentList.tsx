// InvestmentList.tsx
import React from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import InvestmentListHeader from './InvestmentListHeader';
import InvestmentCard from './InvestmentCard';
import AddInvestmentCard from './AddInvestmentCard';
import { Investment } from '../../types/investment';

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

// !: this is the father component of the investment list
const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onOpenInvestmentModal }) => {
  return (
    <Box mb={10}>
      <InvestmentListHeader onAdd={onOpenInvestmentModal} /> {/* header */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}> {/* grid/ main section */}
        {investments.map((investment) => (
          <InvestmentCard key={investment._id} investment={investment} />
        ))}
        <AddInvestmentCard onAdd={onOpenInvestmentModal} /> {/* add investment card */}
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList;
