import React from "react";
import {
  Box,
  Flex,
  Text,
  Divider,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  ReturnType,
  ValueInputMode,
  type InvestmentDetailModalProps,
} from "../../types/investment";
import { DetailModal, StatDisplay } from "../common";

const InvestmentDetailModal: React.FC<InvestmentDetailModalProps> = ({
  isOpen,
  onClose,
  investment,
}) => {
  // Color mode values
  const textColor = useColorModeValue("gray.600", "gray.300");
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

    // Determine the value display
    let returnValue = "N/A";
    if (investment.returnType === ReturnType.FIXED) {
      if (isFixedAmount && investment.returnRate !== undefined) {
        returnValue = formatCurrency(investment.returnRate);
      } else if (!isFixedAmount && investment.returnRate !== undefined) {
        returnValue = formatPercent(investment.returnRate);
      }
    } else if (investment.returnType === ReturnType.NORMAL) {
      if (isFixedAmount && investment.returnRate !== undefined) {
        returnValue = `${formatCurrency(investment.returnRate)} ± ${
          investment.returnRateStdDev
            ? formatCurrency(investment.returnRateStdDev)
            : "N/A"
        }`;
      } else if (!isFixedAmount && investment.returnRate !== undefined) {
        returnValue = `${formatPercent(investment.returnRate)} ± ${
          investment.returnRateStdDev
            ? formatPercent(investment.returnRateStdDev)
            : "N/A"
        }`;
      }
    }

    return (
      <StatDisplay
        label={returnText}
        value={returnValue}
        description={returnDescription}
      />
    );
  };

  // Render dividend information
  const renderDividendInfo = () => {
    if (!investment.dividendType && !investment.dividendRate) {
      return (
        <StatDisplay
          label="Dividend Rate"
          value="N/A"
          description="This investment does not provide dividend income."
        />
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

    // Determine the value display
    let dividendValue = "N/A";
    if (investment.dividendType === ReturnType.FIXED) {
      if (isFixedAmount && investment.dividendRate !== undefined) {
        dividendValue = formatCurrency(investment.dividendRate);
      } else if (!isFixedAmount && investment.dividendRate !== undefined) {
        dividendValue = formatPercent(investment.dividendRate);
      }
    } else if (investment.dividendType === ReturnType.NORMAL) {
      if (isFixedAmount && investment.dividendRate !== undefined) {
        dividendValue = `${formatCurrency(investment.dividendRate)} ± ${
          investment.dividendRateStdDev
            ? formatCurrency(investment.dividendRateStdDev)
            : "N/A"
        }`;
      } else if (!isFixedAmount && investment.dividendRate !== undefined) {
        dividendValue = `${formatPercent(investment.dividendRate)} ± ${
          investment.dividendRateStdDev
            ? formatPercent(investment.dividendRateStdDev)
            : "N/A"
        }`;
      }
    }

    return (
      <StatDisplay
        label={dividendText}
        value={dividendValue}
        description={dividendDescription}
      />
    );
  };

  // Render expense ratio
  const renderExpenseRatio = () => {
    const expenseRatio = investment.expenseRatio;

    if (expenseRatio === undefined || expenseRatio === 0) {
      return (
        <StatDisplay
          label="Expense Ratio"
          value="0.00%"
          description="This investment has no expense ratio."
        />
      );
    }

    return (
      <StatDisplay
        label="Expense Ratio"
        value={formatPercent(expenseRatio)}
        description="Annual percentage deducted from the investment value to cover management costs."
      />
    );
  };

  const renderContent = () => (
    <>
      {/* Description */}
      <Box mb={5}>
        <Text color={textColor}>{investment.description}</Text>
      </Box>

      {/* Last updated */}
      <Box mb={5}>
        <Text fontSize="sm" color={textColor}>
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
      <Box mb={3}>
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
              {investment.taxability === "taxable" ? "Taxable" : "Tax-Exempt"}
            </Badge>
          </Flex>

          <Text fontSize="sm" color={textColor}>
            {investment.taxability === "taxable"
              ? "Gains and income from this investment are subject to taxation. Consider holding in tax-advantaged accounts where appropriate."
              : "Gains and income from this investment are exempt from federal taxes. Typically best held in taxable accounts rather than tax-advantaged retirement accounts."}
          </Text>
        </Flex>
      </Box>
    </>
  );

  return (
    <DetailModal isOpen={isOpen} onClose={onClose} title={investment.name}>
      {renderContent()}
    </DetailModal>
  );
};

export default InvestmentDetailModal;
