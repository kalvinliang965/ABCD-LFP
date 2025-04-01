import React from "react";
import {
  Box,
  Flex,
  Text,
  Divider,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";
import { type InvestmentTypeDetailModalProps } from "../../types/investmentTypes";
import { DetailModal, StatDisplay } from "../common";
import { DistributionType } from "../../types/Enum";
import { ValueInputMode } from "./AddInvestmentTypeModal";

// AI-generated code
// Get value from a Map with type safety and default value
const getMapValue = <T,>(
  map: Map<string, any> | undefined,
  key: string,
  defaultValue: T
): T => {
  if (!map || !map.has(key)) return defaultValue;
  return (map.get(key) as T) || defaultValue;
};

// AI-generated code
// Format date safely
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return String(date);
};

const InvestmentDetailModal: React.FC<InvestmentTypeDetailModalProps> = ({
  isOpen,
  onClose,
  investmentType,
}) => {
  // Color mode values
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");

  if (!investmentType) {
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
    if (isNaN(numericValue)) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericValue);
  };

  // Get return distribution properties with safer type handling
  const returnDistribution =
    investmentType.returnDistribution || new Map<string, any>();
  const returnType = getMapValue<string>(
    returnDistribution,
    "type",
    DistributionType.FIXED
  );
  const returnRate = getMapValue<number>(returnDistribution, "mean", 0);
  const returnRateStdDev = getMapValue<number>(returnDistribution, "stdev", 0);

  // Get income distribution properties with safer type handling
  const incomeDistribution =
    investmentType.incomeDistribution || new Map<string, any>();
  const dividendType = getMapValue<string>(
    incomeDistribution,
    "type",
    DistributionType.FIXED
  );
  const dividendRate = getMapValue<number>(incomeDistribution, "mean", 0);
  const dividendRateStdDev = getMapValue<number>(
    incomeDistribution,
    "stdev",
    0
  );

  // Render return information
  const renderReturnInfo = () => {
    let returnText;
    let returnDescription;
    const isFixedAmount =
      investmentType.returnAmtOrPct === ValueInputMode.AMOUNT;

    switch (returnType) {
      case DistributionType.FIXED:
        returnText = isFixedAmount
          ? "Fixed Return Amount"
          : "Fixed Return Rate";
        returnDescription = isFixedAmount
          ? "A fixed amount added to the investment value annually."
          : "A fixed percentage return on the investment value annually.";
        break;
      case DistributionType.NORMAL:
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
    if (returnType === DistributionType.FIXED) {
      if (isFixedAmount && returnRate !== undefined) {
        returnValue = formatCurrency(returnRate);
      } else if (!isFixedAmount && returnRate !== undefined) {
        returnValue = formatPercent(returnRate);
      }
    } else if (returnType === DistributionType.NORMAL) {
      if (isFixedAmount && returnRate !== undefined) {
        returnValue = `${formatCurrency(returnRate)} ± ${
          returnRateStdDev ? formatCurrency(returnRateStdDev) : "N/A"
        }`;
      } else if (!isFixedAmount && returnRate !== undefined) {
        returnValue = `${formatPercent(returnRate)} ± ${
          returnRateStdDev ? formatPercent(returnRateStdDev) : "N/A"
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
    if (!dividendType || dividendRate === 0) {
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
      investmentType.incomeAmtOrPct === ValueInputMode.AMOUNT;

    switch (dividendType) {
      case DistributionType.FIXED:
        dividendText = isFixedAmount
          ? "Fixed Dividend Amount"
          : "Fixed Dividend Rate";
        dividendDescription = isFixedAmount
          ? "A fixed amount of dividend income paid annually."
          : "A fixed percentage of dividend income paid annually.";
        break;
      case DistributionType.NORMAL:
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
    if (dividendType === DistributionType.FIXED) {
      if (isFixedAmount && dividendRate !== undefined) {
        dividendValue = formatCurrency(dividendRate);
      } else if (!isFixedAmount && dividendRate !== undefined) {
        dividendValue = formatPercent(dividendRate);
      }
    } else if (dividendType === DistributionType.NORMAL) {
      if (isFixedAmount && dividendRate !== undefined) {
        dividendValue = `${formatCurrency(dividendRate)} ± ${
          dividendRateStdDev ? formatCurrency(dividendRateStdDev) : "N/A"
        }`;
      } else if (!isFixedAmount && dividendRate !== undefined) {
        dividendValue = `${formatPercent(dividendRate)} ± ${
          dividendRateStdDev ? formatPercent(dividendRateStdDev) : "N/A"
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
    const expenseRatio = investmentType.expenseRatio;

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
        <Text color={textColor}>{investmentType.description}</Text>
      </Box>

      {/* Last updated */}
      <Box mb={5}>
        <Text fontSize="sm" color={textColor}>
          Last Updated:{" "}
          {formatDate(investmentType.updatedAt || investmentType.createdAt)}
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
              colorScheme={investmentType.taxability ? "red" : "green"}
              px={2}
              py={1}
              borderRadius="md"
            >
              {investmentType.taxability ? "Taxable" : "Tax-Exempt"}
            </Badge>
          </Flex>

          <Text fontSize="sm" color={textColor}>
            {investmentType.taxability
              ? "Gains and income from this investment are subject to taxation. Consider holding in tax-advantaged accounts where appropriate."
              : "Gains and income from this investment are exempt from federal taxes. Typically best held in taxable accounts rather than tax-advantaged retirement accounts."}
          </Text>
        </Flex>
      </Box>
    </>
  );

  return (
    <DetailModal isOpen={isOpen} onClose={onClose} title={investmentType.name}>
      {renderContent()}
    </DetailModal>
  );
};

export default InvestmentDetailModal;
