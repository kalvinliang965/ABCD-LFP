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
  Badge,
} from '@chakra-ui/react';
import { Building2, Wallet, TrendingUp, BarChart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiChevronLeft } from 'react-icons/fi';

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
  glidePath?: boolean;
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
            <Box
              p={6}
              bgGradient="linear(to-r, blue.400, purple.500)"
              borderBottom="1px"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                right={0}
                width="150px"
                height="150px"
                bg="rgba(255,255,255,0.1)"
                borderRadius="50%"
                transform="translate(30%, -50%)"
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                width="100px"
                height="100px"
                bg="rgba(255,255,255,0.1)"
                borderRadius="50%"
                transform="translate(-30%, 50%)"
              />
              <Heading size="lg" color="white">
                New Event Series
              </Heading>
              <Text color="whiteAlpha.800" mt={1}>
                Add financial events to build your scenario plan
              </Text>
            </Box>

            <Box p={6}>

              {addedEvents.length > 0 && (
                <VStack spacing={4} mb={8} align="stretch">
                  <Heading size="md" color="gray.700">
                    Added Events
                  </Heading>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    {addedEvents.map((event, index) => (
                      <Flex
                        key={index}
                        p={4}
                        bg="white"
                        borderRadius="md"
                        shadow="sm"
                        mb={2}
                        justify="space-between"
                        align="center"
                      >
                        <Box>
                          <Text fontWeight="semibold" fontSize="md" color="gray.800" mb={1}>
                            {event.name}
                            <Badge ml={2} colorScheme={
                              event.type === 'income' ? 'green' : 
                              event.type === 'expense' ? 'red' : 
                              event.type === 'invest' ? 'blue' : 'purple'
                            } fontSize="xs" textTransform="uppercase">
                              {event.type}
                            </Badge>
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {event.type !== 'invest' && event.type !== 'rebalance' ? (
                              <>
                                <Text as="span" fontWeight="medium" color="gray.700">Initial Amount:</Text>{' '}
                                <Text as="span" color="green.600" fontWeight="medium">${event.initialAmount?.toLocaleString() || 0}</Text>
                                
                                {/* Display properties for income and expense as badges */}
                                <Flex mt={1} flexWrap="wrap" gap={1}>
                                  {event.inflationAdjusted && (
                                    <Text fontSize="sm" fontWeight="medium" color="orange.600" px={1} py={0.5} 
                                      bg="orange.50" borderRadius="md" display="inline-block">
                                      Inflation Adjusted
                                    </Text>
                                  )}
                                  
                                  {event.type === 'expense' && event.discretionary && (
                                    <Text fontSize="sm" fontWeight="medium" color="purple.600" px={1} py={0.5} 
                                      bg="purple.50" borderRadius="md" display="inline-block">
                                      Discretionary
                                    </Text>
                                  )}
                                  
                                  {event.type === 'income' && event.isSocialSecurity && (
                                    <Text fontSize="sm" fontWeight="medium" color="blue.600" px={1} py={0.5} 
                                      bg="blue.50" borderRadius="md" display="inline-block">
                                      Social Security
                                    </Text>
                                  )}
                                </Flex>
                              </>
                            ) : event.type === 'invest' ? (
                              <>
                                <Box>
                                  {event.assetAllocation ? 
                                    Object.entries(event.assetAllocation).slice(0, 3).map(([key, value], idx) => (
                                      <Flex key={idx} mb={0.5} width="100%">
                                        <Text fontSize="sm" fontWeight="medium" flex="1" isTruncated>
                                          {key}:
                                        </Text>
                                        <Text fontSize="sm" color="blue.600" fontWeight="medium" width="50px" textAlign="right">
                                          {Math.round(Number(value) * 100)}%
                                        </Text>
                                      </Flex>
                                    ))
                                    : <Text fontSize="sm">No allocations</Text>}
                                  {(event as any).glidePath && 
                                    <Text fontSize="sm" fontWeight="medium" color="blue.600" px={1} py={0.5} 
                                    bg="blue.50" borderRadius="md" display="inline-block" mt={1} mb={1}>
                                      <Icon as={TrendingUp} boxSize={3} mr={1} />
                                      Glide Path
                                    </Text>}
                                  <Text fontSize="sm">
                                    <Text as="span" fontWeight="medium" color="gray.700">Max cash:</Text>{' '}
                                    <Text as="span" color="green.600" fontWeight="medium">${event.maxCash?.toLocaleString() || 0}</Text>
                                  </Text>
                                </Box>
                              </>
                            ) : (
                              <>
                                <Box>
                                  {event.assetAllocation ? 
                                    Object.entries(event.assetAllocation).slice(0, 3).map(([key, value], idx) => (
                                      <Flex key={idx} mb={0.5} width="100%">
                                        <Text fontSize="sm" fontWeight="medium" flex="1" isTruncated>
                                          {key}:
                                        </Text>
                                        <Text fontSize="sm" color="purple.600" fontWeight="medium" width="50px" textAlign="right">
                                          {Math.round(Number(value) * 100)}%
                                        </Text>
                                      </Flex>
                                    ))
                                    : <Text fontSize="sm">No allocations</Text>}
                                </Box>
                              </>
                            )}
                          </Text>
                        </Box>
                        <HStack>
                          <IconButton
                            aria-label="Delete event"
                            icon={<DeleteIcon color="red.500" />}
                            size="md"
                            variant="ghost"
                            _hover={{ bg: 'red.50' }}
                            onClick={() => {
                              handleDeleteEvent(index.toString());
                            }}
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

            
              <Flex justify="space-between" mt={8} alignItems="center">
              <Button
                  leftIcon={<Icon as={FiChevronLeft} />}
                  variant="outline"
                  colorScheme="blue"
                  onClick={handleBackToInvestments}
                  size="lg"
                  _hover={{ bg: 'blue.50' }}
                >
                  Back
                </Button>
                
                <Button
                  colorScheme="blue"
                  onClick={handleSaveAndContinue}
                  size="lg"
                  px={8}
                  borderRadius="lg"
                  bgGradient="linear(to-r, blue.400, teal.500)"
                  rightIcon={<FiArrowRight />}
                  _hover={{
                    bgGradient: 'linear(to-r, blue.500, teal.600)',
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                >
                  Continue
                </Button>
              </Flex>
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