import React, { useState } from "react";
import {
  Heading,
  Flex,
  Box,
  useDisclosure,
  Text,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBuilding,
  FaCoins,
  FaChartLine,
  FaMoneyBillWave,
  FaBitcoin,
  FaChartPie,
} from "react-icons/fa";
import Layout from "../../components/Layout";
import FilterBar from "../../components/dashboard/FilterBar";
import InvestmentList from "../../components/dashboard/InvestmentList";
import AddInvestmentTypeModal, {
  InvestmentType,
} from "../../components/dashboard/AddInvestmentTypeModal";

// Sample investment data
interface ExpectedAnnualReturn {
  type: "fixed" | "normalDistribution";
  unit: "percentage" | "amount";
  value?: number;
  mean?: number;
  stdDev?: number;
}

interface InvestmentDataItem {
  name: string;
  description: string;
  expectedAnnualReturn: ExpectedAnnualReturn;
  expenseRatio: number;
  expectedAnnualIncome: ExpectedAnnualReturn;
  taxability: string;
}

const investmentData: InvestmentDataItem[] = [
  {
    name: "Cash",
    description: "Low-risk holding with minimal returns and high liquidity.",
    expectedAnnualReturn: {
      type: "fixed",
      unit: "percentage",
      value: 0.01,
    },
    expenseRatio: 0.0,
    expectedAnnualIncome: {
      type: "fixed",
      unit: "amount",
      value: 0,
    },
    taxability: "taxable",
  },
  {
    name: "US Municipal Bonds",
    description:
      "Tax-exempt bonds issued by local governments with relatively low risk.",
    expectedAnnualReturn: {
      type: "fixed",
      unit: "percentage",
      value: 0.02,
    },
    expenseRatio: 0.005,
    expectedAnnualIncome: {
      type: "fixed",
      unit: "percentage",
      value: 0.03,
    },
    taxability: "tax-exempt",
  },
  {
    name: "Global Equity Fund",
    description:
      "Diversified international stock fund with moderate-to-high volatility.",
    expectedAnnualReturn: {
      type: "normalDistribution",
      unit: "percentage",
      mean: 0.08,
      stdDev: 0.12,
    },
    expenseRatio: 0.008,
    expectedAnnualIncome: {
      type: "normalDistribution",
      unit: "percentage",
      mean: 0.02,
      stdDev: 0.01,
    },
    taxability: "taxable",
  },
  {
    name: "REIT - Commercial Properties",
    description: "Invests in commercial real estate with moderate stability.",
    expectedAnnualReturn: {
      type: "fixed",
      unit: "amount",
      value: 3000,
    },
    expenseRatio: 0.01,
    expectedAnnualIncome: {
      type: "fixed",
      unit: "amount",
      value: 1500,
    },
    taxability: "taxable",
  },
];

// Define investment type interface
interface Investment {
  id: number | string;
  name: string;
  icon: React.ReactElement;
  date: string;
  value: string;
  description: string;
  expenseRatio: number;
  taxability: "taxable" | "tax-exempt";
  accountType: "non-retirement" | "pre-tax-retirement" | "after-tax-retirement";

  // Return information
  returnRate?: number;
  returnType: "fixed" | "normal";
  returnRateStdDev?: number;

  // Dividend/income information
  dividendRate?: number;
  dividendType: "fixed" | "normal";
  dividendRateStdDev?: number;
}

