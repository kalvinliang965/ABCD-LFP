import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Select,
  Badge,
  HStack,
  Tooltip,
  VStack,
  Flex,
  Stack,
  useToken,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import Plot from 'react-plotly.js';

//define the metric types
type MetricType = 'successProbability' | 'medianTotalInvestments';

interface ParameterSweepResults2DProps {
  results: any;
}

const formatParameterName = (paramType: string): string => {
  switch (paramType) {
    case 'rothOptimizer':
      return 'Roth Optimizer';
    case 'startYear':
      return 'Start Year';
    case 'duration':
      return 'Duration';
    case 'initialAmount':
      return 'Initial Amount';
    case 'investmentPercentage':
      return 'Investment %';
    default:
      return paramType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
};

const ParameterSweepResults2D: React.FC<ParameterSweepResults2DProps> = ({ results }) => {
  const [selected_metric, set_selected_metric] = useState<MetricType>('successProbability');
  const [tabIndex, setTabIndex] = useState(0);
  
  const [bg, mid, dark] = useToken('colors', [
    'red.100',     // light background
    selected_metric === 'successProbability' ? 'purple.400' : 'blue.400',  // mid-tone accent
    selected_metric === 'successProbability' ? 'purple.700' : 'blue.700',  // dark accent
  ]);
  
  //build a Plotly colorscale array with normalized stops
  const brandScale: Array<[number, string]> = [
    [0.0, bg],
    [0.5, mid],
    [1.0, dark]
  ];

  if (!results || !results.data || Object.keys(results.data).length === 0) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg">
        <Text>No results available for 2D visualization.</Text>
      </Box>
    );
  }

  const parameter1_type = results.parameter1Type;
  const parameter2_type = results.parameter2Type;
  
  const metric_label = selected_metric === 'successProbability' 
    ? 'Success Probability' 
    : 'Median Total Investments';

  const successful_runs = Object.values(results.data).filter((item: any) => !item.error).length;
  const total_runs = Object.keys(results.data).length;
  
  //estimate simulations per combination by checking run_count in the first available result
  let simulations_per_combination = 0;
  for (const item of Object.values(results.data) as any[]) {
    if (item.results && item.results.run_count) {
      simulations_per_combination = item.results.run_count;
      break;
    }
  }
  
  //calculate total simulations
  const total_simulations = total_runs * simulations_per_combination;

  const prepare_plot_data = () => {
    if (!results || !results.data) {
      return { x: [], y: [], z: [] };
    }

    const param1_values = Array.from(new Set(Object.keys(results.data).map(key => {
      const [param1] = key.split(',');
      return Number(param1);
    }))).sort((a, b) => a - b);

    const param2_values = Array.from(new Set(Object.keys(results.data).map(key => {
      const [, param2] = key.split(',');
      return Number(param2);
    }))).sort((a, b) => a - b);

    if (param1_values.length === 0 || param2_values.length === 0) {
      return { x: [], y: [], z: [] };
    }

    const z_values: number[][] = [];
    
    //initialize the 2D array with empty arrays
    for (let i = 0; i < param1_values.length; i++) {
      const row: number[] = [];
      for (let j = 0; j < param2_values.length; j++) {
        row.push(0);
      }
      z_values.push(row);
    }

    //fill the 2D array with data
    Object.entries(results.data).forEach(([key, value]: [string, any]) => {
      const [param1_str, param2_str] = key.split(',');
      const param1 = Number(param1_str);
      const param2 = Number(param2_str);
      
      if (value.error || !value.results) {
        return; //skip errors
      }
      
      //find indices for this data point
      const x_index = param1_values.indexOf(param1);
      const y_index = param2_values.indexOf(param2);
      
      if (x_index === -1 || y_index === -1) {
        return; //skip if not found
      }
      
      //extract the value based on selected metric
      let metric_value = 0;
      
      if (selected_metric === 'successProbability') {
        //get the last year's success probability from yearly_results
        const yearly_results = value.results.yearly_results;
        if (yearly_results && yearly_results.length > 0) {
          const lastYearData = yearly_results[yearly_results.length - 1];
          metric_value = lastYearData.success_probability;
        }
      } else if (selected_metric === 'medianTotalInvestments') {
        //get the last year's median total investment
        const yearly_results = value.results.yearly_results;
        if (yearly_results && yearly_results.length > 0) {
          const lastYearData = yearly_results[yearly_results.length - 1];
          metric_value = lastYearData.total_investment.median;
        }
      }
      
      //update the data in our 2D array
      z_values[x_index][y_index] = metric_value;
    });

    return {
      x: param1_values,
      y: param2_values,
      z: z_values,
    };
  };

  const plot_data = prepare_plot_data();
  
  //check if we have valid data to render
  const has_valid_plot_data = plot_data.x.length > 0 && 
                            plot_data.y.length > 0 && 
                            plot_data.z.length > 0 &&
                            plot_data.z[0].length > 0;

  //only render plots if we have valid data
  if (!has_valid_plot_data) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg">
        <Text>Insufficient data for 2D visualization. Please ensure both parameters have at least two values each.</Text>
      </Box>
    );
  }

  //AI: Function to determine appropriate tick format based on parameter type
  const getTickFormat = (paramType: string): string => {
    if (paramType === 'startYear' || paramType === 'duration') {
      return 'd'; // Plain integer format for years
    } else if (paramType.includes('Amount') || paramType.includes('Investment')) {
      return '$,~s'; // Currency format for monetary values
    } else {
      return ''; // Default format
    }
  };

  //AI: Tick format for values based on metric
  const tickformat = selected_metric === 'successProbability' ? ',.0%' : '$,~s';
  
  //AI: Common hover label styling
  const hoverlabel = {
    bgcolor: 'rgba(255,255,255,0.9)',
    bordercolor: '#ddd',
    font: { family: 'Inter, sans-serif', size: 12, color: '#000' }
  };

  //AI: Common layout settings
  const commonLayout = {
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
    font: { family: 'Inter, sans-serif', color: '#333', size: 12 },
    margin: { l: 60, r: 40, t: 60, b: 60 },
  };

  //create the surface plot data
  const surface_plot_data = {
    data: [
      {
        type: 'surface',
        x: plot_data.y, 
        y: plot_data.x, 
        z: plot_data.z,
        colorscale: brandScale,
        hoverlabel,
        colorbar: {
          title: metric_label,
          titleside: 'right',
          titlefont: {
            size: 14,
          },
          tickformat,
          outlinewidth: 0,
        },
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: dark,
            project: { z: true }
          }
        },
        hovertemplate: 
          `${formatParameterName(parameter1_type)}: %{y}<br>` +
          `${formatParameterName(parameter2_type)}: %{x}<br>` +
          `${metric_label}: ${selected_metric === 'successProbability' ? '%{z:.1%}' : '$%{z:,.0f}'}<br>` +
          `<extra></extra>`,
      }
    ],
    layout: {
      ...commonLayout,
      title: `Surface Plot: ${metric_label} by ${formatParameterName(parameter1_type)} and ${formatParameterName(parameter2_type)}`,
      autosize: true,
      height: 500,
      scene: {
        xaxis: {
          title: formatParameterName(parameter2_type),
          titlefont: { size: 12 },
          tickformat: getTickFormat(parameter2_type),
          showgrid: false,
        },
        yaxis: {
          title: formatParameterName(parameter1_type),
          titlefont: { size: 12 },
          tickformat: getTickFormat(parameter1_type),
          showgrid: false,
        },
        zaxis: {
          title: metric_label,
          titlefont: { size: 12 },
          tickformat,
        },
        aspectratio: { x: 1, y: 1, z: 0.5 },
        camera: { eye: { x: 1.3, y: 1.3, z: 0.8 } }
      },
    },
    config: {
      responsive: true,
      displayModeBar: false,
    }
  };

  //create the contour plot data
  const contour_plot_data = {
    data: [
      {
        type: 'contour',
        z: plot_data.z,
        x: plot_data.y,
        y: plot_data.x, 
        colorscale: brandScale,
        hoverlabel,
        colorbar: {
          title: metric_label,
          titleside: 'right',
          titlefont: {
            size: 14,
          },
          tickformat,
          outlinewidth: 0,
        },
        contours: {
          coloring: 'heatmap',
          showlabels: true,
          labelfont: {
            size: 11,
            color: '#111',
          },
          line: { 
            width: 1.3, 
            color: dark 
          }
        },
        hovertemplate: 
          `${formatParameterName(parameter1_type)}: %{y}<br>` +
          `${formatParameterName(parameter2_type)}: %{x}<br>` +
          `${metric_label}: ${selected_metric === 'successProbability' ? '%{z:.1%}' : '$%{z:,.0f}'}<br>` +
          `<extra></extra>`,
      }
    ],
    layout: {
      ...commonLayout,
      title: `Contour Plot: ${metric_label} by ${formatParameterName(parameter1_type)} and ${formatParameterName(parameter2_type)}`,
      autosize: true,
      height: 500,
      xaxis: {
        title: formatParameterName(parameter2_type),
        titlefont: { size: 12 },
        tickformat: getTickFormat(parameter2_type),
        showgrid: false,
      },
      yaxis: {
        title: formatParameterName(parameter1_type),
        titlefont: { size: 12 },
        tickformat: getTickFormat(parameter1_type),
        autorange: 'reversed' as const,
        showgrid: false,
      },
    },
    config: {
      responsive: true,
      displayModeBar: false,
    }
  };

  const handle_metric_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    set_selected_metric(e.target.value as MetricType);
  };

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <HStack spacing={2} justify="space-between">
          <Heading size="md">2D Parameter Sweep Results</Heading>
          
          <Stack direction={["column", "row"]} spacing={2} align="flex-end">
            <Tooltip 
              label={`${successful_runs} of ${total_runs} parameter combinations completed successfully`}
              placement="top"
            >
              <Badge colorScheme={successful_runs === total_runs ? "green" : "yellow"} fontSize="sm">
                {successful_runs}/{total_runs} parameter combinations
              </Badge>
            </Tooltip>
            
            {simulations_per_combination > 0 && (
              <Tooltip 
                label={`${simulations_per_combination} simulations run for each parameter combination`}
                placement="top"
              >
                <Badge colorScheme="blue" fontSize="sm">
                  Total simulations: {total_simulations.toLocaleString()}
                </Badge>
              </Tooltip>
            )}
          </Stack>
        </HStack>
        
        <Box>
          <FormControl id="metric-select" mb={4}>
            <FormLabel>Metric to Visualize</FormLabel>
            <Select value={selected_metric} onChange={handle_metric_change}>
              <option value="successProbability">Success Probability</option>
              <option value="medianTotalInvestments">Median Total Investments</option>
            </Select>
          </FormControl>
          
          <Tabs 
            colorScheme="blue" 
            variant="enclosed" 
            onChange={index => setTabIndex(index)} 
            index={tabIndex}
          >
            <TabList>
              <Tab>Surface Plot (3D)</Tab>
              <Tab>Contour Plot (2D)</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack>
                  <Box width="100%" height="500px">
                    {tabIndex === 0 && (
                      <Plot
                        data={surface_plot_data.data}
                        layout={{
                          ...surface_plot_data.layout,
                          scene: {
                            ...surface_plot_data.layout.scene,
                            xaxis: {
                              ...surface_plot_data.layout.scene.xaxis,
                              title: {
                                text: formatParameterName(parameter2_type),
                                font: { size: 14 }
                              }
                            },
                            yaxis: {
                              ...surface_plot_data.layout.scene.yaxis,
                              title: {
                                text: formatParameterName(parameter1_type),
                                font: { size: 14 }
                              }
                            },
                            zaxis: {
                              ...surface_plot_data.layout.scene.zaxis,
                              title: {
                                text: metric_label,
                                font: { size: 14 }
                              }
                            }
                          }
                        }}
                        config={{
                          ...surface_plot_data.config,
                          toImageButtonOptions: {
                            format: 'png',
                            filename: `surface_plot_${parameter1_type}_${parameter2_type}`,
                            width: 1200,
                            height: 800,
                          }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        useResizeHandler={true}
                      />
                    )}
                  </Box>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    <InfoIcon mr={1} />
                    Tip: Click and drag to rotate the 3D view. Double-click to reset. Axes show {formatParameterName(parameter1_type)}, {formatParameterName(parameter2_type)}, and {metric_label}.
                  </Text>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack>
                  <Box width="100%" height="500px">
                    {tabIndex === 1 && (
                      <Plot
                        data={contour_plot_data.data}
                        layout={{
                          ...contour_plot_data.layout,
                          xaxis: {
                            ...contour_plot_data.layout.xaxis,
                            title: {
                              text: formatParameterName(parameter2_type),
                              font: { size: 14 }
                            }
                          },
                          yaxis: {
                            ...contour_plot_data.layout.yaxis,
                            title: {
                              text: formatParameterName(parameter1_type),
                              font: { size: 14 }
                            },
                            autorange: 'reversed' as const,
                          }
                        }}
                        config={{
                          ...contour_plot_data.config,
                          toImageButtonOptions: {
                            format: 'png',
                            filename: `contour_plot_${parameter1_type}_${parameter2_type}`,
                            width: 1200,
                            height: 800,
                          }
                        }}
                        style={{ width: '100%', height: '100%' }}
                        useResizeHandler={true}
                      />
                    )}
                  </Box>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    <InfoIcon mr={1} />
                    Contour lines represent equal values of {metric_label.toLowerCase()}. Horizontal axis: {formatParameterName(parameter2_type)}, Vertical axis: {formatParameterName(parameter1_type)}.
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
        
        <Box>
          <Text fontSize="sm">
            This visualization shows how {metric_label.toLowerCase()} changes when varying both {parameter1_type} and {parameter2_type} parameters.
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default ParameterSweepResults2D; 