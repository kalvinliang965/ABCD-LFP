import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  IconButton,
  Icon,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Badge,
  Tooltip,
  Grid,
  GridItem,
  SimpleGrid,
  Container,
} from '@chakra-ui/react';
import { TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiList,
  FiPlusCircle,
  FiTrash2,
  FiBriefcase,
  FiActivity,
  FiAward,
  FiBarChart2,
  FiInfo,
} from 'react-icons/fi';

import { investmentTypeStorage } from '../../services/investmentTypeStorage';
import { InvestmentTypeRaw } from '../../types/Scenarios';
import { InvestmentRaw } from '../../types/Scenarios';

export type TaxStatus = 'non-retirement' | 'pre-tax' | 'after-tax';

export type InvestmentsConfig = {
  investments: InvestmentRaw[];
};

export interface InvestmentsFormProps {
  investmentsConfig: InvestmentsConfig;
  onChangeInvestmentsConfig: (config: InvestmentsConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const InvestmentsForm: React.FC<InvestmentsFormProps> = ({
  investmentsConfig,
  onChangeInvestmentsConfig: onChangeConfig,
  onBack,
  onContinue,
}) => {
  const [investmentTypes, set_investment_types] = useState<InvestmentTypeRaw[]>([]);
  const [newInvestment, set_new_investment] = useState<InvestmentRaw>({
    investmentType: '',
    value: 0,
    taxStatus: 'non-retirement',
    id: '',
  });
  const [errors, set_errors] = useState<{
    investmentType?: string;
    value?: string;
  }>({});
  const toast = useToast();

  // Load investment types on component mount
  useEffect(() => {
    load_investment_types();
  }, []);

  // AI-generated code
  // Check if a Cash investment exists in the user's investments
  const cash_investment_exists = (): boolean => {
    return investmentsConfig.investments.some(
      investment => investment.investmentType.toLowerCase() === 'cash'
    );
  };

  // AI-generated code
  // Handle continue button click with Cash investment validation
  const handle_continue = () => {
    if (!cash_investment_exists()) {
      toast({
        title: 'Cash investment required',
        description: 'You must add a Cash investment before continuing',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }
    onContinue();
  };

  const load_investment_types = () => {
    const types = investmentTypeStorage.get_all();
    set_investment_types(types);
  };

  // AI-generated code
  // Allow users to add multiple investments of the same type
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statIconBg = useColorModeValue('blue.50', 'blue.900');
  const statTextColor = useColorModeValue('gray.600', 'gray.400');

  // Remove filtering so users can select the same investment type multiple times
  const available_investment_types = investmentTypes;

  const handle_change_investment_type = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const typeId = e.target.value;

    set_new_investment({
      ...newInvestment,
      investmentType: typeId,
    });

    if (errors.investmentType) {
      set_errors({ ...errors, investmentType: undefined });
    }
  };

  const handle_change_value = (_: string, value: number) => {
    set_new_investment({
      ...newInvestment,
      value,
    });

    if (errors.value) {
      set_errors({ ...errors, value: undefined });
    }
  };

  const handle_change_tax_status = (value: string) => {
    set_new_investment({
      ...newInvestment,
      taxStatus: value as TaxStatus,
    });
  };

  // AI-generated code
  // Add function to check if investment type is Cash (case insensitive)
  const is_cash_investment = (investmentType: string): boolean => {
    return investmentType.toLowerCase() === 'cash';
  };

  // AI-generated code
  // Check if current selection is valid based on Cash rule
  const is_valid_investment_combination = (): boolean => {
    if (!newInvestment.investmentType) return true;

    // If investment type is Cash, it must be in non-retirement
    if (
      is_cash_investment(newInvestment.investmentType) &&
      newInvestment.taxStatus !== 'non-retirement'
    ) {
      return false;
    }

    // AI-generated code
    // Check if investment type already exists under the selected tax status
    if (
      investment_type_exists_under_tax_status(newInvestment.investmentType, newInvestment.taxStatus)
    ) {
      return false;
    }

    return true;
  };

  // AI-generated code
  // Check if investment type already exists under the selected tax status
  const investment_type_exists_under_tax_status = (
    investmentType: string,
    taxStatus: string
  ): boolean => {
    return investmentsConfig.investments.some(
      investment =>
        investment.investmentType === investmentType && investment.taxStatus === taxStatus
    );
  };

  const handle_add_investment = () => {
    // Validate
    const newErrors: typeof errors = {};

    if (!newInvestment.investmentType) {
      newErrors.investmentType = 'Please select an investment type';
    }

    if (newInvestment.value <= 0) {
      newErrors.value = 'Value must be greater than zero';
    }

    // AI-generated code
    // Check Cash investment tax status validation
    if (
      is_cash_investment(newInvestment.investmentType) &&
      newInvestment.taxStatus !== 'non-retirement'
    ) {
      toast({
        title: 'Invalid combination',
        description: 'Cash investments can only be placed in non-retirement accounts',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    // AI-generated code
    // Check if investment type already exists under the selected tax status
    if (
      investment_type_exists_under_tax_status(newInvestment.investmentType, newInvestment.taxStatus)
    ) {
      toast({
        title: 'Duplicate investment',
        description: `${newInvestment.investmentType} already added under this tax status`,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      set_errors(newErrors);
      return;
    }

    // Add the investment with a unique ID using timestamp
    const newInvestmentWithId: InvestmentRaw = {
      ...newInvestment,
      // Generate unique ID using timestamp to allow multiple investments of same type
      id:
        investmentTypeStorage.get_by_name(newInvestment.investmentType)?.name +
        ' ' +
        newInvestment.taxStatus,
    };

    onChangeConfig({
      investments: [...investmentsConfig.investments, newInvestmentWithId],
    });

    // Reset the form
    set_new_investment({
      investmentType: '',
      value: 0,
      taxStatus: 'non-retirement',
      id: '',
    });

    toast({
      title: 'Investment added',
      description: `Added ${newInvestmentWithId.investmentType} investment`,
      status: 'success',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
    });
  };

  const handle_remove_investment = (id: string) => {
    const investmentToRemove = investmentsConfig.investments.find(
      investment => investment.id === id
    );

    onChangeConfig({
      investments: investmentsConfig.investments.filter(investment => investment.id !== id),
    });

    toast({
      title: 'Investment removed',
      description: `Removed ${investmentToRemove?.investmentType} investment`,
      status: 'info',
      duration: 2000,
      isClosable: true,
      position: 'top-right',
      variant: 'subtle',
    });
  };

  const format_currency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  //this is for display purpose
  const get_tax_status_display = (status: TaxStatus) => {
    switch (status) {
      case 'non-retirement':
        return 'Non-Retirement';
      case 'pre-tax':
        return 'Pre-Tax';
      case 'after-tax':
        return 'After-Tax';
      default:
        return status;
    }
  };

  const get_tax_status_color = (status: TaxStatus) => {
    switch (status) {
      case 'non-retirement':
        return 'blue';
      case 'pre-tax':
        return 'green';
      case 'after-tax':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // AI-generated code
  // Get icon based on tax status instead of investment type
  const get_tax_status_icon = (status: TaxStatus) => {
    switch (status) {
      case 'non-retirement':
        return FiDollarSign;
      case 'pre-tax':
        return FiAward;
      case 'after-tax':
        return FiBriefcase;
      default:
        return FiInfo;
    }
  };

  const total_investment_value = investmentsConfig.investments.reduce(
    (total, investment) => total + investment.value,
    0
  );

  // Show guidance if no investment types exist at all
  if (investmentTypes.length === 0) {
    return (
      <Box minH="100vh" bg={bg} py={8}>
        <Container maxW="6xl" px={4}>
          <Card
            rounded="xl"
            shadow="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
            bg={cardBg}
            mb={8}
          >
            <CardHeader
              bg={useColorModeValue('blue.50', 'blue.900')}
              py={6}
              px={8}
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon as={TrendingUp} boxSize={6} color="blue.500" />
                  <Heading size="lg" fontWeight="bold">
                    Investment Portfolio
                  </Heading>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody p={8} textAlign="center">
              <Icon as={FiInfo} boxSize={12} color="blue.500" mb={4} />
              <Heading size="md" mb={4}>
                No Investment Types Available
              </Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')} mb={6}>
                You need to create at least one investment type before you can add investments to
                your portfolio.
              </Text>
              <Button colorScheme="blue" onClick={onBack} leftIcon={<Icon as={FiChevronLeft} />}>
                Go Back to Create Investment Types
              </Button>
              {import.meta.env.MODE === 'development' && (
                <Button colorScheme="blue" onClick={onContinue} ml={4}>
                  Skip
                </Button>
              )}
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl" px={4}>
        <Card
          rounded="xl"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
          mb={8}
        >
          <CardHeader
            bg={useColorModeValue('blue.50', 'blue.900')}
            py={6}
            px={8}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={TrendingUp} boxSize={6} color="blue.500" />
                <Heading size="lg" fontWeight="bold">
                  Investment Portfolio
                </Heading>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={0}>
            {/* Stats Overview */}
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={0}
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Box
                p={6}
                borderRightWidth={{ base: 0, md: '1px' }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: '1px', md: 0 }}
                borderBottomColor={borderColor}
              >
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiBarChart2} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Total Portfolio Value
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="bold" color="green.500">
                  {format_currency(total_investment_value)}
                </Heading>
              </Box>

              <Box
                p={6}
                borderRightWidth={{ base: 0, md: '1px' }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: '1px', md: 0 }}
                borderBottomColor={borderColor}
              >
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiList} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Possible Investment Types
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="bold">
                  {investmentsConfig.investments.length} / {investmentTypes.length * 3 - 2}
                </Heading>
              </Box>

              <Box p={6}>
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiPlusCircle} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Available Types
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="bold">
                  {available_investment_types.length}
                </Heading>
              </Box>
            </SimpleGrid>

            <Box p={8}>
              <Text fontSize="lg" fontWeight="medium" mb={6}>
                Configure your investment portfolio by adding different types of investments. You
                can add multiple investments of the same type.
              </Text>

              {/* AI-generated code */}
              {/* Cash requirement notice */}
              {!cash_investment_exists() && (
                <Box
                  mb={6}
                  p={4}
                  borderWidth="1px"
                  borderColor="orange.300"
                  bg="orange.50"
                  borderRadius="md"
                  _dark={{
                    borderColor: 'orange.600',
                    bg: 'orange.900',
                  }}
                >
                  <Flex alignItems="center">
                    <Icon as={FiInfo} color="orange.500" boxSize={5} mr={3} />
                    <Text fontWeight="medium" color="orange.700" _dark={{ color: 'orange.300' }}>
                      A Cash investment is required before you can continue. Please add at least one
                      Cash investment to your portfolio.
                    </Text>
                  </Flex>
                </Box>
              )}

              {/* Investment Cards */}
              {investmentsConfig.investments.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={10}>
                  {investmentsConfig.investments.map(investment => (
                    <Card
                      key={investment.id}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="lg"
                      overflow="hidden"
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                        borderColor: 'blue.200',
                      }}
                    >
                      <CardBody>
                        <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
                          <Flex
                            bg={useColorModeValue(
                              `${get_tax_status_color(investment.taxStatus as TaxStatus)}.50`,
                              `${get_tax_status_color(investment.taxStatus as TaxStatus)}.900`
                            )}
                            p={3}
                            borderRadius="lg"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Icon
                              as={get_tax_status_icon(investment.taxStatus as TaxStatus)}
                              color={`${get_tax_status_color(
                                investment.taxStatus as TaxStatus
                              )}.500`}
                              boxSize={5}
                            />
                          </Flex>
                          <IconButton
                            aria-label="Remove investment"
                            icon={<Icon as={FiTrash2} />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handle_remove_investment(investment.id)}
                          />
                        </Flex>

                        <Heading size="md" mb={1}>
                          {investment.investmentType}
                        </Heading>
                        <Text fontSize="2xl" fontWeight="bold" color="green.500" mb={3}>
                          {format_currency(investment.value)}
                        </Text>

                        <Badge
                          colorScheme={get_tax_status_color(investment.taxStatus as TaxStatus)}
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {get_tax_status_display(investment.taxStatus as TaxStatus)}
                        </Badge>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  mb={8}
                  p={8}
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor={borderColor}
                  borderRadius="lg"
                  textAlign="center"
                >
                  <Icon as={FiList} boxSize={10} color="gray.400" mb={4} />
                  <Heading size="md" mb={2} color="gray.500">
                    No Investments Yet
                  </Heading>
                  <Text color="gray.500" maxW="md" mx="auto">
                    Start building your investment portfolio by adding your first investment using
                    the form below.
                  </Text>
                </Box>
              )}

              {/* Add investment form */}
              <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
              >
                <CardHeader
                  bg={useColorModeValue('gray.50', 'gray.700')}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  py={4}
                  px={6}
                >
                  <Flex alignItems="center">
                    <Icon as={FiPlusCircle} mr={2} color="blue.500" />
                    <Heading size="md">Add New Investment</Heading>
                  </Flex>
                </CardHeader>
                <CardBody p={6}>
                  <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr' }} gap={6}>
                    <GridItem>
                      <FormControl isRequired isInvalid={!!errors.investmentType}>
                        <FormLabel fontWeight="medium">Investment Type</FormLabel>
                        {available_investment_types.length > 0 ? (
                          <Select
                            value={newInvestment.investmentType}
                            onChange={handle_change_investment_type}
                            placeholder="Select an investment type"
                            isInvalid={!!errors.investmentType}
                          >
                            {available_investment_types.map(type => (
                              <option key={type.name} value={type.name || ''}>
                                {type.name}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Text color="orange.500">
                            You've added all available investment types. Go back to Investment Types
                            to create more types.
                          </Text>
                        )}
                        {errors.investmentType && (
                          <FormErrorMessage>{errors.investmentType}</FormErrorMessage>
                        )}
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isRequired isInvalid={!!errors.value}>
                        <FormLabel fontWeight="medium">Value</FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiDollarSign} color="green.500" />
                          </InputLeftElement>
                          <NumberInput
                            min={0}
                            step={100}
                            precision={2}
                            value={newInvestment.value}
                            onChange={handle_change_value}
                            w="100%"
                          >
                            <NumberInputField pl={10} borderRadius="md" />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                        {errors.value && <FormErrorMessage>{errors.value}</FormErrorMessage>}
                      </FormControl>
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 3 }}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">Tax Status</FormLabel>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <Box
                            as="button"
                            type="button"
                            p={4}
                            borderWidth="2px"
                            borderRadius="lg"
                            borderColor={
                              newInvestment.taxStatus === 'non-retirement' ? 'blue.500' : 'gray.200'
                            }
                            bg={
                              newInvestment.taxStatus === 'non-retirement'
                                ? 'blue.50'
                                : 'transparent'
                            }
                            _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                            _dark={{
                              borderColor:
                                newInvestment.taxStatus === 'non-retirement'
                                  ? 'blue.500'
                                  : 'gray.600',
                              bg:
                                newInvestment.taxStatus === 'non-retirement'
                                  ? 'blue.900'
                                  : 'transparent',
                              _hover: {
                                bg: 'blue.900',
                                borderColor: 'blue.700',
                              },
                            }}
                            transition="all 0.2s"
                            onClick={() => handle_change_tax_status('non-retirement')}
                          >
                            <Flex direction="column" align="center">
                              <Flex
                                mb={3}
                                bg={useColorModeValue('blue.100', 'blue.800')}
                                color={useColorModeValue('blue.600', 'blue.300')}
                                p={2}
                                borderRadius="md"
                              >
                                <Icon as={FiDollarSign} boxSize={5} />
                              </Flex>
                              <Text fontWeight="bold" fontSize="md" mb={1}>
                                Non-Retirement
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Standard taxable account
                              </Text>
                            </Flex>
                          </Box>

                          <Box
                            as="button"
                            type="button"
                            p={4}
                            borderWidth="2px"
                            borderRadius="lg"
                            borderColor={
                              newInvestment.taxStatus === 'pre-tax' ? 'green.500' : 'gray.200'
                            }
                            bg={newInvestment.taxStatus === 'pre-tax' ? 'green.50' : 'transparent'}
                            _hover={{
                              bg: 'green.50',
                              borderColor: 'green.300',
                            }}
                            _dark={{
                              borderColor:
                                newInvestment.taxStatus === 'pre-tax' ? 'green.500' : 'gray.600',
                              bg:
                                newInvestment.taxStatus === 'pre-tax' ? 'green.900' : 'transparent',
                              _hover: {
                                bg: 'green.900',
                                borderColor: 'green.700',
                              },
                            }}
                            transition="all 0.2s"
                            onClick={() => handle_change_tax_status('pre-tax')}
                          >
                            <Flex direction="column" align="center">
                              <Flex
                                mb={3}
                                bg={useColorModeValue('green.100', 'green.800')}
                                color={useColorModeValue('green.600', 'green.300')}
                                p={2}
                                borderRadius="md"
                              >
                                <Icon as={FiAward} boxSize={5} />
                              </Flex>
                              <Text fontWeight="bold" fontSize="md" mb={1}>
                                Pre-Tax
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Traditional 401(k), IRA
                              </Text>
                            </Flex>
                          </Box>

                          <Box
                            as="button"
                            type="button"
                            p={4}
                            borderWidth="2px"
                            borderRadius="lg"
                            borderColor={
                              newInvestment.taxStatus === 'after-tax' ? 'purple.500' : 'gray.200'
                            }
                            bg={
                              newInvestment.taxStatus === 'after-tax' ? 'purple.50' : 'transparent'
                            }
                            _hover={{
                              bg: 'purple.50',
                              borderColor: 'purple.300',
                            }}
                            _dark={{
                              borderColor:
                                newInvestment.taxStatus === 'after-tax' ? 'purple.500' : 'gray.600',
                              bg:
                                newInvestment.taxStatus === 'after-tax'
                                  ? 'purple.900'
                                  : 'transparent',
                              _hover: {
                                bg: 'purple.900',
                                borderColor: 'purple.700',
                              },
                            }}
                            transition="all 0.2s"
                            onClick={() => handle_change_tax_status('after-tax')}
                          >
                            <Flex direction="column" align="center">
                              <Flex
                                mb={3}
                                bg={useColorModeValue('purple.100', 'purple.800')}
                                color={useColorModeValue('purple.600', 'purple.300')}
                                p={2}
                                borderRadius="md"
                              >
                                <Icon as={FiBriefcase} boxSize={5} />
                              </Flex>
                              <Text fontWeight="bold" fontSize="md" mb={1}>
                                After-Tax
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Roth 401(k), Roth IRA
                              </Text>
                            </Flex>
                          </Box>
                        </SimpleGrid>
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Flex justifyContent="flex-end" mt={8}>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="blue"
                      onClick={handle_add_investment}
                      size="lg"
                      disabled={investmentTypes.length === 0 || !is_valid_investment_combination()}
                      px={8}
                      fontWeight="bold"
                    >
                      Add Investment
                    </Button>
                  </Flex>
                </CardBody>
              </Card>

              {investmentTypes.length === 0 && (
                <Text color="orange.500" fontSize="sm" mt={4} textAlign="center">
                  No investment types available. Please go back and create investment types first.
                </Text>
              )}

              {/* AI-generated code */}
              {/* Show warning if Cash is selected with non-compatible tax status */}
              {is_cash_investment(newInvestment.investmentType) &&
                newInvestment.taxStatus !== 'non-retirement' && (
                  <Text color="red.500" fontSize="sm" mt={4} textAlign="center" fontWeight="medium">
                    Cash investments can only be placed in non-retirement accounts
                  </Text>
                )}

              {/* AI-generated code */}
              {/* Show warning if investment type already exists under the selected tax status */}
              {newInvestment.investmentType &&
                investment_type_exists_under_tax_status(
                  newInvestment.investmentType,
                  newInvestment.taxStatus
                ) && (
                  <Text color="red.500" fontSize="sm" mt={4} textAlign="center" fontWeight="medium">
                    {newInvestment.investmentType} already added under this tax status
                  </Text>
                )}
            </Box>
          </CardBody>

          <CardFooter
            py={6}
            px={8}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="space-between" width="100%" alignItems="center">
              <Button
                leftIcon={<Icon as={FiChevronLeft} />}
                variant="outline"
                colorScheme="blue"
                onClick={onBack}
                size="lg"
                _hover={{ bg: 'blue.50' }}
              >
                Back
              </Button>

              <Flex alignItems="center">
                <Text color="gray.500" fontSize="sm" mr={4}>
                  {investmentsConfig.investments.length} investment
                  {investmentsConfig.investments.length !== 1 ? 's' : ''} added
                  {investmentsConfig.investments.length > 0 && !cash_investment_exists() && (
                    <Text as="span" color="red.500" ml={2} fontWeight="medium">
                      (Cash investment required)
                    </Text>
                  )}
                </Text>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handle_continue}
                  isDisabled={investmentsConfig.investments.length === 0}
                  px={8}
                  rightIcon={<Icon as={FiChevronRight} />}
                  fontWeight="bold"
                >
                  Continue
                </Button>
              </Flex>
            </Flex>
          </CardFooter>
        </Card>
      </Container>
    </Box>
  );
};

export default InvestmentsForm;
