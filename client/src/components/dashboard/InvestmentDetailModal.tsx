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
  ValueInputMode,
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
    const isFixedAmount =
      investment.returnInputMode === ValueInputMode.FIXED_AMOUNT;

    switch (investment.returnType) {
      case ReturnType.FIXED:
        returnText = isFixedAmount
          ? "Fixed Return Amount"
          : "Fixed Return Rate";
        returnDescription = isFixedAmount
          ? "A fixed amount added to the investment value annually."
          : "A fixed percentage return on the investment value annually.";
        break;
      case ReturnType.NORMAL:
        returnText = isFixedAmount
          ? "Average Return Amount (Normal Distribution)"
          : "Average Return Rate (Normal Distribution)";
        returnDescription = isFixedAmount
          ? "Return amount varies with an average (mean) and standard deviation."
          : "Return rate varies with an average (mean) and standard deviation.";
        break;
      default:
        returnText = isFixedAmount ? "Return Amount" : "Return Rate";
        returnDescription = isFixedAmount
          ? "Expected annual dollar return on this investment."
          : "Expected annual percentage return on this investment.";
    }

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>{returnText}</StatLabel>
          <StatNumber fontSize="xl">
            {isFixedAmount
              ? formatCurrency(investment.returnRate)
              : formatPercent(investment.returnRate)}
          </StatNumber>
          <StatHelpText>
            {investment.returnType === ReturnType.NORMAL &&
              investment.returnRateStdDev && (
                <Tooltip
                  label={`Standard deviation represents the volatility of ${
                    isFixedAmount ? "dollar returns" : "percentage returns"
                  }`}
                >
                  <Flex alignItems="center">
                    Std Dev:{" "}
                    {isFixedAmount
                      ? formatCurrency(investment.returnRateStdDev)
                      : formatPercent(investment.returnRateStdDev)}
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
    const isFixedAmount =
      investment.dividendInputMode === ValueInputMode.FIXED_AMOUNT;

    switch (investment.dividendType) {
      case ReturnType.FIXED:
        dividendText = isFixedAmount
          ? "Fixed Income Amount"
          : "Fixed Dividend Rate";
        dividendDescription = isFixedAmount
          ? "Fixed income provides consistent, predetermined dollar amounts."
          : "Fixed dividends provide consistent, predetermined percentage payments.";
        break;
      case ReturnType.NORMAL:
        dividendText = isFixedAmount
          ? "Average Income Amount (Normal Distribution)"
          : "Average Dividend Rate (Normal Distribution)";
        dividendDescription = isFixedAmount
          ? "Variable income fluctuates based on a normal distribution."
          : "Variable dividends fluctuate based on a normal distribution.";
        break;
      default:
        dividendText = isFixedAmount ? "Income Amount" : "Dividend Rate";
        dividendDescription = isFixedAmount
          ? "Expected annual income amount from dividends or interest."
          : "Expected annual percentage income from dividends or interest.";
    }

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>{dividendText}</StatLabel>
          <StatNumber fontSize="xl">
            {isFixedAmount
              ? formatCurrency(investment.dividendRate)
              : formatPercent(investment.dividendRate)}
          </StatNumber>
          <StatHelpText>
            {investment.dividendType === ReturnType.NORMAL &&
              investment.dividendRateStdDev && (
                <Tooltip
                  label={`Standard deviation represents the volatility of ${
                    isFixedAmount ? "income amounts" : "dividend payments"
                  }`}
                >
                  <Flex alignItems="center">
                    Std Dev:{" "}
                    {isFixedAmount
                      ? formatCurrency(investment.dividendRateStdDev)
                      : formatPercent(investment.dividendRateStdDev)}
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
              <Text fontSize="lg" mb={4}>
                {investment.taxability === "taxable" ? "Taxable" : "Tax-Exempt"}
              </Text>

              <Text fontSize="sm" color={textColor}>
                {investment.taxability === "taxable" ? (
                  <>
                    This investment's returns and income may be subject to
                    taxation based on your tax bracket. Gains are generally
                    taxed when realized (sold), while dividends and interest are
                    typically taxed in the year received.
                  </>
                ) : (
                  <>
                    This investment provides tax advantages as defined by tax
                    regulations. Depending on the specific type, it may be
                    exempt from federal, state, or local taxes. Examples include
                    municipal bonds, which are typically exempt from federal
                    taxes.
                  </>
                )}
              </Text>
            </Box>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvestmentDetailModal;
