/**
 * Now I want you to help me design another page after the event series to ask the user about his
1. inflation assumption
2. financial goal
3. user's state of residence

This is the demand for financial goals
2.1 Financial goal
A financial goal is a non-negative number specifying the desired minimum total value of the user's investments. If a financial goal of 0 is achieved, it means the user is always able to meet their expenses. A positive value for the financial goal represents a safety margin during the user's lifetime and an estate to bequeath afterward.

We only assume a financial goal for one year, not for the entire plan.

The demand for inflation assumption is as follows:
2.6 Inflation assumption
An inflation assumption is defined by (1) a fixed percentage, or (2) a percentage sampled from a specified uniform or normal distribution.

For residence state, we only consider Ny, NJ and CT

Please use sequential thinking to think about how to add this new page after the event series and implement it
 */

import React from "react";
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
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiPercent,
  FiHome,
} from "react-icons/fi";

// Define types
export type InflationType = "fixed" | "uniform" | "normal";

export type InflationConfig = {
  type: InflationType;
  value?: number; // For fixed type
  min?: number; // For uniform type
  max?: number; // For uniform type
  mean?: number; // For normal type
  standardDeviation?: number; // For normal type
};

export type FinancialGoalConfig = {
  value: number; // Non-negative number
};

export type StateOfResidence = "NY" | "NJ" | "CT";

export type AdditionalSettingsConfig = {
  inflationConfig: InflationConfig;
  financialGoal: FinancialGoalConfig;
  stateOfResidence: StateOfResidence;
};

