import React, { useState } from "react";
import {
  Box,
  SimpleGrid,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import InvestmentCard from "./InvestmentCard";
import AddInvestmentCard from "./AddInvestmentCard";
import {
  type InvestmentType,
  type InvestmentTypeListProps,
} from "../../types/investmentTypes";

// this is the page that will be deleted later.
const InvestmentList: React.FC<InvestmentTypeListProps> = ({
  investmentTypes,
  onOpenInvestmentTypeModal,
}) => {
  const [selectedInvestmentType, setSelectedInvestmentType] =
    useState<InvestmentType | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const columns = useBreakpointValue({
    base: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    "2xl": 5,
  });

  const spacing = useBreakpointValue({
    base: 4,
    md: 5,
    lg: 6,
  });

  const handleInvestmentTypeClick = (investmentType: InvestmentType) => {
    setSelectedInvestmentType(investmentType);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setTimeout(() => setSelectedInvestmentType(null), 300);
  };

  return (
    <Box mb={10} width="100%">
      <SimpleGrid
        columns={columns}
        spacing={spacing}
        width="100%"
        autoRows="1fr"
      >
        {investmentTypes.map((investmentType) => (
          <InvestmentCard
            key={investmentType._id}
            investmentType={investmentType}
            onClick={() => handleInvestmentTypeClick(investmentType)}
          />
        ))}

        <AddInvestmentCard onClick={onOpenInvestmentTypeModal} />
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList;