const InvestmentDashboard: React.FC = () => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [taxability, setTaxability] = useState("all");
  const [accountType, setAccountType] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // State for investment type modal
  const {
    isOpen: isInvestmentTypeModalOpen,
    onOpen: onInvestmentTypeModalOpen,
    onClose: onInvestmentTypeModalClose,
  } = useDisclosure();

  // Map the raw investment data to match our Investment interface
  const mapInvestmentData = () => {
    const getIconComponent = (name: string) => {
      if (name.toLowerCase().includes("bond")) {
        return <Icon as={FaBuilding} />;
      } else if (
        name.toLowerCase().includes("equity") ||
        name.toLowerCase().includes("fund")
      ) {
        return <Icon as={FaChartLine} />;
      } else if (
        name.toLowerCase().includes("reit") ||
        name.toLowerCase().includes("real estate")
      ) {
        return <Icon as={FaBuilding} />;
      } else if (name.toLowerCase().includes("cash")) {
        return <Icon as={FaMoneyBillWave} />;
      } else if (name.toLowerCase().includes("crypto")) {
        return <Icon as={FaBitcoin} />;
      }
      return <Icon as={FaChartPie} />;
    };

    return investmentData.map((item, index) => {
      const returnType =
        item.expectedAnnualReturn.type === "normalDistribution"
          ? "normal"
          : "fixed";
      const dividendType =
        item.expectedAnnualIncome.type === "normalDistribution"
          ? "normal"
          : "fixed";

      // Convert return and dividend values based on their types
      let returnRate: number | undefined;
      let returnRateStdDev: number | undefined;
      let dividendRate: number | undefined;
      let dividendRateStdDev: number | undefined;

      if (returnType === "fixed") {
        if (item.expectedAnnualReturn.value !== undefined) {
          returnRate =
            item.expectedAnnualReturn.unit === "percentage"
              ? item.expectedAnnualReturn.value * 100 // Convert from decimal to percentage
              : item.expectedAnnualReturn.value;
        }
      } else {
        if (
          item.expectedAnnualReturn.mean !== undefined &&
          item.expectedAnnualReturn.stdDev !== undefined
        ) {
          returnRate = item.expectedAnnualReturn.mean * 100; // Convert from decimal to percentage
          returnRateStdDev = item.expectedAnnualReturn.stdDev * 100; // Convert from decimal to percentage
        }
      }

      if (dividendType === "fixed") {
        if (item.expectedAnnualIncome.value !== undefined) {
          dividendRate =
            item.expectedAnnualIncome.unit === "percentage"
              ? item.expectedAnnualIncome.value * 100 // Convert from decimal to percentage
              : item.expectedAnnualIncome.value;
        }
      } else {
        if (
          item.expectedAnnualIncome.mean !== undefined &&
          item.expectedAnnualIncome.stdDev !== undefined
        ) {
          dividendRate = item.expectedAnnualIncome.mean * 100; // Convert from decimal to percentage
          dividendRateStdDev = item.expectedAnnualIncome.stdDev * 100; // Convert from decimal to percentage
        }
      }

      // Determine the display value
      let displayValue = "$10,000"; // Default value
      if (
        item.expectedAnnualReturn.unit === "amount" &&
        item.expectedAnnualReturn.value !== undefined
      ) {
        displayValue = `$${item.expectedAnnualReturn.value.toLocaleString()}`;
      }

      const investment: Investment = {
        id: index + 1,
        name: item.name,
        description: item.description,
        icon: getIconComponent(item.name),
        date: new Date().toISOString().split("T")[0],
        value: displayValue,
        expenseRatio: item.expenseRatio * 100, // Convert from decimal to percentage
        returnType: returnType as "fixed" | "normal",
        returnRate,
        returnRateStdDev,
        dividendType: dividendType as "fixed" | "normal",
        dividendRate,
        dividendRateStdDev,
        taxability: item.taxability as "taxable" | "tax-exempt",
        accountType: "non-retirement" as "non-retirement", // Explicitly type this
      };

      return investment;
    });
  };

  // State for investments data
  const [investments, setInvestments] = useState<Investment[]>(
    mapInvestmentData()
  );

  // Handler for saving a new investment type
  const handleSaveInvestmentType = (investmentType: InvestmentType) => {
    // Here you would typically save the investment type to a database
    // For now, we'll just create a new investment using this type
    const getIconComponent = (iconName: string) => {
      const iconOption = iconOptions.find((icon) => icon.name === iconName);
      return iconOption ? <Icon as={iconOption.component} /> : <FaBuilding />;
    };

    const newInvestment: Investment = {
      id: Date.now(),
      name: investmentType.name,
      icon: getIconComponent(investmentType.icon),
      date: new Date().toISOString().split("T")[0],
      value: "$0", // Default value
      description: investmentType.description,
      expenseRatio: investmentType.expenseRatio,
      returnType: investmentType.returnType,
      returnRate: investmentType.returnRate,
      returnRateStdDev: investmentType.returnRateStdDev,
      dividendType: investmentType.dividendType,
      dividendRate: investmentType.dividendRate,
      dividendRateStdDev: investmentType.dividendRateStdDev,
      taxability: investmentType.taxability,
      accountType: "non-retirement", // Default account type
    };

    setInvestments([...investments, newInvestment]);
  };

  // Filter and sort investments
  const filteredInvestments = investments
    .filter((investment) => {
      const matchesSearch =
        investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investment.description &&
          investment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesTaxability =
        taxability === "all" || investment.taxability === taxability;

      const matchesAccountType =
        accountType === "all" || investment.accountType === accountType;

      return matchesSearch && matchesTaxability && matchesAccountType;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "returnType":
          comparison = a.returnType.localeCompare(b.returnType);
          break;
        case "return":
          comparison = (a.returnRate || 0) - (b.returnRate || 0);
          break;
        case "date":
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }

      // Always sort in descending order (newest first)
      return -comparison;
    });

  // Calculate summary values
  const totalValue = investments.reduce(
    (sum, investment) =>
      sum + parseFloat(investment.value.replace(/[^\d.-]/g, "")),
    0
  );

  // Calculate average return rate, handling both fixed and normal distribution
  const totalInvestmentReturn =
    investments.reduce((sum, investment) => {
      if (investment.returnType === "fixed") {
        return sum + (investment.returnRate || 0);
      } else {
        // For normal distribution, we use the mean
        return sum + (investment.returnRate || 0);
      }
    }, 0) / investments.length;

  // Calculate asset allocation by type
  const assetAllocation = investments.reduce((result, investment) => {
    const value = parseFloat(investment.value.replace(/[^\d.-]/g, ""));
    let type = "Other";

    if (
      investment.name.toLowerCase().includes("real estate") ||
      investment.name.toLowerCase().includes("reit")
    ) {
      type = "Real Estate";
    } else if (
      investment.name.toLowerCase().includes("stock") ||
      investment.name.toLowerCase().includes("equity")
    ) {
      type = "Stocks";
    } else if (investment.name.toLowerCase().includes("bond")) {
      type = "Bonds";
    } else if (
      investment.name.toLowerCase().includes("gold") ||
      investment.name.toLowerCase().includes("silver")
    ) {
      type = "Precious Metals";
    } else if (investment.name.toLowerCase().includes("crypto")) {
      type = "Cryptocurrency";
    } else if (investment.name.toLowerCase() === "cash") {
      type = "Cash";
    }

    result[type] = (result[type] || 0) + value;
    return result;
  }, {} as Record<string, number>);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Define iconOptions for displaying icons
  const iconOptions = [
    { name: "TrendingUp", component: FaChartLine, label: "Trending Up" },
    { name: "DollarSign", component: FaMoneyBillWave, label: "Dollar Sign" },
    { name: "PieChart", component: FaChartPie, label: "Pie Chart" },
    { name: "Building", component: FaBuilding, label: "Building" },
    { name: "BarChart", component: FaChartLine, label: "Bar Chart" },
    { name: "LineChart", component: FaChartLine, label: "Line Chart" },
    { name: "Landmark", component: FaBuilding, label: "Landmark" },
    {
      name: "CircleDollarSign",
      component: FaMoneyBillWave,
      label: "Circle Dollar Sign",
    },
    {
      name: "CandlestickChart",
      component: FaChartLine,
      label: "Candlestick Chart",
    },
    { name: "Bank", component: FaBuilding, label: "Bank Building" },
    { name: "MoneyTrend", component: FaMoneyBillWave, label: "Money Trend" },
    { name: "Coins", component: FaCoins, label: "Coins" },
    { name: "Bitcoin", component: FaBitcoin, label: "Bitcoin" },
  ];

  return (
    <Layout title="Investment Dashboard">
      <Flex direction="column" width="100%" mb={8}>
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mb={6}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 4, md: 0 }}
        >
          <Box>
            <Heading size="lg" mb={1}>
              Investment Dashboard
            </Heading>
            <Text color="gray.500">
              Manage and track your investment portfolio
            </Text>
          </Box>
        </Flex>

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          taxability={taxability}
          setTaxability={setTaxability}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <InvestmentList
          investments={filteredInvestments as any}
          onOpenInvestmentModal={onInvestmentTypeModalOpen}
        />

        {/* Investment Type Modal */}
        <AddInvestmentTypeModal
          isOpen={isInvestmentTypeModalOpen}
          onClose={onInvestmentTypeModalClose}
          onSave={handleSaveInvestmentType}
        />
      </Flex>
    </Layout>
  );
};

export default InvestmentDashboard;
