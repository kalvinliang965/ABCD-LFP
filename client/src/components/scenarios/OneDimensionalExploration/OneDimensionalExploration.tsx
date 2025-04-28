// AI-generated code
// Prompt: Create an updated OneDimensionalExploration component that uses the specialized RothOptimizerParameter component

import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';

import { RothOptimizerParameter } from './index';
import InitialAmountParameter from './InitialAmountParameter';
import { scenario_service } from '../../../services/scenarioService';
import { ScenarioRaw, IncomeEventRaw, ExpenseEventRaw } from '../../../types/Scenarios';

type ParameterType =
  | 'rothOptimizer'
  | 'startYear'
  | 'duration'
  | 'initialAmount'
  | 'investmentPercentage';

interface ParameterOption {
  value: ParameterType;
  label: string;
  isNumeric: boolean;
  description: string;
}

const PARAMETER_OPTIONS: ParameterOption[] = [
  {
    value: 'rothOptimizer',
    label: 'Roth Optimizer',
    isNumeric: false,
    description: 'Toggle the Boolean flag for enabling the Roth optimizer',
  },
  {
    value: 'startYear',
    label: 'Start Year',
    isNumeric: true,
    description: 'The start year of an event series',
  },
  {
    value: 'duration',
    label: 'Duration',
    isNumeric: true,
    description: 'The duration of an event series',
  },
  {
    value: 'initialAmount',
    label: 'Initial Amount',
    isNumeric: true,
    description: 'The initial amount of an income or expense event series',
  },
  {
    value: 'investmentPercentage',
    label: 'Investment Percentage',
    isNumeric: true,
    description: 'The percentage for the first investment in a two-investment asset allocation',
  },
];

interface OneDimensionalExplorationProps {
  isOpen: boolean;
  onClose: () => void;
  scenarioId: string;
}

