import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Button, 
  Select, 
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
  useColorModeValue
} from '@chakra-ui/react';
import ProbabilityOfSuccessChart from '../components/charts/ProbabilityOfSuccessChart';
import { useParams, useNavigate } from 'react-router-dom';

// Define chart types
const CHART_TYPES = [
  { id: 'probabilityOfSuccess', name: 'Probability of Success Over Time' },
  { id: 'probabilityRanges', name: 'Probability Ranges for a Selected Quantity Over Time' },
  { id: 'medianOrAverageValues', name: 'Median or Average Values of a Selected Quantity Over Time' }
];

// Need to ask kalvin which parameters are needed for each chart type
const SimulationResults: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const navigate = useNavigate();
  
  // New state variables for chart selection
  const [showChartSelection, setShowChartSelection] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['probabilityOfSuccess']);
  const [dollarValueType, setDollarValueType] = useState<string>('today');
  
  // TODO: Replace with actual API call when ready
  // Right now use mock data
  useEffect(() => {
    const fetchSimulationResults = async () => {
      setLoading(true);
      try {
        // Mock API call - replace with actual API call when ready
        // const response = await axios.get(`${API_URL}/api/scenarios/${scenarioId}/simulation`);
        // setSimulationData(response.data);
        
        setTimeout(() => {
          // Generate mock probability data for chart 1
          const mockProbabilityData = new Map<number, number>();

          for (let i = 0; i < 30; i++) {
            const year = 2023 + i;
            const baseProb = 100 - (i * 2.5);
            const randomAdjustment = Math.random() * 5 - 2.5;
            const probability = Math.max(0, Math.min(100, baseProb + randomAdjustment));

            mockProbabilityData.set(year, probability);
          }

          // Convert data from map to an array format
          const probabilityArrayData = {
            years: Array.from(mockProbabilityData.keys()),
            probabilities: Array.from(mockProbabilityData.values())
          }; 

          setSimulationData({
            probabilityOfSuccess: probabilityArrayData,
            //Todo: Add other simulation data here as needed
          });
          setLoading(false);
        }, 1500); // Simulate loading delay
      } catch (err) {
        console.error('Error fetching simulation results:', err);
        setError('Failed to load simulation results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSimulationResults();
  }, [scenarioId]);
  
  // Handle chart selection submission
  const handleShowCharts = () => {
    setShowChartSelection(false);
  };
  
  // Chart selection UI
  const renderChartSelectionUI = () => {
    const bgColor = useColorModeValue('white', 'gray.700');
    
    return (
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        p={6} 
        shadow="md" 
        bg={bgColor}
        mb={6}
      >
        <Heading as="h2" size="lg" mb={4}>Select Charts to Display</Heading>
        <Text mb={15} fontSize = "lg">
          Choose which charts you'd like to see for your simulation results.
          You can select multiple charts to get a comprehensive view of your financial plan.
        </Text>
        
        <VStack align="start" spacing={6} mb={8}>
          <Box width="100%">
            <Text fontWeight="bold" fontSize = "lg" mb={2}>Chart Types</Text>
            <CheckboxGroup 
              colorScheme="blue" 
              value={selectedCharts}
              onChange={(values) => setSelectedCharts(values as string[])}
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
          
          <Divider />
          
          <Box width="100%">
            <Text fontWeight="bold" fontSize = "lg"mb={2}>Dollar Value Display</Text>
            <Text fontSize="lg" color="gray.500" mb={3} >
              Choose how dollar values should be displayed in the charts.
            </Text>
            <RadioGroup 
              onChange={setDollarValueType} 
              value={dollarValueType}
              colorScheme="blue"
            >
              <Stack direction="row" spacing={5}>
                <Radio value="today">Today's Dollars</Radio>
                <Radio value="future">Future Dollars</Radio>
              </Stack>
            </RadioGroup>
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
            <Heading as="h2" size="lg" mb={4}>Probability of Success Analysis</Heading>
            <Text mb={4} fontSize = "lg">
              This analysis shows the likelihood of meeting your financial goals over time based on 
              the simulation results. A higher probability indicates a greater chance of success.
            </Text>
            
            <ProbabilityOfSuccessChart 
              data={simulationData?.probabilityOfSuccess} 
              
              loading={loading}
            />
            console.log("in simulationData?.probabilityOfSuccess", simulationData?.probabilityOfSuccess)
          </Box>
        )}
        
        {/* Add other chart types here based on selectedCharts */}
        
        <Flex justify="space-between" mt={8}>
          <Button 
            variant="outline" 
            onClick={() => setShowChartSelection(true)}
          >
            Change Chart Selection
          </Button>
          
          <Button 
            colorScheme="blue" 
            onClick={() => navigate(`/scenarios/${scenarioId}`)}
          >
            Back to Scenario
          </Button>
        </Flex>
      </>
    );
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Simulation Results</Heading>
      
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
        <>
          {showChartSelection ? renderChartSelectionUI() : renderCharts()}
        </>
      )}
    </Container>
  );
};

export default SimulationResults;