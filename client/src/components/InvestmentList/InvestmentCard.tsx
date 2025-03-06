// InvestmentCard.tsx
import React from "react";
import {
  Card,
  Flex,
  Icon,
  Text,
  Badge,
  Avatar,
  HStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaBuilding,
  FaChartLine,
  FaCoins,
  FaBitcoin,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import { Investment } from "../../types/investment";

// 如果后端没有提供 icon，则可以根据 name 进行匹配
const getInvestmentIcon = (investment: Investment) => {

  // 优先使用明确的图标映射，不要依赖字符串包含关系
  if (investment.name === "Tech Growth Portfolio") {
    return FaChartLine;
  } else if (investment.name === "Municipal Bond A") {
    return FaFileInvoiceDollar;
  }

  // 后备方案
  return FaChartLine;
};

interface InvestmentCardProps {
  investment: Investment;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ investment }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const dateColor = useColorModeValue("gray.500", "gray.400");

  // 截断文本
  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  const IconComponent = getInvestmentIcon(investment);

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
      p={4}
      height="200px" // 固定卡片高度
      width="320px" // 固定卡片宽度
    >
      {/* 投资名称和图标 */}
      <Flex mb={2} alignItems="center">
        <Icon
          as={IconComponent as any}
          boxSize={6}
          color={highlightColor}
          mr={2}
        />
        <Text fontWeight="bold" fontSize="md" color={highlightColor}>
          {investment.name}
        </Text>
      </Flex>

      {/* 更新时间 */}
      <Flex mb={2} alignItems="center">
        <Icon as={FaCalendarAlt} boxSize={6} color={dateColor} mr={2} />
        <Text fontSize="xs" color={dateColor}>
          Updated: {investment.lastUpdated?.toString()}
        </Text>
      </Flex>

      {/* 描述 */}
      <Text color={textColor} fontSize="sm" mb={4}>
        {truncateText(investment.description || "", 50)}
      </Text>

      <Divider my={3} />

      {/* 用户信息、Taxability状态和Return Type */}
      <HStack spacing={2} wrap="wrap" justify="space-between">
        <Flex alignItems="center">
          <Avatar size="xs" name={investment.name || "User"} mr={2} />
          <Text fontSize="xs">{investment.name || "Anonymous User"}</Text>
        </Flex>

        <HStack spacing={2} flexWrap="wrap">
          <Badge
            colorScheme={investment.isTaxExempt ? "red" : "green"}
            px={2}
            py={1}
            borderRadius="full"
          >
            {investment.isTaxExempt ? "Tax-exempt" : "Taxable"}
          </Badge>

          <Badge px={2} py={1} borderRadius="full" variant="outline">
            {investment.expectedAnnualReturn.mode}
          </Badge>
        </HStack>
      </HStack>
    </Card>
  );
};

export default InvestmentCard;
