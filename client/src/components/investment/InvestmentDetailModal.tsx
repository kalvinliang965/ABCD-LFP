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
          ? "Fixed Dividend Amount"
          : "Fixed Dividend Rate";
        dividendDescription = isFixedAmount
          ? "A fixed amount of dividend income paid annually."
          : "A fixed percentage of dividend income paid annually.";
        break;
      case ReturnType.NORMAL:
        dividendText = isFixedAmount
          ? "Average Dividend Amount (Normal Distribution)"
          : "Average Dividend Rate (Normal Distribution)";
        dividendDescription = isFixedAmount
          ? "Dividend amount varies with an average (mean) and standard deviation."
          : "Dividend rate varies with an average (mean) and standard deviation.";
        break;
      default:
        dividendText = isFixedAmount ? "Dividend Amount" : "Dividend Rate";
        dividendDescription = isFixedAmount
          ? "Expected annual dollar amount of dividend income."
          : "Expected annual percentage of dividend income.";
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
                    isFixedAmount ? "dollar dividends" : "percentage dividends"
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

  // Render expense ratio
  const renderExpenseRatio = () => {
    const expenseRatio = investment.expenseRatio;

    if (expenseRatio === undefined || expenseRatio === 0) {
      return (
        <Box>
          <Stat p={3} bg={statBgColor} borderRadius="md">
            <StatLabel color={labelColor}>Expense Ratio</StatLabel>
            <StatNumber fontSize="xl">0.00%</StatNumber>
          </Stat>
          <Text fontSize="sm" mt={2} color={textColor}>
            This investment has no expense ratio.
          </Text>
        </Box>
      );
    }

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>Expense Ratio</StatLabel>
          <StatNumber fontSize="xl">{formatPercent(expenseRatio)}</StatNumber>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          Annual percentage deducted from the investment value to cover
          management costs.
        </Text>
      </Box>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      closeOnOverlayClick={true}
      isCentered
    >
      <ModalOverlay />
      <ModalContent bg={bgColor} borderColor={borderColor} borderRadius="lg">
        <ModalHeader
          color={highlightColor}
          fontWeight="bold"
          pb={2}
          pt={4}
          px={5}
        >
          {investment.name}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody px={5} py={3}>
          {/* Description */}
          <Box mb={5}>
            <Text color={textColor}>{investment.description}</Text>
          </Box>

          {/* Last updated */}
          <Box mb={5}>
            <Text fontSize="sm" color={labelColor}>
              Last Updated: {investment.lastUpdated || investment.date}
            </Text>
          </Box>

          <Divider mb={5} />

          {/* Return information */}
          <Box mb={6}>
            <Text fontWeight="bold" mb={3}>
              Return Information
            </Text>

            {renderReturnInfo()}
          </Box>

          {/* Dividend information */}
          <Box mb={6}>
            <Text fontWeight="bold" mb={3}>
              Income Information
            </Text>

            {renderDividendInfo()}
          </Box>

          {/* Expense ratio */}
          <Box mb={6}>
            <Text fontWeight="bold" mb={3}>
              Fees & Expenses
            </Text>

            {renderExpenseRatio()}
          </Box>

          {/* Tax information */}
          <Box mb={4}>
            <Text fontWeight="bold" mb={3}>
              Tax Information
            </Text>

            <Flex
              bg={cardBgColor}
              p={4}
              borderRadius="md"
              direction="column"
              gap={2}
            >
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">Tax Status:</Text>
                <Badge
                  colorScheme={
                    investment.taxability === "taxable" ? "red" : "green"
                  }
                  px={2}
                  py={1}
                  borderRadius="md"
                >
                  {investment.taxability === "taxable"
                    ? "Taxable"
                    : "Tax-Exempt"}
                </Badge>
              </Flex>

              <Text fontSize="sm" color={textColor}>
                {investment.taxability === "taxable"
                  ? "Gains and income from this investment are subject to taxation. Consider holding in tax-advantaged accounts where appropriate."
                  : "Gains and income from this investment are exempt from federal taxes. Typically best held in taxable accounts rather than tax-advantaged retirement accounts."}
              </Text>
            </Flex>
          </Box>
        </ModalBody>

        <ModalFooter px={5} py={4}>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onClose}
            size="md"
            borderRadius="md"
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvestmentDetailModal;
