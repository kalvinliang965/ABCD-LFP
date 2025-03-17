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
import InvestmentSummary from "../../components/dashboard/InvestmentSummary";
import InvestmentList from "../../components/dashboard/InvestmentList";
import AddInvestmentModal from "../../components/dashboard/AddInvestmentModal";

// Sample investment data
const investmentData = [
  {
    id: 1,
    name: "Real Estate Trust",
    icon: <FaBuilding />,
    date: "2023-12-20",
    value: "¥50,000",
    returnRate: 6.8,
    status: "In Progress" as const,
    description: "REIT investment focused on commercial properties",
    expenseRatio: 0.75,
    returnType: "normal" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const,
  },
  {
    id: 2,
    name: "Gold ETF",
    icon: <FaCoins />,
    date: "2023-11-25",
    value: "¥10,000",
    returnRate: 3.1,
    status: "Pending" as const,
    description: "Exchange-traded fund tracking gold prices",
    expenseRatio: 0.4,
    returnType: "gbm" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const,
  },
  {
    id: 3,
    name: "Stock Portfolio",
    icon: <FaChartLine />,
    date: "2023-11-10",
    value: "¥25,000",
    returnRate: 8.5,
    status: "In Progress" as const,
    description: "Diversified stock portfolio with focus on tech sector",
    expenseRatio: 0.3,
    returnType: "gbm" as const,
    dividendType: "normal" as const,
    taxability: "taxable" as const,
  },
  {
    id: 4,
    name: "Bond Fund",
    icon: <FaMoneyBillWave />,
    date: "2023-10-15",
    value: "¥15,000",
    returnRate: 4.2,
    status: "Completed" as const,
    description: "Investment grade corporate bonds",
    expenseRatio: 0.2,
    returnType: "fixed" as const,
    dividendType: "fixed" as const,
    taxability: "tax-exempt" as const,
  },
  {
    id: 5,
    name: "Cryptocurrency",
    icon: <FaBitcoin />,
    date: "2023-09-05",
    value: "¥5,000",
    returnRate: -12.5,
    status: "Rejected" as const,
    description: "Bitcoin and Ethereum investment",
    expenseRatio: 1.0,
    returnType: "gbm" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const,
  },
];

const InvestmentDashboard: React.FC = () => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // State for investment modal
  const {
    isOpen: isInvestmentModalOpen,
    onOpen: onInvestmentModalOpen,
    onClose: onInvestmentModalClose,
  } = useDisclosure();

  // State for investments data
  const [investments, setInvestments] = useState(investmentData);

  // State for new investment form
  const [newInvestment, setNewInvestment] = useState({
    name: "",
    description: "",
    value: "",
    returnRate: 0,
    status: "In Progress",
    returnType: "fixed",
    expenseRatio: 0.5,
    dividendType: "fixed",
    taxability: "taxable",
  });

  // Handler functions
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setNewInvestment({ ...newInvestment, [id]: value });
  };

  const handleNumberInputChange = (id: string, value: string) => {
    setNewInvestment({ ...newInvestment, [id]: parseFloat(value) });
  };

  const handleCreateInvestment = () => {
    const newItem = {
      id: Date.now(),
      name: newInvestment.name,
      icon: <FaBuilding />,
      date: new Date().toISOString().split("T")[0],
      value: newInvestment.value,
      returnRate: newInvestment.returnRate,
      status: newInvestment.status as
        | "In Progress"
        | "Completed"
        | "Pending"
        | "Rejected",
      description: newInvestment.description,
      expenseRatio: newInvestment.expenseRatio,
      returnType: newInvestment.returnType as "fixed" | "normal" | "gbm",
      dividendType: newInvestment.dividendType as "fixed" | "normal" | "gbm",
      taxability: newInvestment.taxability as "tax-exempt" | "taxable",
    };

    setInvestments([...investments, newItem as any]);
    onInvestmentModalClose();

    // Reset form
    setNewInvestment({
      name: "",
      description: "",
      value: "",
      returnRate: 0,
      status: "In Progress",
      returnType: "fixed",
      expenseRatio: 0.5,
      dividendType: "fixed",
      taxability: "taxable",
    });
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

      const matchesStatus =
        status === "all" ||
        investment.status.toLowerCase().replace(" ", "-") ===
          status.toLowerCase();

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "value":
          comparison =
            parseFloat(a.value.replace(/[^\d.-]/g, "")) -
            parseFloat(b.value.replace(/[^\d.-]/g, ""));
          break;
        case "return":
          comparison = a.returnRate - b.returnRate;
          break;
        case "date":
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
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
    }

    result[type] = (result[type] || 0) + value;
    return result;
  }, {} as Record<string, number>);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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

          <Button
            leftIcon={<Icon as={FaPlus} />}
            colorScheme="blue"
            onClick={onInvestmentModalOpen}
          >
            Add New Investment
          </Button>
        </Flex>

        <InvestmentSummary
          totalInvestments={investments.length}
          totalInvestmentReturn={totalInvestmentReturn}
          totalValue={`¥${totalValue.toLocaleString()}`}
          totalExpenses="¥1,050"
        />

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderWidth="1px"
            shadow="sm"
          >
            <CardHeader pb={0}>
              <Flex align="center">
                <Icon as={FaChartPie} color="purple.500" mr={2} />
                <Heading size="md">Asset Allocation</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              {Object.entries(assetAllocation).map(([type, value]) => (
                <HStack key={type} justify="space-between" mb={3}>
                  <Text>{type}</Text>
                  <HStack>
                    <Text fontWeight="bold">¥{value.toLocaleString()}</Text>
                    <Text color="gray.500">
                      ({((value / totalValue) * 100).toFixed(1)}%)
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </CardBody>
          </Card>

          <Card
            bg={bgColor}
            borderColor={borderColor}
            borderWidth="1px"
            shadow="sm"
          >
            <CardHeader pb={0}>
              <Flex align="center">
                <Icon as={FaFileAlt} color="blue.500" mr={2} />
                <Heading size="md">Investment Overview</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={2} spacing={4}>
                <Stat>
                  <StatLabel>Highest Return</StatLabel>
                  <StatNumber>
                    {Math.max(...investments.map((i) => i.returnRate)).toFixed(
                      1
                    )}
                    %
                  </StatNumber>
                  <StatHelpText>Best performing asset</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Average Expense Ratio</StatLabel>
                  <StatNumber>
                    {(
                      investments.reduce(
                        (sum, i) => sum + (i.expenseRatio || 0),
                        0
                      ) / investments.length
                    ).toFixed(2)}
                    %
                  </StatNumber>
                  <StatHelpText>Across all investments</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Tax-Exempt Assets</StatLabel>
                  <StatNumber>
                    {
                      investments.filter((i) => i.taxability === "tax-exempt")
                        .length
                    }
                  </StatNumber>
                  <StatHelpText>
                    Count of tax-advantaged investments
                  </StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Pending Investments</StatLabel>
                  <StatNumber>
                    {investments.filter((i) => i.status === "Pending").length}
                  </StatNumber>
                  <StatHelpText>Awaiting completion</StatHelpText>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>

        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <InvestmentList
          investments={filteredInvestments as any}
          onOpenInvestmentModal={onInvestmentModalOpen}
        />

        {/* Modal */}
        <AddInvestmentModal
          isOpen={isInvestmentModalOpen}
          onClose={onInvestmentModalClose}
          newInvestment={newInvestment}
          handleInputChange={handleInputChange}
          handleNumberInputChange={handleNumberInputChange}
          handleCreateInvestment={handleCreateInvestment}
        />
      </Flex>
    </Layout>
  );
};

export default InvestmentDashboard;
