import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  HStack,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { Building2, Wallet, TrendingUp, BarChart } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useEventSeries } from '../../contexts/EventSeriesContext';
import { EventSeriesType, EventSeries } from '../../types/eventSeries';
import { InvestmentRaw } from '../../types/Scenarios';

import { EventSeriesForm } from './EventSeriesForm';

const eventTypeOptions = [
  {
    id: 'income',
    name: 'Income',
    description: 'Regular or one-time income sources',
    icon: Building2,
    header: 'Sources of Income',
    subheader:
      'Do your best to think of every source of income you expect to have throughout your life. Use the Income widget below to add different kinds of income streams. Some may happen one time, others may occur annually or monthly, and may increase or decrease over time.',
  },
  {
    id: 'expense',
    name: 'Expense',
    description: 'Regular or one-time expenses',
    icon: Wallet,
    header: 'Expenses',
    subheader:
      'Add your expected expenses throughout your life. Consider both regular recurring expenses and one-time costs. Remember to account for changes in expenses over time.',
  },
  {
    id: 'invest',
    name: 'Investment Strategy',
    description: 'Define how to invest excess cash',
    icon: TrendingUp,
    header: 'Investment Strategy',
    subheader:
      'Define how your excess cash should be invested. Set your asset allocation and maximum cash holdings to automate your investment strategy.',
  },
  {
    id: 'rebalance',
    name: 'Rebalancing Strategy',
    description: 'Define how to rebalance investments',
    icon: BarChart,
    header: 'Rebalancing Strategy',
    subheader:
      'Specify how your investment portfolio should be rebalanced over time. Set target allocations and conditions for maintaining your desired investment mix.',
  },
];

export interface AddedEvent extends Omit<EventSeries, 'id'> {
  id?: string;
  _id?: string;
}

interface EventSeriesSectionProps {
  addedEvents: AddedEvent[];
  handleDeleteEvent: (id: string) => Promise<void>;
  handleSaveAndContinue: () => void;
  handleBackToInvestments: () => void;
  handleEventAdded: (event: AddedEvent) => void;
  investments?: InvestmentRaw[];
}

const EventSeriesSection: React.FC<EventSeriesSectionProps> = ({
  addedEvents,
  handleDeleteEvent,
  handleSaveAndContinue,
  handleBackToInvestments,
  handleEventAdded,
  investments = [], //default to empty array if not provided
}) => {
  const { selectedType, setSelectedType } = useEventSeries();
  const [existingEvents, setExistingEvents] = useState<{ name: string }[]>([]);

  //use local state for existing events instead of fetching from API
  useEffect(() => {
    //convert addedEvents to the format needed for existingEvents
    const events = addedEvents.map(event => ({
      name: event.name,
    }));
    setExistingEvents(events);
  }, [addedEvents]);

  if (!selectedType) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Box maxW="4xl" mx="auto" py={12} px={4}>
          <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
            <Box p={6}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.900">
                  New Event Series
                </Heading>
                <HStack spacing={4} justify="flex-end" mt={6}>
                  <Button variant="ghost" onClick={handleBackToInvestments}>
                    Back
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSaveAndContinue}
                    bg="blue.500"
                    _hover={{ bg: 'blue.600' }}
                    _active={{ bg: 'blue.700' }}
                  >
                    Continue
                  </Button>
                </HStack>
              </Flex>
              {addedEvents.length > 0 && (
                <VStack spacing={4} mb={8} align="stretch">
                  <Heading size="md" color="gray.700">
                    Added Events
                  </Heading>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    {addedEvents.map(event => (
                      <Flex
                        key={event.id || event._id}
                        p={4}
                        bg="white"
                        borderRadius="md"
                        shadow="sm"
                        mb={2}
                        justify="space-between"
                        align="center"
                      >
                        <Box>
                          <Text fontWeight="medium">{event.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            ${event.initialAmount} • Starting{' '}
                            {event.startYear.type === 'fixed' ? event.startYear.value : 'Variable'}{' '}
                            • {event.duration.type === 'fixed' ? event.duration.value : 'Variable'}{' '}
                            years
                          </Text>
                        </Box>
                        <HStack>
                          <Text
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="sm"
                            bg={
                              event.type === 'income'
                                ? 'green.100'
                                : event.type === 'expense'
                                  ? 'red.100'
                                  : 'blue.100'
                            }
                            color={
                              event.type === 'income'
                                ? 'green.700'
                                : event.type === 'expense'
                                  ? 'red.700'
                                  : 'blue.700'
                            }
                          >
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Text>
                          <IconButton
                            aria-label="Delete event"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteEvent(event.id || event._id || '')}
                          />
                        </HStack>
                      </Flex>
                    ))}
                  </Box>
                </VStack>
              )}
              <Text color="gray.600" mb={6}>
                Select the type of event series you want to add to your financial plan.
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {eventTypeOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <Box
                      key={option.id}
                      as="button"
                      onClick={() => setSelectedType(option.id as EventSeriesType)}
                      bg="white"
                      p={6}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: 'blue.500', bg: 'blue.50' }}
                      transition="all 0.2s"
                      height="100%"
                      textAlign="left"
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                    >
                      <Icon as={IconComponent} w={8} h={8} color="blue.500" mb={4} />
                      <Text fontSize="xl" fontWeight="semibold" color="gray.900" mb={2}>
                        {option.name}
                      </Text>
                      <Text color="gray.600">{option.description}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const typeInfo = eventTypeOptions.find(opt => opt.id === selectedType)!;
  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="4xl" mx="auto" py={12} px={4}>
        <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
          <Box p={6}>
            <Button
              onClick={() => setSelectedType(null)}
              variant="ghost"
              colorScheme="blue"
              mb={6}
              leftIcon={<Text>←</Text>}
            >
              Back to event types
            </Button>
            <Heading size="xl" color="gray.900">
              {typeInfo.header}
            </Heading>
            <Text mt={2} mb={6} color="gray.600">
              {typeInfo.subheader}
            </Text>
            <EventSeriesForm
              initialType={selectedType}
              onBack={() => setSelectedType(null)}
              onEventAdded={handleEventAdded}
              existingEvents={existingEvents}
              investments={investments} //pass investments to the form
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EventSeriesSection;
