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
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputRightElement,
  Flex,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { FaExclamationTriangle, FaUpload } from 'react-icons/fa';
import { FileUp, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { scenario_service } from '../../services/scenarioService';
import { simulation_service } from '../../services/simulationService';
import { ScenarioDetailCard } from '../scenarios';
import { check_state_tax_exists } from '../../services/taxService';
import { StateType } from '../../types/Enum';
import stateTaxYAMLService from '../../services/stateTaxYaml';

interface RunSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Motion components
const MotionBox = motion(Box);

const RunSimulationModal: React.FC<RunSimulationModalProps> = ({ isOpen, onClose }) => {
  const [scenarios, set_scenarios] = useState<any[]>([]);
  const [loading, set_loading] = useState<boolean>(true);
  const [selected_scenario, set_selected_scenario] = useState<string>('');
  const [simulation_count, set_simulation_count] = useState<number>(100);
  const [count_error, set_count_error] = useState<string>('');
  const [is_submitting, set_is_submitting] = useState<boolean>(false);
  const [state_tax_exists, set_state_tax_exists] = useState<boolean | null>(null);
  const [is_importing_tax_data, set_is_importing_tax_data] = useState<boolean>(false);
  const [tax_file, set_tax_file] = useState<File | null>(null);
  const [drag_active, set_drag_active] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        navigate(`/simulations/${result.simulationId}`);
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
    } else {
      set_selected_scenario(scenarioId);
      const selected = scenarios.find(s => s._id === scenarioId);
      if (selected) {
        check_tax_data(selected.residenceState);
      }
    }
  };

  // Add function to check tax data
  const check_tax_data = async (state: StateType) => {
    try {
      const exists = await check_state_tax_exists(state);
      set_state_tax_exists(exists);

      // Add toast notification when tax data doesn't exist
      if (!exists) {
        toast({
          title: 'Simulation Disabled',
          description: `This scenario cannot be used for simulation because tax data for ${state} is missing.`,
          status: 'warning',
          duration: 1500,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error checking state tax data:', error);
      set_state_tax_exists(false);

      // Show error toast
      toast({
        title: 'Tax Data Check Failed',
        description: 'Unable to verify state tax data availability. Simulation is disabled.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Find the selected scenario object
  const selected_scenario_object = scenarios.find(s => s._id === selected_scenario);

  // Handle file selection for tax data import
  const handle_file_select = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selected_file = event.target.files[0];

      // Check if file is YAML
      if (!selected_file.name.endsWith('.yaml') && !selected_file.name.endsWith('.yml')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a YAML file (.yaml or .yml)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_tax_file(selected_file);
    }
  };

  // Trigger file input click
  const handle_browse_click = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events
  const handle_drag_over = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(true);
  };

  const handle_drag_leave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(false);
  };

  const handle_drop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    set_drag_active(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped_file = e.dataTransfer.files[0];

      // Check if file is YAML
      if (!dropped_file.name.endsWith('.yaml') && !dropped_file.name.endsWith('.yml')) {
        toast({
          title: 'Invalid file format',
          description: 'Please upload a YAML file (.yaml or .yml)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      set_tax_file(dropped_file);
    }
  };

  // Handle import function
  const handle_import_yaml = async () => {
    if (!tax_file) {
      toast({
        title: 'No file selected',
        description: 'Please select a YAML file to import',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      set_is_importing_tax_data(true);

      // Read the file content
      const reader = new FileReader();
      reader.onload = async e => {
        const content = e.target?.result as string;
        console.log('content:', content);
        console.log('Type of content:', typeof content);
        try {
          const savedTaxData = await stateTaxYAMLService.create(content);

          toast({
            title: 'Tax Data Imported',
            description: `Successfully imported tax data for ${selected_scenario_object?.residenceState}.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });

          // Refresh tax data status
          if (selected_scenario_object) {
            check_tax_data(selected_scenario_object.residenceState);
          }
          // Reset the file state
          set_tax_file(null);
        } catch (importError) {
          console.error('Error importing tax data:', importError);
          toast({
            title: 'Import Failed',
            description: 'There was an error importing the tax data. Please check the file format.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      };

      reader.readAsText(tax_file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      set_is_importing_tax_data(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

              {/* Tax Data Import Section - show only when a scenario is selected and it has no tax data */}
              {selected_scenario && state_tax_exists === false && (
                <Alert
                  status="warning"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  borderRadius="md"
                  p={4}
                >
                  <AlertIcon boxSize="24px" mr={0} mb={2} />
                  <AlertTitle mb={2}>State Tax Data Missing</AlertTitle>
                  <AlertDescription width="100%">
                    <Text mb={4}>
                      This scenario cannot be used for simulation because tax data for{' '}
                      <strong>{selected_scenario_object?.residenceState}</strong> is missing.
                    </Text>

                    {/* Drag & Drop UI */}
                    <MotionBox
                      p={4}
                      borderRadius="lg"
                      borderWidth="2px"
                      borderStyle="dashed"
                      borderColor={
                        drag_active ? 'purple.400' : useColorModeValue('gray.200', 'gray.700')
                      }
                      bg={
                        drag_active ? useColorModeValue('purple.50', 'purple.900') : 'transparent'
                      }
                      transition={{ duration: 0.2 }}
                      onDragOver={handle_drag_over}
                      onDragLeave={handle_drag_leave}
                      onDrop={handle_drop}
                      whileHover={{ borderColor: 'purple.400' }}
                      mb={4}
                    >
                      <VStack spacing={3}>
                        <MotionBox
                          animate={{
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'loop',
                          }}
                        >
                          <Icon
                            as={FileUp}
                            boxSize={8}
                            color={useColorModeValue('purple.500', 'purple.300')}
                          />
                        </MotionBox>

                        <VStack spacing={1}>
                          <Heading size="sm" textAlign="center">
                            Drag & Drop Tax YAML File
                          </Heading>
                          <Text color="gray.500" fontSize="sm" textAlign="center">
                            or use the button below
                          </Text>
                        </VStack>

                        <FormControl display="flex" justifyContent="center">
                          <Input
                            type="file"
                            accept=".yaml,.yml"
                            ref={fileInputRef}
                            onChange={handle_file_select}
                            display="none"
                          />
                          <Button
                            onClick={handle_browse_click}
                            colorScheme="purple"
                            leftIcon={<Icon as={FileUp} />}
                            size="sm"
                          >
                            Browse Files
                          </Button>
                        </FormControl>

                        <Text fontSize="xs" color="gray.500">
                          Supported file types: .yaml, .yml
                        </Text>
                      </VStack>
                    </MotionBox>

                    {/* Selected File Display */}
                    {tax_file && (
                      <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        mb={4}
                      >
                        <Flex
                          bg={useColorModeValue('green.50', 'green.900')}
                          p={3}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={useColorModeValue('green.200', 'green.700')}
                          align="center"
                        >
                          <Icon as={CheckCircle2} color="green.500" boxSize={5} mr={2} />
                          <Box flex="1">
                            <Text fontWeight="medium" fontSize="sm">
                              Selected file:
                            </Text>
                            <Text fontSize="sm">{tax_file.name}</Text>
                          </Box>
                        </Flex>
                      </MotionBox>
                    )}

                    {/* Import Button */}
                    <Button
                      colorScheme="purple"
                      leftIcon={<Icon as={FaUpload} />}
                      isLoading={is_importing_tax_data}
                      loadingText="Importing..."
                      onClick={handle_import_yaml}
                      isDisabled={!tax_file}
                      size="md"
                      width="full"
                      mt={2}
                    >
                      Import Tax Data
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

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
              is_submitting ||
              state_tax_exists === null ||
              state_tax_exists === false
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
