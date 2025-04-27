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
  Radio,
  RadioGroup,
  Stack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
interface DataItem {
  name: string;
  category: 'investment' | 'income' | 'expense';
  taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
  values: number[];
}

const SimulationResults: React.FC = () => {
  const { simulationId } = useParams<{ simulationId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const navigate = useNavigate();

  // New state variables for chart selection
  const [showChartSelection, setShowChartSelection] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['probabilityOfSuccess']);

  // New state variables for the stacked bar chart
  const [aggregationType, setAggregationType] = useState<'median' | 'average'>('median');
  const [aggregationThreshold, setAggregationThreshold] = useState<number>(10000);

  // Fetch real simulation results from the database
  useEffect(() => {
    const fetchSimulationResults = async () => {
      if (!simulationId) {
        setError('No simulation ID provided');
        return;
      }

      setLoading(true);
      try {
        // Get simulation results from database using the service
        const response = await simulation_service.get_simulation_results(simulationId);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to load simulation results');
        }
        
        const result = response.data;
        
        // Transform the data for our charts
        const formattedData = {
          // Probability of success data
          probabilityOfSuccess: {
            years: result.years,
            // If no probability array exists, create one based on successProbability
            probabilities: Array(result.years.length).fill(result.successProbability * 100)
          },
          
          // Chart data for investments, income, and expenses
          medianOrAverageValues: {
            years: result.years,
            data: {
              investments: result.investments,
              income: result.income,
              expenses: result.expenses
            }
          },
          
          // Probability ranges data for shaded line chart
          probabilityRanges: {
            totalInvestments: result.totalInvestments ? {
              years: result.years,
              median: result.totalInvestments.median,
              ranges: result.totalInvestments.ranges
            } : undefined,
            
            totalIncome: result.totalIncome ? {
              years: result.years,
              median: result.totalIncome.median,
              ranges: result.totalIncome.ranges
            } : undefined,
            
            totalExpenses: result.totalExpenses ? {
              years: result.years,
              median: result.totalExpenses.median,
              ranges: result.totalExpenses.ranges
            } : undefined
          }
        };
        
        setSimulationData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching simulation results:', err);
        setError('Failed to load simulation results. Please try again later.');
        setLoading(false);
      }
    };

    fetchSimulationResults();
  }, [simulationId]);

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

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>
        Simulation Results
      </Heading>

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
