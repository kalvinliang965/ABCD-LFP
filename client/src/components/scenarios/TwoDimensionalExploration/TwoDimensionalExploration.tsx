import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  Divider,
  Text,
  Alert,
  AlertIcon,
  Box,
  Spinner,
  Center,
  useToast,
  Heading,
  Grid,
  GridItem,
} from '@chakra-ui/react';

import { 
  StartYearParameter, 
  DurationParameter,
  InitialAmountParameter,
  InvestmentPercentageParameter 
} from '../OneDimensionalExploration';
import { scenario_service } from '../../../services/scenarioService';
import { ScenarioRaw, IncomeEventRaw, ExpenseEventRaw, InvestmentEventRaw } from '../../../types/Scenarios';

type ParameterType =
  | 'startYear'
  | 'duration'
  | 'initialAmount'
  | 'investmentPercentage';

interface ParameterOption {
  value: ParameterType;
  label: string;
  description: string;
}

const PARAMETER_OPTIONS: ParameterOption[] = [
  {
    value: 'startYear',
    label: 'Start Year',
    description: 'The start year of an event series',
  },
  {
    value: 'duration',
    label: 'Duration',
    description: 'The fixed duration of an event series',
  },
  {
    value: 'initialAmount',
    label: 'Initial Amount',
    description: 'The fixed initial amount of an income or expense event series',
  },
  {
    value: 'investmentPercentage',
    label: 'Investment Percentage',
    description: 'The percentage for the first investment in a two-investment asset allocation',
  },
];

interface TwoDimensionalExplorationProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
  onExplorationComplete?: (results: any) => void;
}

// the structure for parameter data
interface ParameterData {
  type: ParameterType | '';
  event_name: string;
  lower_bound: number;
  upper_bound: number;
  step_size: number;
}

