import React from 'react';
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
  Divider
} from '@chakra-ui/react';
import { FaPlus, FaBuilding, FaChartLine, FaCoins, FaBitcoin, FaFileInvoiceDollar, FaCalendarAlt } from 'react-icons/fa';

// 定义投资回报类型
enum ReturnType {
  FIXED = "fixed",
  NORMAL = "normal",
  GBM = "gbm"
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
  taxability: 'taxable' | 'tax-exempt';
  lastUpdated: string;
  username?: string;
}

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

// 获取投资类型对应的图标
const getInvestmentIcon = (name: string) => {
  if (name.toLowerCase().includes('real estate') || name.toLowerCase().includes('property')) {
    return FaBuilding;
  } else if (name.toLowerCase().includes('stock') || name.toLowerCase().includes('portfolio')) {
    return FaChartLine;
  } else if (name.toLowerCase().includes('gold') || name.toLowerCase().includes('etf')) {
    return FaCoins;
  } else if (name.toLowerCase().includes('crypto') || name.toLowerCase().includes('bitcoin')) {
    return FaBitcoin;
  } else if (name.toLowerCase().includes('bond') || name.toLowerCase().includes('fund') || name.toLowerCase().includes('equity')) {
    return FaFileInvoiceDollar;
  }
  return FaChartLine; // 默认图标
};

const InvestmentList: React.FC<InvestmentListProps> = ({ investments, onOpenInvestmentModal }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const dateColor = useColorModeValue('gray.500', 'gray.400');
  
  // 截断文本函数
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Box mb={10}>
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
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {investments.map((investment) => (
          <Card 
            key={investment.id} 
            bg={cardBg}
            boxShadow="md"
            borderRadius="md"
            borderWidth="1px"
            borderColor={borderColor}
            borderStyle="dashed"
            overflow="hidden"
            transition="all 0.3s"
            _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
            cursor="pointer"
            p={4}
          >
            {/* 投资名称和图标 */}
            <Flex mb={2} alignItems="center">
              <Icon 
                as={getInvestmentIcon(investment.name)} 
                boxSize={6} 
                color={highlightColor}
                mr={2}
              />
              <Text fontWeight="bold" fontSize="md" color={highlightColor}>
                {investment.name}
              </Text>
            </Flex>
            
            {/* 更新日期 */}
            <Flex mb={2} alignItems="center">
              <Icon as={FaCalendarAlt} size="sm" color={dateColor} mr={2} />
              <Text fontSize="xs" color={dateColor}>
                Updated: {investment.lastUpdated}
              </Text>
            </Flex>
            
            {/* 描述 */}
            <Text color={textColor} fontSize="sm" mb={4}>
              {truncateText(investment.description, 50)}
            </Text>
            
            <Divider my={3} />
            
            {/* 用户信息、Taxable状态和Return Type */}
            <HStack spacing={2} wrap="wrap" justify="space-between">
              <Flex alignItems="center">
                <Avatar size="xs" name={investment.username || "User"} mr={2} />
                <Text fontSize="xs">{investment.username || "Anonymous User"}</Text>
              </Flex>
              
              <HStack spacing={2} flexWrap="wrap">
                <Badge 
                  colorScheme={investment.taxability === 'taxable' ? 'red' : 'green'}
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {investment.taxability === 'taxable' ? 'Taxable' : 'Tax-exempt'}
                </Badge>
                
                <Badge px={2} py={1} borderRadius="full" variant="outline">
                  {investment.returnType}
                </Badge>
              </HStack>
            </HStack>
          </Card>
        ))}
        
        {/* 添加新投资卡片 */}
        <Card
          bg={cardBg}
          boxShadow="md"
          borderRadius="md"
          borderWidth="1px"
          borderColor={borderColor}
          borderStyle="dashed"
          overflow="hidden"
          transition="all 0.3s"
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
          cursor="pointer"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          py={10}
          onClick={onOpenInvestmentModal}
        >
          <Icon as={FaPlus} boxSize={10} mb={3} color="gray.400" />
          <Text color="gray.500">Add New Investment</Text>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList; 