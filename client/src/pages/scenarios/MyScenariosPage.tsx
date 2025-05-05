import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Flex,
  Button,
  Icon,
  Badge,
  useColorModeValue,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaPlus, FaPlayCircle, FaRegLightbulb, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { ScenarioDetailCard } from '../../components/scenarios';
import { RunSimulationModal } from '../../components/simulation';
import { scenario_service } from '../../services/scenarioService';
import { scenarioYAMLService } from '../../services/scenarioYAML';
import { SAMPLE_SCENARIOS } from '../../types/scenario'; //! temporary
import { ScenarioRaw } from '../../types/Scenarios';
import { convert_scenario_to_yaml } from '../../utils/yamlExport';

const MyScenariosPage: React.FC = () => {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [actualScenarios, setActualScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  const headingColor = useColorModeValue('gray.700', 'white');
  const noteColor = useColorModeValue('blue.700', 'blue.200');
  const noteBgColor = useColorModeValue('blue.50', 'blue.900');
  const infoColor = useColorModeValue('gray.600', 'gray.400');
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchDrafts();
    fetchActualScenarios();

    // Cleanup function
    return () => {
      setDrafts([]);
      setActualScenarios([]);
    };
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const draftScenarios = await scenario_service.get_draft_scenarios();
      // Replace the entire drafts array instead of appending
      setDrafts(draftScenarios.data);
      setLoading(false);
    } catch (error) {
      console.log('error fetching drafts:', error);
      // toast({
      //   title: 'Error',
      //   description: 'failed to fetch draft scenarios',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
      setLoading(false);
    }
  };

  const fetchActualScenarios = async () => {
    try {
      const scenarios = await scenario_service.get_all_scenarios();
      setActualScenarios(scenarios.data);
    } catch (error) {
      console.log('error fetching actual scenarios:', error);
      // toast({
      //   title: 'Error',
      //   description: 'failed to fetch scenarios',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
    }
  };

  const handle_sample_scenario = async (scenario: ScenarioRaw) => {
    try {
      // Download the scenario as YAML before creating it
      const yaml = convert_scenario_to_yaml(scenario);
      const savedScenario = await scenarioYAMLService.create(yaml);
      console.log('yaml in myScenariosPage:', savedScenario);
    } catch (error) {
      console.error('Error creating scenario:', error);
    }
  };

  const handleEditDraft = (draftId: string) => {
    navigate(`/scenarios/edit/${draftId}`);
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await scenario_service.delete_scenario(draftId);
      setDrafts(drafts.filter(draft => draft._id !== draftId));
      toast({
        title: 'Draft Deleted',
        description: 'Draft scenario was deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log('Error deleting draft:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to delete draft scenario',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await scenario_service.delete_scenario(scenarioId);
      setActualScenarios(actualScenarios.filter(scenario => scenario._id !== scenarioId));
      toast({
        title: 'Scenario Deleted',
        description: 'Scenario has been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.log('Error deleting scenario:', error);
      // toast({
      //   title: 'Error',
      //   description: 'Failed to delete scenario',
      //   status: 'error',
      //   duration: 3000,
      //   isClosable: true,
      // });
    }
  };

  return (
    <Box py={4} px={4} w="100%" position="relative">
      {/* Header section with more visual appeal */}
      <Flex direction="column" mb={6} pb={4} borderBottom="1px solid" borderColor={borderColor}>
        <Flex justify="space-between" align="center" wrap="wrap" mb={2}>
          <Box>
            <Heading as="h1" size="xl" color={headingColor} fontWeight="extrabold">
              Financial Scenarios
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Plan and simulate your financial future
            </Text>
          </Box>
          <Button
            onClick={() => handle_sample_scenario(SAMPLE_SCENARIOS[0])}
            size="sm"
            colorScheme="blue"
            leftIcon={<FaPlus />}
            boxShadow="sm"
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
            transition="all 0.2s"
          >
            New Scenario
          </Button>
        </Flex>

        {/* Info box with improved styling */}
        <Box
          bg={bgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="blue.400"
        >
          <Flex align="start">
            <Icon as={FaInfoCircle} color="blue.400" mt={1} mr={3} boxSize={5} />
            <Text fontSize="sm" color={infoColor} lineHeight="1.6">
              A scenario is a collection of information defining your financial plan. It includes
              your financial goals, investment strategies, income/expense events, and market
              assumptions needed to run simulations. Each scenario can be for an individual or a
              couple, with different life expectancies and financial objectives.
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Action Cards with enhanced visual appeal */}
      <Heading as="h2" size="md" mb={4} color={headingColor} fontWeight="semibold">
        Quick Actions
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5} mb={8}>
        {/* here is that create new scenario card*/}
        <Box
          bg={cardBgColor}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          borderTop="4px solid"
          borderTopColor="blue.500"
          _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          transition="all 0.3s"
          cursor="pointer"
          onClick={() => navigate('/scenarios/new')}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Flex
              w="60px"
              h="60px"
              bg="blue.50"
              color="blue.500"
              borderRadius="full"
              justify="center"
              align="center"
              mb={3}
            >
              <Icon as={FaPlus} boxSize={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2} color="blue.500">
              Create New Scenario
            </Heading>
            <Text color={infoColor}>Start planning your financial future with a new scenario</Text>
          </Flex>
        </Box>

        {/* run simulation card */}
        <Box
          bg={cardBgColor}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          borderTop="4px solid"
          borderTopColor="purple.500"
          _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
          transition="all 0.3s"
          cursor="pointer"
          onClick={onOpen}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Flex
              w="60px"
              h="60px"
              bg="purple.50"
              color="purple.500"
              borderRadius="full"
              justify="center"
              align="center"
              mb={3}
            >
              <Icon as={FaPlayCircle} boxSize={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2} color="purple.500">
              Run Simulation
            </Heading>
            <Text color={infoColor}>Test and validate your financial strategies</Text>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Draft Scenarios Section - Only show if there are drafts */}
      {drafts.length > 0 && (
        <Box mb={8}>
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            pb={2}
            borderBottom="1px solid"
            borderColor={borderColor}
          >
            <Heading as="h2" size="md" color={headingColor} fontWeight="semibold">
              Your Draft Scenarios
            </Heading>
            <Badge colorScheme="blue" fontSize="sm" borderRadius="full" px={3} py={1}>
              {drafts.length} drafts
            </Badge>
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
            {drafts.map(draft => (
              <Box
                key={draft._id}
                bg={cardBgColor}
                p={5}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading as="h3" size="md" mb={2} color={headingColor}>
                      {draft.name}
                    </Heading>
                    <Text color={infoColor}>
                      Last updated: {new Date(draft.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Flex gap={2}>
                    <Button
                      leftIcon={<FaEdit />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDraft(draft._id)}
                    >
                      Continue Editing
                    </Button>
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft._id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Actual Scenarios Section */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          pb={2}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" color={headingColor} fontWeight="semibold">
            Your Scenarios
          </Heading>
          <Badge colorScheme="blue" fontSize="sm" borderRadius="full" px={3} py={1}>
            {actualScenarios.length} scenarios
          </Badge>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 1 }} spacing={6}>
          {actualScenarios.map(scenario => (
            <ScenarioDetailCard
              key={scenario._id}
              scenario={scenario}
              onDelete={() => handleDeleteScenario(scenario._id)}
            />
          ))}
          {actualScenarios.length === 0 && !loading && (
            <Text color={infoColor} textAlign="center" py={4}>
              No scenarios found. Create a new scenario to get started.
            </Text>
          )}
        </SimpleGrid>
      </Box>

      {/* Pro Tip with enhanced design */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex
          bg={noteBgColor}
          p={4}
          align="center"
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Flex bg="yellow.100" p={2} borderRadius="full" justify="center" align="center" mr={3}>
            <Icon as={FaRegLightbulb} color="yellow.500" boxSize={5} />
          </Flex>
          <Heading as="h3" size="sm" fontWeight="bold" color={noteColor}>
            Pro Tip: Create multiple scenarios to compare strategies
          </Heading>
        </Flex>
        <Box p={4} bg={cardBgColor}>
          <Text fontSize="sm" color={infoColor} lineHeight="1.7">
            A complete scenario includes your investment types, event series (like income/expenses),
            inflation assumptions, and strategies for withdrawals and spending. You can run
            simulations on each scenario to see how different decisions might affect your financial
            future.
          </Text>
        </Box>
      </Box>

      {/* Import the RunSimulationModal component */}
      <RunSimulationModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default MyScenariosPage;
