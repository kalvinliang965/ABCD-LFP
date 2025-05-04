import { Box, Text, Select, Flex, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

// Define the data structure for investments, income, and expenses
interface DataItem {
  name: string;
  category: 'investment' | 'income' | 'expense';
  taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
  values: number[];
  color?: string;
}

// Define the props interface
interface StackedBarChartProps {
  years?: number[];
  data?: {
    // New structure with median and average
    median?: {
      investments?: DataItem[];
      income?: DataItem[];
      expenses?: DataItem[];
    };
    average?: {
      investments?: DataItem[];
      income?: DataItem[];
      expenses?: DataItem[];
    };
    // Backward compatibility for old structure
    investments?: DataItem[];
    income?: DataItem[];
    expenses?: DataItem[];
  };
  title?: string;
  loading?: boolean;
  aggregationType?: 'median' | 'average';
  onAggregationTypeChange?: (type: 'median' | 'average') => void;
  aggregationThreshold?: number;
  onAggregationThresholdChange?: (threshold: number) => void;
}


// Colors for different categories
const COLORS = {
  investment: {
    'non-retirement': ['#ff9999', '#ff6666', '#ff3333', '#ff0000'],
    'pre-tax': ['#99ccff', '#66b3ff', '#3399ff', '#0080ff'],
    'after-tax': ['#99ff99', '#66ff66', '#33ff33', '#00ff00'],
  },
  // New color scheme for income - blues and greens
  income: [
    '#4299E1', // Blue
    '#38B2AC', // Teal
    '#48BB78', // Green
    '#68D391', // Light green
    '#9AE6B4', // Lighter green
    '#81E6D9', // Light teal
  ],
  // New color scheme for expenses - oranges and reds with better separation
  expense: [
    '#F56565', // Red
    '#ED8936', // Orange
    '#ECC94B', // Yellow
    '#F6AD55', // Light orange
    '#FC8181', // Light red
    '#FEB2B2', // Lighter red
    '#FAF089', // Light yellow
  ],
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  years = [],
  data = { median: { investments: [], income: [], expenses: [] }, average: { investments: [], income: [], expenses: [] } },
  title = 'Financial Values Over Time',
  loading = false,
  aggregationType = 'median',
  onAggregationTypeChange = () => {},
  aggregationThreshold = 0,
  onAggregationThresholdChange = () => {},
}) => {
  console.log('StackedBarChart props:', {
    years,
    data,
    title,
    loading,
    aggregationType,
    aggregationThreshold,
  });
  
  // State for the active tab
  const [activeTab, setActiveTab] = useState<'investments' | 'income' | 'expenses'>('investments');

  // Use provided data instead of mock data
  const chartYears = years.length > 0 ? years : [];
  
  // Check if we're using the old data format (direct properties) or new format (median/average objects)
  const isOldFormat = !!(data.investments || data.income || data.expenses);
  
  // For backward compatibility - if old format is used, use it directly regardless of aggregationType
  const chartData = isOldFormat
    ? {
        investments: data.investments?.length ? data.investments : [],
        income: data.income?.length ? data.income : [],
        expenses: data.expenses?.length ? data.expenses : [],
      }
    : {
        // Otherwise use the new format based on aggregationType
        investments: (aggregationType === 'median' 
          ? data.median?.investments 
          : data.average?.investments) || [],
        income: (aggregationType === 'median' 
          ? data.median?.income 
          : data.average?.income) || [],
        expenses: (aggregationType === 'median' 
          ? data.median?.expenses 
          : data.average?.expenses) || [],
      };

  // Get the active data based on the selected tab
  const getActiveData = () => {
    switch (activeTab) {
      case 'investments':
        return applyAggregationThreshold(chartData.investments, aggregationThreshold);
      case 'income':
        return applyAggregationThreshold(chartData.income, aggregationThreshold);
      case 'expenses':
        return applyAggregationThreshold(chartData.expenses, aggregationThreshold);
      default:
        return [];
    }
  };

  // Get the appropriate title based on the active tab
  const getActiveTitle = () => {
    switch (activeTab) {
      case 'investments':
        return 'Investment Values Over Time';
      case 'income':
        return 'Income Breakdown Over Time';
      case 'expenses':
        return 'Expense Breakdown Over Time';
      default:
        return title;
    }
  };

  // Apply aggregation threshold and assign colors
  const activeData = getActiveData();
  assignColors(activeData, activeTab);

  // Configure chart options
  const options = {
    title: {
      text: `${getActiveTitle()} (${aggregationType === 'median' ? 'Median' : 'Average'} Values)`,
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
      formatter: function (params: any) {
        if (!Array.isArray(params)) {
          const year = params.axisValue || params.name;
          return `Year: ${year}<br/>
                  ${params.seriesName}: ${formatCurrency(params.value)}`;
        }

        let tooltip = `Year: ${params[0].axisValue}<br/>`;
        let total = 0;

        // Add each value
        params.forEach((param: any) => {
          tooltip += `${param.seriesName}: ${formatCurrency(param.value)}<br/>`;
          total += param.value;
        });

        // Add total
        tooltip += `<strong>Total: ${formatCurrency(total)}</strong>`;

        return tooltip;
      },
    },
    legend: {
      data: activeData.map(item => item.name),
      top: 40,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartYears,
      name: 'Year',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      name: 'Dollar Value',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: (value: number) => formatCurrency(value, false),
      },
    },
    series: activeData.map(item => ({
      name: item.name,
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series',
      },
      data: item.values,
      itemStyle: {
        color: item.color,
      },
    })),
  };

  // Helper function to format currency
  function formatCurrency(value: number, includeSymbol = true): string {
    return includeSymbol
      ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Helper function to apply aggregation threshold
  function applyAggregationThreshold(items: DataItem[], threshold: number): DataItem[] {
    // Find items that are always below threshold
    const belowThreshold = items.filter(item => item.values.every(value => value < threshold));

    // If no items are below threshold, return original array
    if (belowThreshold.length === 0) {
      return items;
    }

    // Keep items above threshold
    const aboveThreshold = items.filter(item => !item.values.every(value => value < threshold));

    // Create "Other" category by aggregating values
    const otherValues = chartYears.map((_, yearIndex) => {
      return belowThreshold.reduce((sum, item) => sum + item.values[yearIndex], 0);
    });

    // Add "Other" category to result with appropriate category
    return [
      ...aboveThreshold,
      {
        name: `Other ${activeTab === 'investments' ? 'Investments' : activeTab === 'income' ? 'Income' : 'Expenses'}`,
        category:
          activeTab === 'investments'
            ? 'investment'
            : activeTab === 'income'
              ? 'income'
              : 'expense',
        taxStatus: activeTab === 'investments' ? 'pre-tax' : undefined,
        values: otherValues,
      },
    ];
  }

  // Helper function to assign colors based on category and tax status
  function assignColors(items: DataItem[], category: 'investments' | 'income' | 'expenses'): void {
    if (category === 'investments') {
      // Count investments by tax status
      const counts = {
        'non-retirement': 0,
        'pre-tax': 0,
        'after-tax': 0,
      };

      // Assign colors for investments based on tax status
      items.forEach(item => {
        if (item.taxStatus) {
          const statusCount = counts[item.taxStatus]++;
          const statusColors = COLORS.investment[item.taxStatus];
          item.color = statusColors[statusCount % statusColors.length];
        }
      });
    } else {
      // Assign colors for income or expenses
      const colorArray = category === 'income' ? COLORS.income : COLORS.expense;
      items.forEach((item, index) => {
        item.color = colorArray[index % colorArray.length];
      });
    }
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" bg="white" mb={6}>
      <Tabs
        variant="enclosed"
        colorScheme="blue"
        mb={4}
        onChange={index => {
          const tabs: Array<'investments' | 'income' | 'expenses'> = [
            'investments',
            'income',
            'expenses',
          ];
          setActiveTab(tabs[index]);
        }}
      >
        <TabList>
          <Tab>Investments</Tab>
          <Tab>Income</Tab>
          <Tab>Expenses</Tab>
        </TabList>
      </Tabs>

      <Flex justify="space-between" mb={4}>
        <Select
          value={aggregationType}
          onChange={e => onAggregationTypeChange(e.target.value as 'median' | 'average')}
          width="150px"
        >
          <option value="median">Median Values</option>
          <option value="average">Average Values</option>
        </Select>

        <Select
          value={aggregationThreshold}
          onChange={e => onAggregationThresholdChange(Number(e.target.value))}
          width="200px"
        >
          <option value="0">No Aggregation</option>
          <option value="1000">Threshold: $1,000</option>
          <option value="5000">Threshold: $5,000</option>
          <option value="10000">Threshold: $10,000</option>
          <option value="50000">Threshold: $50,000</option>
        </Select>
      </Flex>

      <ReactECharts
        option={options}
        style={{ height: '500px' }}
        showLoading={loading}
        key={`${activeTab}-${aggregationType}-${aggregationThreshold}`}
      />

      <Text fontSize="sm" mt={2} color="gray.600" textAlign="center">
        {activeTab === 'investments' ? (
          <>
            This chart shows the {aggregationType} value of each investment over time. Investments
            are color-coded by tax status:
            <Box as="span" color="#ff6666" fontWeight="bold">
              {' '}
              Non-Retirement
            </Box>
            ,
            <Box as="span" color="#3399ff" fontWeight="bold">
              {' '}
              Pre-Tax
            </Box>
            , and
            <Box as="span" color="#33ff33" fontWeight="bold">
              {' '}
              After-Tax
            </Box>
            .
          </>
        ) : activeTab === 'income' ? (
          <>This chart shows the {aggregationType} value of each income source over time.</>
        ) : (
          <>
            This chart shows the {aggregationType} value of each expense category over time. Taxes
            are included as a separate category.
          </>
        )}
      </Text>
    </Box>
  );
};

export default StackedBarChart;
