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
  useToast,
  Heading,
} from '@chakra-ui/react';

import { 
  RothOptimizerParameter, 
  StartYearParameter, 
  DurationParameter,
  InitialAmountParameter,
  InvestmentPercentageParameter 
} from './index';
import { scenario_service } from '../../../services/scenarioService';
import { ScenarioRaw, IncomeEventRaw, ExpenseEventRaw, InvestmentEventRaw } from '../../../types/Scenarios';

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
    description: 'The fixed duration of an event series',
  },
  {
    value: 'initialAmount',
    label: 'Initial Amount',
    isNumeric: true,
    description: 'The fixed initial amount of an income or expense event series',
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
  onExplorationComplete?: (results: any) => void;
}

const OneDimensionalExploration: React.FC<OneDimensionalExplorationProps> = ({
  isOpen,
  onClose,
  scenarioId,
  onExplorationComplete,
}) => {
  const [selectedParameter, set_selected_parameter] = useState<ParameterType | ''>('');
  const [lower_bound, set_lower_bound] = useState<number>(0);
  const [upper_bound, set_upper_bound] = useState<number>(100);
  const [step_size, set_step_size] = useState<number>(10);
  const [scenario_data, set_scenario_data] = useState<ScenarioRaw>();
  //loading state for fetching original scenario data
  const [loading, set_loading] = useState<boolean>(false);
  const [error, set_error] = useState<string | null>(null);
  const [roth_flag, set_roth_flag] = useState<boolean>(false);

  //track if parameter value has changed from original
  const [parameter_changed, set_parameter_changed] = useState<boolean>(false);

  const [selected_event_name, set_selected_event_name] = useState<string>('');
  const [start_year_value, set_start_year_value] = useState<number>(0);
  const [duration_value, set_duration_value] = useState<number>(0);
  const [simulations_per_value, set_simulations_per_value] = useState<number>(5);

  const [exploration_results, set_exploration_results] = useState<any[]>([]);
  const [is_loading, set_is_loading] = useState<boolean>(false);
  const toast = useToast();

  const parameter_option = PARAMETER_OPTIONS.find(option => option.value === selectedParameter);
  const is_numeric_parameter = parameter_option?.isNumeric ?? false;

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
    set_parameter_changed(false); //reset change tracking
    set_selected_event_name(''); //reset selected event

    //reset values to appropriate defaults based on parameter type
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
    } else if (value === 'initialAmount') {
      set_lower_bound(1000);
      set_upper_bound(10000);
      set_step_size(1000);
    }
  };

  //handler for Roth Optimizer value change
  const handle_roth_flag_change = (new_value: boolean) => {
    set_roth_flag(new_value);

    //check if the new value is different from the original value
    //and update parameter_changed accordingly
    if (scenario_data) {
      set_parameter_changed(new_value !== scenario_data.RothConversionOpt);
    }
  };

  const handle_initial_amount_change = (new_value: number) => {
    if (!scenario_data) return;
    
    const selected_event = Array.from(scenario_data.eventSeries).find(
      event => event.name === selected_event_name && 'initialAmount' in event
    ) as IncomeEventRaw | ExpenseEventRaw | undefined;

    if (selected_event) {
      set_parameter_changed(new_value !== selected_event.initialAmount);
    }
  };

  const handle_investment_percentage_change = (new_value: number) => {
    if (!scenario_data) return;
    
    //find the raw invest event
    const selected_event = Array.from(scenario_data.eventSeries).find(
      (event): event is InvestmentEventRaw => 
        event.type === 'invest' && event.name === selected_event_name
    );

    if (selected_event) {
      //normalize whatever shape assetAllocation has into a simple key->value map
      const alloc_raw = (selected_event as any).assetAllocation;
      const alloc_map: Record<string, number> = Array.isArray(alloc_raw)
        ? alloc_raw.reduce((m, { type, value }) => ({ ...m, [type]: value }), {})
        : { ...alloc_raw };

      //pick out the first non-zero entry
      const first_non_zero = Object.values(alloc_map).find(v => v > 0) ?? 0;

      //compare new_value (0-100) to that *100
      set_parameter_changed(new_value !== first_non_zero * 100);
    }
  };

  //handler for Start Year value change
  const handle_start_year_change = (new_value: number) => {
    if (!scenario_data) return;
    set_start_year_value(new_value);

    //find the selected event
    const selected_event = Array.from(scenario_data.eventSeries).find(
      event => event.name === selected_event_name
    );

    if (selected_event) {
      //check if start field exists and is a proper object
      const event_with_start = selected_event as any;
      if (event_with_start.start && typeof event_with_start.start === 'object' && 
          event_with_start.start.type === 'fixed' && 
          typeof event_with_start.start.value === 'number') {
        
        //compare the new value with the original start year value
        set_parameter_changed(new_value !== event_with_start.start.value);
      }
    }
  };

  //handler for Duration value change
  const handle_duration_change = (new_value: number) => {
    if (!scenario_data) return;
    set_duration_value(new_value);

    //find the selected event
    const selected_event = Array.from(scenario_data.eventSeries).find(
      event => event.name === selected_event_name
    );

    if (selected_event) {
      //check if duration field exists and is a proper object
      const event_with_duration = selected_event as any;
      if (event_with_duration.duration && typeof event_with_duration.duration === 'object' && 
          event_with_duration.duration.type === 'fixed' && 
          typeof event_with_duration.duration.value === 'number') {
        
        //compare the new value with the original duration value
        set_parameter_changed(new_value !== event_with_duration.duration.value);
      }
    }
  };

  const run_exploration = async () => {
    //clear old state before starting a new sweep
    set_exploration_results([]);
    set_error(null);
    set_is_loading(true);

    //build the payload
    const payload: any = {
      scenarioId,
      parameterType: selectedParameter,
      numSimulations: simulations_per_value
    };

    if (selectedParameter === 'rothOptimizer') {
      //for boolean flag, just send a single value
      payload.value = roth_flag;
    } else {
      //for all numeric parameters
      //add eventName for event-related parameters
      payload.eventName = selected_event_name;
      
      //always use range for numeric parameters
      payload.range = {
        lower: lower_bound,
        upper: upper_bound,
        step: step_size <= 0 ? 1 : step_size,
      };
    }

    console.log('Running exploration with:', payload);
    
    try {
      const sweep = await scenario_service.simulate_parameter_sweep(payload);
      set_exploration_results(sweep);
      console.log('Exploration results:', sweep);
      
      console.log('Parameter sweep details:');
      console.table(sweep.data.map((item: any) => ({
        parameter_value: item.param,
        success_probability: item.results?.successProbability || 'N/A',
        error: item.error || 'None'
      })));
      
      toast({
        title: "Exploration completed",
        description: "Parameter sweep simulation has completed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      //pass results to parent component if callback provided
      if (onExplorationComplete) {
        onExplorationComplete(sweep);
      }
    } catch (err) {
      console.error('Simulation parameter sweep failed:', err);
      set_error(err instanceof Error ? err.message : String(err));
      toast({
        title: "Exploration failed",
        description: `Failed to run parameter sweep: ${err instanceof Error ? err.message : String(err)}`,
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

  const is_valid_input = () => {
    if (!selectedParameter) return false;

    //for Roth optimizer, the value must be different than original
    if (selectedParameter === 'rothOptimizer') {
      return parameter_changed;
    }
    
    //numeric parameters
    if (is_numeric_parameter) {
      if (['startYear', 'duration', 'initialAmount', 'investmentPercentage'].includes(selectedParameter) && 
          !selected_event_name) {
        return false;
      }
      
      if (lower_bound > upper_bound) return false;
      
      //check step size
      if (step_size <= 0) return false;
      
      //check for too many steps
      if ((upper_bound - lower_bound) / step_size > 100) return false;
      
      //additional constraint for investment percentage
      if (selectedParameter === 'investmentPercentage' && (lower_bound < 0 || upper_bound > 100)) {
        return false;
      }
      
      return true;
    }

    return true;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>1D Scenario Exploration</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Text>
              Select a parameter to explore. The system will run simulations for each value in the range.
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
                originalValue={lower_bound}
                selectedEventName={selected_event_name}
                onEventNameChange={set_selected_event_name}
              />
            )}

            {selectedParameter === 'investmentPercentage' && scenario_data && (
              <InvestmentPercentageParameter
                scenario_data={scenario_data}
                onValueChange={handle_investment_percentage_change}
                originalValue={lower_bound}
                selectedEventName={selected_event_name}
                onEventNameChange={set_selected_event_name}
              />
            )}

            {selectedParameter === 'startYear' && scenario_data && (
              <StartYearParameter
                scenario_data={scenario_data}
                onValueChange={handle_start_year_change}
                originalValue={start_year_value}
                selectedEventName={selected_event_name}
                onEventNameChange={set_selected_event_name}
              />
            )}

            {selectedParameter === 'duration' && scenario_data && (
              <DurationParameter
                scenario_data={scenario_data}
                onValueChange={handle_duration_change}
                originalValue={duration_value}
                selectedEventName={selected_event_name}
                onEventNameChange={set_selected_event_name}
              />
            )}

            {/*unified range inputs for all numeric parameters */}
            {is_numeric_parameter && selectedParameter !== 'rothOptimizer' && (
              <>
                <Heading size="sm" mt={4} mb={2}>Parameter Range</Heading>
                <Text fontSize="sm" mb={3}>
                  Define a range for the parameter value.
                </Text>
                
                <FormControl id="lower-bound" isRequired>
                  <FormLabel>Lower Bound</FormLabel>
                  <NumberInput
                    value={lower_bound}
                    onChange={(_, val) => {
                      set_lower_bound(val);
                    }}
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
                    value={upper_bound}
                    onChange={(_, val) => set_upper_bound(val)}
                    min={lower_bound}
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
                  <NumberInput 
                    value={step_size} 
                    onChange={(_, val) => set_step_size(val)} 
                    min={1}
                    isDisabled={lower_bound === upper_bound}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl id="simulations-per-value" isRequired mt={4}>
                  <FormLabel>Simulations Per Value</FormLabel>
                  <NumberInput 
                    value={simulations_per_value} 
                    onChange={(_, val) => set_simulations_per_value(val)} 
                    min={1}
                    max={100}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Number of Monte Carlo simulations to run for each parameter value
                  </Text>
                </FormControl>

                {lower_bound !== upper_bound && (
                  <Box mt={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      This will create {Math.floor((upper_bound - lower_bound) / step_size) + 1}{' '}
                      parameter values × {simulations_per_value} simulations each = {' '}
                      {(Math.floor((upper_bound - lower_bound) / step_size) + 1) * simulations_per_value}{' '}
                      total simulations
                    </Text>
                  </Box>
                )}

                {(upper_bound - lower_bound) / step_size > 50 && (
                  <Alert status="warning">
                    <AlertIcon />
                    Large number of steps may cause performance issues. Consider increasing the step size.
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
