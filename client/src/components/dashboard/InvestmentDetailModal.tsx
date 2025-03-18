import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Text,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import {
  ReturnType,
  type InvestmentDetailModalProps,
} from "../../types/investment";

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  isOpen,
  onClose,
  investment,
}) => {
  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const statBgColor = useColorModeValue("blue.50", "blue.900");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");

  if (!investment) {
    return null;
  }

  // Helper function: format percentage
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  // Helper function: format currency
  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined) return "N/A";
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, ""))
        : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericValue);
  };

  // Render return information
  const renderReturnInfo = () => {
    let returnText;
    let returnDescription;

    switch (investment.returnType) {
      case ReturnType.FIXED:
        returnText = "Fixed Return Rate";
        returnDescription =
          "A fixed return investment provides a consistent, predetermined return.";
        break;
      case ReturnType.NORMAL:
        returnText = "Average Return Rate (Normal Distribution)";
        returnDescription =
          "Normal distribution returns vary with an average (mean) and standard deviation.";
        break;
      default:
        returnText = "Return Rate";
        returnDescription = "Expected annual return on this investment.";
    }

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>{returnText}</StatLabel>
          <StatNumber fontSize="xl">
            {formatPercent(investment.returnRate)}
          </StatNumber>
          <StatHelpText>
            {investment.returnType === ReturnType.NORMAL &&
              investment.returnRateStdDev && (
                <Tooltip label="Standard deviation represents the volatility of returns">
                  <Flex alignItems="center">
                    Std Dev: {formatPercent(investment.returnRateStdDev)}
                  </Flex>
                </Tooltip>
              )}
          </StatHelpText>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          {returnDescription}
        </Text>
      </Box>
    );
  };

  // Render dividend information
  const renderDividendInfo = () => {
    if (!investment.dividendType && !investment.dividendRate) {
      return (
        <Box>
          <Stat p={3} bg={statBgColor} borderRadius="md">
            <StatLabel color={labelColor}>Dividend Rate</StatLabel>
            <StatNumber fontSize="xl">N/A</StatNumber>
          </Stat>
          <Text fontSize="sm" mt={2} color={textColor}>
            This investment does not provide dividend income.
          </Text>
        </Box>
      );
    }

    let dividendText;
    let dividendDescription;

    switch (investment.dividendType) {
      case ReturnType.FIXED:
        dividendText = "Fixed Dividend Rate";
        dividendDescription =
          "Fixed dividends provide consistent, predetermined income payments.";
        break;
      case ReturnType.NORMAL:
        dividendText = "Average Dividend Rate (Normal Distribution)";
        dividendDescription =
          "Variable dividends fluctuate based on a normal distribution.";
        break;
      default:
        dividendText = "Dividend Rate";
        dividendDescription =
          "Expected annual income from dividends or interest.";
    }

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>{dividendText}</StatLabel>
          <StatNumber fontSize="xl">
            {formatPercent(investment.dividendRate)}
          </StatNumber>
          <StatHelpText>
            {investment.dividendType === ReturnType.NORMAL &&
              investment.dividendRateStdDev && (
                <Tooltip label="Standard deviation represents the volatility of dividend payments">
                  <Flex alignItems="center">
                    Std Dev: {formatPercent(investment.dividendRateStdDev)}
                  </Flex>
                </Tooltip>
              )}
          </StatHelpText>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          {dividendDescription}
        </Text>
      </Box>
    );
  };

  // Render expense ratio information
  const renderExpenseRatio = () => {
    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>Expense Ratio</StatLabel>
          <StatNumber fontSize="xl">
            {formatPercent(investment.expenseRatio)}
          </StatNumber>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          Annual percentage subtracted from the investment's value by the
          provider. Calculated based on the average value during the year.
        </Text>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text>{investment.name}</Text>
            <Badge
              colorScheme={
                investment.taxability === "taxable" ? "red" : "green"
              }
              px={2}
              py={1}
              borderRadius="md"
            >
              {investment.taxability === "taxable" ? "Taxable" : "Tax-Exempt"}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          {/* Basic Information */}
          <Box mb={6}>
            <Flex justify="space-between" alignItems="center" mb={2}>
              <Text fontSize="lg" fontWeight="bold" color={highlightColor}>
                Investment Overview
              </Text>
              <Text fontSize="sm" color={labelColor}>
                Updated: {investment.lastUpdated || investment.date}
              </Text>
            </Flex>
            <Text mb={4}>{investment.description}</Text>
          </Box>

          <Divider mb={6} />

          {/* Return Information */}
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color={highlightColor}>
              Return & Income Details
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              {renderReturnInfo()}
              {renderDividendInfo()}
            </SimpleGrid>
            <Box mt={4}>{renderExpenseRatio()}</Box>
          </Box>

          <Divider mb={6} />

          {/* Tax Information */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4} color={highlightColor}>
              Tax Information
            </Text>
            <Box p={4} bg={cardBgColor} borderRadius="md">
              <Text fontWeight="medium" mb={2}>
                Tax Status
              </Text>
              <Text>
                {investment.taxability === "taxable"
                  ? "This investment is taxable. Gains and income are subject to taxation."
                  : "This investment is tax-exempt. Gains and income may be exempt from certain taxes."}
              </Text>
              {investment.taxability === "tax-exempt" && (
                <Text fontSize="sm" color={labelColor} mt={2}>
                  Note: Tax-exempt investments should not be held in retirement
                  accounts, as they would not provide any additional tax benefit
                  in that context.
                </Text>
              )}
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue">Edit Investment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvestmentDetailModal;
