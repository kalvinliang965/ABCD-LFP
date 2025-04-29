import React, { useState, useEffect } from 'react';
import {
  Box,
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
  useColorModeValue,
} from '@chakra-ui/react';
import { ScenarioRaw, InvestmentEventRaw, EventRaw } from '../../../types/Scenarios';

interface InvestmentPercentageParameterProps {
  scenario_data: ScenarioRaw;
  onValueChange: (newValue: number) => void;
  originalValue: number;
  selectedEventName: string;
  onEventNameChange: (eventName: string) => void;
}

//helper to normalize allocation to a simple Record<string, number>
const normalize_allocation = (allocation: any): Record<string, number> => {
  if (Array.isArray(allocation)) {
    return allocation.reduce((acc, { type, value }) => {
      acc[type] = value;
      return acc;
    }, {} as Record<string, number>);
  }
  return { ...allocation }; //assume it's already { [key]: number }
};

//count non-zero allocations in a normalized allocation object
const count_non_zero_allocations = (allocation: Record<string, number>): number => {
  return Object.values(allocation).filter(value => value > 0).length;
};

//format allocations for display
const format_allocation = (allocation: Record<string, number>): string => {
  return Object.entries(allocation)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
    .join(' / ');
};

interface NormalizedEvent {
  raw: InvestmentEventRaw;
  start: Record<string, number>;
  end: Record<string, number>;
  has_glide_path: boolean;
}

const InvestmentPercentageParameter: React.FC<InvestmentPercentageParameterProps> = ({
  scenario_data,
  onValueChange,
  originalValue,
  selectedEventName,
  onEventNameChange,
}) => {
  //state to track user-entered value separately from initialization
  const [current_value, set_current_value] = useState<number>(originalValue);
  const [selected_event, set_selected_event] = useState<InvestmentEventRaw | null>(null);
  //track if the value has been initialized from the selected event
  const [is_initialized, set_is_initialized] = useState<boolean>(false);

  //find and normalize investment events with exactly two non-zero allocations in either start or end
  const valid_investment_events: NormalizedEvent[] = Array.from(scenario_data.eventSeries)
    .filter((event): event is InvestmentEventRaw => event.type === 'invest')
    .map(event => {
      const start = normalize_allocation((event as any).assetAllocation);
      const end = normalize_allocation((event as any).assetAllocation2 || (event as any).assetAllocation);
      const has_glide_path = (event as any).glidePath === true && 
                          JSON.stringify(start) !== JSON.stringify(end);
      return { raw: event, start, end, has_glide_path };
    })
    .filter(({ start, end }) => 
      count_non_zero_allocations(start) === 2 || count_non_zero_allocations(end) === 2
    );

  //update selected event when event name changes
  useEffect(() => {
    const event = valid_investment_events.find(e => e.raw.name === selectedEventName);
    if (event) {
      set_selected_event(event.raw);
      //only set the initial value when first selecting the event
      if (!is_initialized || selectedEventName !== selected_event?.name) {
        const first_non_zero = Object.entries(event.start).find(([_, value]) => value > 0);
        if (first_non_zero) {
          const [_, value] = first_non_zero;
          const initial_value = value * 100;
          set_current_value(initial_value);
          onValueChange(initial_value);
          set_is_initialized(true);
        }
      }
    } else {
      set_selected_event(null);
      set_current_value(originalValue);
      set_is_initialized(false);
    }
  }, [selectedEventName, valid_investment_events, originalValue]);

  const handle_event_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event_name = e.target.value;
    onEventNameChange(event_name);
  };

  const handle_percentage_change = (value: number) => {
    //ensure value is within 0-100 range and not NaN
    if (isNaN(value)) {
      //default to 0 if input is empty or NaN
      set_current_value(0);
      onValueChange(0);
      return;
    }
    
    const clamped_value = Math.max(0, Math.min(100, value));
    set_current_value(clamped_value);
    onValueChange(clamped_value);
  };

  //find normalized version of selected event
  const normalized_selected = selected_event 
    ? valid_investment_events.find(e => e.raw === selected_event)
    : null;

  //get the original value for the selected event
  const get_original_value = () => {
    if (!normalized_selected) return 0;
    const first_non_zero = Object.values(normalized_selected.start).find(v => v > 0);
    return first_non_zero ? first_non_zero * 100 : 0;
  };

  const original_value = get_original_value();
  const has_value_changed = current_value !== original_value;

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
          {normalized_selected ? (
            <>
              {normalized_selected.raw.name}<br />
              Start: {format_allocation(normalized_selected.start)}<br />
              {normalized_selected.has_glide_path && 
                `End: ${format_allocation(normalized_selected.end)}`}
            </>
          ) : (
            'No event selected'
          )}
        </Text>
      </Box>

      <FormControl>
        <FormLabel>Select Investment Event</FormLabel>
        <Select
          placeholder="Select an investment event"
          value={selectedEventName}
          onChange={handle_event_change}
          isDisabled={false} //never disable the dropdown
        >
          {valid_investment_events.map(({ raw, has_glide_path }) => (
            <option key={raw.name} value={raw.name}>
              {raw.name}{has_glide_path ? " (Glide Path)" : ""}
            </option>
          ))}
        </Select>
        {has_value_changed && (
          <Text fontSize="sm" color="orange.500" mt={1}>
            Note: Changing the event will discard your current changes.
          </Text>
        )}
      </FormControl>

      {selected_event && (
        <FormControl>
          <FormLabel>First Investment Percentage</FormLabel>
          <NumberInput
            value={current_value}
            onChange={(value_string, value_number) => {
              handle_percentage_change(value_number);
            }}
            min={0}
            max={100}
            keepWithinRange={true}
            clampValueOnBlur={true}
            isInvalid={isNaN(current_value) || current_value < 0 || current_value > 100}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text mt={2} fontSize="sm" color="gray.600">
            Second investment will be automatically set to {isNaN(current_value) ? "100" : (100 - current_value).toFixed(0)}%
          </Text>
          {(isNaN(current_value) || current_value < 0 || current_value > 100) && (
            <Text color="red.500" fontSize="sm" mt={1}>
              Value must be a number between 0% and 100%
            </Text>
          )}
        </FormControl>
      )}

      {valid_investment_events.length === 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          No investment events found with exactly two non-zero allocations. This parameter can only be used with investment events that have exactly two investments in their allocation.
        </Alert>
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

export default InvestmentPercentageParameter; 