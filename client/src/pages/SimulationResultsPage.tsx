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

// Define the new schema interface
interface SimulationResult_v1 {
  scenarioId: string;
  seed: string;
  runCount: number;
  yearlyResults: Array<{
    year: number;
    success_probability: number;
    all_income_event: Array<{ name: string; mean: number; median: number }>;
    all_expense_event: Array<{ name: string; mean: number; median: number }>;
    all_investment: Array<{ name: string; mean: number; median: number }>;
    total_investment: { median: number; ranges: { [key: string]: [number, number] } };
    total_income: { median: number; ranges: { [key: string]: [number, number] } };
    total_expense: { median: number; ranges: { [key: string]: [number, number] } };
    total_early_withdrawal_tax: { median: number; ranges: { [key: string]: [number, number] } };
    total_discretionary_expenses_pct: { median: number; ranges: { [key: string]: [number, number] } };
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const SimulationResults: React.FC = () => {
  // Get parameters from URL - could be either simulationId or scenarioId
  const { simulationId} = useParams<{ simulationId?: string}>();
  const navigate = useNavigate();
  const location = useLocation();
  const scenarioId = location.state?.scenarioId || null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // New state variables for chart selection
  const [showChartSelection, setShowChartSelection] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['probabilityOfSuccess']);

  // New state variables for the stacked bar chart
  const [aggregationType, setAggregationType] = useState<'median' | 'average'>('median');
  const [aggregationThreshold, setAggregationThreshold] = useState<number>(0);

  // Debugging helper
  // const toggleDebug = () => {
  //   setShowDebug(!showDebug);
  // };

  // Fetch simulation results from the database
  useEffect(() => {
    const fetchSimulationResults = async () => {
      console.log('Current URL:', window.location.href);
      console.log('Route params:', { simulationId, scenarioId });
      
      // Determine which ID to use (prioritize simulationId if available)
      const idToUse = simulationId || scenarioId;
      const idType = simulationId ? 'simulationId' : 'scenarioId';
      
      if (!idToUse) {
        // Try to get ID from location state
        const stateId = location.state?.simulationId || location.state?.scenarioId;
        if (stateId) {
          console.log(`Using ${idType} from state:`, stateId);
          const path = simulationId ? `/simulations/${stateId}` : `/scenarios/${stateId}/results`;
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
        if (simulationId) {
          // Get results by simulation ID
          response = await simulation_service.get_simulation_results(idToUse);
          console.log('API response: for simulationId', response);
        } else {
          // Get results by scenario ID
          response = await simulation_service.get_simulations_by_scenario(idToUse);
          console.log('API response: for scenarioId', response);
        }
        
        console.log('API response: for all', response);
        setRawResponse(response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load simulation results');
        }
        
        // Handle both single result and array of results
        let result;
        if (!simulationId && scenarioId && Array.isArray(response.data) && response.data.length > 0) {
          // If retrieving by scenarioId, use the most recent result if multiple exist
          // because same scenarioId can have multiple simulation results
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
        
        // Validate required fields for new schema
        const typedResult = result as unknown as SimulationResult_v1;
        if (!typedResult.yearlyResults || !Array.isArray(typedResult.yearlyResults) || typedResult.yearlyResults.length === 0) {
          console.error('Missing or invalid yearlyResults array in response:', typedResult);
          throw new Error('Invalid data format: missing yearlyResults array');
        }

        console.log('yearly results', typedResult.yearlyResults);
        
        // Transform the data for charts based on new SimulationResult_v1 schema
        const formattedData = {
          // Probability of success data
          probabilityOfSuccess: {
            years: typedResult.yearlyResults.map((yr) => yr.year),
            // Get success_probability directly from the new schema (as percentage)
            probabilities: typedResult.yearlyResults.map((yr) => yr.success_probability * 100)
          },
          
          // Chart data for investments, income, and expenses
          medianOrAverageValues: {
            years: typedResult.yearlyResults.map((yr) => yr.year),
            data: {
              median: {
                investments: transformInvestmentEvents(typedResult.yearlyResults, 'median'),
                income: transformIncomeEvents(typedResult.yearlyResults, 'median'),
                expenses: transformExpenseEvents(typedResult.yearlyResults, 'median')
              },
              average: {
                investments: transformInvestmentEvents(typedResult.yearlyResults, 'average'),
                income: transformIncomeEvents(typedResult.yearlyResults, 'average'),
                expenses: transformExpenseEvents(typedResult.yearlyResults, 'average')
              }
            }
          },
          
          // Probability ranges data for shaded line chart
          probabilityRanges: {
            totalInvestments: transformShadedChartData(typedResult.yearlyResults, 'total_investment'),
            totalIncome: transformShadedChartData(typedResult.yearlyResults, 'total_income'),
            totalExpenses: transformShadedChartData(typedResult.yearlyResults, 'total_expense'),
            earlyWithdrawalTax: transformShadedChartData(typedResult.yearlyResults, 'total_early_withdrawal_tax'),
            discretionaryExpensesPct: transformShadedChartData(typedResult.yearlyResults, 'total_discretionary_expenses_pct')
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

          <Button colorScheme="blue" onClick={() => navigate(`/scenarios`)}>
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

      {/* <Flex justifyContent="flex-end" mb={4}>
        <Button size="sm" colorScheme="gray" onClick={toggleDebug}>
          {showDebug ? "Hide Debug" : "Show Debug"}
        </Button>
      </Flex> */}

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
function transformIncomeEvents(
  yearlyResults: Array<any>,
  aggregationType: 'median' | 'average' = 'median'
): Array<{
  name: string;
  category: 'income';
  values: number[];
}> {
  // First, get all unique income event names across all years
  const allEventNames = new Set<string>();
  
  yearlyResults.forEach(yearResult => {
    yearResult.all_income_event.forEach((event: any) => {
      allEventNames.add(event.name);
    });
  });
  
  // Map each income event name to its values across years
  return Array.from(allEventNames).map(eventName => {
    return {
      name: eventName,
      category: 'income',
      values: yearlyResults.map(yearResult => {
        const event = yearResult.all_income_event.find((e: any) => e.name === eventName);
        // Use median or mean based on selected aggregation type
        return event ? (aggregationType === 'median' ? event.median : event.mean) : 0;
      })
    };
  });
}

/**
 * Helper function to transform expense events to chart format based on new schema
 */
function transformExpenseEvents(
  yearlyResults: Array<any>,
  aggregationType: 'median' | 'average' = 'median'
): Array<{
  name: string;
  category: 'expense';
  values: number[];
}> {
  // First, get all unique expense event names across all years
  const allEventNames = new Set<string>();
  
  yearlyResults.forEach(yearResult => {
    yearResult.all_expense_event.forEach((event: any) => {
      allEventNames.add(event.name);
    });
  });
  
  // Map each expense event name to its values across years
  return Array.from(allEventNames).map(eventName => {
    return {
      name: eventName,
      category: 'expense',
      values: yearlyResults.map(yearResult => {
        const event = yearResult.all_expense_event.find((e: any) => e.name === eventName);
        // Use median or mean based on selected aggregation type
        return event ? (aggregationType === 'median' ? event.median : event.mean) : 0;
      })
    };
  });
}

/**
 * Helper function to transform investment events to chart format based on new schema
 */
function transformInvestmentEvents(
  yearlyResults: Array<any>,
  aggregationType: 'median' | 'average' = 'median'
): Array<{
  name: string;
  category: 'investment';
  taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
  values: number[];
}> {
  // First, get all unique investment event names across all years
  const allEventNames = new Set<string>();
  
  yearlyResults.forEach(yearResult => {
    yearResult.all_investment.forEach((event: any) => {
      allEventNames.add(event.name);
    });
  });
  
  // Map each investment event name to its values across years
  return Array.from(allEventNames).map(eventName => {
    // Determine tax status based on name
    let taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax' | undefined;
    if (eventName.includes('pre-tax')) taxStatus = 'pre-tax';
    else if (eventName.includes('after-tax')) taxStatus = 'after-tax';
    else taxStatus = 'non-retirement';
    
    return {
      name: eventName,
      category: 'investment',
      taxStatus,
      values: yearlyResults.map(yearResult => {
        const event = yearResult.all_investment.find((e: any) => e.name === eventName);
        // Use median or mean based on selected aggregation type
        return event ? (aggregationType === 'median' ? event.median : event.mean) : 0;
      })
    };
  });
}

/**
 * Helper function to transform shaded chart data from the new schema
 */
function transformShadedChartData(
  yearlyResults: Array<any>,
  property: 'total_investment' | 'total_income' | 'total_expense' | 'total_early_withdrawal_tax' | 'total_discretionary_expenses_pct'
): {
  years: number[];
  median: number[];
  ranges: {
    range10_90: number[][];
    range20_80: number[][];
    range30_70: number[][];
    range40_60: number[][];
  }
} {
  // Extract years
  const years = yearlyResults.map(yr => yr.year);

  const isPercentage = property === 'total_discretionary_expenses_pct';
  
  // Extract median values
  const median = yearlyResults.map(yr => {
    const val = yr[property]?.median || 0;
    return isPercentage ? val * 100 : val;
  });
  
  // Initialize ranges object
  const ranges = {
    range10_90: [[] as number[], [] as number[]],
    range20_80: [[] as number[], [] as number[]],
    range30_70: [[] as number[], [] as number[]],
    range40_60: [[] as number[], [] as number[]]
  };
  
  // Fill ranges data
  yearlyResults.forEach(yr => {
    const shaded = yr[property];
    if (shaded && shaded.ranges) {
      for (const rangeKey of Object.keys(ranges) as Array<keyof typeof ranges>) {
        const [lower, upper] = shaded.ranges[rangeKey] || [shaded.median, shaded.median];
        ranges[rangeKey][0].push(isPercentage ? lower * 100 : lower);
        ranges[rangeKey][1].push(isPercentage ? upper * 100 : upper);
      }
    } else {
      for (const rangeKey of Object.keys(ranges) as Array<keyof typeof ranges>) {
        ranges[rangeKey][0].push(0);
        ranges[rangeKey][1].push(0);
      }
    }
  });
  
  return {
    years,
    median,
    ranges
  };
}
