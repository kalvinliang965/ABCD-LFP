import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface InvestmentCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: IconType;
  period?: string;
}

const InvestmentCard: React.FC<InvestmentCardProps> = ({ title, value, change = 0, icon, period }) => {
  const isPositive = change >= 0;
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  return (
    <Box
      className="stat-card"
      bg={cardBg}
      borderRadius="10px"
      p="20px"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
      display="flex"
      alignItems="center"
    >
      {icon && (
        <Icon
          as={icon}
          boxSize={10}
          color={isPositive ? 'green.500' : 'red.500'}
          mr={4}
        />
      )}
      <Box>
        <Text color={textColor} fontSize="sm" fontWeight="medium">{title}</Text>
        <Text fontSize="2xl" fontWeight="bold" my="2">{value}</Text>
        {change !== undefined && (
          <Flex alignItems="center">
            <Box
              as="span"
              color={isPositive ? 'green.500' : 'red.500'}
              fontSize="sm"
              fontWeight="medium"
            >
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% {period && `(${period})`}
            </Box>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default InvestmentCard; 