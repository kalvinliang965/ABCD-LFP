import React from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import InvestmentItem from '../InvestmentItem';

interface Investment {
  id: number;
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

interface InvestmentListProps {
  investments: Investment[];
  onOpenInvestmentModal: () => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onOpenInvestmentModal
}) => {
  return (
    <Box mb={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
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
          <InvestmentItem
            key={investment.id}
            name={investment.name}
            icon={investment.icon}
            date={investment.date}
            value={investment.value}
            returnRate={investment.returnRate}
            status={investment.status}
            description={investment.description}
            expenseRatio={investment.expenseRatio}
            returnType={investment.returnType}
            dividendType={investment.dividendType}
            taxability={investment.taxability}
          />
        ))}
        
        <Box
          p={5}
          height="100%"
          borderWidth="1px"
          borderRadius="lg"
          borderStyle="dashed"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
          onClick={onOpenInvestmentModal}
        >
          <Icon as={FaPlus} boxSize={8} mb={3} color="gray.400" />
          <Text color="gray.500">Add New Investment</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default InvestmentList; 