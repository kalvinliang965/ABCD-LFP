import React, { useState } from "react";
import {
  Heading,
  Flex,
  Box,
  useDisclosure,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Icon,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaBuilding,
  FaCoins,
  FaChartLine,
  FaMoneyBillWave,
  FaBitcoin,
  FaPlus,
  FaChartPie,
  FaFileAlt,
} from "react-icons/fa";
import Layout from "../../components/Layout";
import FilterBar from "../../components/dashboard/FilterBar";
import InvestmentList from "../../components/dashboard/InvestmentList";
import AddInvestmentTypeModal, {
  InvestmentType,
} from "../../components/dashboard/AddInvestmentTypeModal";

// Sample investment data
const investmentData = [
  {
    id: 1,
    name: "Real Estate Trust",
    icon: <FaBuilding />,
    date: "2023-12-20",
    value: "$50,000",
    returnRate: 6.8,
    description: "REIT investment focused on commercial properties",
    expenseRatio: 0.75,
    returnType: "normal" as const,
    dividendType: "fixed" as const,
    dividendRate: 2.3,
    taxability: "taxable" as const,
    accountType: "non-retirement" as const,
  },
  {
    id: 2,
    name: "Gold ETF",
    icon: <FaCoins />,
    date: "2023-11-25",
    value: "$10,000",
    returnRate: 3.1,
    description: "Exchange-traded fund tracking gold prices",
    expenseRatio: 0.4,
    returnType: "normal" as const,
    dividendType: "fixed" as const,
    dividendRate: 0.5,
    taxability: "taxable" as const,
    accountType: "pre-tax-retirement" as const,
  },
  {
    id: 3,
    name: "Stock Portfolio",
    icon: <FaChartLine />,
    date: "2023-11-10",
    value: "$25,000",
    returnRate: 8.5,
    description: "Diversified stock portfolio with focus on tech sector",
    expenseRatio: 0.3,
    returnType: "normal" as const,
    dividendType: "normal" as const,
    dividendRate: 1.8,
    taxability: "taxable" as const,
    accountType: "after-tax-retirement" as const,
  },
  {
    id: 4,
    name: "Bond Fund",
    icon: <FaMoneyBillWave />,
    date: "2023-10-15",
    value: "$15,000",
    returnRate: 4.2,
    description: "Investment grade corporate bonds",
    expenseRatio: 0.2,
    returnType: "fixed" as const,
    dividendType: "fixed" as const,
    dividendRate: 4.0,
    taxability: "tax-exempt" as const,
    accountType: "non-retirement" as const,
  },
  {
    id: 5,
    name: "Cryptocurrency",
    icon: <FaBitcoin />,
    date: "2023-09-05",
    value: "$5,000",
    returnRate: -12.5,
    description: "Bitcoin and Ethereum investment",
    expenseRatio: 1.0,
    returnType: "normal" as const,
    dividendType: "fixed" as const,
    dividendRate: 0,
    taxability: "taxable" as const,
    accountType: "non-retirement" as const,
  },
  {
    id: 6,
    name: "Cash",
    icon: <FaMoneyBillWave />,
    date: "2023-08-01",
    value: "$10,000",
    returnRate: 0.1,
    description: "Cash holdings",
    expenseRatio: 0,
    returnType: "fixed" as const,
    dividendType: "fixed" as const,
    dividendRate: 0,
    taxability: "taxable" as const,
    accountType: "non-retirement" as const,
  },
];

// Define investment type interface
interface Investment {
  id: number | string;
  name: string;
  icon: React.ReactElement;
  date: string;
  value: string;
  returnRate: number;
  description: string;
  expenseRatio: number;
  returnType: "fixed" | "normal";
  dividendType: "fixed" | "normal";
  dividendRate: number;
  taxability: "taxable" | "tax-exempt";
  accountType: "non-retirement" | "pre-tax-retirement" | "after-tax-retirement";
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

  // State for investments data
  const [investments, setInvestments] = useState<Investment[]>(investmentData);

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
      returnRate: investmentType.returnRate,
      description: investmentType.description,
      expenseRatio: investmentType.expenseRatio,
      returnType: investmentType.returnType,
      dividendType: investmentType.dividendType,
      dividendRate: investmentType.dividendRate,
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
          comparison = a.returnRate - b.returnRate;
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
  const totalInvestmentReturn =
    investments.reduce((sum, investment) => sum + investment.returnRate, 0) /
    investments.length;

  // Calculate asset allocation by type
  const assetAllocation = investments.reduce((result, investment) => {
    const value = parseFloat(investment.value.replace(/[^\d.-]/g, ""));
    let type = "Other";

    if (investment.name.toLowerCase().includes("real estate")) {
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
          accountType={accountType}
          setAccountType={setAccountType}
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
