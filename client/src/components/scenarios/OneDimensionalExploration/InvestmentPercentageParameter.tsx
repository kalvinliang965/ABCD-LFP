import React, { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Select,
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
import { ScenarioRaw, InvestmentEventRaw } from '../../../types/Scenarios';

interface InvestmentPercentageParameterProps {
  scenario_data: ScenarioRaw;
  onValueChange: (newValue: number) => void;
  originalValue: number;
  selectedEventName: string;
  onEventNameChange: (name: string) => void;
}

//helper to normalize allocation to a simple Record<string, number>
const normalize_allocation = (allocation: any): Record<string, number> => {
  if (Array.isArray(allocation)) {
    return allocation.reduce((acc, { type, value }) => {
      acc[type] = value;
      return acc;
    }, {} as Record<string, number>);
  }
  return { ...allocation }; //ATTN: assume it's already { [key]: number } recheck after merge
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
  name: string;
  raw: InvestmentEventRaw;
  start: Record<string, number>;
  end: Record<string, number>;
  has_glide_path: boolean;
  percentage: number; //first investment percentage
}

const InvestmentPercentageParameter: React.FC<InvestmentPercentageParameterProps> = ({
  scenario_data,
  onValueChange,
  originalValue,
  selectedEventName,
  onEventNameChange,
}) => {
  const [available_events, set_available_events] = useState<NormalizedEvent[]>([]);
  
  //investment events have a blue theme
  const color_scheme = 'blue';
  const bg_color = useColorModeValue('blue.50', 'blue.900');
  const selected_bg_color = useColorModeValue('blue.100', 'blue.800');

  useEffect(() => {
    if (!scenario_data) return;

    //find and normalize investment events with exactly two non-zero allocations
    const filtered_events: NormalizedEvent[] = [];
    
    Array.from(scenario_data.eventSeries)
      .filter((event): event is InvestmentEventRaw => event.type === 'invest')
      .forEach(event => {
        const start = normalize_allocation((event as any).assetAllocation);
        const end = normalize_allocation((event as any).assetAllocation2 || (event as any).assetAllocation);
        const has_glide_path = (event as any).glidePath === true && 
                            JSON.stringify(start) !== JSON.stringify(end);
                            
        //only include events with exactly 2 allocations
        if (count_non_zero_allocations(start) === 2 || count_non_zero_allocations(end) === 2) {
          //get the first non-zero allocation as the percentage (0-1 scale)
          const first_non_zero = Object.entries(start).find(([_, value]) => value > 0);
          const percentage = first_non_zero ? first_non_zero[1] * 100 : 0;
          
          filtered_events.push({ 
            name: event.name, 
            raw: event, 
            start, 
            end, 
            has_glide_path,
            percentage
          });
        }
      });

    set_available_events(filtered_events);
  }, [scenario_data]);

  useEffect(() => {
    //when event is selected, update the parent with the event's original percentage
    if (selectedEventName) {
      const selected_event = available_events.find(event => event.name === selectedEventName);
      if (selected_event) {
        onValueChange(selected_event.percentage);
      }
    }
  }, [selectedEventName, available_events, onValueChange]);

  const handle_event_change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event_name = e.target.value;
    onEventNameChange(event_name);
  };

  //get selected event
  const selected_event = available_events.find(e => e.name === selectedEventName);

  return (
    <VStack spacing={4} align="stretch">
      <Alert status="info" mb={2}>
        <AlertIcon />
        <Text fontSize="sm">
          Only investment events with exactly two assets can be modified for one-dimensional exploration.
        </Text>
      </Alert>

      <FormControl isRequired mt={3}>
        <FormLabel>Investment Event</FormLabel>
        <Select
          placeholder="Select an investment event"
          value={selectedEventName}
          onChange={handle_event_change}
          isDisabled={available_events.length === 0}
          bg={`${color_scheme}.50`}
          borderColor={`${color_scheme}.200`}
        >
          {available_events.map(event => (
            <option key={event.name} value={event.name}>
              {event.name}{event.has_glide_path ? " (Glide Path)" : ""}
            </option>
          ))}
        </Select>
      </FormControl>

      {selectedEventName && selected_event && (
        <>
          <Divider my={2} />
          <Box p={3} bg={selected_bg_color}>
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Original asset allocation:
            </Text>
            <Text fontSize="sm">
              {format_allocation(selected_event.start)}
            </Text>
            {selected_event.has_glide_path && (
              <>
                <Text fontSize="sm" fontWeight="medium" mt={2} mb={1}>
                  Ending allocation (glide path):
                </Text>
                <Text fontSize="sm">
                  {format_allocation(selected_event.end)}
                </Text>
              </>
            )}
            <Text fontSize="sm" mt={2}>
              First investment percentage:{' '}
              <Badge colorScheme={color_scheme}>
                {selected_event.percentage.toFixed(0)}%
              </Badge>
            </Text>
          </Box>
        </>
      )}

      {available_events.length === 0 && (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          No investment events found with exactly two non-zero allocations. This parameter can only be used with investment events that have exactly two investments in their allocation.
        </Alert>
      )}
    </VStack>
  );
};

export default InvestmentPercentageParameter; 