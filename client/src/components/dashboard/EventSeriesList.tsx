import React from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  useColorModeValue,
  Text
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import EventSeriesItem from '../EventSeriesItem';

interface EventSeries {
  id: number;
  name: string;
  description?: string;
  type: 'income' | 'expense' | 'invest' | 'rebalance';
  startYear: string | number;
  duration: string | number;
  initialAmount?: string;
  annualChange?: string;
  inflationAdjusted?: boolean;
  isSocialSecurity?: boolean;
  isDiscretionary?: boolean;
  assetAllocation?: { investment: string; percentage: number }[];
  maxCash?: string;
}

interface EventSeriesListProps {
  eventSeries: EventSeries[];
  onOpenEventModal: () => void;
}

const EventSeriesList: React.FC<EventSeriesListProps> = ({
  eventSeries,
  onOpenEventModal
}) => {
  return (
    <Box mb={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Event Series</Heading>
        <Button 
          leftIcon={<Icon as={FaPlus} />} 
          colorScheme="blue" 
          size="sm"
          onClick={onOpenEventModal}
        >
          Add Event Series
        </Button>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {eventSeries.map((event) => (
          <EventSeriesItem
            key={event.id}
            name={event.name}
            description={event.description}
            type={event.type}
            startYear={event.startYear}
            duration={event.duration}
            amount={event.initialAmount}
            annualChange={event.annualChange}
            inflationAdjusted={event.inflationAdjusted}
            isSocialSecurity={event.isSocialSecurity}
            isDiscretionary={event.isDiscretionary}
            assetAllocation={event.assetAllocation}
            maxCash={event.maxCash}
          />
        ))}
        
        <Box
          p={5}
          height="100%"
          borderWidth="1px"
          borderRadius="lg"
          borderStyle="dashed"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
          onClick={onOpenEventModal}
        >
          <Icon as={FaPlus} boxSize={8} mb={3} color="gray.400" />
          <Text color="gray.500">Add New Event Series</Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default EventSeriesList; 