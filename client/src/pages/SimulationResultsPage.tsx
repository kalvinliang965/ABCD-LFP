import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  CheckboxGroup,
  VStack,
  Code,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { simulation_service } from '../services/simulationService';

import ProbabilityOfSuccessChart from '../components/charts/ProbabilityOfSuccessChart';
import ShadedLineChart from '../components/charts/ShadedLineChart';
import StackedBarChart from '../components/charts/StackedBarChart';

// Define chart types
const CHART_TYPES = [
  { id: 'probabilityOfSuccess', name: 'Probability of Success Over Time' },
  { id: 'probabilityRanges', name: 'Probability Ranges for a Selected Quantity Over Time' },
  {
    id: 'medianOrAverageValues',
    name: 'Median or Average Values of a Selected Quantity Over Time',
  },
];

// Define the data structure for investments, income, and expenses
// interface DataItem {
//   name: string;
//   category: 'investment' | 'income' | 'expense';
//   taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
//   values: number[];
// }

const SimulationResults: React.FC = () => {
  // Get parameters from URL - could be either simulationId or scenarioId
  const { simulationId} = useParams<{ simulationId?: string}>();

 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const scenarioId = '680d7e3057f1cf67b95a5fa8';

  // New state variables for chart selection
  const [showChartSelection, setShowChartSelection] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['probabilityOfSuccess']);

  // New state variables for the stacked bar chart
  const [aggregationType, setAggregationType] = useState<'median' | 'average'>('median');
  const [aggregationThreshold, setAggregationThreshold] = useState<number>(10000);

  // Debugging helper
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  // Fetch simulation results from the database
  useEffect(() => {
    const fetchSimulationResults = async () => {
      console.log('Current URL:', window.location.href);
      console.log('Route params:', { simulationId, scenarioId });
      // Determine which ID to use (prefer scenarioId if available)
      const idToUse = scenarioId || simulationId;
      const idType = scenarioId ? 'scenarioId' : 'simulationId';
      
      if (!idToUse) {
        // Try to get ID from location state
        const stateId = location.state?.scenarioId || location.state?.simulationId;
        if (stateId) {
          console.log(`Using ${idType} from state:`, stateId);
          const path = scenarioId ? `/scenarios/${stateId}/results` : `/simulations/${stateId}`;
          navigate(path, { replace: true });
          return;
        }
        
        setError('No scenario or simulation ID provided');
        return;
      }

      setLoading(true);
      try {
        console.log(`Fetching simulation results for ${idType}:`, idToUse);
        
        let response;
        // Call the appropriate service method based on ID type
        if (scenarioId) {
          // Get results by scenario ID
          response = await simulation_service.get_simulations_by_scenario(idToUse);
          console.log('API response: for scenarioId', response);
        } else {
          // Get results by simulation ID
          response = await simulation_service.get_simulation_results(idToUse);
          console.log('API response: for simulationId', response);
        }
        
        console.log('API response: for all', response);
        setRawResponse(response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load simulation results');
        }
        
        // Handle both single result and array of results
        let result;
        if (scenarioId && Array.isArray(response.data) && response.data.length > 0) {
          // If retrieving by scenarioId, use the most recent result if multiple exist
          result = response.data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          console.log('Using most recent of multiple results:', result);
        } else {
          // Direct result or single result from array
          result = Array.isArray(response.data) ? response.data[0] : response.data;
        }
        
        if (!result) {
          throw new Error('No simulation results found');
        }
        
        // Validate required fields
        if (!result.yearlyData || !Array.isArray(result.yearlyData) || result.yearlyData.length === 0) {
          console.error('Missing or invalid yearlyData array in response:', result);
          throw new Error('Invalid data format: missing yearlyData array');
        }
        
        // Transform the data for charts
        const formattedData = {
          // Probability of success data
          probabilityOfSuccess: {
            years: result.yearlyData.map(yr => yr.year),
            // Calculate probability based on is_goal_met
            probabilities: result.yearlyData.map(yr => yr.is_goal_met ? 100 : 0)
          },
          
          // Chart data for investments, income, and expenses
          medianOrAverageValues: {
            years: result.yearlyData.map(yr => yr.year),
            data: {
              investments: transformYearlyDataToChartFormat(result.yearlyData, 'investments'),
              income: transformYearlyDataToChartFormat(result.yearlyData, 'income_breakdown'),
              expenses: transformYearlyDataToChartFormat(result.yearlyData, 'expense_breakdown', 'expenses')
            }
          },
          
          // Probability ranges data for shaded line chart
          probabilityRanges: {
            totalInvestments: {
              years: result.yearlyData.map(yr => yr.year),
              median: result.yearlyData.map(yr => 
                yr.total_after_tax + yr.total_pre_tax + yr.total_non_retirement
              ),
              ranges: extractRangesFromYearlyData(result.yearlyData, 'totalInvestments')
            },
            
            totalIncome: {
              years: result.yearlyData.map(yr => yr.year),
              median: result.yearlyData.map(yr => yr.cur_year_income),
              ranges: extractRangesFromYearlyData(result.yearlyData, 'totalIncome')
            },
            
            totalExpenses: {
              years: result.yearlyData.map(yr => yr.year),
              median: result.yearlyData.map(yr => yr.total_expenses),
              ranges: extractRangesFromYearlyData(result.yearlyData, 'totalExpenses')
            }
          }
        };
        
        console.log('Formatted data for charts:', formattedData);
        setSimulationData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching simulation results:', err);
        setError(`Failed to load simulation results: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    fetchSimulationResults();
  }, [simulationId, scenarioId, navigate, location]);

  // Handle showing charts
  const handleShowCharts = () => {
    setShowChartSelection(false);
  };

  // Render the chart selection UI
  const renderChartSelectionUI = () => {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        shadow="md"
        bg={useColorModeValue('white', 'gray.700')}
      >
        <Heading as="h2" size="lg" mb={4}>
          Select Charts to Display
        </Heading>
        <Text mb={15} fontSize="lg">
          Choose which charts you'd like to see for your simulation results. You can select multiple
          charts to get a comprehensive view of your financial plan.
        </Text>

        <VStack align="start" spacing={6} mb={8}>
          <Box width="100%">
            <Text fontWeight="bold" fontSize="lg" mb={2}>
              Chart Types
            </Text>
            <CheckboxGroup
              colorScheme="blue"
              value={selectedCharts}
              onChange={values => setSelectedCharts(values as string[])}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {CHART_TYPES.map(chart => (
                  <Checkbox key={chart.id} value={chart.id}>
                    {chart.name}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </Box>
        </VStack>

        <Flex justify="flex-end">
          <Button
            colorScheme="blue"
            onClick={handleShowCharts}
            isDisabled={selectedCharts.length === 0}
          >
            Generate Charts
          </Button>
        </Flex>
      </Box>
    );
  };

  // Render the selected charts
  const renderCharts = () => {
    return (
      <>
        {selectedCharts.includes('probabilityOfSuccess') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>
              Probability of Success Analysis
            </Heading>
            <Text mb={4} fontSize="lg">
              This analysis shows the likelihood of meeting your financial goals over time based on
              the simulation results. A higher probability indicates a greater chance of success.
            </Text>

            <ProbabilityOfSuccessChart
              data={simulationData?.probabilityOfSuccess}
              loading={loading}
            />
          </Box>
        )}

        {selectedCharts.includes('medianOrAverageValues') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>
              Financial Values Over Time
            </Heading>
            <Text mb={4} fontSize="lg">
              This chart shows the {aggregationType} values of investments, income, and expenses
              over time. Use the tabs to switch between different financial categories.
            </Text>

            <StackedBarChart
              years={simulationData?.medianOrAverageValues?.years}
              data={simulationData?.medianOrAverageValues?.data}
              loading={loading}
              aggregationType={aggregationType}
              onAggregationTypeChange={setAggregationType}
              aggregationThreshold={aggregationThreshold}
              onAggregationThresholdChange={setAggregationThreshold}
            />
          </Box>
        )}

        {selectedCharts.includes('probabilityRanges') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>
              Probability Ranges Over Time
            </Heading>
            <Text mb={4} fontSize="lg">
              This chart shows the probability ranges for various financial metrics over time. The
              shaded regions represent different probability ranges from the simulation results.
            </Text>

            <ShadedLineChart
              data={simulationData?.probabilityRanges}
              loading={loading}
            />
          </Box>
        )}

        <Flex justify="space-between" mt={8}>
          <Button variant="outline" onClick={() => setShowChartSelection(true)}>
            Change Chart Selection
          </Button>

          <Button colorScheme="blue" onClick={() => navigate(`/dashboard`)}>
            Back to Dashboard
          </Button>
        </Flex>
      </>
    );
  };

  // Get ID info for display
  const idInfo = scenarioId 
    ? `Scenario ID: ${scenarioId}` 
    : (simulationId ? `Simulation ID: ${simulationId}` : '');

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={2}>
        Simulation Results
      </Heading>
      
      {idInfo && (
        <Text mb={4} color="gray.600" fontSize="sm">
          {idInfo}
        </Text>
      )}

      <Flex justifyContent="flex-end" mb={4}>
        <Button size="sm" colorScheme="gray" onClick={toggleDebug}>
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </Flex>

      {showDebug && rawResponse && (
        <Box mb={6} p={4} bg="gray.50" borderRadius="md" overflow="auto" maxHeight="300px">
          <Heading size="sm" mb={2}>Debug: API Response</Heading>
          <Code display="block" whiteSpace="pre" p={2}>
            {JSON.stringify(rawResponse, null, 2)}
          </Code>
        </Box>
      )}

      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading ? (
        <Flex justify="center" align="center" height="400px">
          <Spinner size="xl" />
          <Text ml={4}>Loading simulation results...</Text>
        </Flex>
      ) : (
        <>{showChartSelection ? renderChartSelectionUI() : renderCharts()}</>
      )}
    </Container>
  );
};

export default SimulationResults;

/**
 * Helper function to transform yearly data to the chart format
 */
function transformYearlyDataToChartFormat(
  yearlyData: Array<any>, 
  property: string,
  nestedProperty?: string
): Array<{
  name: string;
  category: 'investment' | 'income' | 'expense';
  taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
  values: number[];
}> {
  // Get all unique keys across all years
  const allKeys = new Set<string>();
  yearlyData.forEach((yr: any) => {
    const record = nestedProperty ? yr[property][nestedProperty] : yr[property];
    Object.keys(record || {}).forEach(key => allKeys.add(key));
  });
  
  // Determine category based on property
  let category: 'investment' | 'income' | 'expense';
  if (property === 'investments') category = 'investment';
  else if (property === 'income_breakdown') category = 'income';
  else category = 'expense';
  
  // Convert to array format for charts
  return Array.from(allKeys).map(key => {
    // For investments, determine tax status based on key name
    let taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax' | undefined;
    if (category === 'investment') {
      if (key.includes('pre-tax')) taxStatus = 'pre-tax';
      else if (key.includes('after-tax')) taxStatus = 'after-tax';
      else taxStatus = 'non-retirement';
    }
    
    return {
      name: key,
      category,
      taxStatus,
      values: yearlyData.map((yr: any) => {
        const record = nestedProperty ? yr[property][nestedProperty] : yr[property];
        return record ? record[key] || 0 : 0;
      })
    };
  });
}

/**
 * Helper function to extract ranges from yearly data
 */
function extractRangesFromYearlyData(
  yearlyData: Array<any>,
  statType: 'totalInvestments' | 'totalIncome' | 'totalExpenses'
): {
  range10_90: number[][];
  range20_80: number[][];
  range30_70: number[][];
  range40_60: number[][];
} {
  // Initialize empty range arrays
  const ranges = {
    range10_90: [[] as number[], [] as number[]],
    range20_80: [[] as number[], [] as number[]],
    range30_70: [[] as number[], [] as number[]],
    range40_60: [[] as number[], [] as number[]]
  };
  
  // Check if stats exist in yearly data
  const hasStats = yearlyData.some((yr: any) => yr.stats && yr.stats[statType]);
  
  if (hasStats) {
    // Extract ranges from each year's stats
    yearlyData.forEach((yr: any) => {
      if (yr.stats && yr.stats[statType]) {
        const statRanges = yr.stats[statType].ranges;
        
        // Extract low and high values for each range
        for (const rangeKey of Object.keys(ranges) as Array<keyof typeof ranges>) {
          if (statRanges[rangeKey]) {
            ranges[rangeKey][0].push(statRanges[rangeKey][0]);
            ranges[rangeKey][1].push(statRanges[rangeKey][1]);
          } else {
            // Default to 0 if range is missing
            ranges[rangeKey][0].push(0);
            ranges[rangeKey][1].push(0);
          }
        }
      } else {
        // No stats for this year, use 0 values
        for (const rangeKey of Object.keys(ranges) as Array<keyof typeof ranges>) {
          ranges[rangeKey][0].push(0);
          ranges[rangeKey][1].push(0);
        }
      }
    });
  } else {
    // No stats at all, create default ranges
    const length = yearlyData.length;
    for (const rangeKey of Object.keys(ranges) as Array<keyof typeof ranges>) {
      ranges[rangeKey][0] = Array(length).fill(0);
      ranges[rangeKey][1] = Array(length).fill(0);
    }
  }
  
  return ranges;
}
