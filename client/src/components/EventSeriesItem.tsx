import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Badge,
  useColorModeValue,
  Progress
} from '@chakra-ui/react';

interface EventSeriesItemProps {
  name: string;
  description?: string;
  type: 'income' | 'expense' | 'invest' | 'rebalance';
  startYear: string | number;
  duration: string | number;
  amount?: string;
  annualChange?: string;
  inflationAdjusted?: boolean;
  isSocialSecurity?: boolean;
  isDiscretionary?: boolean;
  assetAllocation?: { investment: string; percentage: number }[];
  maxCash?: string;
}

const EventSeriesItem: React.FC<EventSeriesItemProps> = ({
  name,
  description,
  type,
  startYear,
  duration,
  amount,
  annualChange,
  inflationAdjusted,
  isSocialSecurity,
  isDiscretionary,
  assetAllocation,
  maxCash
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  const typeColors = {
    'income': { bg: 'green.100', color: 'green.700' },
    'expense': { bg: 'red.100', color: 'red.700' },
    'invest': { bg: 'blue.100', color: 'blue.700' },
    'rebalance': { bg: 'purple.100', color: 'purple.700' }
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
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      </Flex>
      
      {description && (
        <Text color={textColor} fontSize="sm" mb={3}>
          {description}
        </Text>
      )}
      
      <Flex justifyContent="space-between" mb={2}>
        <Text fontWeight="medium">Start Year:</Text>
        <Text>{startYear}</Text>
      </Flex>
      
      <Flex justifyContent="space-between" mb={3}>
        <Text fontWeight="medium">Duration:</Text>
        <Text>{duration} {Number(duration) === 1 ? 'year' : 'years'}</Text>
      </Flex>
      
      {(type === 'income' || type === 'expense') && (
        <>
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Initial Amount:</Text>
            <Text>{amount}</Text>
          </Flex>
          
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Annual Change:</Text>
            <Text>{annualChange}</Text>
          </Flex>
          
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Inflation Adjusted:</Text>
            <Text>{inflationAdjusted ? 'Yes' : 'No'}</Text>
          </Flex>
          
          {type === 'income' && isSocialSecurity !== undefined && (
            <Flex justifyContent="space-between" mb={2}>
              <Text fontWeight="medium">Social Security:</Text>
              <Text>{isSocialSecurity ? 'Yes' : 'No'}</Text>
            </Flex>
          )}
          
          {type === 'expense' && isDiscretionary !== undefined && (
            <Flex justifyContent="space-between" mb={2}>
              <Text fontWeight="medium">Discretionary:</Text>
              <Text>{isDiscretionary ? 'Yes' : 'No'}</Text>
            </Flex>
          )}
        </>
      )}
      
      {(type === 'invest' || type === 'rebalance') && assetAllocation && (
        <>
          <Text fontWeight="medium" mb={2}>Asset Allocation:</Text>
          {assetAllocation.map((item, index) => (
            <Flex key={index} justifyContent="space-between" fontSize="sm" mb={1}>
              <Text>{item.investment}:</Text>
              <Text>{item.percentage}%</Text>
            </Flex>
          ))}
          
          {type === 'invest' && maxCash && (
            <Flex justifyContent="space-between" mt={2}>
              <Text fontWeight="medium">Maximum Cash:</Text>
              <Text>{maxCash}</Text>
            </Flex>
          )}
        </>
      )}
    </Box>
  );
};

export default EventSeriesItem; 