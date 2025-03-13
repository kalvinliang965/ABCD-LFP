import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  Text,
  Card,
  Badge,
  Avatar,
  HStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaBuilding,
  FaChartLine,
  FaCoins,
  FaBitcoin,
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";
import InvestmentCard from "./InvestmentCard";
import AddInvestmentCard from "./AddInvestmentCard";

// 定义投资回报类型
enum ReturnType {
  FIXED = "fixed",
  NORMAL = "normal",
  GBM = "gbm",
}

interface Investment {
  id: string;
  name: string;
  description: string;
  value: number;
  status: string;
  returnType: ReturnType;
  returnValue: number | string;
  expenseRatio?: number;
  dividendType?: ReturnType;
  dividendValue?: number | string;
  taxability: "taxable" | "tax-exempt";
  lastUpdated: string;
  username?: string;
}

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

// 获取投资类型对应的图标
const getInvestmentIcon = (name: string) => {
  if (
    name.toLowerCase().includes("real estate") ||
    name.toLowerCase().includes("property")
  ) {
    return FaBuilding;
  } else if (
    name.toLowerCase().includes("stock") ||
    name.toLowerCase().includes("portfolio")
  ) {
    return FaChartLine;
  } else if (
    name.toLowerCase().includes("gold") ||
    name.toLowerCase().includes("etf")
  ) {
    return FaCoins;
  } else if (
    name.toLowerCase().includes("crypto") ||
    name.toLowerCase().includes("bitcoin")
  ) {
    return FaBitcoin;
  } else if (
    name.toLowerCase().includes("bond") ||
    name.toLowerCase().includes("fund") ||
    name.toLowerCase().includes("equity")
  ) {
    return FaFileInvoiceDollar;
  }
  return FaChartLine; // 默认图标
};

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onOpenInvestmentModal,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");

  // 截断文本函数
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Box mb={10} width="100%">
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading size="md">Investments</Heading>
        <Button
          leftIcon={<Icon as={FaPlus} />}
          colorScheme="blue"
          size="sm"
          onClick={onOpenInvestmentModal}
        >
          Add Investment
        </Button>
      </Flex>

      <SimpleGrid
        columns={{ base: 1, sm: 2, md: 2, lg: 3, xl: 4, "2xl": 5 }}
        spacing={{ base: 4, md: 5, lg: 6 }}
        width="100%"
        autoRows="1fr"
      >
        {investments.map((investment) => (
          <InvestmentCard key={investment.id} investment={investment} />
        ))}

        <AddInvestmentCard onClick={onOpenInvestmentModal} />
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList;
