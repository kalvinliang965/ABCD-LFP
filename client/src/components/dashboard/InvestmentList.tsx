import React, { useState } from "react";
import { Box, SimpleGrid, useDisclosure } from "@chakra-ui/react";
import InvestmentCard from "./InvestmentCard";
import AddInvestmentCard from "./AddInvestmentCard";
import InvestmentDetailModal from "./InvestmentDetailModal";
import {
  type Investment,
  type InvestmentListProps,
} from "../../types/investment";

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onOpenInvestmentModal,
}) => {
  const [selectedInvestment, setSelectedInvestment] =
    useState<Investment | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleInvestmentClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setTimeout(() => setSelectedInvestment(null), 300);
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
          <InvestmentCard
            key={investment.id}
            investment={investment}
            onClick={() => handleInvestmentClick(investment)}
          />
        ))}

        <AddInvestmentCard onClick={onOpenInvestmentModal} />
      </SimpleGrid>

      <InvestmentDetailModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        investment={selectedInvestment}
      />
    </Box>
  );
};

export default InvestmentList;