export interface AdditionalSettingsFormProps {
  additionalSettings: AdditionalSettingsConfig;
  onChangeAdditionalSettings: (settings: AdditionalSettingsConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const AdditionalSettingsForm: React.FC<AdditionalSettingsFormProps> = ({
  additionalSettings,
  onChangeAdditionalSettings: onChangeSettings,
  onBack,
  onContinue,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const formBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handle_change_inflation_type = (value: string) => {
    const newType = value as InflationType;
    let updatedConfig: InflationConfig;

    switch (newType) {
      case "fixed":
        updatedConfig = {
          type: "fixed",
          value: additionalSettings.inflationConfig.value || 2.5,
        };
        break;
      case "uniform":
        updatedConfig = {
          type: "uniform",
          min: additionalSettings.inflationConfig.min || 1.0,
          max: additionalSettings.inflationConfig.max || 4.0,
        };
        break;
      case "normal":
        updatedConfig = {
          type: "normal",
          mean: additionalSettings.inflationConfig.mean || 2.5,
          standardDeviation:
            additionalSettings.inflationConfig.standardDeviation || 1.0,
        };
        break;
      default:
        return;
    }

    onChangeSettings({
      ...additionalSettings,
      inflationConfig: updatedConfig,
    });
  };

  const handle_change_financial_goal = (_: string, value: number) => {
    onChangeSettings({
      ...additionalSettings,
      financialGoal: {
        value: Math.max(0, value), // Ensure non-negative
      },
    });
  };

  const handle_change_state = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeSettings({
      ...additionalSettings,
      stateOfResidence: e.target.value as StateOfResidence,
    });
  };

  // Render inflation fields based on type
  const render_inflation_fields = () => {
    const { inflationConfig } = additionalSettings;

    switch (inflationConfig.type) {
      case "fixed":
        return (
          <FormControl isRequired>
            <FormLabel fontWeight="medium">Inflation Rate (%)</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiPercent} color="green.500" />
              </InputLeftElement>
              <NumberInput
                min={0}
                max={20}
                step={0.1}
                value={inflationConfig.value}
                onChange={(_, value) =>
                  onChangeSettings({
                    ...additionalSettings,
                    inflationConfig: {
                      ...inflationConfig,
                      value,
                    },
                  })
                }
                w="100%"
              >
                <NumberInputField pl={10} borderRadius="md" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </FormControl>
        );

      case "uniform":
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Minimum Rate (%)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="green.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  value={inflationConfig.min}
                  onChange={(_, value) =>
                    onChangeSettings({
                      ...additionalSettings,
                      inflationConfig: {
                        ...inflationConfig,
                        min: value,
                      },
                    })
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Maximum Rate (%)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="green.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  value={inflationConfig.max}
                  onChange={(_, value) =>
                    onChangeSettings({
                      ...additionalSettings,
                      inflationConfig: {
                        ...inflationConfig,
                        max: value,
                      },
                    })
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>
          </VStack>
        );

      case "normal":
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Mean (μ) Rate (%)</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="green.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  value={inflationConfig.mean}
                  onChange={(_, value) =>
                    onChangeSettings({
                      ...additionalSettings,
                      inflationConfig: {
                        ...inflationConfig,
                        mean: value,
                      },
                    })
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">
                Standard Deviation (σ) (%)
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="green.500" />
                </InputLeftElement>
                <NumberInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={inflationConfig.standardDeviation}
                  onChange={(_, value) =>
                    onChangeSettings({
                      ...additionalSettings,
                      inflationConfig: {
                        ...inflationConfig,
                        standardDeviation: value,
                      },
                    })
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>
          </VStack>
        );
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
                <Icon as={FiDollarSign} mr={2} />
                Additional Settings
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
              Configure additional important settings for your financial
              scenario, including inflation assumptions, financial goals, and
              state of residence.
            </Text>

            <VStack spacing={8} align="stretch">
              {/* Inflation Configuration */}
              <Box
                p={6}
                bg={formBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiPercent} mr={2} color="green.500" />
                  Inflation Assumptions
                </Heading>

                <FormControl as="fieldset" mb={4}>
                  <FormLabel as="legend" fontWeight="medium">
                    Inflation Type
                  </FormLabel>
                  <RadioGroup
                    value={additionalSettings.inflationConfig.type}
                    onChange={handle_change_inflation_type}
                  >
                    <Stack
                      direction={{ base: "column", md: "row" }}
                      spacing={5}
                    >
                      <Radio value="fixed" colorScheme="green" size="lg">
                        <Text fontSize="md">Fixed Percentage</Text>
                      </Radio>
                      <Radio value="uniform" colorScheme="green" size="lg">
                        <Text fontSize="md">Uniform Distribution</Text>
                      </Radio>
                      <Radio value="normal" colorScheme="green" size="lg">
                        <Text fontSize="md">Normal Distribution</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {render_inflation_fields()}
              </Box>

              {/* Financial Goal */}
              <Box
                p={6}
                bg={formBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiDollarSign} mr={2} color="blue.500" />
                  Financial Goal
                </Heading>

                <Text color="gray.600" mb={4} fontSize="sm">
                  Set your annual financial goal. A value of 0 indicates that
                  you wish to meet all your expenses. A positive value
                  represents a desired minimum total value of your investments.
                </Text>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">
                    Annual Goal Amount ($)
                  </FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiDollarSign} color="blue.500" />
                    </InputLeftElement>
                    <NumberInput
                      min={0}
                      step={1000}
                      value={additionalSettings.financialGoal.value}
                      onChange={handle_change_financial_goal}
                      w="100%"
                    >
                      <NumberInputField pl={10} borderRadius="md" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>
              </Box>

              {/* State of Residence */}
              <Box
                p={6}
                bg={formBg}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiHome} mr={2} color="purple.500" />
                  State of Residence
                </Heading>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Select State</FormLabel>
                  <Select
                    value={additionalSettings.stateOfResidence}
                    onChange={handle_change_state}
                    borderRadius="md"
                  >
                    <option value="NY">New York (NY)</option>
                    <option value="NJ">New Jersey (NJ)</option>
                    <option value="CT">Connecticut (CT)</option>
                  </Select>
                </FormControl>
              </Box>
            </VStack>
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

export default AdditionalSettingsForm;
