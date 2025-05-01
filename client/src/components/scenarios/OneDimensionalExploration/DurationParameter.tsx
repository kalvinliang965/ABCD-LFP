import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
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
  Box,
  Flex,
  Badge,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { ScenarioRaw } from '../../../types/Scenarios';

interface DurationParameterProps {
  scenario_data: ScenarioRaw;
  onValueChange: (newValue: number) => void;
  originalValue: number;
  selectedEventName: string;
  onEventNameChange: (name: string) => void;
}

//for simpler type checking and access
interface EventWithDuration {
  name: string;
  type: string;
  duration: { [key: string]: any };
}

type EventType = 'income' | 'expense' | 'invest' | 'rebalance';

const DurationParameter: React.FC<DurationParameterProps> = ({
  scenario_data,
  onValueChange,
  originalValue,
  selectedEventName,
  onEventNameChange,
}) => {
  const [available_events, set_available_events] = useState<Array<{ name: string; duration: number; type: string }>>([]);
  const [filtered_events, set_filtered_events] = useState<Array<{ name: string; duration: number; type: string }>>([]);
  const [duration_value, set_duration_value] = useState<number>(originalValue);
  const [selected_event_type, set_selected_event_type] = useState<EventType | ''>('');

  //different event types colors
  const color_schemes = {
    income: 'green',
    expense: 'red',
    invest: 'blue',
    rebalance: 'purple'
  };

  const bg_colors = {
    income: useColorModeValue('green.50', 'green.900'),
    expense: useColorModeValue('red.50', 'red.900'),
    invest: useColorModeValue('blue.50', 'blue.900'),
    rebalance: useColorModeValue('purple.50', 'purple.900')
  };

  const selected_bg_colors = {
    income: useColorModeValue('green.100', 'green.800'),
    expense: useColorModeValue('red.100', 'red.800'),
    invest: useColorModeValue('blue.100', 'blue.800'),
    rebalance: useColorModeValue('purple.100', 'purple.800')
  };

  useEffect(() => {
    if (!scenario_data) return;

    //filter event series with fixed duration
    const filtered_events: Array<{ name: string; duration: number; type: string }> = [];
    
    Array.from(scenario_data.eventSeries).forEach(event => {
      if (['income', 'expense', 'invest', 'rebalance'].includes(event.type)) {
        const event_with_duration = event as unknown as EventWithDuration;
        
        //check if duration is a fixed value 
        if (event_with_duration.duration && typeof event_with_duration.duration === 'object' && 
            event_with_duration.duration.type === 'fixed' && 
            typeof event_with_duration.duration.value === 'number') {
          
          filtered_events.push({
            name: event.name,
            duration: event_with_duration.duration.value,
            type: event.type
          });
        }
      }
    });

    set_available_events(filtered_events);
  }, [scenario_data]);

  //filter events based on selected event type
  useEffect(() => {
    if (selected_event_type) {
      const filtered = available_events.filter(event => event.type === selected_event_type);
      set_filtered_events(filtered);
    } else {
      set_filtered_events([]);
    }
    
    //reset selected event name when event type changes
    onEventNameChange('');
  }, [selected_event_type, available_events, onEventNameChange]);

  useEffect(() => {
    //when event is selected, set the duration value to its current duration
    if (selectedEventName) {
      const selected_event = filtered_events.find(event => event.name === selectedEventName);
      if (selected_event) {
        set_duration_value(selected_event.duration);
      }
    }
  }, [selectedEventName, filtered_events]);

  const handle_event_type_change = (value: string) => {
    set_selected_event_type(value as EventType);
  };

  const handle_event_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event_name = e.target.value;
    onEventNameChange(event_name);
  };

  const handle_duration_change = (_: string, value_as_number: number) => {
    set_duration_value(value_as_number);
    onValueChange(value_as_number);
  };

  const event_type_counts = {
    income: available_events.filter(e => e.type === 'income').length,
    expense: available_events.filter(e => e.type === 'expense').length,
    invest: available_events.filter(e => e.type === 'invest').length,
    rebalance: available_events.filter(e => e.type === 'rebalance').length
  };

  const event_type_options: Array<{ value: EventType; label: string; }> = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'invest', label: 'Investment' },
    { value: 'rebalance', label: 'Rebalance' }
  ];

  return (
    <VStack spacing={4} align="stretch">
      <Alert status="info" mb={2}>
        <AlertIcon />
        <Text fontSize="sm">
          Only events with fixed durations can be modified for one-dimensional exploration.
        </Text>
      </Alert>
      
      <FormControl isRequired>
        <FormLabel>Event Type</FormLabel>
        <Flex justifyContent="space-between" wrap="wrap" gap={2}>
          {event_type_options.map(option => (
            <Box 
              key={option.value}
              flex={{ base: '1 0 46%', md: '1' }}
              bg={selected_event_type === option.value ? selected_bg_colors[option.value] : bg_colors[option.value]}
              borderRadius="md"
              p={3}
              cursor={event_type_counts[option.value] > 0 ? "pointer" : "not-allowed"}
              opacity={event_type_counts[option.value] > 0 ? 1 : 0.5}
              onClick={() => {
                if (event_type_counts[option.value] > 0) {
                  handle_event_type_change(option.value);
                }
              }}
              border="1px solid"
              borderColor={selected_event_type === option.value ? `${color_schemes[option.value]}.500` : "transparent"}
              transition="all 0.2s"
              _hover={{
                boxShadow: event_type_counts[option.value] > 0 ? "md" : "none",
                transform: event_type_counts[option.value] > 0 ? "translateY(-2px)" : "none"
              }}
            >
              <Text fontWeight={selected_event_type === option.value ? "bold" : "normal"} color={`${color_schemes[option.value]}.600`}>
                {option.label}
              </Text>
              <Badge colorScheme={color_schemes[option.value]}>
                {event_type_counts[option.value]}
              </Badge>
            </Box>
          ))}
        </Flex>
      </FormControl>

      {selected_event_type && (
        <FormControl isRequired mt={3}>
          <FormLabel>Event Series</FormLabel>
          <Select
            placeholder={`Select a ${selected_event_type} event`}
            value={selectedEventName}
            onChange={handle_event_change}
            isDisabled={filtered_events.length === 0}
            bg={selected_event_type ? `${color_schemes[selected_event_type]}.50` : undefined}
            borderColor={selected_event_type ? `${color_schemes[selected_event_type]}.200` : undefined}
          >
            {filtered_events.map(event => (
              <option key={event.name} value={event.name}>
                {event.name}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

      {selectedEventName && (
        <>
          <Divider my={2} />
          <FormControl isRequired>
            <FormLabel>Duration (years)</FormLabel>
            <NumberInput
              value={duration_value}
              onChange={handle_duration_change}
              min={1}
              max={100}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <Alert status="info" mt={2}>
            <AlertIcon />
            <Text>
              Original duration: {filtered_events.find(e => e.name === selectedEventName)?.duration} years
            </Text>
          </Alert>
        </>
      )}
    </VStack>
  );
};

export default DurationParameter; 