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
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import { TrendingUp } from "lucide-react";

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

interface InvestmentsFormProps {
  investmentsConfig: InvestmentsConfig;
  onChangeInvestmentsConfig: (config: InvestmentsConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const InvestmentsForm: React.FC<InvestmentsFormProps> = ({
  investmentsConfig,
  onChangeInvestmentsConfig,
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

    onChangeInvestmentsConfig({
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
    onChangeInvestmentsConfig({
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

  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="4xl" mx="auto" py={12} px={4}>
        <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
          <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color="gray.900">
                Investment Configuration
              </Heading>
              <HStack spacing={2}>
                <Button variant="ghost" colorScheme="blue" onClick={onBack}>
                  Back
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={onContinue}
                  isDisabled={investmentsConfig.investments.length === 0}
                >
                  Next
                </Button>
              </HStack>
            </Flex>

            <Flex align="center" mb={6}>
              <Icon as={TrendingUp} color="blue.500" boxSize={5} mr={2} />
              <Text color="gray.600">
                Add your investments to your financial scenario. Each investment
                type can only be used once.
              </Text>
            </Flex>

            {/* Current investments list */}
            {investmentsConfig.investments.length > 0 ? (
              <Box mb={8}>
                <Heading size="md" color="gray.700" mb={4}>
                  Your Investments
                </Heading>
                <Box
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                  overflow="hidden"
                >
                  <Table variant="simple" size="md">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Investment Type</Th>
                        <Th isNumeric>Value</Th>
                        <Th>Tax Status</Th>
                        <Th width="80px"></Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {investmentsConfig.investments.map((investment) => (
                        <Tr key={investment.id}>
                          <Td fontWeight="medium">
                            {investment.investmentTypeName}
                          </Td>
                          <Td isNumeric>{format_currency(investment.value)}</Td>
                          <Td>
                            {get_tax_status_display(investment.taxStatus)}
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Remove investment"
                              icon={<DeleteIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() =>
                                handle_remove_investment(investment.id)
                              }
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            ) : (
              <Box
                p={5}
                bg="blue.50"
                borderRadius="md"
                mb={8}
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <Text color="blue.700">
                  You haven't added any investments yet. Use the form below to
                  add your first investment.
                </Text>
              </Box>
            )}

            <Divider mb={6} />

            {/* Add new investment form */}
            <Box>
              <Heading size="md" color="gray.700" mb={4}>
                Add New Investment
              </Heading>

              {available_investment_types.length === 0 ? (
                <Box
                  p={5}
                  bg="yellow.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="yellow.500"
                >
                  <Text color="yellow.700">
                    You've added all available investment types. If you want to
                    add a different type, you'll need to remove one of your
                    existing investments first.
                  </Text>
                </Box>
              ) : (
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired isInvalid={!!errors.investmentType}>
                    <FormLabel fontWeight="medium">Investment Type</FormLabel>
                    <Select
                      placeholder="Select investment type"
                      value={newInvestment.investmentTypeId}
                      onChange={handle_change_investment_type}
                    >
                      {available_investment_types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.investmentType}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.value}>
                    <FormLabel fontWeight="medium">Value</FormLabel>
                    <NumberInput
                      min={0}
                      value={newInvestment.value}
                      onChange={handle_change_value}
                      precision={0}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.value}</FormErrorMessage>
                  </FormControl>

                  <FormControl as="fieldset">
                    <FormLabel as="legend" fontWeight="medium">
                      Tax Status
                    </FormLabel>
                    <RadioGroup
                      value={newInvestment.taxStatus}
                      onChange={handle_change_tax_status}
                    >
                      <Stack direction="row" spacing={5}>
                        <Radio value="non-retirement">Non-Retirement</Radio>
                        <Radio value="pre-tax">Pre-Tax</Radio>
                        <Radio value="after-tax">After-Tax</Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="green"
                    onClick={handle_add_investment}
                    alignSelf="flex-start"
                    mt={2}
                  >
                    Add Investment
                  </Button>
                </VStack>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InvestmentsForm;
