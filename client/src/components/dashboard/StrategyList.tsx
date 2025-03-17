import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  useColorModeValue,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { FaPlus, FaChevronDown } from 'react-icons/fa';
import StrategyItem from '../StrategyItem';

interface Strategy {
  id: number;
  name: string;
  type: 'spending' | 'withdrawal';
  description?: string;
  items: string[];
}

interface StrategyListProps {
  strategies: Strategy[];
  onOpenStrategyModal: (type: 'spending' | 'withdrawal') => void;
}

const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  onOpenStrategyModal
}) => {
  return (
    <Box mb={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Strategies</Heading>
        <Menu>
          <MenuButton as={Button} rightIcon={<FaChevronDown />} colorScheme="blue" size="sm">
            Add Strategy
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => onOpenStrategyModal('spending')}>
              Spending Strategy
            </MenuItem>
            <MenuItem onClick={() => onOpenStrategyModal('withdrawal')}>
              Withdrawal Strategy
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {strategies.map((strategy) => (
          <StrategyItem
            key={strategy.id}
            name={strategy.name}
            type={strategy.type}
            description={strategy.description}
            items={strategy.items}
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
          onClick={() => onOpenStrategyModal('spending')}
        >
          <Icon as={FaPlus} boxSize={8} mb={3} color="gray.400" />
          <Text color="gray.500">Add New Strategy</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default StrategyList; 