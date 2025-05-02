import React, { useState } from 'react';
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

interface ParameterSweepChartsProps {
  results: any;
}

type MetricType = 'successProbability' | 'medianTotalInvestments';

const ParameterSweepCharts: React.FC<ParameterSweepChartsProps> = ({ results }) => {
  const [selected_metric, set_selected_metric] = useState<MetricType>('successProbability');

  if (!results || !Array.isArray(results.data) || results.data.length === 0) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text>No data available for charts.</Text>
      </Box>
    );
  }

  const is_numeric_parameter = !isNaN(Number(results.data[0].param));
  const metric_label = selected_metric === 'successProbability' 
    ? 'Success Probability' 
    : 'Median Total Investments';
  
  //count successful simulations
  const successful_runs = results.data.filter((item: any) => !item.error).length;
  const total_runs = results.data.length;

  //generate different colors for each parameter value
  const generate_colors = (count: number) => {
    const colors = [];
    const hue_step = 360 / count;
    for (let i = 0; i < count; i++) {
      const hue = i * hue_step;
      colors.push(`hsla(${hue}, 70%, 50%, 1)`);
    }
    return colors;
  };

  //5.1 Multi-line chart, value over time
  const prepare_time_series_data = () => {
    //check if we have yearly data
    if (!results.data[0]?.results?.yearlyData) {
      return null;
    }

    const colors = generate_colors(results.data.length);
    const datasets: Array<{
      label: string;
      data: Array<{ x: number; y: number }>;
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }> = [];
    const all_years = new Set<number>();

    //prepare datasets
    results.data.forEach((item: any, index: number) => {
      if (!item.results?.yearlyData) return;

      const yearly_data = item.results.yearlyData;
      const data_points: { x: number; y: number }[] = [];

      //extract metric from yearly results
      yearly_data.forEach((yearly: any) => {
        const year = yearly.year;
        all_years.add(year);
        let value = 0;
        
        if (selected_metric === 'successProbability') {
          //using the probability of success map
          value = (item.results.probabilityOfSuccess[year] || 0) / 100;
        } else if (selected_metric === 'medianTotalInvestments') {
          //get median total investments from stats
          value = yearly.stats?.totalInvestments?.median || 0;
        }
        
        data_points.push({
          x: year,
          y: value,
        });
      });

      //sort data points by year
      data_points.sort((a, b) => a.x - b.x);

      datasets.push({
        label: `${results.parameterType}: ${item.param}`,
        data: data_points,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('1)', '0.1)'),
        tension: 0.2,
      });
    });

    //prepare labels (years)
    const years = Array.from(all_years).sort((a, b) => a - b);

    return {
      labels: years,
      datasets,
    };
  };

  //5.2 Line chart->parameter vs. final value
  const prepare_parameter_vs_metric_data = () => {
    if (!is_numeric_parameter) {
      return null;
    }

    const data_points: { x: number; y: number }[] = [];

    //sort data by parameter value
    const sorted_data = [...results.data].sort((a, b) => 
      Number(a.param) - Number(b.param)
    );

    //extract final values for the selected metric
    sorted_data.forEach((item: any) => {
      if (!item.results) return;
      
      let value = 0;
      
      if (selected_metric === 'successProbability') {
        value = item.results.successProbability || 0;
      } else if (selected_metric === 'medianTotalInvestments') {
        //get the final year's median total investments
        const yearly_data = item.results.yearlyData;
        if (yearly_data && yearly_data.length > 0) {
          const last_year = yearly_data[yearly_data.length - 1];
          value = last_year.stats?.totalInvestments?.median || 0;
        }
      }
      
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
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  const time_series_data = prepare_time_series_data();
  const parameter_vs_metric_data = prepare_parameter_vs_metric_data();

  const chart_options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
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
        title: {
          display: true,
          text: metric_label,
          font: {
            weight: 'bold' as const
          }
        },
        min: selected_metric === 'successProbability' ? 0 : undefined,
        max: selected_metric === 'successProbability' ? 1 : undefined,
        ticks: {
          callback: function(value) {
            if (selected_metric === 'successProbability') {
              return (Number(value) * 100).toFixed(0) + '%';
            }
            return value.toLocaleString();
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
              label += context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
  };

  const parameter_chart_options: ChartOptions<'line'> = {
    ...chart_options,
    scales: {
      x: {
        title: {
          display: true,
          text: `${results.parameterType} Value`,
          font: {
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: chart_options.scales?.y ? { ...chart_options.scales.y } : {}
    },
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
      <HStack mb={3} justify="space-between" align="center">
        <Heading size="md">
          1D Visualization
        </Heading>
        <Heading size="sm" color="gray.600">
          Parameter: {results.parameterType}
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
          <Tab><Text fontWeight="medium">Time</Text></Tab>
          {is_numeric_parameter && <Tab><Text fontWeight="medium">Value</Text></Tab>}
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
              {time_series_data ? (
                <Line data={time_series_data} options={chart_options} />
              ) : (
                <Flex h="100%" align="center" justify="center">
                  <Text color="gray.500">
                    No time series data available
                  </Text>
                </Flex>
              )}
            </Box>
          </TabPanel>

          {is_numeric_parameter && (
            <TabPanel>
              <Heading size="sm" mb={2}>
                Final {metric_label} by Value
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Shows final outcomes for different values
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