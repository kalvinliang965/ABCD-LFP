import React from "react";
import { useColorModeValue } from "@chakra-ui/react";
import {
  Box,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  FormControl,
  FormLabel,
  Select,
  HStack,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface InvestmentFilterBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  taxability: string;
  setTaxability: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const InvestmentFilterBar = ({
  searchTerm,
  setSearchTerm,
  taxability,
  setTaxability,
  sortBy,
  setSortBy,
}: InvestmentFilterBarProps) => {
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      mb={6}
      p={4}
      bg={bg}
      borderRadius="md"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
      width="100%"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        gap={4}
        width="100%"
        wrap="wrap"
      >
        <Box flex="1" maxW={{ base: "100%", md: "300px", lg: "350px" }}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search investments"
            />
          </InputGroup>
        </Box>

        <HStack spacing={4} alignItems="center" flexWrap="wrap">
          <Box>
            <FormControl
              id="taxability-filter"
              display="flex"
              alignItems="center"
            >
              <FormLabel mb={0} mr={2} whiteSpace="nowrap" fontSize="sm">
                Taxability:
              </FormLabel>
              <Select
                size="md"
                minWidth="150px"
                value={taxability}
                onChange={(e) => setTaxability(e.target.value)}
                aria-label="Filter by taxability"
              >
                <option value="all">All Taxability</option>
                <option value="taxable">Taxable</option>
                <option value="tax-exempt">Tax-exempt</option>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl id="sort-by" display="flex" alignItems="center">
              <FormLabel mb={0} mr={2} whiteSpace="nowrap" fontSize="sm">
                Sort by:
              </FormLabel>
              <Select
                size="md"
                minWidth="150px"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort investments"
              >
                <option value="date">Date (newest)</option>
                <option value="name">Name</option>
                <option value="return">Return Rate</option>
                <option value="returnType">Return Type</option>
              </Select>
            </FormControl>
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
};

export default InvestmentFilterBar;