const OneDimensionalExploration: React.FC<OneDimensionalExplorationProps> = ({
  isOpen,
  onClose,
  scenarioId,
}) => {
  const [selectedParameter, set_selected_parameter] = useState<ParameterType | ''>('');
  const [lowerBound, set_lower_bound] = useState<number>(0);
  const [upperBound, set_upper_bound] = useState<number>(100);
  const [stepSize, set_step_size] = useState<number>(10);
  const [scenario_data, set_scenario_data] = useState<ScenarioRaw>();
  // Loading state for fetching original scenario data
  const [loading, set_loading] = useState<boolean>(false);
  const [error, set_error] = useState<string | null>(null);
  const [roth_flag, set_roth_flag] = useState<boolean>(false);

  // Track if parameter value has changed from original
  const [parameterChanged, set_parameter_changed] = useState<boolean>(false);

  const [selectedEventName, set_selected_event_name] = useState<string>('');

  const parameter_option = PARAMETER_OPTIONS.find(option => option.value === selectedParameter);
  const is_numeric_parameter = parameter_option?.isNumeric ?? false;

  // Fetch original scenario data when needed
  useEffect(() => {
    const fetch_scenario_data = async () => {
      if (!scenarioId) return;

      set_loading(true);
      set_error(null);

      try {
        const response = await scenario_service.get_scenario_by_id(scenarioId);

        if (response?.data) {
          // Extract roth optimizer value from scenario data
          // Note: This assumes the API returns the Roth optimizer flag in this format
          // Adjust the path based on your actual data structure
          set_scenario_data(response.data);
          console.log(
            'scenario_data from useEffect from fetch_scenario_data from one dimensional exploration',
            scenario_data
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
  }, [scenarioId, selectedParameter]);

  const handle_parameter_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ParameterType | '';
    set_selected_parameter(value);
    set_parameter_changed(false); // Reset change tracking
    set_selected_event_name(''); // Reset selected event

    // Reset values to appropriate defaults based on parameter type
    if (value === 'startYear') {
      set_lower_bound(2023);
      set_upper_bound(2033);
      set_step_size(1);
    } else if (value === 'duration') {
      set_lower_bound(1);
      set_upper_bound(10);
      set_step_size(1);
    } else if (value === 'investmentPercentage') {
      set_lower_bound(0);
      set_upper_bound(100);
      set_step_size(10);
    }
  };

  // Handler for Roth Optimizer value change
  const handle_roth_flag_change = (newValue: boolean) => {
    set_roth_flag(newValue);

    // Check if the new value is different from the original value
    // and update parameterChanged accordingly
    if (scenario_data) {
      set_parameter_changed(newValue !== scenario_data.RothConversionOpt);
    }
  };

  const handle_initial_amount_change = (newValue: number) => {
    if (!scenario_data) return;
    
    const selectedEvent = Array.from(scenario_data.eventSeries).find(
      event => event.name === selectedEventName && 'initialAmount' in event
    ) as IncomeEventRaw | ExpenseEventRaw | undefined;

    if (selectedEvent) {
      set_parameter_changed(newValue !== selectedEvent.initialAmount);
    }
  };

  const run_exploration = () => {
    // This would be implemented to call the backend API to run the simulations
    console.log('Running exploration with:', {
      scenarioId,
      parameterType: selectedParameter,
      isNumeric: is_numeric_parameter,
      lowerBound: selectedParameter === 'initialAmount' ? undefined : lowerBound,
      upperBound: selectedParameter === 'initialAmount' ? undefined : upperBound,
      stepSize: selectedParameter === 'initialAmount' ? undefined : stepSize,
      rothFlag: selectedParameter === 'rothOptimizer' ? roth_flag : undefined,
      initialAmount: selectedParameter === 'initialAmount' ? lowerBound : undefined,
      eventName: selectedParameter === 'initialAmount' ? selectedEventName : undefined,
    });

    // Close the modal after submission
    onClose();

    // In a real implementation, this would navigate to a results view or trigger a loading state
  };

  const is_valid_input = () => {
    if (!selectedParameter) return false;

    // For Roth optimizer, the value must be different than original
    if (selectedParameter === 'rothOptimizer') {
      return parameterChanged;
    }

    // For initial amount, we need a selected event and changed value
    if (selectedParameter === 'initialAmount') {
      return selectedEventName && parameterChanged;
    }

    if (is_numeric_parameter) {
      // Validate numeric inputs
      if (lowerBound >= upperBound) return false;
      if (stepSize <= 0) return false;
      if ((upperBound - lowerBound) / stepSize > 100) return false; // Prevent too many steps
    }

    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>One-dimensional Scenario Exploration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Select a single parameter to explore across multiple simulations. The system will run
              simulations for each value in the range you specify.
            </Text>

            <FormControl id="parameter-select" isRequired>
              <FormLabel>Scenario Parameter</FormLabel>
              <Select
                placeholder="Select parameter to explore"
                value={selectedParameter}
                onChange={handle_parameter_change}
              >
                {PARAMETER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {selectedParameter && (
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {parameter_option?.description}
                </Text>
                <Divider my={2} />
              </Box>
            )}

            {/* Conditional rendering based on selected parameter */}
            {selectedParameter === 'rothOptimizer' &&
              (loading ? (
                <Center p={6}>
                  <Spinner size="md" mr={3} />
                  <Text>Loading scenario data...</Text>
                </Center>
              ) : error ? (
                <Alert status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              ) : scenario_data ? (
                <RothOptimizerParameter
                  originalValue={scenario_data.RothConversionOpt}
                  onValueChange={handle_roth_flag_change}
                />
              ) : (
                <Alert status="warning">
                  <AlertIcon />
                  No scenario data available
                </Alert>
              ))}

            {selectedParameter === 'initialAmount' && scenario_data && (
              <InitialAmountParameter
                scenario_data={scenario_data}
                onValueChange={handle_initial_amount_change}
                originalValue={lowerBound}
                selectedEventName={selectedEventName}
                onEventNameChange={set_selected_event_name}
              />
            )}

            {selectedParameter && selectedParameter !== 'rothOptimizer' && selectedParameter !== 'initialAmount' && (
              <>
                <FormControl id="lower-bound" isRequired>
                  <FormLabel>Lower Bound</FormLabel>
                  <NumberInput
                    value={lowerBound}
                    onChange={(_, val) => set_lower_bound(val)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl id="upper-bound" isRequired>
                  <FormLabel>Upper Bound</FormLabel>
                  <NumberInput
                    value={upperBound}
                    onChange={(_, val) => set_upper_bound(val)}
                    min={lowerBound + stepSize}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl id="step-size" isRequired>
                  <FormLabel>Step Size</FormLabel>
                  <NumberInput value={stepSize} onChange={(_, val) => set_step_size(val)} min={1}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {is_numeric_parameter && (
                  <Box mt={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      This will create {Math.floor((upperBound - lowerBound) / stepSize) + 1}{' '}
                      simulation runs
                    </Text>
                  </Box>
                )}

                {(upperBound - lowerBound) / stepSize > 50 && (
                  <Alert status="warning">
                    <AlertIcon />
                    Large number of steps may cause performance issues. Consider increasing the step
                    size.
                  </Alert>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={run_exploration} isDisabled={!is_valid_input()}>
            Run Exploration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OneDimensionalExploration;
