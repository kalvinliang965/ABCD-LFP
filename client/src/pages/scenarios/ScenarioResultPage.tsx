// AI-generated code
// Prompt: Create a new ScenarioResultPage component as a placeholder for simulation results. This page should use snake_case for the function name, Chakra UI for layout, and display a message that simulation results will appear here. It should extract the scenario name from the URL using useParams.
import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  Code,
  Button,
  HStack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChartLine, FaHistory, FaArrowRight } from 'react-icons/fa';
import { Layout } from '../../layouts';
import { scenario_service } from '../../services/scenarioService';
import { simulation_service } from '../../services/simulationService';
// AI-generated code
// Prompt: Import the OneDimensionalExploration component from its new location
import OneDimensionalExploration from '../../components/scenarios/OneDimensionalExploration/OneDimensionalExploration';
import { ParameterSweepResults } from '../../components/scenarios/OneDimensionalExploration';
import { TwoDimensionalExploration, ParameterSweepResults2D } from '../../components/scenarios/TwoDimensionalExploration';

// Interface for simulation history items
interface SimulationHistoryItem {
  _id: string;
  scenarioId: string;
  createdAt: string;
  updatedAt: string;
  runCount?: number;
  count?: number; // Some API responses use count instead of runCount
  seed?: string;
  userId?: string;
  // Add any other fields that might be in the response
}

