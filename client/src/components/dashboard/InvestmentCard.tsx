import React from "react";
import {
  Card,
  Flex,
  Icon,
  Text,
  Badge,
  Avatar,
  Divider,
  useColorModeValue,
  Box,
  Spacer,
} from "@chakra-ui/react";
import {
  FaBuilding,
  FaChartLine,
  FaCoins,
  FaBitcoin,
  FaFileInvoiceDollar,
  FaCalendarAlt,
} from "react-icons/fa";

// Define return types
enum ReturnType {
  FIXED = "fixed",
  NORMAL = "normal",
  GBM = "gbm",
}

interface Investment {
  id: string | number;
  name: string;
  description: string;
  date?: string;
  lastUpdated?: string;
  value: string | number;
  returnRate?: number;
  status?: string;
  returnType: ReturnType | string;
  returnValue?: number | string;
  expenseRatio?: number;
  dividendType?: ReturnType | string;
  dividendValue?: number | string;
  taxability: "taxable" | "tax-exempt";
  username?: string;
}

interface InvestmentCardProps {
  investment: Investment;
}

// Get appropriate icon based on investment name
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
  return FaChartLine; // Default icon
};

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const iconBgColor = useColorModeValue("gray.50", "gray.700");

  // Truncate text function
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Card
      bg={cardBg}
      boxShadow="md"
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      borderStyle="dashed"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
      cursor="pointer"
      height="100%"
      minHeight="220px"
      display="flex"
      flexDirection="column"
    >
      {/* Card content area */}
      <Box p={4} flex="1" display="flex" flexDirection="column">
        {/* Investment name and user avatar */}
        <Flex mb={2} alignItems="center">
          <Avatar size="xs" name={investment.username || "User"} mr={2} />
          <Text
            fontWeight="bold"
            fontSize="md"
            color={highlightColor}
            noOfLines={1}
          >
            {investment.name}
          </Text>
        </Flex>

        {/* Update date */}
        <Flex mb={2} alignItems="center">
          <Icon as={FaCalendarAlt} size="sm" color={dateColor} mr={2} />
          <Text fontSize="xs" color={dateColor}>
            Updated: {investment.lastUpdated || investment.date}
          </Text>
        </Flex>

        {/* Description and investment type icon */}
        <Flex
          flex="1"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={3}
        >
          <Box maxWidth="70%">
            <Text color={textColor} fontSize="sm" noOfLines={3}>
              {truncateText(investment.description, 100)}
            </Text>
          </Box>

          <Flex
            alignItems="center"
            justifyContent="center"
            bg={iconBgColor}
            p={3}
            borderRadius="md"
            flexShrink={0}
            height="60px"
            width="60px"
          >
            <Icon
              as={getInvestmentIcon(investment.name)}
              boxSize={8}
              color={highlightColor}
            />
          </Flex>
        </Flex>

        <Spacer />
      </Box>

      {/* Card footer - always at the bottom */}
      <Box>
        <Divider />
        <Box p={3} height="45px">
          <Flex justify="space-between" alignItems="center">
            <Badge
              colorScheme={
                investment.taxability === "taxable" ? "red" : "green"
              }
              px={2}
              py={0.5}
              borderRadius="md"
              textAlign="center"
              fontSize="2xs"
              textTransform="uppercase"
              fontWeight="bold"
            >
              {investment.taxability === "taxable" ? "Taxable" : "Tax-exempt"}
            </Badge>

            <Badge
              px={2}
              py={0.5}
              borderRadius="md"
              variant="outline"
              textAlign="center"
              fontSize="2xs"
              textTransform="uppercase"
              fontWeight="bold"
            >
              {investment.returnType}
            </Badge>
          </Flex>
        </Box>
      </Box>
    </Card>
  );
};

export default InvestmentCard;
