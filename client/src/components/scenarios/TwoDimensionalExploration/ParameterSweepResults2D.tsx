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
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import Plot from 'react-plotly.js';

//define the metric types
type MetricType = 'successProbability' | 'medianTotalInvestments' | 'averageTotalInvestments';

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
    : selected_metric === 'medianTotalInvestments'
    ? 'Median Total Investments'
    : 'Average Total Investments';

  const successful_runs = Object.values(results.data).filter((item: any) => !item.error).length;
  const total_runs = Object.keys(results.data).length;

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
        if (value.results.probabilityOfSuccess) {
          //pull the very last year's value
          const prob_map = value.results.probabilityOfSuccess;
          const years = Object.keys(prob_map).map(Number).sort((a, b) => a - b);
          const last_year = years[years.length - 1];
          metric_value = (prob_map[last_year] || 0) / 100;
        }
      } else if (selected_metric === 'medianTotalInvestments' || selected_metric === 'averageTotalInvestments') {
        const snaps = value.results.yearlyData;
        if (snaps && snaps.length) {
          //get total investment value at the last snapshot
          const last_snap = snaps[snaps.length - 1];
          //use the sum of all investment types
          metric_value = last_snap.total_after_tax + 
                  last_snap.total_pre_tax + 
                  last_snap.total_non_retirement;
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

  //create the surface plot data
  const surface_plot_data = {
    data: [
      {
        type: 'surface',
        x: plot_data.y, 
        y: plot_data.x, 
        z: plot_data.z,
        colorscale: selected_metric === 'successProbability' ? 'Greens' : 'Blues',
        colorbar: {
          title: metric_label,
          titleside: 'right',
          titlefont: {
            size: 14,
          },
          tickformat: selected_metric === 'successProbability' ? ',.0%' : '$,.0f',
        },
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: "#42f462",
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
      title: `Surface Plot: ${metric_label} by ${formatParameterName(parameter1_type)} and ${formatParameterName(parameter2_type)}`,
      autosize: true,
      height: 500,
      scene: {
        xaxis: {
          title: formatParameterName(parameter2_type),
          titlefont: { size: 12 },
        },
        yaxis: {
          title: formatParameterName(parameter1_type),
          titlefont: { size: 12 },
        },
        zaxis: {
          title: metric_label,
          titlefont: { size: 12 },
          tickformat: selected_metric === 'successProbability' ? ',.0%' : '$,.0f',
        },
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1 }
        }
      },
      margin: {
        l: 65,
        r: 50,
        b: 65,
        t: 90,
      }
    },
    config: {
      responsive: true,
      displayModeBar: true,
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
        colorscale: selected_metric === 'successProbability' ? 'Greens' : 'Blues',
        colorbar: {
          title: metric_label,
          titleside: 'right',
          titlefont: {
            size: 14,
          },
          tickformat: selected_metric === 'successProbability' ? ',.0%' : '$,.0f',
        },
        contours: {
          coloring: 'heatmap',
          showlabels: true,
          labelfont: {
            size: 10,
            color: 'white',
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
      title: `Contour Plot: ${metric_label} by ${formatParameterName(parameter1_type)} and ${formatParameterName(parameter2_type)}`,
      autosize: true,
      height: 500,
      xaxis: {
        title: formatParameterName(parameter2_type),
        titlefont: { size: 12 },
      },
      yaxis: {
        title: formatParameterName(parameter1_type),
        titlefont: { size: 12 },
      },
      margin: {
        l: 65,
        r: 50,
        b: 65,
        t: 90,
      }
    },
    config: {
      responsive: true,
      displayModeBar: true,
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
          
          <HStack>
            <Tooltip 
              label={`${successful_runs} of ${total_runs} parameter combinations completed successfully`}
              placement="top"
            >
              <Badge colorScheme={successful_runs === total_runs ? "green" : "yellow"} fontSize="sm">
                {successful_runs}/{total_runs} completed
              </Badge>
            </Tooltip>
          </HStack>
        </HStack>
        
        <Box>
          <FormControl id="metric-select" mb={4}>
            <FormLabel>Metric to Visualize</FormLabel>
            <Select value={selected_metric} onChange={handle_metric_change}>
              <option value="successProbability">Success Probability</option>
              <option value="medianTotalInvestments">Median Total Investments</option>
            </Select>
          </FormControl>
          
          <Tabs colorScheme="blue" variant="enclosed">
            <TabList>
              <Tab>Surface Plot (3D)</Tab>
              <Tab>Contour Plot (2D)</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack>
                  <Box width="100%" height="500px">
                    <Plot
                      data={surface_plot_data.data}
                      layout={surface_plot_data.layout}
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
                      onInitialized={(figure) => {
                        if (figure && figure.plot) {
                          const canvas = figure.plot.querySelector('canvas');
                          if (canvas) {
                            canvas.setAttribute('willReadFrequently', 'true');
                          }
                        }
                      }}
                      onUpdate={(figure) => {
                        if (figure && figure.plot) {
                          const canvas = figure.plot.querySelector('canvas');
                          if (canvas) {
                            canvas.setAttribute('willReadFrequently', 'true');
                          }
                        }
                      }}
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    <InfoIcon mr={1} />
                    Tip: Click and drag to rotate the 3D view. Double-click to reset.
                  </Text>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack>
                  <Box width="100%" height="500px">
                    <Plot
                      data={contour_plot_data.data}
                      layout={contour_plot_data.layout}
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
                      onInitialized={(figure) => {
                        if (figure && figure.plot) {
                          const canvas = figure.plot.querySelector('canvas');
                          if (canvas) {
                            canvas.setAttribute('willReadFrequently', 'true');
                          }
                        }
                      }}
                      onUpdate={(figure) => {
                        if (figure && figure.plot) {
                          const canvas = figure.plot.querySelector('canvas');
                          if (canvas) {
                            canvas.setAttribute('willReadFrequently', 'true');
                          }
                        }
                      }}
                    />
                  </Box>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    <InfoIcon mr={1} />
                    Contour lines represent equal values of {metric_label.toLowerCase()}.
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