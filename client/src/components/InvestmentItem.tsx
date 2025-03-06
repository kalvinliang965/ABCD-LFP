import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';

interface InvestmentItemProps {
  name: string;
  icon: React.ReactNode;
  date: string;
  value: string;
  returnRate: number;
  description?: string;
  expenseRatio?: number;
  returnType?: 'fixed' | 'normal' | 'gbm';
  dividendType?: 'fixed' | 'normal' | 'gbm';
  // 只保留 taxability，用来做 Badge 展示
  taxability?: 'tax-exempt' | 'taxable';
}

const InvestmentItem: React.FC<InvestmentItemProps> = ({
  name,
  icon,
  date,
  value,
  returnRate,
  description,
  expenseRatio,
  returnType,
  dividendType,
  taxability,
}) => {
  // 根据深色 / 浅色模式切换背景和文字颜色
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  // 判断收益是否为正
  const isPositive = returnRate >= 0;

  // 根据 taxability 来动态设置徽章颜色
  const taxabilityColors = {
    'tax-exempt': { bg: 'green.100', color: 'green.700' },
    'taxable': { bg: 'red.100', color: 'red.700' },
  };
  
  return (
    <Card
      bg={cardBg}
      borderRadius="lg"
      borderWidth="1px"
      shadow="md"
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
      // 也可以根据需要添加 p={5} 或别的 spacing
    >
      {/* Header 区域 */}
      <CardHeader>
        <Flex justifyContent="space-between" alignItems="center">
          <Heading size="md">{name}</Heading>
          <Box fontSize="xl">{icon}</Box>
        </Flex>
      </CardHeader>

      {/* Body 区域 */}
      <CardBody>
        <Text color={textColor} fontSize="sm" mb={3}>
          Updated: {date}
        </Text>

        <Flex justifyContent="space-between" mb={3}>
          <Text>Value: {value}</Text>
          <Text
            color={isPositive ? 'green.500' : 'red.500'}
            fontWeight="medium"
          >
            {isPositive ? '+' : ''}
            {returnRate}%
          </Text>
        </Flex>

        {/* 如果传了 description，就显示 */}
        {description && (
          <Text fontSize="sm" color={textColor} mt={2} mb={2}>
            {description}
          </Text>
        )}
        
        {/* 如果设置了回报类型，就显示 */}
        {returnType && (
          <Flex justifyContent="space-between" fontSize="sm" mt={2}>
            <Text fontWeight="medium">Return Type:</Text>
            <Text>{returnType}</Text>
          </Flex>
        )}
        
        {/* 如果设置了费用率，就显示 */}
        {expenseRatio !== undefined && (
          <Flex justifyContent="space-between" fontSize="sm" mt={1}>
            <Text fontWeight="medium">Expense Ratio:</Text>
            <Text>{expenseRatio}%</Text>
          </Flex>
        )}
        
        {/* 如果设置了分红类型，就显示 */}
        {dividendType && (
          <Flex justifyContent="space-between" fontSize="sm" mt={1}>
            <Text fontWeight="medium">Dividend Type:</Text>
            <Text>{dividendType}</Text>
          </Flex>
        )}
      </CardBody>

      {/* Footer 区域 */}
      <CardFooter>
        {taxability && (
          <Badge
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textAlign="center"
            bg={taxabilityColors[taxability].bg}
            color={taxabilityColors[taxability].color}
          >
            {taxability}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default InvestmentItem;
