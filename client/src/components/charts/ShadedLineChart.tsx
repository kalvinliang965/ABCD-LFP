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
  //userCurrentAge?: number; // Current age of the user
}

// Create an empty ProbabilityRangeData object to use as fallback
const emptyProbabilityData: ProbabilityRangeData = {
  years: [],
  median: [],
  ranges: {
    range10_90: [[], []],
    range20_80: [[], []],
    range30_70: [[], []],
    range40_60: [[], []],
  }
};

const ShadedLineChart: React.FC<ShadedLineChartProps> = ({
  data = {},
  loading = false,
  //userCurrentAge = 60 // Default age for mock data
}) => {
  // State for the selected quantity
  const [selectedQuantity, setSelectedQuantity] = useState<string>('totalInvestments');

  // Use provided data or fallback to empty data with proper structure
  const chartData = {
    totalInvestments: data.totalInvestments || emptyProbabilityData,
    totalIncome: data.totalIncome || emptyProbabilityData,
    totalExpenses: data.totalExpenses || emptyProbabilityData,
    earlyWithdrawalTax: data.earlyWithdrawalTax || emptyProbabilityData,
    discretionaryExpensesPct: data.discretionaryExpensesPct || emptyProbabilityData,
  };
  console.log('chartData', chartData);

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
      return `${(value).toFixed(1)}%`;
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
    dataZoom: [
      {
        type: 'slider',      
        show: true,
        xAxisIndex: 0,
        start: 0,            
        end: 100
      },
      {
        type: 'inside',       
        xAxisIndex: 0,
        start: 70,
        end: 100
      }
    ],
    
    xAxis: {
      type: 'category',
      data: activeData.years.map((year: number, i: number) => {
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
      // Add custom min and max to provide more visual space for the data

      min: function (value: { min: number; max: number }) {
        if (selectedQuantity === 'discretionaryExpensesPct') {
          return Math.max(0, Math.floor(value.min - 5));
        }
        return Math.floor(value.min * 0.95); // 保留整十、整百的刻度
      },
      max: function (value: { min: number; max: number }) {
        if (selectedQuantity === 'discretionaryExpensesPct') {
          return Math.min(100, Math.ceil(value.max + 5));
        }
        return Math.ceil(value.max * 1.05); // 向上取整
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
          (upper: number, i: number) => upper - activeData.ranges.range10_90[0][i]
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
          (upper: number, i: number) => upper - activeData.ranges.range20_80[0][i]
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
          (upper: number, i: number) => upper - activeData.ranges.range30_70[0][i]
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
          (upper: number, i: number) => upper - activeData.ranges.range40_60[0][i]
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
