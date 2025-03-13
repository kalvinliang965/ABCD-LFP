import React from "react";
import {
  Box,
  Input,
  Select,
  HStack,
  Flex,
  InputGroup,
  InputLeftElement,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaSearch, FaFilter, FaSort } from "react-icons/fa";

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  status: string;
  setStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: string;
  setSortOrder: (sortOrder: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  status,
  setStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 3, md: 4 }}
      mb={6}
      width="100%"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        gap={{ base: 3, md: 4 }}
      >
        <InputGroup width={{ base: "100%", md: "40%" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search investments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="md"
          />
        </InputGroup>

        <HStack
          spacing={{ base: 2, md: 4 }}
          width={{ base: "100%", md: "auto" }}
          alignItems="center"
        >
          <Flex alignItems="center" width={{ base: "100%", md: "auto" }}>
            <Icon as={FaFilter} color="gray.400" mr={2} />
            <Select
              placeholder="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              size="md"
              width={{ base: "full", md: "150px" }}
            >
              <option value="all">All Status</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Flex>

          <Flex alignItems="center" width={{ base: "100%", md: "auto" }}>
            <Icon as={FaSort} color="gray.400" mr={2} />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="md"
              width={{ base: "full", md: "150px" }}
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="value">Value</option>
              <option value="return">Return</option>
            </Select>
          </Flex>

          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            size="md"
            width={{ base: "full", md: "120px" }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
        </HStack>
      </Flex>
    </Box>
  );
};

export default FilterBar;
