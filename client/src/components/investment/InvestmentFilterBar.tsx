import React from "react";
import FilterBar, { FilterOption, SortOption } from "../common/FilterBar";
import { FaFilter, FaSort } from "react-icons/fa";

interface InvestmentFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  taxability: string;
  setTaxability: (status: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
}

const InvestmentFilterBar: React.FC<InvestmentFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  taxability,
  setTaxability,
  sortBy,
  setSortBy,
}) => {
  // Investment-specific filter options
  const taxabilityOptions: FilterOption[] = [
    { value: "all", label: "All Taxability" },
    { value: "taxable", label: "Taxable" },
    { value: "tax-exempt", label: "Tax-Exempt" },
  ];

  // Investment-specific sort options
  const sortOptions: SortOption[] = [
    { value: "date", label: "Date" },
    { value: "name", label: "Name" },
    { value: "returnType", label: "Return Type" },
    { value: "return", label: "Return Rate" },
  ];

  return (
    <FilterBar
      // Search props
      searchPlaceholder="Search investments..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      // Filter props
      filterIcon={FaFilter}
      filterLabel="Filter by taxability"
      filterOptions={taxabilityOptions}
      selectedFilter={taxability}
      onFilterChange={setTaxability}
      // Sort props
      sortIcon={FaSort}
      sortLabel="Sort investments"
      sortOptions={sortOptions}
      selectedSort={sortBy}
      onSortChange={setSortBy}
    />
  );
};

export default InvestmentFilterBar;
