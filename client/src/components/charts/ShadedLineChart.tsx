import { Box, Text, Select, Flex } from '@chakra-ui/react';
import ReactECharts from 'echarts-for-react';
import React, { useState } from 'react';

// Define the data structure for probability ranges
interface ProbabilityRangeData {
  years: number[];
  median: number[];
  ranges: {
    range10_90: [number[], number[]]; // [lower bounds, upper bounds]
    range20_80: [number[], number[]];
    range30_70: [number[], number[]];
    range40_60: [number[], number[]];
  };
  goal?: number; // for financial goal line
}

// Define the props interface
interface ShadedLineChartProps {
  data?: {
    totalInvestments?: ProbabilityRangeData;
    totalIncome?: ProbabilityRangeData;
    totalExpenses?: ProbabilityRangeData;
    earlyWithdrawalTax?: ProbabilityRangeData;
    discretionaryExpensesPct?: ProbabilityRangeData;
  };
  loading?: boolean;
  userCurrentAge?: number; // Current age of the user
}

const ShadedLineChart: React.FC<ShadedLineChartProps> = ({
  data = {},
  loading = false,
  //userCurrentAge = 60 // Default age for mock data
}) => {
  // State for the selected quantity
  const [selectedQuantity, setSelectedQuantity] = useState<string>('totalInvestments');

  // Generate mock data if no data is provided
  const mockYears = Array.from({ length: 30 }, (_, i) => 2023 + i);
  //   const mockAges = Array.from({ length: 30 }, (_, i) => userCurrentAge + i);

  // Helper function to generate mock range data with more realistic patterns
  const generateMockRangeData = (
    baseValue: number,
    growthRate: number,
    volatility: number,
    hasGoal: boolean = false,
    pattern: 'growth' | 'decline' | 'peak' | 'valley' = 'growth'
  ): ProbabilityRangeData => {
    const years = mockYears;
    //const ages = mockAges;
    const median: number[] = [];
    const range10_90: [number[], number[]] = [[], []];
    const range20_80: [number[], number[]] = [[], []];
    const range30_70: [number[], number[]] = [[], []];
    const range40_60: [number[], number[]] = [[], []];

    for (let i = 0; i < years.length; i++) {
      let yearValue: number;

      // Apply different patterns to create more realistic scenarios
      switch (pattern) {
        case 'growth':
          yearValue = baseValue * Math.pow(1 + growthRate, i);
          break;
        case 'decline':
          yearValue = baseValue * (1 - i * 0.02);
          yearValue = Math.max(yearValue, baseValue * 0.3); // Prevent going too low
          break;
        case 'peak':
          // Rise then fall (retirement spending pattern)
          if (i < years.length / 3) {
            yearValue = baseValue * Math.pow(1 + growthRate, i);
          } else {
            yearValue =
              baseValue *
              Math.pow(1 + growthRate, years.length / 3) *
              Math.pow(1 - growthRate / 2, i - years.length / 3);
          }
          break;
        case 'valley':
          // Fall then rise (market recovery pattern)
          if (i < years.length / 4) {
            yearValue = baseValue * Math.pow(1 - growthRate, i);
          } else {
            yearValue =
              baseValue *
              Math.pow(1 - growthRate, years.length / 4) *
              Math.pow(1 + growthRate, i - years.length / 4);
          }
          break;
        default:
          yearValue = baseValue * Math.pow(1 + growthRate, i);
      }

      // Volatility increases with time - square root relationship
      const yearVolatility = volatility * Math.sqrt(i + 1);

      median.push(yearValue);

      // Calculate ranges based on volatility
      range10_90[0].push(Math.max(0, yearValue * (1 - 1.65 * yearVolatility))); // 10th percentile
      range10_90[1].push(yearValue * (1 + 1.65 * yearVolatility)); // 90th percentile

      range20_80[0].push(Math.max(0, yearValue * (1 - 1.28 * yearVolatility))); // 20th percentile
      range20_80[1].push(yearValue * (1 + 1.28 * yearVolatility)); // 80th percentile

      range30_70[0].push(Math.max(0, yearValue * (1 - 0.84 * yearVolatility))); // 30th percentile
      range30_70[1].push(yearValue * (1 + 0.84 * yearVolatility)); // 70th percentile

      range40_60[0].push(Math.max(0, yearValue * (1 - 0.52 * yearVolatility))); // 40th percentile
      range40_60[1].push(yearValue * (1 + 0.52 * yearVolatility)); // 60th percentile
    }

    return {
      years,
      // ages,
      median,
      ranges: {
        range10_90: [range10_90[0], range10_90[1]],
        range20_80: [range20_80[0], range20_80[1]],
        range30_70: [range30_70[0], range30_70[1]],
        range40_60: [range40_60[0], range40_60[1]],
      },
      goal: hasGoal ? baseValue * 1.5 : undefined, // Only set goal for investments
    };
  };

  // Generate mock data for each quantity with realistic patterns
  const mockData = {
    totalInvestments: generateMockRangeData(1000000, 0.06, 0.15, true, 'peak'), // Investments peak then decline in retirement
    totalIncome: generateMockRangeData(120000, 0.03, 0.08, false, 'decline'), // Income declines in retirement
    totalExpenses: generateMockRangeData(80000, 0.025, 0.05, false, 'growth'), // Expenses grow with inflation
    earlyWithdrawalTax: generateMockRangeData(5000, 0.02, 0.2, false, 'valley'), // Taxes might vary with market conditions
    discretionaryExpensesPct: generateMockRangeData(50, 0.01, 0.1, false, 'growth'), // Percentage starts at 50%
    // totalInvestments: [],
    // totalIncome: [],
    // totalExpenses: [],
    // earlyWithdrawalTax: [], // Taxes might vary with market conditions
    // discretionaryExpensesPct: [] // Percentage starts at 50%
  };

  // Use provided data or fallback to mock data
  const chartData = {
    totalInvestments: data.totalInvestments || mockData.totalInvestments,
    totalIncome: data.totalIncome || mockData.totalIncome,
    totalExpenses: data.totalExpenses || mockData.totalExpenses,
    earlyWithdrawalTax: data.earlyWithdrawalTax || mockData.earlyWithdrawalTax,
    discretionaryExpensesPct: data.discretionaryExpensesPct || mockData.discretionaryExpensesPct,
  };

  // Get the active data based on the selected quantity
  const activeData = chartData[selectedQuantity as keyof typeof chartData];

  // Get appropriate title and y-axis label based on selected quantity
  const getTitle = () => {
    switch (selectedQuantity) {
      case 'totalInvestments':
        return 'Total Investments Over Time';
      case 'totalIncome':
        return 'Total Income Over Time';
      case 'totalExpenses':
        return 'Total Expenses Over Time';
      case 'earlyWithdrawalTax':
        return 'Early Withdrawal Tax Over Time';
      case 'discretionaryExpensesPct':
        return 'Discretionary Expenses Percentage Over Time';
      default:
        return 'Probability Ranges Over Time';
    }
  };

  const getYAxisLabel = () => {
    if (selectedQuantity === 'discretionaryExpensesPct') {
      return 'Percentage (%)';
    }
    return 'Total Value ($)'; // Simplified label, remove references to today's/future dollars
  };

  // Helper function to format values to better display in the chart
  const formatValue = (value: number): string => {
    if (selectedQuantity === 'discretionaryExpensesPct') {
      return `${value.toFixed(1)}%`;
    }
    return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  };

  // Configure chart options
  const options = {
    title: {
      text: getTitle(),
      left: 'center',
      textStyle: {
        fontWeight: 'bold',
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: '#ccc',
      padding: 10,
      textStyle: {
        color: '#333',
      },
      formatter: function (params: any) {
        const yearIndex = params[0].dataIndex;
        const year = activeData.years[yearIndex];
        // const age = activeData.ages ? activeData.ages[yearIndex] : null;

        let tooltip = `<div style="font-weight:bold;margin-bottom:5px;font-size:14px">`;
        // tooltip += age ? `Year: ${year} / Age: ${age}</div>` : `Year: ${year}</div>`;

        // Add percentile information in a table format
        tooltip += `<table style="width:100%;border-collapse:collapse;margin-top:5px">`;

        // Add median (50th percentile)
        tooltip += `<tr>
          <td style="padding:3px;font-weight:bold;color:#FF4500">Median (P50):</td>
          <td style="padding:3px;text-align:right;font-weight:bold;color:#FF4500">${formatValue(activeData.median[yearIndex])}</td>
        </tr>`;

        // Add other percentiles
        const percentiles = [
          {
            name: 'P10-P90',
            lower: activeData.ranges.range10_90[0][yearIndex],
            upper: activeData.ranges.range10_90[1][yearIndex],
            color: 'rgba(173, 216, 230, 1)',
          },
          {
            name: 'P20-P80',
            lower: activeData.ranges.range20_80[0][yearIndex],
            upper: activeData.ranges.range20_80[1][yearIndex],
            color: 'rgba(100, 149, 237, 1)',
          },
          {
            name: 'P30-P70',
            lower: activeData.ranges.range30_70[0][yearIndex],
            upper: activeData.ranges.range30_70[1][yearIndex],
            color: 'rgba(70, 130, 180, 1)',
          },
          {
            name: 'P40-P60',
            lower: activeData.ranges.range40_60[0][yearIndex],
            upper: activeData.ranges.range40_60[1][yearIndex],
            color: 'rgba(25, 25, 112, 1)',
          },
        ];

        percentiles.forEach(p => {
          tooltip += `<tr>
            <td style="padding:3px;color:${p.color}">${p.name}:</td>
            <td style="padding:3px;text-align:right">${formatValue(p.lower)} - ${formatValue(p.upper)}</td>
          </tr>`;
        });

        tooltip += `</table>`;

        // Add goal information if applicable
        if (selectedQuantity === 'totalInvestments' && activeData.goal) {
          tooltip += `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #eee">
            <span style="font-weight:bold;color:#FF0000">Financial Goal: ${formatValue(activeData.goal)}</span>
          </div>`;
        }

        return tooltip;
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.5)',
          width: 1,
        },
      },
    },
    legend: {
      data: ['Median', '10%-90%', '20%-80%', '30%-70%', '40%-60%'],
      bottom: 0,
      icon: 'rect',
      itemWidth: 15,
      itemHeight: 10,
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: activeData.years.map((year, i) => {
        // if (activeData.ages) {
        //   return `${year} / ${activeData.ages[i]}`;
        // }
        return year.toString();
      }),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        margin: 15,
      },
      axisTick: {
        alignWithLabel: true,
      },
      axisLine: {
        lineStyle: {
          color: '#999',
        },
      },
      nameLocation: 'middle',
      nameGap: 35,
      name: 'Year / Age',
    },
    yAxis: {
      type: 'value',
      name: getYAxisLabel(),
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontWeight: 'bold',
        padding: [0, 0, 10, 0],
      },
      axisLabel: {
        formatter: (value: number) => {
          if (selectedQuantity === 'discretionaryExpensesPct') {
            return `${value}%`;
          }
          return value.toLocaleString('en-US');
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ddd',
        },
      },
    },
    series: [
      // 10%-90% range (lightest shade)
      // First, the base line (10th percentile)
      {
        //name: '10%-90% base',
        name: '10%-90%',

        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 }, // invisible, just a base for stacking
        stack: 'confidence-band-10-90',
        data: activeData.ranges.range10_90[0], // 10th percentile
        legendHoverLink: false,
      },

      // Then the fill (difference between 90th and 10th)
      {
        name: '10%-90%',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: 'rgba(173, 216, 230, 0.6)', // light blue
        },
        itemStyle: {
          color: 'rgba(173, 216, 230, 0.6)',
        },
        stack: 'confidence-band-10-90',
        data: activeData.ranges.range10_90[1].map(
          (upper, i) => upper - activeData.ranges.range10_90[0][i]
        ),
      },

      // Base line at 20th percentile
      {
        name: '20%-80% base',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 }, // no fill for base
        stack: 'confidence-band-20-80',
        data: activeData.ranges.range20_80[0],
      },

      // Fill between 20th and 80th percentile
      {
        name: '20%-80%',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: 'rgba(100, 149, 237, 0.6)', // cornflower blue
        },
        itemStyle: {
          color: 'rgba(100, 149, 237, 0.6)',
        },
        stack: 'confidence-band-20-80',
        data: activeData.ranges.range20_80[1].map(
          (upper, i) => upper - activeData.ranges.range20_80[0][i]
        ),
      },

      // Base line at 30th percentile
      {
        name: '30%-70% base',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        stack: 'confidence-band-30-70',
        data: activeData.ranges.range30_70[0],
      },

      // Fill between 30th and 70th percentile
      {
        name: '30%-70%',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: 'rgba(70, 130, 180, 0.6)', // steel blue
        },
        itemStyle: {
          color: 'rgba(70, 130, 180, 0.6)',
        },
        stack: 'confidence-band-30-70',
        data: activeData.ranges.range30_70[1].map(
          (upper, i) => upper - activeData.ranges.range30_70[0][i]
        ),
      },

      // 40%-60% range (darkest shade)
      // Base line at 40th percentile
      {
        name: '40%-60% base',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: { opacity: 0 },
        stack: 'confidence-band-40-60',
        data: activeData.ranges.range40_60[0],
      },

      // Fill between 40th and 60th percentile
      {
        name: '40%-60%',
        type: 'line',
        showSymbol: false,
        symbol: 'none',
        lineStyle: { opacity: 0 },
        areaStyle: {
          color: 'rgba(25, 25, 112, 0.6)', // midnight blue
        },
        itemStyle: {
          color: 'rgba(25, 25, 112, 0.6)',
        },
        stack: 'confidence-band-40-60',
        data: activeData.ranges.range40_60[1].map(
          (upper, i) => upper - activeData.ranges.range40_60[0][i]
        ),
      },

      // Median line
      {
        name: 'Median',
        type: 'line',
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#e63946', // Red median line
        },
        itemStyle: {
          color: '#e63946',
        },
        data: activeData.median,
        z: 5, // Ensure median line is on top
        emphasis: {
          lineStyle: {
            width: 5,
          },
        },
      },

      // Financial goal line (only for investments)
      ...(selectedQuantity === 'totalInvestments' && activeData.goal
        ? [
            {
              name: 'Financial Goal',
              type: 'line',
              symbol: 'none',
              lineStyle: {
                width: 2,
                color: '#FF0000', // Red for clear visibility
                type: 'dashed',
              },
              data: activeData.years.map(() => activeData.goal),
              z: 4,
              markArea: {
                silent: true,
                itemStyle: {
                  opacity: 0.05,
                  color: '#ff0000',
                },
                data: [
                  [
                    {
                      yAxis: activeData.goal,
                    },
                    {
                      yAxis: 'max',
                    },
                  ],
                ],
              },
            },
          ]
        : []),
    ],
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" bg="white" mb={6}>
      <Flex justify="space-between" mb={4}>
        <Select
          value={selectedQuantity}
          onChange={e => setSelectedQuantity(e.target.value)}
          width="300px"
        >
          <option value="totalInvestments">Total Investments</option>
          <option value="totalIncome">Total Income</option>
          <option value="totalExpenses">Total Expenses</option>
          <option value="earlyWithdrawalTax">Early Withdrawal Tax</option>
          <option value="discretionaryExpensesPct">Discretionary Expenses Percentage</option>
        </Select>
      </Flex>

      <ReactECharts
        option={options}
        style={{ height: '500px' }}
        showLoading={loading}
        key={`${selectedQuantity}`}
      />

      <Text fontSize="sm" mt={2} color="gray.600" textAlign="center">
        This chart shows the median value and probability ranges for {getTitle().toLowerCase()}. The
        shaded regions represent different probability ranges: 10%-90% (lightest), 20%-80%, 30%-70%,
        and 40%-60% (darkest).
        {selectedQuantity === 'totalInvestments' &&
          activeData.goal &&
          ' The dashed red line represents your financial goal.'}
      </Text>
    </Box>
  );
};

export default ShadedLineChart;