const TwoDimensionalExploration: React.FC<TwoDimensionalExplorationProps> = ({
  isOpen,
  onClose,
  scenarioId,
  onExplorationComplete,
}) => {
  // parameter 1 state
  const [parameter1, set_parameter1] = useState<ParameterData>({
    type: '',
    event_name: '',
    lower_bound: 0,
    upper_bound: 100,
    step_size: 10
  });

  //parameter 2 state
  const [parameter2, set_parameter2] = useState<ParameterData>({
    type: '',
    event_name: '',
    lower_bound: 0,
    upper_bound: 100,
    step_size: 10
  });

  const [scenario_data, set_scenario_data] = useState<ScenarioRaw>();
  const [loading, set_loading] = useState<boolean>(false);
  const [error, set_error] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState<boolean>(false);
  const [simulations_per_combination, set_simulations_per_combination] = useState<number>(5);
  const toast = useToast();

  const parameter1_option = PARAMETER_OPTIONS.find(option => option.value === parameter1.type);
  const parameter2_option = PARAMETER_OPTIONS.find(option => option.value === parameter2.type);

  //fetch original scenario data when needed
  useEffect(() => {
    const fetch_scenario_data = async () => {
      if (!scenarioId) return;

      set_loading(true);
      set_error(null);

      try {
        const response = await scenario_service.get_scenario_by_id(scenarioId);

        if (response?.data) {
          set_scenario_data(response.data);
          console.log(
            'scenario_data from useEffect from fetch_scenario_data from two dimensional exploration',
            response.data
          );
        } else {
          set_error('Failed to retrieve scenario data');
        }
      } catch (err) {
        console.error('Error fetching scenario details:', err);
        set_error(
          `Failed to load scenario details: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        set_loading(false);
      }
    };

    fetch_scenario_data();
  }, [scenarioId]);

  //handle parameter 1 change
  const handle_parameter1_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ParameterType | '';
    
    //update parameter data with appropriate defaults
    set_parameter1({
      ...parameter1,
      type: value,
      event_name: '',
      ...get_default_bounds(value)
    });
  };

  //handle parameter 2 change
  const handle_parameter2_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ParameterType | '';
    
    //update parameter data with appropriate defaults
    set_parameter2({
      ...parameter2,
      type: value,
      event_name: '',
      ...get_default_bounds(value)
    });
  };

  //helper function to get default bounds for a parameter type
  const get_default_bounds = (param_type: ParameterType | '') => {
    if (param_type === 'startYear') {
      return { lower_bound: 2023, upper_bound: 2033, step_size: 1 };
    } else if (param_type === 'duration') {
      return { lower_bound: 1, upper_bound: 10, step_size: 1 };
    } else if (param_type === 'investmentPercentage') {
      return { lower_bound: 0, upper_bound: 100, step_size: 10 };
    } else if (param_type === 'initialAmount') {
      return { lower_bound: 1000, upper_bound: 10000, step_size: 1000 };
    }
    return { lower_bound: 0, upper_bound: 100, step_size: 10 };
  };

  //handler for parameter 1 event selection
  const handle_parameter1_event_change = useCallback((event_name: string) => {
    console.log('Parameter 1 event name changed to:', event_name);
    set_parameter1(prev => ({ ...prev, event_name }));
  }, []);

  //handler for parameter 2 event selection
  const handle_parameter2_event_change = useCallback((event_name: string) => {
    console.log('Parameter 2 event name changed to:', event_name);
    set_parameter2(prev => ({ ...prev, event_name }));
  }, []);

  //run the 2D exploration
  const run_exploration = async () => {
    //clear old state before starting a new sweep
    set_error(null);
    set_is_loading(true);

    //build the payload
    const payload: any = {
      scenarioId,
      parameter1: {
        type: parameter1.type,
        eventName: parameter1.event_name,
        range: {
          lower: parameter1.lower_bound,
          upper: parameter1.upper_bound,
          step: parameter1.step_size <= 0 ? 1 : parameter1.step_size,
        }
      },
      parameter2: {
        type: parameter2.type,
        eventName: parameter2.event_name,
        range: {
          lower: parameter2.lower_bound,
          upper: parameter2.upper_bound,
          step: parameter2.step_size <= 0 ? 1 : parameter2.step_size,
        }
      },
      numSimulations: simulations_per_combination
    };

    console.log('Running 2D exploration with:', payload);
    
    try {
      const sweep = await scenario_service.simulate_parameter_sweep_2d(payload);
      console.log('2D Exploration results:', sweep);
      
      toast({
        title: "Exploration completed",
        description: "2D parameter sweep simulation has completed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      //pass results to parent component if callback provided
      if (onExplorationComplete) {
        onExplorationComplete(sweep);
      }
    } catch (err) {
      console.error('2D Simulation parameter sweep failed:', err);
      set_error(err instanceof Error ? err.message : String(err));
      toast({
        title: "Exploration failed",
        description: `Failed to run 2D parameter sweep: ${err instanceof Error ? err.message : String(err)}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      set_is_loading(false);
      //close the modal after submission
      onClose();
    }
  };

  // validation function for input
  const is_valid_input = () => {
    if (!parameter1.type || !parameter2.type) return false;
    if (parameter1.type === parameter2.type) return false;
    if (!parameter1.event_name) return false;
    if (!parameter2.event_name) return false;
    
    //check numeric parameter ranges
    if (parameter1.lower_bound > parameter1.upper_bound) return false;
    if (parameter2.lower_bound > parameter2.upper_bound) return false;
    
    //check step sizes
    if (parameter1.step_size <= 0) return false;
    if (parameter2.step_size <= 0) return false;
    
    // make sure each range actually produces at least two distinct values
    const count1 = Math.floor((parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size) + 1;
    const count2 = Math.floor((parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size) + 1;
    if (count1 < 2 || count2 < 2) return false;
    
    //check for too many steps
    if ((parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size > 20) return false;
    if ((parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size > 20) return false;
    
    //additional constraint for investment percentage
    if (parameter1.type === 'investmentPercentage' && (parameter1.lower_bound < 0 || parameter1.upper_bound > 100)) {
      return false;
    }
    
    if (parameter2.type === 'investmentPercentage' && (parameter2.lower_bound < 0 || parameter2.upper_bound > 100)) {
      return false;
    }
    
    return true;
  };

  //calculate total simulation count
  const calculate_total_simulations = () => {
    let param1_count = Math.floor((parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size) + 1;
    let param2_count = Math.floor((parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size) + 1;
    
    return param1_count * param2_count;
  };

  const total_simulations = calculate_total_simulations();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>2D Scenario Exploration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Select two parameters to explore. The system will run simulations for each combination of values.
            </Text>

            {/* Parameter 1 selection */}
            <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Heading size="sm" mb={2}>Parameter 1</Heading>
              <FormControl id="parameter1-select" isRequired>
                <FormLabel>Scenario Parameter</FormLabel>
                <Select
                  placeholder="Select first parameter to explore"
                  value={parameter1.type}
                  onChange={handle_parameter1_change}
                >
                  {PARAMETER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {parameter1.type && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {parameter1_option?.description}
                  </Text>
                  <Divider my={2} />
                </Box>
              )}

              {/* Render parameter-specific inputs for Parameter 1 */}
              {parameter1.type === 'initialAmount' && scenario_data && (
                <InitialAmountParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter1.lower_bound}
                  selectedEventName={parameter1.event_name}
                  onEventNameChange={handle_parameter1_event_change}
                />
              )}

              {parameter1.type === 'investmentPercentage' && scenario_data && (
                <InvestmentPercentageParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter1.lower_bound}
                  selectedEventName={parameter1.event_name}
                  onEventNameChange={handle_parameter1_event_change}
                />
              )}

              {parameter1.type === 'startYear' && scenario_data && (
                <StartYearParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter1.lower_bound}
                  selectedEventName={parameter1.event_name}
                  onEventNameChange={handle_parameter1_event_change}
                />
              )}

              {parameter1.type === 'duration' && scenario_data && (
                <DurationParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter1.lower_bound}
                  selectedEventName={parameter1.event_name}
                  onEventNameChange={handle_parameter1_event_change}
                />
              )}

              {/* Numeric parameter range inputs for Parameter 1 */}
              {parameter1.type && (
                <>
                  <Heading size="sm" mt={4} mb={2}>Parameter Range</Heading>
                  <Text fontSize="sm" mb={3}>
                    Define a range for the parameter value.
                  </Text>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl id="lower-bound-1" isRequired>
                        <FormLabel>Lower Bound</FormLabel>
                        <NumberInput
                          value={parameter1.lower_bound}
                          onChange={(_, val) => set_parameter1(prev => ({ ...prev, lower_bound: val }))}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl id="upper-bound-1" isRequired>
                        <FormLabel>Upper Bound</FormLabel>
                        <NumberInput
                          value={parameter1.upper_bound}
                          onChange={(_, val) => set_parameter1(prev => ({ ...prev, upper_bound: val }))}
                          min={parameter1.lower_bound}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl id="step-size-1" isRequired mt={4}>
                    <FormLabel>Step Size</FormLabel>
                    <NumberInput 
                      value={parameter1.step_size} 
                      onChange={(_, val) => set_parameter1(prev => ({ ...prev, step_size: val }))} 
                      min={1}
                      isDisabled={parameter1.lower_bound === parameter1.upper_bound}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {parameter1.lower_bound !== parameter1.upper_bound && (
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="bold">
                        This will create {Math.floor((parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size) + 1}{' '}
                        values for parameter 1
                      </Text>
                    </Box>
                  )}

                  {(parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size > 10 && (
                    <Alert status="warning" mt={2}>
                      <AlertIcon />
                      Consider reducing the number of steps for better performance.
                    </Alert>
                  )}
                </>
              )}
            </Box>

            {/* Parameter 2 selection */}
            <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Heading size="sm" mb={2}>Parameter 2</Heading>
              <FormControl id="parameter2-select" isRequired>
                <FormLabel>Scenario Parameter</FormLabel>
                <Select
                  placeholder="Select second parameter to explore"
                  value={parameter2.type}
                  onChange={handle_parameter2_change}
                >
                  {PARAMETER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {parameter2.type && (
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {parameter2_option?.description}
                  </Text>
                  <Divider my={2} />
                </Box>
              )}

              {/* Render parameter-specific inputs for Parameter 2 */}
              {parameter2.type === 'initialAmount' && scenario_data && (
                <InitialAmountParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter2.lower_bound}
                  selectedEventName={parameter2.event_name}
                  onEventNameChange={handle_parameter2_event_change}
                />
              )}

              {parameter2.type === 'investmentPercentage' && scenario_data && (
                <InvestmentPercentageParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter2.lower_bound}
                  selectedEventName={parameter2.event_name}
                  onEventNameChange={handle_parameter2_event_change}
                />
              )}

              {parameter2.type === 'startYear' && scenario_data && (
                <StartYearParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter2.lower_bound}
                  selectedEventName={parameter2.event_name}
                  onEventNameChange={handle_parameter2_event_change}
                />
              )}

              {parameter2.type === 'duration' && scenario_data && (
                <DurationParameter
                  scenario_data={scenario_data}
                  onValueChange={() => {}}
                  originalValue={parameter2.lower_bound}
                  selectedEventName={parameter2.event_name}
                  onEventNameChange={handle_parameter2_event_change}
                />
              )}

              {/* Numeric parameter range inputs for Parameter 2 */}
              {parameter2.type && (
                <>
                  <Heading size="sm" mt={4} mb={2}>Parameter Range</Heading>
                  <Text fontSize="sm" mb={3}>
                    Define a range for the parameter value.
                  </Text>
                  
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl id="lower-bound-2" isRequired>
                        <FormLabel>Lower Bound</FormLabel>
                        <NumberInput
                          value={parameter2.lower_bound}
                          onChange={(_, val) => set_parameter2(prev => ({ ...prev, lower_bound: val }))}
                          min={0}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl id="upper-bound-2" isRequired>
                        <FormLabel>Upper Bound</FormLabel>
                        <NumberInput
                          value={parameter2.upper_bound}
                          onChange={(_, val) => set_parameter2(prev => ({ ...prev, upper_bound: val }))}
                          min={parameter2.lower_bound}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <FormControl id="step-size-2" isRequired mt={4}>
                    <FormLabel>Step Size</FormLabel>
                    <NumberInput 
                      value={parameter2.step_size} 
                      onChange={(_, val) => set_parameter2(prev => ({ ...prev, step_size: val }))} 
                      min={1}
                      isDisabled={parameter2.lower_bound === parameter2.upper_bound}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  {parameter2.lower_bound !== parameter2.upper_bound && (
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="bold">
                        This will create {Math.floor((parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size) + 1}{' '}
                        values for parameter 2
                      </Text>
                    </Box>
                  )}

                  {(parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size > 10 && (
                    <Alert status="warning" mt={2}>
                      <AlertIcon />
                      Consider reducing the number of steps for better performance.
                    </Alert>
                  )}
                </>
              )}
            </Box>

            {/* Summary of total simulations */}
            {total_simulations > 0 && (
              <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                <FormControl id="simulations-per-combination" isRequired mb={3}>
                  <FormLabel>Simulations Per Combination</FormLabel>
                  <NumberInput 
                    value={simulations_per_combination} 
                    onChange={(_, val) => set_simulations_per_combination(val)} 
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Number of Monte Carlo simulations to run for each parameter combination
                  </Text>
                </FormControl>
                
                <Text fontWeight="bold">
                  {total_simulations} parameter combinations × {simulations_per_combination} simulations each = {total_simulations * simulations_per_combination} total simulations
                </Text>
                {total_simulations * simulations_per_combination > 200 && (
                  <Alert status="warning" mt={2}>
                    <AlertIcon />
                    Large number of simulations may take a long time to complete. Consider reducing the step sizes or simulations per combination.
                  </Alert>
                )}
              </Box>
            )}

            {parameter1.type === parameter2.type && (
              <Alert status="error">
                <AlertIcon />
                Parameters must be different for 2D exploration
              </Alert>
            )}
            
            {(parameter1.type && parameter2.type) && (
              (Math.floor((parameter1.upper_bound - parameter1.lower_bound) / parameter1.step_size) + 1) < 2 ||
              (Math.floor((parameter2.upper_bound - parameter2.lower_bound) / parameter2.step_size) + 1) < 2
            ) && (
              <Alert status="error" mt={2}>
                <AlertIcon />
                Each parameter range must include at least two values. <br/>
                Please increase the range or decrease the step size.
              </Alert>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="purple" 
            onClick={run_exploration} 
            isDisabled={!is_valid_input() || is_loading}
            isLoading={is_loading}
            loadingText="Running Simulations"
          >
            Run 2D Exploration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TwoDimensionalExploration; 