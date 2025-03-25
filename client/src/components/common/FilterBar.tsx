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
import { FaSearch } from "react-icons/fa";

/**
 * AI prompt : help me design a filter bar to filter the data by using the filter options and the sort options, I want to use the filter bar in the scenario list page and the investment list page
 */
export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  // Search
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Filter
  filterIcon?: React.ElementType;
  filterLabel?: string;
  filterOptions: FilterOption[];
  selectedFilter: string;
  onFilterChange: (value: string) => void;

  // Sort
  sortIcon?: React.ElementType;
  sortLabel?: string;
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterIcon,
  filterLabel,
  filterOptions,
  selectedFilter,
  onFilterChange,
  sortIcon,
  sortLabel,
  sortOptions,
  selectedSort,
  onSortChange,
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
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            size="md"
          />
        </InputGroup>

        <HStack
          spacing={{ base: 2, md: 4 }}
          width={{ base: "100%", md: "auto" }}
          alignItems="center"
        >
          {filterOptions.length > 0 && (
            <Flex alignItems="center" width={{ base: "100%", md: "auto" }}>
              {filterIcon && <Icon as={filterIcon} color="gray.400" mr={2} />}
              <Select
                value={selectedFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                size="md"
                width={{ base: "full", md: "160px" }}
                aria-label={filterLabel || "Filter"}
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Flex>
          )}

          {sortOptions.length > 0 && (
            <Flex alignItems="center" width={{ base: "100%", md: "auto" }}>
              {sortIcon && <Icon as={sortIcon} color="gray.400" mr={2} />}
              <Select
                value={selectedSort}
                onChange={(e) => onSortChange(e.target.value)}
                size="md"
                width={{ base: "full", md: "150px" }}
                aria-label={sortLabel || "Sort"}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Flex>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default FilterBar;
