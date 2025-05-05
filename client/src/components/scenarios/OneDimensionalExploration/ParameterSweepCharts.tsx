import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Select,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Flex,
  Badge,
  HStack,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { InfoIcon } from '@chakra-ui/icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const COLOR_PALETTE = [
  '#3b82f6', // Blue-500
  '#f97316', // Orange-500
  '#10b981', // Emerald-500
  '#ef4444', // Red-500
  '#8b5cf6', // Violet-500
  '#14b8a6', // Teal-500
  '#f59e0b', // Amber-500
  '#6366f1', // Indigo-500
  '#ec4899', // Pink-500
  '#6b7280', // Gray-500
];

interface ParameterSweepChartsProps {
  results: any;
}

type MetricType = 'successProbability' | 'medianTotalInvestments';

//function to format parameter names for display
const formatParameterName = (paramName: string): string => {
  if (paramName === 'rothOptimizer') {
    return 'Roth Optimizer';
  }
  
  //split by capital letters and join with spaces
  return paramName
    //insert a space before all capital letters
    .replace(/([A-Z])/g, ' $1')
    //ensure the first letter is capitalized
    .replace(/^./, str => str.toUpperCase())
    //trim any leading space
    .trim();
};

const ParameterSweepCharts: React.FC<ParameterSweepChartsProps> = ({ results }) => {
  const [selected_metric, set_selected_metric] = useState<MetricType>('successProbability');
  const [visibleLines, set_visible_lines] = useState<Set<string>>(new Set());
  const [chartData, set_chart_data] = useState<any>(null);

  if (!results || !Array.isArray(results.data) || results.data.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text>No data available for charts.</Text>
      </Box>
    );
  }

  const is_numeric_parameter = !isNaN(Number(results.data[0].param));
  const is_roth_parameter = results.parameterType === 'rothOptimizer';
  const metric_label = selected_metric === 'successProbability' 
    ? 'Success Probability' 
    : 'Median Total Investments';
  
  //count successful simulations
  const successful_runs = results.data.filter((item: any) => !item.error).length;
  const total_runs = results.data.length;

  //5.1 Multi-line chart, value over time
  const prepare_time_series_data = () => {
    if (!results.data[0]?.results) {
      return null;
    }

    const datasets: Array<{
      label: string;
      data: Array<{ x: number; y: number }>;
      borderColor: string;
      backgroundColor: string;
      tension: number;
      pointRadius: number;
      pointHoverRadius: number;
      pointBackgroundColor: string;
      borderDash: number[];
      clip: false;
    }> = [];
    const all_years = new Set<number>();

    //prepare datasets
    results.data.forEach((item: any, index: number) => {
      if (!item.results) return;
      
      const data_points: { x: number; y: number }[] = [];
      const yearly_results = item.results.yearly_results;
      
      //format parameter name to be more readable
      const paramName = formatParameterName(results.parameterType);
      const label = `${paramName}: ${item.param}`;
      
      if (yearly_results && yearly_results.length) {
        yearly_results.forEach((yearData: { year: number; success_probability: number; total_investment: { median: number } }) => {
          all_years.add(yearData.year);
          if (selected_metric === 'successProbability') {
            data_points.push({ 
              x: yearData.year, 
              y: yearData.success_probability 
            });
          } else {
            data_points.push({ 
              x: yearData.year, 
              y: yearData.total_investment.median 
            });
          }
        });
      }

      //sort data points by year
      data_points.sort((a, b) => a.x - b.x);

      const borderColor = COLOR_PALETTE[index % COLOR_PALETTE.length];

      datasets.push({
        label,
        data: data_points,
        borderColor,
        backgroundColor: borderColor.replace(')', ', 0.1)'),
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: borderColor,
        borderDash: index % 2 === 0 ? [] : [5, 5],
        clip: false as const,
      });
    });

    //sort datasets by final Y value (descending) to ensure smaller values are drawn on top
    datasets.sort((a, b) => {
      const aLast = a.data[a.data.length - 1]?.y || 0;
      const bLast = b.data[b.data.length - 1]?.y || 0;
      return bLast - aLast;
    });

    //prepare labels (years)
    const years = Array.from(all_years).sort((a, b) => a - b);

    return {
      labels: years,
      datasets,
    };
  };

  //update time series data when results or selected metric changes
  useEffect(() => {
    const new_time_series_data = prepare_time_series_data();
    set_chart_data(new_time_series_data);
    
    //initialize visible lines with all labels
    if (new_time_series_data) {
      const allLabels = new_time_series_data.datasets.map((ds: any) => ds.label);
      set_visible_lines(new Set(allLabels));
    }
  }, [results, selected_metric]);

  //5.2 Line chart->parameter vs. final value
  const prepare_parameter_vs_metric_data = () => {
    if (!is_numeric_parameter || is_roth_parameter) {
      return null;
    }

    const data_points: { x: number | string; y: number }[] = [];

    //sort data by parameter value
    const sorted_data = [...results.data].sort((a, b) => {
      return Number(a.param) - Number(b.param);
    });

    //extract final values for the selected metric
    sorted_data.forEach((item: any) => {
      if (!item.results) return;
      
      const yearly_results = item.results.yearly_results;
      if (!yearly_results || !yearly_results.length) return;
      
      const lastYearData = yearly_results[yearly_results.length - 1];
      const value = selected_metric === 'successProbability' 
        ? lastYearData.success_probability 
        : lastYearData.total_investment.median;
      
      data_points.push({
        x: Number(item.param),
        y: value,
      });
    });

    return {
      labels: data_points.map(p => p.x.toString()),
      datasets: [
        {
          label: metric_label,
          data: data_points,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          pointRadius: 2,
          pointHoverRadius: 4,
          pointBackgroundColor: 'rgba(53, 162, 235, 1)',
          borderDash: [],
          clip: false as const,
        },
      ],
    };
  };

  const parameter_vs_metric_data = prepare_parameter_vs_metric_data();

  const chart_options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',  //use category scale for years
        title: {
          display: true,
          text: 'Year',
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        max: selected_metric === 'successProbability' ? 1 : undefined,
        title: {
          display: true,
          text: selected_metric === 'successProbability' ? 'Success Probability (%)' : 'Total Investment ($)',
          font: {
            weight: 'bold' as const
          }
        },
        ticks: {
          callback: function(value) {
            if (selected_metric === 'successProbability') {
              return (Number(value) * 100).toFixed(0) + '%';
            }
            return '$' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (selected_metric === 'successProbability') {
              label += (context.parsed.y * 100).toFixed(1) + '%';
            } else {
              label += '$' + context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    layout: {
      //add a few extra pixels around the edges for better visibility
      padding: { top: 8, bottom: 8, left: 0, right: 0 }
    }
  };

  const parameter_chart_options: ChartOptions<'line'> = {
    ...chart_options,
    scales: {
      x: {
        type: 'linear',  // Always use linear scale for numeric parameters
        title: {
          display: true,
          text: `${formatParameterName(results.parameterType)} Value`,
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        beginAtZero: true,
        max: selected_metric === 'successProbability' ? 1 : undefined,
        title: {
          display: true,
          text: selected_metric === 'successProbability' ? 'Success Probability (%)' : 'Total Investment ($)',
          font: {
            weight: 'bold' as const
          }
        },
        ticks: {
          callback: function(value) {
            if (selected_metric === 'successProbability') {
              return (Number(value) * 100).toFixed(0) + '%';
            }
            return '$' + value.toLocaleString();
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
      <HStack mb={3} justify="space-between" align="center">
        <Heading size="md">
          1D Visualization
        </Heading>
        <Heading size="sm" color="gray.600">
          Parameter: {formatParameterName(results.parameterType)}
        </Heading>
        <HStack>
          <Badge colorScheme="blue">{total_runs} Runs</Badge>
          {successful_runs > 0 && <Badge colorScheme="green">{successful_runs} Successful</Badge>}
        </HStack>
      </HStack>
      
      <FormControl mb={4}>
        <FormLabel>
          <HStack spacing={1}>
            <Text>Select Metric</Text>
            <Tooltip label="Choose measurement to display">
              <span><Icon as={InfoIcon} color="gray.500" w={3} h={3} /></span>
            </Tooltip>
          </HStack>
        </FormLabel>
        <Select 
          value={selected_metric} 
          onChange={(e) => set_selected_metric(e.target.value as MetricType)}
        >
          <option value="successProbability">Success Probability</option>
          <option value="medianTotalInvestments">Median Total Investments</option>
        </Select>
      </FormControl>

      <Tabs variant="enclosed" colorScheme="blue" mt={4}>
        <TabList>
          <Tab><Text fontWeight="medium">Value Over Time</Text></Tab>
          {is_numeric_parameter && !is_roth_parameter && <Tab><Text fontWeight="medium">Final Value</Text></Tab>}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Heading size="sm" mb={2}>
              {metric_label} Over Time
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Shows changes over time for each value
            </Text>
            
            <Box h="400px">
              {chartData ? (
                <Line data={chartData} options={chart_options} />
              ) : (
                <Flex h="100%" align="center" justify="center">
                  <Text color="gray.500">
                    No time series data available
                  </Text>
                </Flex>
              )}
            </Box>
          </TabPanel>

          {is_numeric_parameter && !is_roth_parameter && (
            <TabPanel>
              <Heading size="sm" mb={2}>
                Final {metric_label} by Parameter Value
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Shows final outcomes for different parameter values
              </Text>
              
              <Box h="400px">
                {parameter_vs_metric_data ? (
                  <Line data={parameter_vs_metric_data} options={parameter_chart_options} />
                ) : (
                  <Flex h="100%" align="center" justify="center">
                    <Text color="gray.500">
                      No parameter data available
                    </Text>
                  </Flex>
                )}
              </Box>
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default ParameterSweepCharts; 