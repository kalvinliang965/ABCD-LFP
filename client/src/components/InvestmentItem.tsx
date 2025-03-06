import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface InvestmentItemProps {
  name: string;
  icon: React.ReactNode;
  date: string;
  value: string;
  returnRate: number;
  status: 'In Progress' | 'Completed' | 'Pending' | 'Rejected';
  description?: string;
  expenseRatio?: number;
  returnType?: 'fixed' | 'normal' | 'gbm';
  dividendType?: 'fixed' | 'normal' | 'gbm';
  taxability?: 'tax-exempt' | 'taxable';
}

const InvestmentItem: React.FC<InvestmentItemProps> = ({
  name,
  icon,
  date,
  value,
  returnRate,
  status,
  description,
  expenseRatio,
  returnType,
  dividendType,
  taxability
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const isPositive = returnRate >= 0;
  
  const statusColors = {
    'In Progress': { bg: 'blue.100', color: 'blue.700' },
    'Completed': { bg: 'green.100', color: 'green.700' },
    'Pending': { bg: 'yellow.100', color: 'yellow.700' },
    'Rejected': { bg: 'red.100', color: 'red.700' }
  };

  return (
    <Box
      p={5}
      shadow="md"
      borderWidth="1px"
      borderRadius="lg"
      bg={cardBg}
      transition="transform 0.3s, box-shadow 0.3s"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" mb={3}>
        <Heading size="md">{name}</Heading>
        <Box fontSize="xl">{icon}</Box>
      </Flex>
      
      <Text color={textColor} fontSize="sm" mb={3}>
        Updated: {date}
      </Text>
      
      <Flex justifyContent="space-between" mb={3}>
        <Text>Value: {value}</Text>
        <Text
          color={isPositive ? 'green.500' : 'red.500'}
          fontWeight="medium"
        >
          {isPositive ? "+" : ""}{returnRate}%
        </Text>
      </Flex>
      
      <Badge
        px={2}
        py={1}
        borderRadius="full"
        fontSize="xs"
        fontWeight="bold"
        textAlign="center"
        bg={statusColors[status].bg}
        color={statusColors[status].color}
        mb={3}
      >
        {status}
      </Badge>
      
      {description && (
        <Text fontSize="sm" color={textColor} mt={2} mb={2}>
          {description}
        </Text>
      )}
      
      {returnType && (
        <Flex justifyContent="space-between" fontSize="sm" mt={2}>
          <Text fontWeight="medium">Return Type:</Text>
          <Text>{returnType}</Text>
        </Flex>
      )}
      
      {expenseRatio !== undefined && (
        <Flex justifyContent="space-between" fontSize="sm" mt={1}>
          <Text fontWeight="medium">Expense Ratio:</Text>
          <Text>{expenseRatio}%</Text>
        </Flex>
      )}
      
      {dividendType && (
        <Flex justifyContent="space-between" fontSize="sm" mt={1}>
          <Text fontWeight="medium">Dividend Type:</Text>
          <Text>{dividendType}</Text>
        </Flex>
      )}
      
      {taxability && (
        <Flex justifyContent="space-between" fontSize="sm" mt={1}>
          <Text fontWeight="medium">Taxability:</Text>
          <Text>{taxability}</Text>
        </Flex>
      )}
    </Box>
  );
};

export default InvestmentItem; 