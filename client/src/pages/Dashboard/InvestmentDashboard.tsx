import React, { useState, useEffect } from "react";
import {
  Heading,
  Flex,
  Box,
  useDisclosure,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Container,
  Badge,
  Divider,
  Icon,
  Tooltip,
  Button,
  useToast,
} from "@chakra-ui/react";
import investment, {
  AddInvestmentTypeModal,
  InvestmentFilterBar,
} from "../../components/investment";
import InvestmentList from "../../components/investment/InvestmentList";
import { investmentTypeApi } from "../../services/investmentType";
import { InvestmentType } from "../../types/investmentTypes";

// Sample investment data kept as fallback
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

//TODO: 需要删除
//dummy data TODO
const sampleInvestmentData: InvestmentDataItem[] = [
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

const InvestmentDashboard: React.FC = () => {
  const toast = useToast();

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [taxability, setTaxability] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [isLoading, setIsLoading] = useState(true);

  // State for investment type modal
  const {
    isOpen: isInvestmentTypeModalOpen,
    onOpen: onInvestmentTypeModalOpen,
    onClose: onInvestmentTypeModalClose,
  } = useDisclosure();

  // State for investments data
  const [investments, setInvestments] = useState<InvestmentType[]>([]);

  //! chen checking, why DB is not connected
  // Fetch investments from API on component mount
  useEffect(() => {
    const fetchInvestments = async () => {
      setIsLoading(true);
      try {
        const data = await investmentTypeApi.getAll();
        setInvestments(data);
      } catch (error) {
        console.error("Error fetching investments:", error);
        toast({
          title: "Error fetching investments",
          description:
            "Could not load investments from the server. Using sample data instead.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        // Map sample data as fallback
        setInvestments(mapInvestmentData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvestments();
  }, [toast]);

  // Map the raw investment data to match our Investment interface (fallback)
  const mapInvestmentData = () => {
    return sampleInvestmentData.map((item, index) => {
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

      // Create returnDistribution map with proper typing
      const returnDistMap = new Map<string, any>();
      returnDistMap.set("type", returnType);
      if (returnType === "fixed") {
        returnDistMap.set("value", returnRate);
      } else {
        returnDistMap.set("mean", returnRate);
        returnDistMap.set("stdev", returnRateStdDev);
      }

      // Create incomeDistribution map with proper typing
      const incomeDistMap = new Map<string, any>();
      incomeDistMap.set("type", dividendType);
      if (dividendType === "fixed") {
        incomeDistMap.set("value", dividendRate);
      } else {
        incomeDistMap.set("mean", dividendRate);
        incomeDistMap.set("stdev", dividendRateStdDev);
      }

      const investment: InvestmentType = {
        _id: String(index + 1), // Convert index to string for _id
        name: item.name,
        description: item.description,
        returnAmtOrPct:
          item.expectedAnnualReturn.unit === "percentage"
            ? "percent"
            : "amount",
        returnDistribution: returnDistMap,
        expenseRatio: item.expenseRatio * 100, // Convert from decimal to percentage
        incomeAmtOrPct:
          item.expectedAnnualIncome.unit === "percentage"
            ? "percent"
            : "amount",
        incomeDistribution: incomeDistMap,
        taxability: item.taxability === "taxable",
        // Add createdAt and updatedAt for consistency
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return investment;
    });
  };

  // Handler for saving a new investment type
  const handleSaveInvestmentType = async (investmentType: InvestmentType) => {
    try {
      // Save to API
      const savedInvestment = await investmentTypeApi.create(investmentType);

      // Update local state with newly created investment
      setInvestments([...investments, savedInvestment]);

      toast({
        title: "Investment type created",
        description: `${investmentType.name} has been saved successfully.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving investment type:", error);
      toast({
        title: "Error saving investment type",
        description: "Could not save the investment type to the server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Filter and sort investments
  const filteredInvestments = investments
    .filter((investment) => {
      // Filter by search term
      const matchesSearch =
        searchTerm === "" ||
        investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investment.description &&
          investment.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      // Filter by taxability
      const matchesTaxability =
        taxability === "all" ||
        (taxability === "taxable"
          ? investment.taxability === true
          : investment.taxability === false);

      return matchesSearch && matchesTaxability;
    })
    .sort((a, b) => {
      // Sort by selected sort option
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "date") {
        // Sort by date, most recent first
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      } else if (sortBy === "returnRate") {
        // Use a basic sorting strategy since we're encountering TypeScript issues
        // We'll sort alphabetically as a fallback
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

  // Calculate total number of investments for display
  const totalInvestments = filteredInvestments.length;

  // Colors for light/dark mode
  const bgMain = useColorModeValue("gray.50", "gray.900");
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const tipBg = useColorModeValue("blue.50", "blue.900");

  return (
    <Box width="100%">
      {/* Filter Section */}
      <Box mb={6}>
        <InvestmentFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          taxability={taxability}
          setTaxability={setTaxability}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
      </Box>

      {/* Investments Section */}
      <Box mb={10}>
        <HStack justify="space-between" mb={4}>
          <Heading as="h2" size="md" color={headingColor}>
            Your Investment Portfolio
          </Heading>
          <Badge
            colorScheme="blue"
            fontSize="md"
            borderRadius="full"
            px={3}
            py={1}
          >
            {totalInvestments}{" "}
            {totalInvestments === 1 ? "Investment" : "Investments"}
          </Badge>
        </HStack>
        <Divider mb={4} />
        <InvestmentList
          investmentTypes={filteredInvestments}
          onOpenInvestmentTypeModal={onInvestmentTypeModalOpen}
        />
      </Box>

      {/* Investment Type Modal */}
      <AddInvestmentTypeModal
        isOpen={isInvestmentTypeModalOpen}
        onClose={onInvestmentTypeModalClose}
        onSave={handleSaveInvestmentType}
      />
    </Box>
  );
};

export default InvestmentDashboard;
