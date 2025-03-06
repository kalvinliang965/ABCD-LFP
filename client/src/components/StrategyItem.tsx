import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue,
  OrderedList,
  ListItem
} from '@chakra-ui/react';

interface StrategyItemProps {
  name: string;
  type: 'spending' | 'withdrawal';
  description?: string;
  items: string[];
}

const StrategyItem: React.FC<StrategyItemProps> = ({
  name,
  type,
  description,
  items
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  const typeColors = {
    'spending': { bg: 'orange.100', color: 'orange.700' },
    'withdrawal': { bg: 'teal.100', color: 'teal.700' }
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
        <Badge
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          fontWeight="bold"
          textAlign="center"
          bg={typeColors[type].bg}
          color={typeColors[type].color}
        >
          {type === 'spending' ? 'Spending Strategy' : 'Withdrawal Strategy'}
        </Badge>
      </Flex>
      
      {description && (
        <Text color={textColor} fontSize="sm" mb={3}>
          {description}
        </Text>
      )}
      
      <Text fontWeight="medium" mb={2}>
        {type === 'spending' ? 'Discretionary Expense Priority:' : 'Investment Withdrawal Order:'}
      </Text>
      
      <OrderedList pl={4} spacing={1}>
        {items.map((item, index) => (
          <ListItem key={index}>{item}</ListItem>
        ))}
      </OrderedList>
    </Box>
  );
};

export default StrategyItem; 