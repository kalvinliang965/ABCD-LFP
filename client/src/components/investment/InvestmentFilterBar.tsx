import React from "react";
import { Button, Stack, useColorModeValue, VStack } from "@chakra-ui/react";
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
  Text,
  Icon,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FaFilter, FaPlus, FaSort } from "react-icons/fa";

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
  const headingColor = useColorModeValue("blue.600", "blue.300");
  const iconColor = useColorModeValue("blue.500", "blue.300");
  const labelColor = useColorModeValue("gray.700", "gray.300");

  return (
    <Box
      mb={6}
      px={5}
      pb={5}
      pt={0}
      mt={6}
      bg={bg}
      borderRadius="lg"
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
        <VStack align="flex-start" pt={3}>
          <Text fontSize="md" fontWeight="medium" color={headingColor}>
            Filter & Sort Investments
          </Text>
          <Box width="100%" maxW={{ base: "100%", md: "300px", lg: "350px" }}>
            <InputGroup size="md">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={iconColor} />
              </InputLeftElement>
              <Input
                placeholder="Search investments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search investments"
                borderRadius="md"
                _focus={{
                  borderColor: iconColor,
                  boxShadow: `0 0 0 1px ${iconColor}`,
                }}
              />
            </InputGroup>
          </Box>
        </VStack>

        <HStack pt={3} spacing={4} alignItems="center" flexWrap="wrap">
          <Box>
            <FormControl
              id="taxability-filter"
              display="flex"
              alignItems="center"
            >
              <Flex alignItems="center" mr={2}>
                <Icon as={FaFilter} color={iconColor} mr={1} boxSize={3} />
                <FormLabel
                  mb={0}
                  mr={1}
                  whiteSpace="nowrap"
                  fontSize="sm"
                  color={labelColor}
                  fontWeight="medium"
                >
                  Taxability:
                </FormLabel>
              </Flex>
              <Select
                size="md"
                minWidth="150px"
                value={taxability}
                onChange={(e) => setTaxability(e.target.value)}
                aria-label="Filter by taxability"
                borderRadius="md"
                _focus={{
                  borderColor: iconColor,
                  boxShadow: `0 0 0 1px ${iconColor}`,
                }}
              >
                <option value="all">All Taxability</option>
                <option value="taxable">Taxable</option>
                <option value="tax-exempt">Tax-exempt</option>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <FormControl id="sort-by" display="flex" alignItems="center">
              <Flex alignItems="center" mr={2}>
                <Icon as={FaSort} color={iconColor} mr={1} boxSize={3} />
                <FormLabel
                  mb={0}
                  mr={1}
                  whiteSpace="nowrap"
                  fontSize="sm"
                  color={labelColor}
                  fontWeight="medium"
                >
                  Sort by:
                </FormLabel>
              </Flex>
              <Select
                size="md"
                minWidth="150px"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort investments"
                borderRadius="md"
                _focus={{
                  borderColor: iconColor,
                  boxShadow: `0 0 0 1px ${iconColor}`,
                }}
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
