import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ScenarioRaw, IncomeEventRaw, ExpenseEventRaw } from '../../../types/Scenarios';

interface InitialAmountParameterProps {
  scenario_data: ScenarioRaw;
  onValueChange: (newValue: number) => void;
  originalValue: number;
  selectedEventName: string;
  onEventNameChange: (eventName: string) => void;
}

const InitialAmountParameter: React.FC<InitialAmountParameterProps> = ({
  scenario_data,
  onValueChange,
  originalValue,
  selectedEventName,
  onEventNameChange,
}) => {
  const [event_type, set_event_type] = useState<'income' | 'expense'>('income');
  const [current_value, set_current_value] = useState<number>(originalValue);
  const [selected_event, set_selected_event] = useState<IncomeEventRaw | ExpenseEventRaw | null>(null);

  //filter events based on type and ensure they have initialAmount
  const filtered_events = Array.from(scenario_data.eventSeries).filter(
    event => event.type === event_type && 'initialAmount' in event
  ) as (IncomeEventRaw | ExpenseEventRaw)[];

  //update selected event when event name changes
  useEffect(() => {
    const event = filtered_events.find(e => e.name === selectedEventName);
    if (event) {
      set_selected_event(event);
      //only set the initial value if we haven't selected an event before
      if (!selected_event) {
        set_current_value(event.initialAmount);
        onValueChange(event.initialAmount);
      }
    } else {
      set_selected_event(null);
      set_current_value(originalValue);
    }
  }, [selectedEventName, filtered_events, originalValue, onValueChange, selected_event]);

  const handle_event_type_change = (value: string) => {
    set_event_type(value as 'income' | 'expense');
    onEventNameChange(''); //reset selected event when type changes
    set_selected_event(null);
    set_current_value(originalValue);
  };

  const handle_event_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event_name = e.target.value;
    onEventNameChange(event_name);
  };

  const handle_amount_change = (value: number) => {
    set_current_value(value);
    onValueChange(value);
  };

  const has_value_changed = selected_event ? current_value !== selected_event.initialAmount : false;

  const changed_bg = useColorModeValue('green.50', 'green.900');
  const unchanged_bg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={4} align="stretch">
      <Box
        p={4}
        borderRadius="md"
        bg={has_value_changed ? changed_bg : unchanged_bg}
        borderLeft={has_value_changed ? '4px solid green.400' : 'none'}
      >
        <Text fontWeight="medium" mb={3}>
          Original scenario setting:
        </Text>
        <Text>
          {selected_event ? `${selected_event.name}: $${selected_event.initialAmount}` : 'No event selected'}
        </Text>
      </Box>

      <FormControl>
        <FormLabel>Event Type</FormLabel>
        <RadioGroup value={event_type} onChange={handle_event_type_change}>
          <VStack align="start" spacing={2}>
            <Radio value="income">Income Event</Radio>
            <Radio value="expense">Expense Event</Radio>
          </VStack>
        </RadioGroup>
      </FormControl>

      <FormControl>
        <FormLabel>Select Event</FormLabel>
        <Select
          placeholder="Select an event"
          value={selectedEventName}
          onChange={handle_event_change}
        >
          {filtered_events.map(event => (
            <option key={event.name} value={event.name}>
              {event.name}
            </option>
          ))}
        </Select>
      </FormControl>

      {selected_event && (
        <FormControl>
          <FormLabel>Initial Amount</FormLabel>
          <NumberInput
            value={current_value}
            onChange={(_, value) => handle_amount_change(value)}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}

      {selected_event && !has_value_changed && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          The selected value is the same as the original setting. Change it to enable comparison.
        </Alert>
      )}
    </VStack>
  );
};

export default InitialAmountParameter; 