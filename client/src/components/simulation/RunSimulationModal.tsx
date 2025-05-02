// AI-generated code
// Create a modal component for Run simulation that allows user to select scenarios and specify simulation count

import {
  Box,
  Heading,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  SimpleGrid,
  Badge,
  Icon,
  useToast,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaUpload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { scenario_service } from '../../services/scenarioService';
import { simulation_service } from '../../services/simulationService';
import { ScenarioDetailCard } from '../scenarios';
import { check_state_tax_exists } from '../../services/taxService';
import { StateType } from '../../types/Enum';
import ImportStateTaxYaml from './ImportStateTaxYaml';

interface RunSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RunSimulationModal: React.FC<RunSimulationModalProps> = ({ isOpen, onClose }) => {
  const [scenarios, set_scenarios] = useState<any[]>([]);
  const [loading, set_loading] = useState<boolean>(true);
  const [selected_scenario, set_selected_scenario] = useState<string>('');
  const [simulation_count, set_simulation_count] = useState<number>(100);
  const [count_error, set_count_error] = useState<string>('');
  const [is_submitting, set_is_submitting] = useState<boolean>(false);
  const [state_tax_exists, set_state_tax_exists] = useState<boolean | null>(null);
  const [force_show_importer, set_force_show_importer] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetch_scenarios();
    }

    // Cleanup function
    return () => {
      // Reset state when modal closes
      if (!isOpen) {
        set_selected_scenario('');
      }
    };
  }, [isOpen]);

  const fetch_scenarios = async () => {
    try {
      set_loading(true);
      const response = await scenario_service.get_all_scenarios();
      // Filter scenarios where isDraft is false
      const active_scenarios = response.data.filter((scenario: any) => !scenario.isDraft);
      set_scenarios(active_scenarios);
      set_loading(false);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch scenarios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      set_loading(false);
    }
  };

  const validate_simulation_count = (value: number) => {
    if (!value || value <= 0) {
      set_count_error('Simulation count must be a positive integer');
      return false;
    }

    if (!Number.isInteger(value)) {
      set_count_error('Simulation count must be an integer');
      return false;
    }

    set_count_error('');
    return true;
  };

  const handle_simulation_count_change = (value: string) => {
    const num_value = parseInt(value);
    set_simulation_count(num_value);
    validate_simulation_count(num_value);
  };

  const handle_run_simulation = async () => {
    if (!selected_scenario) {
      toast({
        title: 'No Scenario Selected',
        description: 'Please select a scenario to run simulation',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validate_simulation_count(simulation_count)) {
      return;
    }

    // Show warning toast if state tax data is missing
    if (state_tax_exists === false) {
      toast({
        title: 'State Tax Data Missing',
        description: 'Proceeding with simulation assuming state tax is 0.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }

    try {
      set_is_submitting(true);

      // Call the simulation service to run the simulation
      const result = await simulation_service.run_simulation(selected_scenario, simulation_count);

      toast({
        title: 'Simulation Started',
        description: `Running ${simulation_count} simulations for the selected scenario`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // After successful submission, navigate to results page if there's a simulation ID
      if (result && result.simulationId) {
        navigate(`/simulations/${result.simulationId}`, {
          state: { scenarioId: selected_scenario },
        });
      }

      onClose();

      // Clear selection after running
      set_selected_scenario('');
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Simulation Failed',
        description: 'There was an error running the simulation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      set_is_submitting(false);
    }
  };

  const handle_card_selection = (scenarioId: string) => {
    // Toggle selection - if it's already selected, unselect it
    if (selected_scenario === scenarioId) {
      set_selected_scenario('');
      set_state_tax_exists(null);
      // Reset force_show_importer when unselecting a scenario
      set_force_show_importer(false);
    } else {
      set_selected_scenario(scenarioId);
      const selected = scenarios.find(s => s._id === scenarioId);
      if (selected) {
        check_tax_data(selected.residenceState);
        // Also reset force_show_importer when selecting a new scenario
        set_force_show_importer(false);
      }
    }
  };

  // Add function to check tax data
  const check_tax_data = async (state: StateType) => {
    try {
      const exists = await check_state_tax_exists(state);
      set_state_tax_exists(exists);

      // Add informational toast notification when tax data doesn't exist
      if (!exists) {
        toast({
          title: 'State Tax Data Missing',
          description: `No tax data for ${state} found. If you proceed, state tax will be assumed to be 0.`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error checking state tax data:', error);
      set_state_tax_exists(false);

      // Show error toast
      toast({
        title: 'Tax Data Check Failed',
        description:
          'Unable to verify state tax data availability. If you proceed, state tax will be assumed to be 0.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Find the selected scenario object
  const selected_scenario_object = scenarios.find(s => s._id === selected_scenario);

  // Handle successful YAML import
  const handle_import_success = () => {
    // Refresh tax data status
    if (selected_scenario_object) {
      check_tax_data(selected_scenario_object.residenceState);
      // Hide the importer after successful import
      set_force_show_importer(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure Simulation</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Text>Loading scenarios...</Text>
          ) : scenarios.filter(s => !s.isDraft).length === 0 ? (
            <VStack spacing={4} align="center" p={4}>
              <Icon as={FaExclamationTriangle} boxSize={12} color="orange.500" />
              <Heading size="md" textAlign="center">
                No Scenarios Available
              </Heading>
              <Text textAlign="center">
                You don't have any active scenarios yet. Please create a scenario first.
              </Text>
              <Button colorScheme="blue" onClick={() => navigate('/scenarios/new')}>
                Create New Scenario
              </Button>
            </VStack>
          ) : (
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Select Scenario</FormLabel>
                <Text fontSize="sm" color="gray.500" mb={2}>
                  Click on a scenario card to select it for simulation. Click again to unselect.
                </Text>

                {/* Show scenario cards instead of dropdown */}
                <SimpleGrid columns={1} spacing={4} mb={4}>
                  {scenarios
                    .filter(scenario => !scenario.isDraft)
                    .map(scenario => (
                      <Box
                        key={scenario._id}
                        onClick={() => handle_card_selection(scenario._id)}
                        cursor="pointer"
                        position="relative"
                        borderWidth={selected_scenario === scenario._id ? '2px' : '1px'}
                        borderColor={
                          selected_scenario === scenario._id
                            ? 'purple.500'
                            : useColorModeValue('gray.200', 'gray.700')
                        }
                        borderRadius="lg"
                        transition="all 0.2s"
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'md',
                        }}
                      >
                        {selected_scenario === scenario._id && (
                          <Badge
                            position="absolute"
                            top="-2"
                            right="-2"
                            colorScheme="purple"
                            fontSize="0.8em"
                            py={1}
                            px={2}
                            borderRadius="full"
                            zIndex={1}
                          >
                            Selected
                          </Badge>
                        )}
                        {/* Pass hideFooter prop to hide the footer in this context */}
                        <ScenarioDetailCard scenario={scenario} hideFooter={true} />
                      </Box>
                    ))}
                </SimpleGrid>
              </FormControl>

              {/* State Tax Data Warning */}
              {selected_scenario && state_tax_exists === false && (
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    State tax data is missing for this scenario. If you proceed, state tax will be
                    assumed to be 0.
                  </AlertDescription>
                </Alert>
              )}

              {/* Tax Data Import Section - show when forced or when state tax data is missing */}
              {selected_scenario &&
                selected_scenario_object &&
                (state_tax_exists === false || force_show_importer ? (
                  <ImportStateTaxYaml
                    state={selected_scenario_object.residenceState}
                    onImportSuccess={handle_import_success}
                    isReupload={force_show_importer && state_tax_exists === true}
                  />
                ) : null)}

              <FormControl isRequired isInvalid={!!count_error}>
                <FormLabel fontWeight="bold">Number of Simulations</FormLabel>
                <NumberInput
                  min={1}
                  step={10}
                  value={simulation_count}
                  onChange={handle_simulation_count_change}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                {count_error ? (
                  <FormErrorMessage>{count_error}</FormErrorMessage>
                ) : (
                  <FormHelperText>
                    How many times should we run the simulation? Higher numbers give more accurate
                    results but take longer.
                  </FormHelperText>
                )}
              </FormControl>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          {/* Re-upload button - show only when tax data exists */}
          {selected_scenario &&
            selected_scenario_object &&
            state_tax_exists === true &&
            !force_show_importer && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="purple"
                leftIcon={<Icon as={FaUpload} />}
                onClick={() => set_force_show_importer(true)}
                mr="auto"
              >
                Re-upload State Tax Data
              </Button>
            )}
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handle_run_simulation}
            isLoading={is_submitting}
            loadingText="Running..."
            isDisabled={
              scenarios.filter(s => !s.isDraft).length === 0 ||
              !selected_scenario ||
              !!count_error ||
              is_submitting
            }
          >
            Run Simulation
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RunSimulationModal;
