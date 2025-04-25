import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Tooltip,
  List,
  ListItem,
  Badge,
  Container,
  IconButton,
} from '@chakra-ui/react';
import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaArrowUp, FaArrowDown, FaWallet } from 'react-icons/fa';
import {
  FiRefreshCcw,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiRepeat,
} from 'react-icons/fi';

export type RothConversionOptimizer = {
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<string>;
};

export interface RothConversionStrategy {
  roth_conversion_opt: boolean;
  roth_conversion_start: number;
  roth_conversion_end: number;
  availableAccounts: Array<{
    id: string;
    name: string;
  }>; // All available investment accounts with ID and name
  accountPriority: string[]; // Selected account IDs in priority order
}

export interface RothConversionOptimizerFormProps {
  rothConversionStrategy: RothConversionStrategy;
  onChangeRothConversionStrategy: (strategy: RothConversionStrategy) => void;
  onBack: () => void;
  onFinish?: () => void;
  onContinue?: () => void;
}

// Helper to get account name by ID
const getAccountNameById = (accounts: Array<{ id: string; name: string }>, id: string): string => {
  const account = accounts.find(acc => acc.id === id);
  return account ? account.name : id; // Fallback to ID if name not found
};

export const RothConversionOptimizerForm: React.FC<RothConversionOptimizerFormProps> = ({
  rothConversionStrategy,
  onChangeRothConversionStrategy,
  onBack,
  onFinish,
  onContinue,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const stepBg = useColorModeValue('blue.100', 'blue.800');
  const cardShadow = useColorModeValue(
    '0 4px 6px rgba(0, 0, 0, 0.1)',
    '0 4px 6px rgba(0, 0, 0, 0.3)'
  );

  const bgColor = useColorModeValue('white', 'gray.800');
  const listItemBg = useColorModeValue('gray.50', 'gray.700');
  const listItemHoverBg = useColorModeValue('gray.100', 'gray.600');

  const current_year = new Date().getFullYear();

  function handle_opt_change(checked: boolean) {
    console.log('check aviliable accounts', rothConversionStrategy.availableAccounts);
    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      roth_conversion_opt: checked,
    });
  }

  function handle_start_year_change(stringValue: string, numValue: number) {
    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      roth_conversion_start: numValue,
    });
  }

  function handle_end_year_change(stringValue: string, numValue: number) {
    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      roth_conversion_end: numValue,
    });
  }

  const is_opt_in = rothConversionStrategy.roth_conversion_opt;
  const conversion_years =
    rothConversionStrategy.roth_conversion_end - rothConversionStrategy.roth_conversion_start + 1;

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(rothConversionStrategy.accountPriority);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      accountPriority: items,
    });
  };

  // Add an account to the priority list
  const addAccount = (accountId: string) => {
    if (!rothConversionStrategy.accountPriority.includes(accountId)) {
      onChangeRothConversionStrategy({
        ...rothConversionStrategy,
        accountPriority: [...rothConversionStrategy.accountPriority, accountId],
      });
    }
  };

  // Remove an account from the priority list
  const removeAccount = (accountId: string) => {
    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      accountPriority: rothConversionStrategy.accountPriority.filter(id => id !== accountId),
    });
  };

  // Move an account up in priority
  const moveUp = (index: number) => {
    if (index <= 0) return;

    const newPriority = [...rothConversionStrategy.accountPriority];
    const temp = newPriority[index];
    newPriority[index] = newPriority[index - 1];
    newPriority[index - 1] = temp;

    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      accountPriority: newPriority,
    });
  };

  // Move an account down in priority
  const moveDown = (index: number) => {
    if (index >= rothConversionStrategy.accountPriority.length - 1) return;

    const newPriority = [...rothConversionStrategy.accountPriority];
    const temp = newPriority[index];
    newPriority[index] = newPriority[index + 1];
    newPriority[index + 1] = temp;

    onChangeRothConversionStrategy({
      ...rothConversionStrategy,
      accountPriority: newPriority,
    });
  };

  // Get available accounts that aren't already in the priority list
  const getAvailableAccounts = () => {
    return rothConversionStrategy.availableAccounts.filter(
      account => !rothConversionStrategy.accountPriority.includes(account.id)
    );
  };
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Card
          borderRadius="xl"
          boxShadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
        >
          <CardHeader
            bg={headerBg}
            py={6}
            px={6}
            borderBottom="1px"
            borderColor={borderColor}
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="5px"
              bgGradient="linear(to-r, blue.400, purple.500)"
            />
            <Flex justify="space-between" align="center">
              <Heading
                size="lg"
                bgGradient="linear(to-r, blue.500, purple.500)"
                bgClip="text"
                display="flex"
                alignItems="center"
              >
                <Icon as={FiRefreshCcw} mr={3} boxSize={6} />
                Roth Conversion Optimizer
              </Heading>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={onBack}
                  leftIcon={<Icon as={FiChevronLeft} />}
                  size="md"
                  rounded="lg"
                >
                  Back
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={{ base: 5, md: 8 }}>
            <VStack spacing={8} align="stretch">
              <Box
                p={5}
                borderRadius="lg"
                bg={infoBg}
                borderLeft="4px solid"
                borderLeftColor="blue.400"
              >
                <Text color="blue.700" fontSize="md">
                  Roth conversion allows you to transfer funds from traditional retirement accounts
                  to Roth accounts. While you'll pay taxes on the converted amount now, all future
                  growth and qualified withdrawals will be tax-free.
                </Text>
              </Box>

              {/* Toggle Switch Section */}
              <Card p={6} borderRadius="lg" shadow={cardShadow}>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap={{ base: 'wrap', md: 'nowrap' }}
                  gap={4}
                >
                  <Box flex="1">
                    <Heading size="md" mb={2} display="flex" alignItems="center">
                      <Icon as={FiRepeat} mr={2} color="purple.500" />
                      Enable Roth Conversion Strategy
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      Automatically convert traditional IRA funds to Roth IRA over time to minimize
                      tax impact
                    </Text>
                  </Box>
                  <FormControl display="flex" alignItems="center" width="auto">
                    <Switch
                      id="roth-opt-in"
                      colorScheme="purple"
                      size="lg"
                      isChecked={is_opt_in}
                      onChange={e => handle_opt_change(e.target.checked)}
                    />
                    <FormLabel htmlFor="roth-opt-in" mb="0" ml={3}>
                      <Badge
                        colorScheme={is_opt_in ? 'green' : 'gray'}
                        fontSize="sm"
                        py={1}
                        px={2}
                        borderRadius="full"
                      >
                        {is_opt_in ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </FormLabel>
                  </FormControl>
                </Flex>
              </Card>

              {/* Year Range Section */}
              {is_opt_in && (
                <Card p={6} borderRadius="lg" shadow={cardShadow}>
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FiCalendar} mr={2} color="blue.500" />
                    Conversion Time Period
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
                    <FormControl>
                      <FormLabel htmlFor="roth-start-year" fontWeight="medium" color="gray.700">
                        Start Year
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={current_year}
                          max={current_year + 50}
                          value={rothConversionStrategy.roth_conversion_start}
                          onChange={handle_start_year_change}
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            id="roth-start-year"
                            borderRadius="md"
                            borderColor="blue.300"
                            _hover={{ borderColor: 'blue.400' }}
                            fontSize="md"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel htmlFor="roth-end-year" fontWeight="medium" color="gray.700">
                        End Year
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={rothConversionStrategy.roth_conversion_start}
                          max={current_year + 50}
                          value={rothConversionStrategy.roth_conversion_end}
                          onChange={handle_end_year_change}
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            id="roth-end-year"
                            borderRadius="md"
                            borderColor="blue.300"
                            _hover={{ borderColor: 'blue.400' }}
                            fontSize="md"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </SimpleGrid>

                  <Flex
                    bg="purple.50"
                    p={3}
                    borderRadius="md"
                    align="center"
                    borderLeft="3px solid"
                    borderLeftColor="purple.400"
                  >
                    <Icon as={FiInfo} mr={3} color="purple.500" />
                    <Text fontSize="sm" color="purple.800">
                      Your conversion will be spread over <strong>{conversion_years} years</strong>{' '}
                      ({rothConversionStrategy.roth_conversion_start} -{' '}
                      {rothConversionStrategy.roth_conversion_end}) to minimize tax impact.
                    </Text>
                  </Flex>
                  <Box maxW="800px" mx="auto" p={5}>
                    <Card
                      bg={bgColor}
                      boxShadow="xl"
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor={borderColor}
                      overflow="hidden"
                    >
                      <CardHeader bg="blue.600" color="white" p={4}>
                        <Heading size="lg">Roth Conversion Strategy</Heading>
                        <Text mt={2}>
                          Define the order in which your investments will be used to cover expenses
                        </Text>
                      </CardHeader>

                      <CardBody p={6}>
                        <VStack spacing={6} align="stretch">
                          <Box>
                            <Heading size="md" mb={4} display="flex" alignItems="center">
                              <Icon as={FaWallet} mr={2} color="blue.500" />
                              Roth Conversion Priority Order
                            </Heading>
                            <Text mb={4}>
                              Arrange your investment accounts in the order you want them to be used
                              for roth conversions. Accounts at the top will be used first.
                            </Text>

                            {rothConversionStrategy.accountPriority.length > 0 ? (
                              <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="roth-conversion-priority">
                                  {provided => (
                                    <List
                                      spacing={3}
                                      mt={4}
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                    >
                                      {rothConversionStrategy.accountPriority.map(
                                        (accountId, index) => (
                                          <Draggable
                                            key={accountId}
                                            draggableId={accountId}
                                            index={index}
                                          >
                                            {provided => (
                                              <ListItem
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                p={3}
                                                bg={listItemBg}
                                                borderRadius="md"
                                                boxShadow="sm"
                                                display="flex"
                                                justifyContent="space-between"
                                                alignItems="center"
                                                _hover={{ bg: listItemHoverBg }}
                                              >
                                                <Text fontWeight="medium">
                                                  {index + 1}.{' '}
                                                  {getAccountNameById(
                                                    rothConversionStrategy.availableAccounts,
                                                    accountId
                                                  )}
                                                </Text>
                                                <Flex>
                                                  <Tooltip label="Move up" placement="top">
                                                    <IconButton
                                                      aria-label="Move up"
                                                      icon={<FaArrowUp />}
                                                      size="sm"
                                                      variant="ghost"
                                                      isDisabled={index === 0}
                                                      onClick={() => moveUp(index)}
                                                      mr={1}
                                                    />
                                                  </Tooltip>
                                                  <Tooltip label="Move down" placement="top">
                                                    <IconButton
                                                      aria-label="Move down"
                                                      icon={<FaArrowDown />}
                                                      size="sm"
                                                      variant="ghost"
                                                      isDisabled={
                                                        index ===
                                                        rothConversionStrategy.accountPriority
                                                          .length -
                                                          1
                                                      }
                                                      onClick={() => moveDown(index)}
                                                      mr={1}
                                                    />
                                                  </Tooltip>
                                                  <Tooltip label="Remove" placement="top">
                                                    <IconButton
                                                      aria-label="Remove account"
                                                      icon={<Icon name="close" />}
                                                      size="sm"
                                                      variant="ghost"
                                                      colorScheme="red"
                                                      onClick={() => removeAccount(accountId)}
                                                    />
                                                  </Tooltip>
                                                </Flex>
                                              </ListItem>
                                            )}
                                          </Draggable>
                                        )
                                      )}
                                      {provided.placeholder}
                                    </List>
                                  )}
                                </Droppable>
                              </DragDropContext>
                            ) : (
                              <Text color="gray.500" fontStyle="italic">
                                No accounts selected for roth conversion priority
                              </Text>
                            )}
                          </Box>

                          <Divider />

                          <Box>
                            <Heading size="sm" mb={3}>
                              Available Accounts:
                            </Heading>
                            {getAvailableAccounts().length > 0 ? (
                              <List spacing={2}>
                                {getAvailableAccounts().map(account => (
                                  <ListItem
                                    key={account.id}
                                    p={2}
                                    borderRadius="md"
                                    _hover={{
                                      bg: 'gray.50',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => addAccount(account.id)}
                                  >
                                    <Flex align="center">
                                      <Badge colorScheme="purple" mr={2}>
                                        {account.id}
                                      </Badge>
                                      <Text>{account.name}</Text>
                                      <Text ml={2} fontSize="sm" color="blue.500">
                                        (Click to add)
                                      </Text>
                                    </Flex>
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Text color="gray.500" fontStyle="italic">
                                All accounts have been added to the priority list
                              </Text>
                            )}
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Box>
                </Card>
              )}
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={useColorModeValue('gray.50', 'gray.700')}
          >
            <Flex width="100%" justify="space-between">
              <Button
                variant="outline"
                leftIcon={<Icon as={FiChevronLeft} />}
                onClick={onBack}
                size="lg"
                rounded="lg"
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                rightIcon={<Icon as={FiChevronRight} />}
                onClick={onFinish || onContinue}
                size="lg"
                rounded="lg"
                bgGradient="linear(to-r, blue.400, purple.500)"
                _hover={{
                  bgGradient: 'linear(to-r, blue.500, purple.600)',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                transition="all 0.2s"
              >
                Continue
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </Container>
    </Box>
  );
};

export default RothConversionOptimizerForm;
