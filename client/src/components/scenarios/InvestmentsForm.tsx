import React, { useState } from "react";
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
  Radio,
  RadioGroup,
  Stack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Icon,
  Divider,
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
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { TrendingUp } from "lucide-react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiList,
  FiPlusCircle,
  FiTrash2,
} from "react-icons/fi";

// Mock investment types (to be replaced with data from the database)
const MOCK_INVESTMENT_TYPES = [
  { id: "stock", name: "Stocks" },
  { id: "bond", name: "Bonds" },
  { id: "real_estate", name: "Real Estate" },
  { id: "cash", name: "Cash" },
  { id: "gold", name: "Gold" },
  { id: "crypto", name: "Cryptocurrency" },
  { id: "mutual_fund", name: "Mutual Fund" },
  { id: "etf", name: "ETF" },
];

export type TaxStatus = "non-retirement" | "pre-tax" | "after-tax";

export type Investment = {
  id: string;
  investmentTypeId: string;
  investmentTypeName: string;
  value: number;
  taxStatus: TaxStatus;
};

export type InvestmentsConfig = {
  investments: Investment[];
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
  const [newInvestment, set_new_investment] = useState<Omit<Investment, "id">>({
    investmentTypeId: "",
    investmentTypeName: "",
    value: 0,
    taxStatus: "non-retirement",
  });
  const [errors, set_errors] = useState<{
    investmentType?: string;
    value?: string;
  }>({});
  const toast = useToast();

  /* AI prompt : help me design a form to add investments to the financial scenario and I need to add a button to remove the investment */
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const formBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableBg = useColorModeValue("white", "gray.800");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  // Filter out already selected investment types
  const available_investment_types = MOCK_INVESTMENT_TYPES.filter(
    (type) =>
      !investmentsConfig.investments.some(
        (investment) => investment.investmentTypeId === type.id
      )
  );

  const handle_change_investment_type = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const typeId = e.target.value;
    const typeName =
      MOCK_INVESTMENT_TYPES.find((type) => type.id === typeId)?.name || "";

    set_new_investment({
      ...newInvestment,
      investmentTypeId: typeId,
      investmentTypeName: typeName,
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

  const handle_add_investment = () => {
    // Validate
    const newErrors: typeof errors = {};

    if (!newInvestment.investmentTypeId) {
      newErrors.investmentType = "Please select an investment type";
    }

    if (newInvestment.value <= 0) {
      newErrors.value = "Value must be greater than zero";
    }

    if (Object.keys(newErrors).length > 0) {
      set_errors(newErrors);
      return;
    }

    // Add the investment
    const newInvestmentWithId: Investment = {
      ...newInvestment,
      id: Date.now().toString(), // Use a timestamp as a simple ID
    };

    onChangeConfig({
      investments: [...investmentsConfig.investments, newInvestmentWithId],
    });

    // Reset the form
    set_new_investment({
      investmentTypeId: "",
      investmentTypeName: "",
      value: 0,
      taxStatus: "non-retirement",
    });

    toast({
      title: "Investment added",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handle_remove_investment = (id: string) => {
    onChangeConfig({
      investments: investmentsConfig.investments.filter(
        (investment) => investment.id !== id
      ),
    });

    toast({
      title: "Investment removed",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const format_currency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const get_tax_status_display = (status: TaxStatus) => {
    switch (status) {
      case "non-retirement":
        return "Non-Retirement";
      case "pre-tax":
        return "Pre-Tax";
      case "after-tax":
        return "After-Tax";
      default:
        return status;
    }
  };

  const get_tax_status_color = (status: TaxStatus) => {
    switch (status) {
      case "non-retirement":
        return "blue";
      case "pre-tax":
        return "green";
      case "after-tax":
        return "purple";
      default:
        return "gray";
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="4xl" mx="auto" px={4}>
        <Card
          rounded="lg"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
        >
          <CardHeader bg={headerBg} py={5} px={6}>
            <Flex justify="space-between" align="center">
              <Heading
                size="lg"
                color="gray.800"
                display="flex"
                alignItems="center"
              >
                <Icon as={TrendingUp} mr={2} />
                Investment Configuration
              </Heading>
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  onClick={onBack}
                  leftIcon={<Icon as={FiChevronLeft} />}
                >
                  Back
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <Text color="gray.600" mb={6} fontSize="md">
              Add your investments to your financial scenario. Each investment
              type can only be used once. These investments will be used to
              model your financial growth over time.
            </Text>

            {/* Current investments list */}
            {investmentsConfig.investments.length > 0 ? (
              <Box
                mb={8}
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                overflow="hidden"
              >
                <Flex
                  bg={tableHeaderBg}
                  p={4}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  alignItems="center"
                >
                  <Icon as={FiList} color="blue.500" mr={2} />
                  <Heading size="md" color="gray.700">
                    Your Investments
                  </Heading>
                </Flex>

                <Table variant="simple" bg={tableBg}>
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th>Investment Type</Th>
                      <Th>Value</Th>
                      <Th>Tax Status</Th>
                      <Th width="80px"></Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {investmentsConfig.investments.map((investment) => (
                      <Tr key={investment.id} _hover={{ bg: hoverBg }}>
                        <Td fontWeight="medium">
                          {investment.investmentTypeName}
                        </Td>
                        <Td color="green.600" fontWeight="medium">
                          {format_currency(investment.value)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={get_tax_status_color(
                              investment.taxStatus
                            )}
                            px={2}
                            py={1}
                            borderRadius="md"
                          >
                            {get_tax_status_display(investment.taxStatus)}
                          </Badge>
                        </Td>
                        <Td>
                          <Tooltip label="Remove investment">
                            <IconButton
                              aria-label="Remove investment"
                              icon={<Icon as={FiTrash2} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() =>
                                handle_remove_investment(investment.id)
                              }
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box
                mb={8}
                p={6}
                borderWidth="1px"
                borderStyle="dashed"
                borderColor={borderColor}
                borderRadius="md"
                textAlign="center"
              >
                <Icon as={FiList} boxSize={8} color="gray.400" mb={2} />
                <Text color="gray.500">
                  No investments added yet. Use the form below to add your
                  investments.
                </Text>
              </Box>
            )}

            {/* Add investment form */}
            <Box
              p={6}
              bg={formBg}
              borderRadius="md"
              borderWidth="1px"
              borderColor={borderColor}
              mb={4}
            >
              <Heading size="md" mb={4} display="flex" alignItems="center">
                <Icon as={FiPlusCircle} mr={2} color="blue.500" />
                Add New Investment
              </Heading>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired isInvalid={!!errors.investmentType}>
                  <FormLabel fontWeight="medium">Investment Type</FormLabel>
                  <Select
                    value={newInvestment.investmentTypeId}
                    onChange={handle_change_investment_type}
                    placeholder="Select investment type"
                    borderRadius="md"
                  >
                    {available_investment_types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </Select>
                  {errors.investmentType && (
                    <FormErrorMessage>{errors.investmentType}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.value}>
                  <FormLabel fontWeight="medium">Value</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiDollarSign} color="green.500" />
                    </InputLeftElement>
                    <NumberInput
                      min={0}
                      step={1000}
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
                  {errors.value && (
                    <FormErrorMessage>{errors.value}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Tax Status</FormLabel>
                  <RadioGroup
                    value={newInvestment.taxStatus}
                    onChange={handle_change_tax_status}
                  >
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      spacing={{ base: 2, md: 5 }}
                    >
                      <Radio
                        value="non-retirement"
                        colorScheme="blue"
                        size="lg"
                      >
                        <Text fontSize="md">Non-Retirement</Text>
                      </Radio>
                      <Radio value="pre-tax" colorScheme="green" size="lg">
                        <Text fontSize="md">Pre-Tax</Text>
                      </Radio>
                      <Radio value="after-tax" colorScheme="purple" size="lg">
                        <Text fontSize="md">After-Tax</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Flex justifyContent="flex-end">
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    onClick={handle_add_investment}
                    size="md"
                    mt={2}
                  >
                    Add Investment
                  </Button>
                </Flex>
              </VStack>
            </Box>

            {investmentsConfig.investments.length ===
              MOCK_INVESTMENT_TYPES.length && (
              <Text color="orange.500" fontSize="sm" mt={2}>
                All investment types have been used. Remove an existing
                investment to add a different type.
              </Text>
            )}
          </CardBody>

          <CardFooter
            p={6}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="flex-end" width="100%">
              <Button
                colorScheme="blue"
                size="lg"
                onClick={onContinue}
                isDisabled={investmentsConfig.investments.length === 0}
                px={8}
                rightIcon={<Icon as={FiChevronRight} />}
              >
                Continue
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </Box>
    </Box>
  );
};

export default InvestmentsForm;
