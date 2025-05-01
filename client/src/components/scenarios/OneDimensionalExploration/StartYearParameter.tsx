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

interface StartYearParameterProps {
  scenario_data: ScenarioRaw;
  onValueChange: (newValue: number) => void;
  originalValue: number;
  selectedEventName: string;
  onEventNameChange: (name: string) => void;
}

//for simpler type checking and access
interface EventWithStart {
  name: string;
  type: string;
  start: { [key: string]: any };
}

type EventType = 'income' | 'expense' | 'invest' | 'rebalance';

const StartYearParameter: React.FC<StartYearParameterProps> = ({
  scenario_data,
  onValueChange,
  originalValue,
  selectedEventName,
  onEventNameChange,
}) => {
  const [available_events, set_available_events] = useState<Array<{ name: string; startYear: number; type: string }>>([]);
  const [filtered_events, set_filtered_events] = useState<Array<{ name: string; startYear: number; type: string }>>([]);
  const [year_value, set_year_value] = useState<number>(originalValue);
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

    //filter event series with fixed startYear
    const filtered_events: Array<{ name: string; startYear: number; type: string }> = [];
    
    Array.from(scenario_data.eventSeries).forEach(event => {
      if (['income', 'expense', 'invest', 'rebalance'].includes(event.type)) {
        const event_with_start = event as unknown as EventWithStart;
        
        //check if start is a fixed value
        if (event_with_start.start && typeof event_with_start.start === 'object' && 
            event_with_start.start.type === 'fixed' && 
            typeof event_with_start.start.value === 'number') {
          
          filtered_events.push({
            name: event.name,
            startYear: event_with_start.start.value,
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
    //when event is selected, set the year value to its current start year
    if (selectedEventName) {
      const selected_event = filtered_events.find(event => event.name === selectedEventName);
      if (selected_event) {
        set_year_value(selected_event.startYear);
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

  const handle_year_change = (_: string, value_as_number: number) => {
    set_year_value(value_as_number);
    onValueChange(value_as_number);
  };

  //count events by type to show in radio buttons
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
          Only events with fixed start years can be modified for one-dimensional exploration.
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
            <FormLabel>Start Year</FormLabel>
            <NumberInput
              value={year_value}
              onChange={handle_year_change}
              min={2000}
              max={2100}
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
              Original start year: {filtered_events.find(e => e.name === selectedEventName)?.startYear}
            </Text>
          </Alert>
        </>
      )}
    </VStack>
  );
};

export default StartYearParameter; 