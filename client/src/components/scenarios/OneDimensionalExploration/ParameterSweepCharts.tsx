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

type MetricType = 'successProbability' | 'medianTotalInvestments' | 'averageTotalInvestments';

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
    : selected_metric === 'medianTotalInvestments'
    ? 'Median Total Investments'
    : 'Average Total Investments';
  
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
    if (!results.data[0]?.results) {
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
      if (!item.results) return;
      
      const data_points: { x: number; y: number }[] = [];
      
      if (selected_metric === 'successProbability') {
        // For success probability, use the probability map directly
        const probMap = item.results.probabilityOfSuccess;
        if (probMap) {
          // Extract years and values
          Object.entries(probMap).forEach(([yearStr, probValue]) => {
            const year = parseInt(yearStr);
            all_years.add(year);
            // Convert percentage (0-100) to decimal (0-1)
            data_points.push({
              x: year,
              y: (probValue as number) / 100
            });
          });
        }
      } else {
        // For investment metrics, use yearlyData
        const yearlyData = item.results.yearlyData;
        if (yearlyData && yearlyData.length) {
          yearlyData.forEach((snapshot: any) => {
            // Make sure the year is available
            if (snapshot.year) {
              all_years.add(snapshot.year);
              // Use the sum of all investment types instead of looking for a non-existent totalInvestments field
              const totalValue = 
                snapshot.total_after_tax + 
                snapshot.total_pre_tax + 
                snapshot.total_non_retirement;
              
              data_points.push({
                x: snapshot.year,
                y: totalValue
              });
            }
          });
        }
      }

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

    // Debug log to inspect the structure
    console.log("Parameter sweep data structure:", sorted_data[0]?.results);

    //extract final values for the selected metric
    sorted_data.forEach((item: any) => {
      if (!item.results) return;
      
      let value = 0;
      
      if (selected_metric === 'successProbability') {
        if (item.results.probabilityOfSuccess) {
          // pull the very last year's value instead of the always-zero top-level field
          const probMap = item.results.probabilityOfSuccess;
          const years = Object.keys(probMap).map(Number).sort((a,b) => a - b);
          const lastYear = years[years.length - 1];
          value = (probMap[lastYear] || 0) / 100;
          console.log(`Parameter ${item.param}: Last year=${lastYear}, Probability=${value*100}%`);
        }
      } else if (selected_metric === 'medianTotalInvestments' || selected_metric === 'averageTotalInvestments') {
        const snaps = item.results.yearlyData;
        if (snaps && snaps.length) {
          // grab the total investment value at the last snapshot
          const lastSnap = snaps[snaps.length - 1];
          // Use the sum of all investment types
          value = lastSnap.total_after_tax + 
                  lastSnap.total_pre_tax + 
                  lastSnap.total_non_retirement;
          
          console.log(`Parameter ${item.param}: Last snapshot total investment values: 
            after_tax=${lastSnap.total_after_tax}, 
            pre_tax=${lastSnap.total_pre_tax}, 
            non_retirement=${lastSnap.total_non_retirement}, 
            Total=${value}`);
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
        type: 'linear',  // Use linear scale for numeric year values
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
        type: 'linear',  // Use linear scale for numeric parameter values
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
          <option value="averageTotalInvestments">Average Total Investments</option>
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