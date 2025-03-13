import React from "react";
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBuilding,
  FaPercentage,
  FaMoneyBillWave,
  FaCalendarAlt,
} from "react-icons/fa";

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
  totalExpenses,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box mb={6} width="100%">
      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 4 }}
        spacing={{ base: 3, md: 4 }}
        width="100%"
      >
        <Stat
          bg={bgColor}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <StatLabel display="flex" alignItems="center" mb={2}>
            <Icon as={FaBuilding} mr={2} color="blue.500" />
            Total Investments
          </StatLabel>
          <StatNumber fontWeight="bold">{totalInvestments}</StatNumber>
          <StatHelpText>Number of investments</StatHelpText>
        </Stat>

        <Stat
          bg={bgColor}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <StatLabel display="flex" alignItems="center" mb={2}>
            <Icon as={FaPercentage} mr={2} color="green.500" />
            Average Return
          </StatLabel>
          <StatNumber fontWeight="bold">
            {totalInvestmentReturn.toFixed(1)}%
          </StatNumber>
          <StatHelpText>Average annual return</StatHelpText>
        </Stat>

        <Stat
          bg={bgColor}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <StatLabel display="flex" alignItems="center" mb={2}>
            <Icon as={FaMoneyBillWave} mr={2} color="purple.500" />
            Total Value
          </StatLabel>
          <StatNumber fontWeight="bold">{totalValue}</StatNumber>
          <StatHelpText>Total investment value</StatHelpText>
        </Stat>

        <Stat
          bg={bgColor}
          p={4}
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="sm"
        >
          <StatLabel display="flex" alignItems="center" mb={2}>
            <Icon as={FaCalendarAlt} mr={2} color="red.500" />
            Monthly Expenses
          </StatLabel>
          <StatNumber fontWeight="bold">{totalExpenses}</StatNumber>
          <StatHelpText>Average monthly expenses</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentSummary;