// Keep internal functions as snake_case but the component itself must be PascalCase for React
const ScenarioResultPage = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const [scenarioName, setScenarioName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  // AI-generated code
  // Prompt: Add state and handlers for the OneDimensionalExploration modal
  const [isOneDimModalOpen, set_is_one_dim_modal_open] = useState<boolean>(false);
  const [isTwoDimModalOpen, set_is_two_dim_modal_open] = useState<boolean>(false);
  const [parameterSweepResults, set_parameter_sweep_results] = useState<any>(null);
  const [parameterSweep2DResults, set_parameter_sweep_2d_results] = useState<any>(null);
  
  // New state for simulation history
  const [simulationHistory, setSimulationHistory] = useState<SimulationHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const open_one_dim_exploration = () => {
    set_is_one_dim_modal_open(true);
  };

  const close_one_dim_exploration = () => {
    set_is_one_dim_modal_open(false);
  };
  
  const open_two_dim_exploration = () => {
    set_is_two_dim_modal_open(true);
  };

  const close_two_dim_exploration = () => {
    set_is_two_dim_modal_open(false);
  };
  
  const handle_exploration_complete = (results: any) => {
    console.log('1D Exploration completed with results:', results);
    set_parameter_sweep_results(results);
    set_parameter_sweep_2d_results(null);
    
    // Refresh simulation history after a new exploration is completed
    fetch_simulation_history();
  };
  
  const handle_2d_exploration_complete = (results: any) => {
    console.log('2D Exploration completed with results:', results);
    set_parameter_sweep_2d_results(results);
    set_parameter_sweep_results(null);
    
    // Refresh simulation history after a new exploration is completed
    fetch_simulation_history();
  };

  // Function to navigate to SimulationResultsPage with a specific simulation
  const view_simulation_results = (simulationId: string) => {
    navigate(`/simulations/${simulationId}`, { 
      state: { scenarioId: scenarioId } 
    });
  };

  // New function to fetch simulation history
  const fetch_simulation_history = async () => {
    if (!scenarioId) return;
    
    setLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const response = await simulation_service.get_simulations_by_scenario(scenarioId);
      
      if (response.success && Array.isArray(response.data)) {
        // Sort by creation date (newest first)
        const sortedHistory = [...response.data].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setSimulationHistory(sortedHistory as SimulationHistoryItem[]);
      } else {
        setSimulationHistory([]);
        if (!response.success) {
          setHistoryError(response.message || 'Failed to load simulation history');
        }
      }
    } catch (err) {
      console.error('Error fetching simulation history:', err);
      setHistoryError(
        `Failed to load simulation history: ${err instanceof Error ? err.message : String(err)}`
      );
      setSimulationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Debug logs
  console.log('ScenarioResultPage: Rendering with scenarioId:', scenarioId);

  useEffect(() => {
    const fetch_scenario_details = async () => {
      console.log('ScenarioResultPage: Starting fetch for scenarioId:', scenarioId);

      if (!scenarioId) {
        console.error('ScenarioResultPage: No scenarioId provided');
        setError('No scenario ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('ScenarioResultPage: Making API call to get_scenario_by_id with:', scenarioId);
        const response = await scenario_service.get_scenario_by_id(scenarioId);
        console.log('ScenarioResultPage: API response:', response);
        setApiResponse(response); // Store the full response for debugging

        if (response?.data) {
          console.log('ScenarioResultPage: Setting scenarioName to:', response.data.name);
          setScenarioName(response.data.name || 'Unnamed Scenario');
        } else {
          console.error('ScenarioResultPage: No data found in response');
          setError('Scenario not found');
        }
      } catch (err) {
        console.error('ScenarioResultPage: Error fetching scenario:', err);
        setError(
          `Failed to load scenario details: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        console.log('ScenarioResultPage: Setting loading to false');
        setLoading(false);
      }
    };

    fetch_scenario_details();
    
    // Fetch simulation history when component mounts
    fetch_simulation_history();
  }, [scenarioId]);

  if (loading) {
    return (
      <Layout title="Loading Simulation Results">
        <Center minH="60vh">
          <Spinner size="xl" />
        </Center>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <Center minH="60vh" flexDirection="column">
          <Alert status="error" borderRadius="md" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
          <Box mt={4}>
            <Text fontWeight="bold">Debug Info:</Text>
            <Code p={2} borderRadius="md">
              ScenarioId: {scenarioId || 'undefined'}
            </Code>
          </Box>
        </Center>
      </Layout>
    );
  }

  // Format date for display
  const format_date = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (



    
    <Layout title={`Simulation Results: ${scenarioName}`}>
      <Box maxW="1200px" mx="auto" px={4}>
         
        {/* Simulation History Section */}
        <Box
          p={6} 
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg="white"
          mb={6}
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">
              <HStack>
                <FaHistory />
                <Text>Simulation History</Text>
              </HStack>
            </Heading>
            <Button 
              size="sm" 
              colorScheme="blue" 
              onClick={fetch_simulation_history}
              isLoading={loadingHistory}
            >
              Refresh
            </Button>
          </Flex>
          
          {historyError && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {historyError}
            </Alert>
          )}
          
          {loadingHistory ? (
            <Center p={8}>
              <Spinner />
            </Center>
          ) : simulationHistory.length === 0 ? (
            <Text color="gray.600" p={4} textAlign="center">
              No simulation results found. Run an exploration to generate results.
            </Text>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {simulationHistory.map((simulation) => (
                <Card key={simulation._id} borderWidth="1px" variant="outline" size="sm">
                  <CardHeader pb={2}>
                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="blue">
                        Run Count: {simulation.runCount || simulation.count || 'N/A'}
                      </Badge>
                      <Text fontSize="xs" color="gray.600">
                        {format_date(simulation.createdAt)}
                      </Text>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={2}>
                    <Flex align="center" justify="space-between">
                      <Box>
                        <Text fontSize="xs" color="gray.600">Simulation ID:</Text>
                        <Text fontSize="xs" fontFamily="monospace" mb={2}>
                          {simulation._id.substring(0, 10)}...
                        </Text>
                      </Box>
                      <Tooltip label="View Full Results">
                        <IconButton
                          aria-label="View full results"
                          icon={<FaChartLine />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => view_simulation_results(simulation._id)}
                        />
                      </Tooltip>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Box>
        <Box
          p={6} 
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg="white"
          mb={6}
        >
          <Heading size="lg" mb={4}>
            Simulation Results
          </Heading>
          <Text fontSize="md" color="gray.600" mb={6}>
            Results for scenario: <b>{scenarioName}</b>
          </Text>

          {!parameterSweepResults && !parameterSweep2DResults && (
            <Text mb={6} color="gray.600">
              Run a parameter exploration to see how different parameter values affect the scenario outcomes over time.
              The visualization will include both time series charts and parameter impact analysis.
            </Text>
          )}

          {/* Exploration options */}
          <Box mt={4} mb={6}>
            <Text fontWeight="bold" mb={3}>
              Exploration Options:
            </Text>
            <HStack spacing={4} justify="flex-start">
              {/* AI-generated code
                 Prompt: Update one-dimensional exploration button to open the modal */}
              <Button colorScheme="blue" onClick={open_one_dim_exploration}>
                One-dimensional Scenario Exploration
              </Button>
              <Button colorScheme="purple" onClick={open_two_dim_exploration}>
                Two-dimensional Scenario Exploration
              </Button>
            </HStack>
          </Box>
        </Box>
        
        {/* Parameter sweep results section */}
        {parameterSweepResults && (
          <Box mb={6}>
            <ParameterSweepResults results={parameterSweepResults} />
          </Box>
        )}
        
        {/* 2D Parameter sweep results section */}
        {parameterSweep2DResults && (
          <Box mb={6}>
            <ParameterSweepResults2D results={parameterSweep2DResults} />
          </Box>
        )}
       
      </Box>

      {/* AI-generated code
         Prompt: Add the OneDimensionalExploration modal component */}
      {scenarioId && (
        <>
          <OneDimensionalExploration
            isOpen={isOneDimModalOpen}
            onClose={close_one_dim_exploration}
            scenarioId={scenarioId}
            onExplorationComplete={handle_exploration_complete}
          />
          <TwoDimensionalExploration
            isOpen={isTwoDimModalOpen}
            onClose={close_two_dim_exploration}
            scenarioId={scenarioId}
            onExplorationComplete={handle_2d_exploration_complete}
          />
        </>
      )}
    </Layout>
  );
};

export default ScenarioResultPage;
//make some changes in this to store the history of the simulation results 