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
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Layout } from '../../layouts';
import { scenario_service } from '../../services/scenarioService';
// AI-generated code
// Prompt: Import the OneDimensionalExploration component from its new location
import OneDimensionalExploration from '../../components/scenarios/OneDimensionalExploration/OneDimensionalExploration';

// Keep internal functions as snake_case but the component itself must be PascalCase for React
const ScenarioResultPage = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [scenarioName, setScenarioName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  // AI-generated code
  // Prompt: Add state and handlers for the OneDimensionalExploration modal
  const [isOneDimModalOpen, set_is_one_dim_modal_open] = useState<boolean>(false);

  const open_one_dim_exploration = () => {
    set_is_one_dim_modal_open(true);
  };

  const close_one_dim_exploration = () => {
    set_is_one_dim_modal_open(false);
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

  return (
    <Layout title={`Simulation Results: ${scenarioName}`}>
      <Center minH="60vh">
        <Box
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          boxShadow="md"
          bg="white"
          maxW="800px"
          w="100%"
        >
          <Heading size="lg" mb={4}>
            Simulation Results
          </Heading>
          <Text fontSize="md" color="gray.600" mb={6}>
            Results for scenario: <b>{scenarioName}</b>
          </Text>

          <Text mb={6} color="gray.400">
            Simulation results will appear here.
          </Text>

          {/* Exploration options */}
          <Box mt={6}>
            <Text fontWeight="bold" mb={3}>
              Exploration Options:
            </Text>
            <HStack spacing={4} justify="center">
              {/* AI-generated code
                 Prompt: Update one-dimensional exploration button to open the modal */}
              <Button colorScheme="blue" size="lg" minW="200px" onClick={open_one_dim_exploration}>
                One-dimensional Scenario Exploration
              </Button>
              <Button colorScheme="purple" size="lg" minW="200px">
                Two-dimensional Scenario Exploration
              </Button>
            </HStack>
          </Box>
        </Box>
      </Center>

      {/* AI-generated code
         Prompt: Add the OneDimensionalExploration modal component */}
      {scenarioId && (
        <OneDimensionalExploration
          isOpen={isOneDimModalOpen}
          onClose={close_one_dim_exploration}
          scenarioId={scenarioId}
        />
      )}
    </Layout>
  );
};

export default ScenarioResultPage;
