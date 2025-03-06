import React from 'react';
import {
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  status: string;
  setStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  status,
  setStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) => {
  return (
    <Flex 
      direction={{ base: "column", md: "row" }} 
      mb={6} 
      gap={4}
      align={{ base: "stretch", md: "center" }}
    >
      <InputGroup flex={{ base: "1", md: "2" }}>
        <InputLeftElement pointerEvents="none">
          <FaSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search investments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg={useColorModeValue('white', 'gray.700')}
        />
      </InputGroup>
      
      <Flex gap={3} direction={{ base: "column", sm: "row" }} flex="1">
        <Box flex="1">
          <Flex alignItems="center">
            <Box minWidth="70px">Status:</Box>
            <Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              bg={useColorModeValue('white', 'gray.700')}
            >
              <option value="all">All</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Flex>
        </Box>
        
        <Box flex="1">
          <Flex alignItems="center">
            <Box minWidth="70px">Sort By:</Box>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg={useColorModeValue('white', 'gray.700')}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="value">Value</option>
              <option value="return">Return</option>
            </Select>
          </Flex>
        </Box>
        
        <Box flex="1">
          <Flex alignItems="center">
            <Box minWidth="70px">Order:</Box>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              bg={useColorModeValue('white', 'gray.700')}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default FilterBar; 