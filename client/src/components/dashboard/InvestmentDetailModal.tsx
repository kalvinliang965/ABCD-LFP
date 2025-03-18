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
  Grid,
  GridItem,
  Badge,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import {
  FaPercent,
  FaChartLine,
  FaCoins,
  FaMoneyBillWave,
  FaExclamationCircle,
  FaInfoCircle,
  FaCalendarAlt,
  FaChartPie,
} from "react-icons/fa";
import { FaWallet, FaPiggyBank, FaTags } from "react-icons/fa6";

// 定义投资类型接口，确保与 Dashboard 中的一致
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

interface InvestmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment | null;
}

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

  // 如果没有投资数据，返回空内容
  if (!investment) {
    return null;
  }

  // 帮助函数：格式化百分比
  const formatPercent = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return `${value.toFixed(2)}%`;
  };

  // 帮助函数：格式化货币
  const formatCurrency = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ""));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numericValue);
  };

  // 获取账户类型的显示名称
  const getAccountTypeName = (type: string) => {
    switch (type) {
      case "non-retirement":
        return "Non-Retirement";
      case "pre-tax-retirement":
        return "Pre-Tax Retirement";
      case "after-tax-retirement":
        return "After-Tax Retirement";
      default:
        return type;
    }
  };

  // 渲染回报率信息
  const renderReturnInfo = () => {
    const returnText =
      investment.returnType === "fixed"
        ? "Fixed Return Rate"
        : "Average Return Rate";

    const returnDescription =
      investment.returnType === "fixed"
        ? "A fixed return investment provides a consistent, predetermined return."
        : "Normal distribution returns vary with an average (mean) and standard deviation.";

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>
            <Flex alignItems="center">
              <Icon as={FaChartLine} mr={2} />
              {returnText}
            </Flex>
          </StatLabel>
          <StatNumber fontSize="xl">
            {formatPercent(investment.returnRate)}
          </StatNumber>
          <StatHelpText>
            {investment.returnType === "normal" &&
              investment.returnRateStdDev && (
                <Tooltip label="Standard deviation represents the volatility of returns">
                  <Flex alignItems="center">
                    <Icon as={FaExclamationCircle} mr={1} />
                    Std Dev: {formatPercent(investment.returnRateStdDev)}
                  </Flex>
                </Tooltip>
              )}
          </StatHelpText>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          <Icon as={FaInfoCircle} mr={1} />
          {returnDescription}
        </Text>
      </Box>
    );
  };

  // 渲染分红信息
  const renderDividendInfo = () => {
    const dividendText =
      investment.dividendType === "fixed"
        ? "Fixed Dividend Rate"
        : "Average Dividend Rate";

    const dividendDescription =
      investment.dividendType === "fixed"
        ? "Fixed dividends provide consistent, predetermined income payments."
        : "Variable dividends fluctuate based on company performance and market conditions.";

    return (
      <Box>
        <Stat p={3} bg={statBgColor} borderRadius="md">
          <StatLabel color={labelColor}>
            <Flex alignItems="center">
              <Icon as={FaCoins} mr={2} />
              {dividendText}
            </Flex>
          </StatLabel>
          <StatNumber fontSize="xl">
            {formatPercent(investment.dividendRate)}
          </StatNumber>
          <StatHelpText>
            {investment.dividendType === "normal" &&
              investment.dividendRateStdDev && (
                <Tooltip label="Standard deviation represents the volatility of dividend payments">
                  <Flex alignItems="center">
                    <Icon as={FaExclamationCircle} mr={1} />
                    Std Dev: {formatPercent(investment.dividendRateStdDev)}
                  </Flex>
                </Tooltip>
              )}
          </StatHelpText>
        </Stat>
        <Text fontSize="sm" mt={2} color={textColor}>
          <Icon as={FaInfoCircle} mr={1} />
          {dividendDescription}
        </Text>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          <Flex justify="space-between" align="center">
            <Text>{investment.name}</Text>
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
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={6}>
          {/* 基本信息 */}
          <Box mb={6}>
            <Flex justify="space-between" alignItems="center" mb={2}>
              <Text fontSize="lg" fontWeight="bold" color={highlightColor}>
                Investment Overview
              </Text>
              <Flex alignItems="center">
                <Icon as={FaCalendarAlt} mr={1} color={labelColor} />
                <Text fontSize="sm" color={labelColor}>
                  Added: {investment.date}
                </Text>
              </Flex>
            </Flex>
            <Text mb={4}>{investment.description}</Text>

            {/* 当前价值和费用比率 */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
              <GridItem>
                <Stat p={3} bg={statBgColor} borderRadius="md">
                  <StatLabel color={labelColor}>
                    <Flex alignItems="center">
                      <Icon as={FaMoneyBillWave} mr={2} />
                      Current Value
                    </Flex>
                  </StatLabel>
                  <StatNumber fontSize="xl">
                    {formatCurrency(investment.value)}
                  </StatNumber>
                </Stat>
              </GridItem>
              <GridItem>
                <Stat p={3} bg={statBgColor} borderRadius="md">
                  <StatLabel color={labelColor}>
                    <Flex alignItems="center">
                      <Icon as={FaPercent} mr={2} />
                      Expense Ratio
                    </Flex>
                  </StatLabel>
                  <StatNumber fontSize="xl">
                    {formatPercent(investment.expenseRatio)}
                  </StatNumber>
                  <StatHelpText>Annual management fee</StatHelpText>
                </Stat>
              </GridItem>
            </Grid>
          </Box>

          <Divider mb={6} />

          {/* 回报和分红信息 */}
          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color={highlightColor}>
              Return & Income Details
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {renderReturnInfo()}
              {renderDividendInfo()}
            </SimpleGrid>
          </Box>

          <Divider mb={6} />

          {/* 其他信息 */}
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4} color={highlightColor}>
              Additional Information
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box p={4} bg={cardBgColor} borderRadius="md">
                <Flex align="center" mb={2}>
                  <Icon as={FaWallet} mr={2} color={highlightColor} />
                  <Text fontWeight="medium">Account Type</Text>
                </Flex>
                <Text>{getAccountTypeName(investment.accountType)}</Text>
              </Box>

              <Box p={4} bg={cardBgColor} borderRadius="md">
                <Flex align="center" mb={2}>
                  <Icon as={FaTags} mr={2} color={highlightColor} />
                  <Text fontWeight="medium">Tax Implications</Text>
                </Flex>
                <Text>
                  {investment.taxability === "taxable"
                    ? "Gains and income are subject to taxation."
                    : "Gains and income may be exempt from certain taxes."}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue">Edit Investment</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvestmentDetailModal;
