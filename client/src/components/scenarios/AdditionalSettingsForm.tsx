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
  SimpleGrid,
  Container,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip,
  Grid,
  GridItem,
  Badge,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiPercent,
  FiHome,
  FiMinusCircle,
  FiSettings,
  FiTarget,
  FiMapPin,
  FiInfo,
  FiBarChart,
  FiShield,
} from "react-icons/fi";
import { useState } from "react";
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
  afterTaxContributionLimit: number; 
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
  // AI-generated code
  // upgrade the UI for this page to make it looks better and more modern
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const sectionBg = useColorModeValue("white", "gray.800");
  const statBg = useColorModeValue("blue.50", "blue.900");
  const statIconBg = useColorModeValue("blue.100", "blue.800");
  const statTextColor = useColorModeValue("gray.600", "gray.400");

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

  const handle_change_financial_goal = (valueString: string, value: number) => {
    if (valueString === "") {
        onChangeSettings({
          ...additionalSettings,
          financialGoal: {
            value: 0, // ensure non-negative
          },
        });
    } else {
        onChangeSettings({
          ...additionalSettings,
          financialGoal: {
            value: Math.max(0, value), // ensure non-negative
          },
        });
    }
  };

  const handle_change_state = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeSettings({
      ...additionalSettings,
      stateOfResidence: e.target.value as StateOfResidence,
    });
  };

  // Get colored inflation type badge
  const get_inflation_type_badge = (type: InflationType) => {
    switch (type) {
      case "fixed":
        return (
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            Fixed Rate
          </Badge>
        );
      case "uniform":
        return (
          <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
            Uniform Distribution
          </Badge>
        );
      case "normal":
        return (
          <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
            Normal Distribution
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get state name from code
  const get_state_name = (code: StateOfResidence) => {
    switch (code) {
      case "NY":
        return "New York";
      case "NJ":
        return "New Jersey";
      case "CT":
        return "Connecticut";
      default:
        return code;
    }
  };

  // Get formatted inflation value for display
  const get_inflation_display = () => {
    const { inflationConfig } = additionalSettings;

    switch (inflationConfig.type) {
      case "fixed":
        return `${inflationConfig.value}%`;
      case "uniform":
        return `${inflationConfig.min}% to ${inflationConfig.max}%`;
      case "normal":
        return `μ: ${inflationConfig.mean}%, σ: ${inflationConfig.standardDeviation}%`;
      default:
        return "Not set";
    }
  };
  
  const [inflation_buffer1, set_inflation_buffer1] = useState("");
  const [inflation_buffer2, set_inflation_buffer2] = useState("");
  const reset_inflation_buffer = () => {
    set_inflation_buffer1("");
    set_inflation_buffer2("");
  }

  // Render inflation card options
  const render_inflation_type_options = () => {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box
          as="button"
          type="button"
          p={4}
          borderWidth="2px"
          borderRadius="lg"
          borderColor={
            additionalSettings.inflationConfig.type === "fixed"
              ? "green.500"
              : "gray.200"
          }
          bg={
            additionalSettings.inflationConfig.type === "fixed"
              ? "green.50"
              : "transparent"
          }
          _hover={{ bg: "green.50", borderColor: "green.300" }}
          _dark={{
            borderColor:
              additionalSettings.inflationConfig.type === "fixed"
                ? "green.500"
                : "gray.600",
            bg:
              additionalSettings.inflationConfig.type === "fixed"
                ? "green.900"
                : "transparent",
            _hover: { bg: "green.900", borderColor: "green.700" },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type("fixed");
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue("green.100", "green.800")}
              color={useColorModeValue("green.600", "green.300")}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiPercent} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Fixed Rate
            </Text>
            <Text fontSize="sm" color="gray.500">
              Single percentage value
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
            additionalSettings.inflationConfig.type === "uniform"
              ? "orange.500"
              : "gray.200"
          }
          bg={
            additionalSettings.inflationConfig.type === "uniform"
              ? "orange.50"
              : "transparent"
          }
          _hover={{ bg: "orange.50", borderColor: "orange.300" }}
          _dark={{
            borderColor:
              additionalSettings.inflationConfig.type === "uniform"
                ? "orange.500"
                : "gray.600",
            bg:
              additionalSettings.inflationConfig.type === "uniform"
                ? "orange.900"
                : "transparent",
            _hover: { bg: "orange.900", borderColor: "orange.700" },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type("uniform")
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue("orange.100", "orange.800")}
              color={useColorModeValue("orange.600", "orange.300")}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiBarChart} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Uniform Distribution
            </Text>
            <Text fontSize="sm" color="gray.500">
              Range between min and max
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
            additionalSettings.inflationConfig.type === "normal"
              ? "purple.500"
              : "gray.200"
          }
          bg={
            additionalSettings.inflationConfig.type === "normal"
              ? "purple.50"
              : "transparent"
          }
          _hover={{ bg: "purple.50", borderColor: "purple.300" }}
          _dark={{
            borderColor:
              additionalSettings.inflationConfig.type === "normal"
                ? "purple.500"
                : "gray.600",
            bg:
              additionalSettings.inflationConfig.type === "normal"
                ? "purple.900"
                : "transparent",
            _hover: { bg: "purple.900", borderColor: "purple.700" },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type("normal");
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue("purple.100", "purple.800")}
              color={useColorModeValue("purple.600", "purple.300")}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiBarChart} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Normal Distribution
            </Text>
            <Text fontSize="sm" color="gray.500">
              Mean and standard deviation
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>
    );
  };

  
  // Render inflation fields based on type
  const render_inflation_fields = () => {
    const { inflationConfig } = additionalSettings;

    const convertToValidNumber = (value: string): number => {
      if (value === '' || value === '.') return 0;
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    };

    const handle_change_inflation = (field: string, value: string, update_func: Function) => {
      let processedValue = value;
      processedValue = processedValue
      .replace(/,/g, '.') 
      .replace(/[^0-9.]/g, '')
      .replace(/(\..*)\./g, '$1'); 
      if (processedValue.startsWith("0") && processedValue.length > 1 && !processedValue.startsWith("0.")) {
        processedValue = processedValue.substring(1);
      } else if (processedValue.startsWith(".")) {
        processedValue = `0${processedValue}`
      } 
      update_func(processedValue);


      let finalValue = convertToValidNumber(processedValue);
      switch (field) {
        case 'value':
        case 'mean':
          finalValue = Math.min(20, Math.max(0, finalValue));
          break;
        case 'min':
          finalValue = Math.min(
            additionalSettings.inflationConfig.max ?? 20,
            Math.max(0, finalValue)
          );
          break;
        case 'max':
          finalValue = Math.max(
            additionalSettings.inflationConfig.min ?? 0,
            Math.min(20, finalValue)
          );
          break;
        case 'standardDeviation':
          finalValue = Math.min(10, Math.max(0.1, finalValue));
          break;
      }
      const newInflationConfig = {
        ...additionalSettings.inflationConfig,
        [field]: Number(finalValue.toFixed(4)) 
      };
      
      console.log(newInflationConfig);
    
      onChangeSettings({
        ...additionalSettings,
        inflationConfig: newInflationConfig
      });
    }

    switch (inflationConfig.type) {
      case "fixed":
        return (
          <FormControl isRequired>
            <FormLabel fontWeight="medium">Inflation Rate (%)</FormLabel>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiPercent} color="green.500" />
              </InputLeftElement>
              <NumberInput
                min={0}
                max={20}
                inputMode="decimal"
                pattern="[0-9.,]*"
                step={0.0001}
                precision={4}
                value={inflation_buffer1}
                onChange={(valueAsString: string) => handle_change_inflation("value", valueAsString, set_inflation_buffer1)}
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
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Minimum Rate (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="orange.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={inflation_buffer1}
                  onChange={(valueAsString: string) => handle_change_inflation("min", valueAsString, set_inflation_buffer1)}
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
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="orange.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={inflation_buffer2}
                  onChange={(valueAsString: string) => handle_change_inflation("max", valueAsString, set_inflation_buffer2)}
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
          </SimpleGrid>
        );

      case "normal":
        return (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Mean (μ) Rate (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="purple.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  value={inflation_buffer1}
                  onChange={(valueAsString: string) => handle_change_inflation("mean", valueAsString, set_inflation_buffer1)}
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
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="purple.500" />
                </InputLeftElement>
                <NumberInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={inflation_buffer2}
                  onChange={(valueAsString: string) => handle_change_inflation("standardDeviation", valueAsString, set_inflation_buffer2)}
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
          </SimpleGrid>
        );
    }
  };

  // State card options
  const render_state_options = () => {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {["NY", "NJ", "CT"].map((stateCode) => (
          <Box
            key={stateCode}
            as="button"
            type="button"
            p={4}
            borderWidth="2px"
            borderRadius="lg"
            borderColor={
              additionalSettings.stateOfResidence === stateCode
                ? "blue.500"
                : "gray.200"
            }
            bg={
              additionalSettings.stateOfResidence === stateCode
                ? "blue.50"
                : "transparent"
            }
            _hover={{ bg: "blue.50", borderColor: "blue.300" }}
            _dark={{
              borderColor:
                additionalSettings.stateOfResidence === stateCode
                  ? "blue.500"
                  : "gray.600",
              bg:
                additionalSettings.stateOfResidence === stateCode
                  ? "blue.900"
                  : "transparent",
              _hover: { bg: "blue.900", borderColor: "blue.700" },
            }}
            transition="all 0.2s"
            onClick={() =>
              onChangeSettings({
                ...additionalSettings,
                stateOfResidence: stateCode as StateOfResidence,
              })
            }
          >
            <Flex direction="column" align="center">
              <Flex
                mb={3}
                bg={useColorModeValue("blue.100", "blue.800")}
                color={useColorModeValue("blue.600", "blue.300")}
                p={2}
                borderRadius="md"
              >
                <Icon as={FiMapPin} boxSize={5} />
              </Flex>
              <Text fontWeight="bold" fontSize="md" mb={1}>
                {get_state_name(stateCode as StateOfResidence)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {stateCode}
              </Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

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
            bg={useColorModeValue("blue.50", "blue.900")}
            py={6}
            px={8}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={FiSettings} boxSize={6} color="blue.500" />
                <Heading size="lg" fontWeight="bold">
                  Additional Settings
                </Heading>
              </HStack>
              <Button
                variant="ghost"
                colorScheme="blue"
                onClick={onBack}
                leftIcon={<Icon as={FiChevronLeft} />}
                size="md"
              >
                Back
              </Button>
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
                borderRightWidth={{ base: 0, md: "1px" }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: "1px", md: 0 }}
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
                    <Icon as={FiPercent} color="green.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Inflation Model
                  </Text>
                </HStack>
                <Flex align="center" gap={2}>
                  <Heading size="md" fontWeight="bold">
                    {get_inflation_type_badge(
                      additionalSettings.inflationConfig.type
                    )}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    {get_inflation_display()}
                  </Text>
                </Flex>
              </Box>

              <Box
                p={6}
                borderRightWidth={{ base: 0, md: "1px" }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: "1px", md: 0 }}
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
                    <Icon as={FiTarget} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Financial Goal
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="bold" color="green.500">
                  ${additionalSettings.financialGoal.value.toLocaleString()}
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
                    <Icon as={FiMapPin} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    State of Residence
                  </Text>
                </HStack>
                <Heading size="md" fontWeight="bold">
                  {get_state_name(additionalSettings.stateOfResidence)}
                  <Badge ml={2} colorScheme="blue">
                    {additionalSettings.stateOfResidence}
                  </Badge>
                </Heading>
              </Box>
            </SimpleGrid>

            <Box p={8}>
              <Text fontSize="lg" fontWeight="medium" mb={6}>
                Configure additional important settings for your financial
                scenario, including inflation assumptions, financial goals, and
                state of residence.
              </Text>

              {/* After tax contribution limit */}
              <Card
                mb={8}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
              >
                <CardHeader
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  py={4}
                  px={6}
                >
                  <Flex alignItems="center">
                    <Icon as={FiMinusCircle} mr={2} color="green.500" boxSize={5} />
                    <Heading size="md">After tax contribution limit</Heading>
                    <Tooltip
                      label="After tax contribution limit is an annual limit on contributions to after-tax retirement accounts"
                      placement="top"
                      hasArrow
                    >
                      <Box ml={2}>
                        <Icon as={FiInfo} color="gray.400" boxSize={5} />
                      </Box>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody p={6}>
                  <Text fontSize="md" color="gray.600" mb={6}>
                      Set the maximum amount you plan to contribute to after-tax accounts in your 
                      financial plan. This helps model savings beyond traditional retirement 
                      limits and can be adjusted to reflect your specific goals or income strategies.
                  </Text>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">After Tax Contribution Limit</FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiMinusCircle} color="green.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={0}
                          step={1}
                          value={additionalSettings.afterTaxContributionLimit}
                          onChange={(valueString, value) => {
                            if (valueString === "") {
                              onChangeSettings({
                                ...additionalSettings,
                                afterTaxContributionLimit: 0
                              })
                            } else {
                              onChangeSettings({
                                ...additionalSettings,
                                afterTaxContributionLimit: value
                              })
                            }
                          }
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
                </CardBody>
              </Card>
              {/* Inflation Configuration */}
              <Card
                mb={8}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
              >
                <CardHeader
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  py={4}
                  px={6}
                >
                  <Flex alignItems="center">
                    <Icon as={FiPercent} mr={2} color="green.500" boxSize={5} />
                    <Heading size="md">Inflation Assumptions</Heading>
                    <Tooltip
                      label="Inflation impacts how costs increase over time and affects investment growth"
                      placement="top"
                      hasArrow
                    >
                      <Box ml={2}>
                        <Icon as={FiInfo} color="gray.400" boxSize={5} />
                      </Box>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody p={6}>
                  <Text fontSize="md" color="gray.600" mb={6}>
                    Choose how you want to model inflation in your financial
                    plan. You can use a fixed rate or statistical distributions
                    for more sophisticated modeling.
                  </Text>

                  {render_inflation_type_options()}

                  {render_inflation_fields()}
                </CardBody>
              </Card>

              {/* Financial Goal */}
              <Card
                mb={8}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
              >
                <CardHeader
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  py={4}
                  px={6}
                >
                  <Flex alignItems="center">
                    <Icon as={FiTarget} mr={2} color="blue.500" boxSize={5} />
                    <Heading size="md">Financial Goal</Heading>
                    <Tooltip
                      label="A financial goal of $0 means meeting all expenses. Higher values represent safety margins and potential inheritance."
                      placement="top"
                      hasArrow
                    >
                      <Box ml={2}>
                        <Icon as={FiInfo} color="gray.400" boxSize={5} />
                      </Box>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody p={6}>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                    <Box>
                      <Text fontSize="md" color="gray.600" mb={4}>
                        Set your annual financial goal. A value of $0 indicates
                        that you wish to meet all your expenses. A positive
                        value represents a desired minimum total value of your
                        investments.
                      </Text>

                      <Flex mt={6} gap={4} align="center">
                        <Icon
                          as={FiShield}
                          color="green.500"
                          boxSize={12}
                          opacity={0.8}
                        />
                        <Box>
                          <Text
                            fontWeight="medium"
                            fontSize="sm"
                            color="gray.500"
                          >
                            Recommended
                          </Text>
                          <Text fontWeight="bold">
                            Set a safety margin of 10-20% of your annual
                            expenses
                          </Text>
                        </Box>
                      </Flex>
                    </Box>

                    <Box>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">
                          Annual Goal Amount ($)
                        </FormLabel>
                        <InputGroup size="lg">
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
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* State of Residence */}
              <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                shadow="sm"
              >
                <CardHeader
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderBottomWidth="1px"
                  borderBottomColor={borderColor}
                  py={4}
                  px={6}
                >
                  <Flex alignItems="center">
                    <Icon as={FiMapPin} mr={2} color="blue.500" boxSize={5} />
                    <Heading size="md">State of Residence</Heading>
                    <Tooltip
                      label="Your state of residence affects tax calculations and other location-specific factors."
                      placement="top"
                      hasArrow
                    >
                      <Box ml={2}>
                        <Icon as={FiInfo} color="gray.400" boxSize={5} />
                      </Box>
                    </Tooltip>
                  </Flex>
                </CardHeader>
                <CardBody p={6}>
                  <Text fontSize="md" color="gray.600" mb={6}>
                    Select your state of residence. This will be used for tax
                    planning purposes and other state-specific financial
                    considerations.
                  </Text>

                  {render_state_options()}
                </CardBody>
              </Card>
            </Box>
          </CardBody>

          <CardFooter
            py={6}
            px={8}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="flex-end" width="100%" alignItems="center">
              <Text color="gray.500" fontSize="sm" mr="auto">
                All settings completed
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => {
                  console.log(additionalSettings.inflationConfig)
                  onContinue();
                }}
                px={8}
                rightIcon={<Icon as={FiChevronRight} />}
                fontWeight="bold"
              >
                Save and Finish
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </Container>
    </Box>
  );
};

export default AdditionalSettingsForm;
