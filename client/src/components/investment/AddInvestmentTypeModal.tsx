import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepSeparator,
  useSteps,
  Grid,
  Text,
  Divider,
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  Stack,
  Flex,
  Heading,
  useColorModeValue,
  Icon,
  Badge,
  Tag,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { InvestmentTypeRaw } from "../../types/Scenarios";
import { DistributionType } from "../../types/Enum";
import {
  FiCheck,
  FiDollarSign,
  FiPercent,
  FiInfo,
  FiPieChart,
} from "react-icons/fi";

// AI-generated code
// Generate a prettier modal for adding investment types
// Define value input modes for form handling
export enum ValueInputMode {
  PERCENT = "percentage",
  AMOUNT = "amount",
}

// Define form state interface that's more friendly for the UI
// *这里定义了form的state，用于存储用户输入的数据
interface InvestmentTypeForm {
  name: string;
  description: string;
  returnType: string;
  returnRate: string;
  returnInputMode: string;
  returnRateStdDev?: string;
  expenseRatio: string;
  dividendType: string;
  dividendRate: string;
  dividendInputMode: string;
  dividendRateStdDev?: string;
  taxability: boolean;
}

// Define props for the component
interface AddInvestmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investmentType: InvestmentTypeRaw) => void;
  initialData?: InvestmentTypeRaw; // Added for edit mode
  isEditMode?: boolean; // Flag to indicate if in edit mode
}

// Create the component
const AddInvestmentTypeModal: React.FC<AddInvestmentTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditMode = false,
}) => {
  // Define the steps
  const steps = [
    { title: "Basic Info", description: "Name and description", icon: FiInfo },
    {
      title: "Return Details",
      description: "Expected returns and expense ratio",
      icon: FiPieChart,
    },
    {
      title: "Income & Tax",
      description: "Dividend income and taxability",
      icon: FiDollarSign,
    },
    { title: "Review", description: "Review and save", icon: FiCheck },
  ];

  // Initialize at review step (3) if editing, otherwise at first step (0)
  const { activeStep, setActiveStep } = useSteps({
    index: isEditMode ? 3 : 0,
    count: steps.length,
  });

  // Reset active step when edit mode changes
  useEffect(() => {
    setActiveStep(isEditMode ? 3 : 0);
  }, [isEditMode, setActiveStep]);

  // Default empty form values
  const defaultFormValues: InvestmentTypeForm = {
    name: "",
    description: "",
    returnType: DistributionType.FIXED,
    returnRate: "",
    returnInputMode: ValueInputMode.PERCENT,
    expenseRatio: "",
    dividendType: DistributionType.FIXED,
    dividendRate: "",
    dividendInputMode: ValueInputMode.PERCENT,
    taxability: true,
  };

  // Initialize form data with initialData if provided
  const [formData, setFormData] = useState<InvestmentTypeForm>(() => {
    if (initialData) {
      // Extract values from return distribution
      const returnType =
        initialData.returnDistribution[0].type || DistributionType.FIXED;
      const returnRateKey =
        returnType === DistributionType.FIXED ? "value" : "mean";
      const returnRate =
        initialData.returnDistribution[0][returnRateKey]?.toString() || "0";
      const returnRateStdDev =
        returnType === DistributionType.NORMAL
          ? initialData.returnDistribution[0]["stdev"]?.toString()
          : undefined;

      // Extract values from income distribution
      const dividendType =
        initialData.incomeDistribution[0].type || DistributionType.FIXED;
      const dividendRateKey =
        dividendType === DistributionType.FIXED ? "value" : "mean";
      const dividendRate =
        initialData.incomeDistribution[0][dividendRateKey]?.toString() || "0";
      const dividendRateStdDev =
        dividendType === DistributionType.NORMAL
          ? initialData.incomeDistribution[0]["stdev"]?.toString()
          : undefined;

      return {
        name: initialData.name || "",
        description: initialData.description || "",
        returnType: returnType,
        returnRate: returnRate,
        returnInputMode: initialData.returnAmtOrPct || ValueInputMode.PERCENT,
        returnRateStdDev: returnRateStdDev,
        expenseRatio: initialData.expenseRatio.toString() || "0",
        dividendType: dividendType,
        dividendRate: dividendRate,
        dividendInputMode: initialData.incomeAmtOrPct || ValueInputMode.PERCENT,
        dividendRateStdDev: dividendRateStdDev,
        taxability: initialData.taxability,
      };
    }

    return defaultFormValues;
  });

  // Reset form when modal is closed
  const handleModalClose = () => {
    // Only reset if not in edit mode to prevent resetting when closing during edit
    if (!isEditMode) {
      setFormData(defaultFormValues);
      setActiveStep(0);
    }
    onClose();
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle numeric input changes - now just uses regular handleInputChange since we're using strings
  // We'll convert to numbers when submitting

  // Prevent mouse wheel from changing number input values
  const preventWheelChange = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Handle radio input changes
  const handleRadioInputChange = (id: string, value: string) => {
    console.log("handleRadioInputChange", id, value);
    setFormData({ ...formData, [id]: value });
  };

  // Handle taxability change
  const handleTaxabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      taxability: value === "taxable",
    });
  };

  // Handle return type change
  const handleReturnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      returnType: value,
      // Reset the standard deviation when switching to fixed
      returnRateStdDev:
        value === DistributionType.FIXED
          ? undefined
          : formData.returnRateStdDev || "",
    });
  };

  // Handle dividend type change
  const handleDividendTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      dividendType: value,
      // Reset the standard deviation when switching to fixed
      dividendRateStdDev:
        value === DistributionType.FIXED
          ? undefined
          : formData.dividendRateStdDev || "",
    });
  };

  // Navigation functions
  const handleNext = () => {
    if (validateCurrentStep()) {
      // Only save the values, don't change types in the form data
      setActiveStep(Math.min(activeStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  const handleSave = () => {
    try {
      // Convert form data to InvestmentTypeRaw format
      const investmentType: InvestmentTypeRaw = {
        name: formData.name,
        description: formData.description,
        returnAmtOrPct: formData.returnInputMode,
        expenseRatio: parseFloat(formData.expenseRatio) / 100, // Convert from percentage to decimal
        incomeAmtOrPct: formData.dividendInputMode,
        taxability: formData.taxability,
        id: initialData && initialData.id ? initialData.id : undefined,
        returnDistribution: [], // Initialize with empty array
        incomeDistribution: [], // Initialize with empty array
      };

      // Create return distribution based on type
      if (formData.returnType === DistributionType.FIXED) {
        investmentType.returnDistribution = [
          {
            type: DistributionType.FIXED,
            value:
              formData.returnInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.returnRate) / 100
                : parseFloat(formData.returnRate),
          },
        ];
      } else if (formData.returnType === DistributionType.NORMAL) {
        investmentType.returnDistribution = [
          {
            type: DistributionType.NORMAL,
            mean:
              formData.returnInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.returnRate) / 100
                : parseFloat(formData.returnRate),
            stdev:
              formData.returnInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.returnRateStdDev || "0") / 100
                : parseFloat(formData.returnRateStdDev || "0"),
          },
        ];
      }

      // Create income distribution based on type
      if (formData.dividendType === DistributionType.FIXED) {
        investmentType.incomeDistribution = [
          {
            type: DistributionType.FIXED,
            value:
              formData.dividendInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.dividendRate) / 100
                : parseFloat(formData.dividendRate),
          },
        ];
      } else if (formData.dividendType === DistributionType.NORMAL) {
        investmentType.incomeDistribution = [
          {
            type: DistributionType.NORMAL,
            mean:
              formData.dividendInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.dividendRate) / 100
                : parseFloat(formData.dividendRate),
            stdev:
              formData.dividendInputMode === ValueInputMode.PERCENT
                ? parseFloat(formData.dividendRateStdDev || "0") / 100
                : parseFloat(formData.dividendRateStdDev || "0"),
          },
        ];
      }

      // Pass the data to the parent component
      onSave(investmentType);

      // Reset form and modal
      handleModalClose();
    } catch (error) {
      console.error("Error saving investment type:", error);
      // Consider adding error handling UI here
    }
  };

  // Validation function
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        return !!formData.name && !!formData.description;
      case 1: // Return Details
        // Check for valid number formats
        const returnRateStr = formData.returnRate.trim();
        const returnRateStdDevStr = formData.returnRateStdDev
          ? formData.returnRateStdDev.trim()
          : "";
        const expenseRatioStr = formData.expenseRatio.trim();

        // Check if inputs are valid numbers
        const returnRateValid = is_valid_number_input(returnRateStr);
        const returnRateStdDevValid =
          formData.returnType !== DistributionType.NORMAL ||
          (returnRateStdDevStr !== "" &&
            is_valid_number_input(returnRateStdDevStr));
        const expenseRatioValid = is_valid_number_input(expenseRatioStr);

        return returnRateValid && returnRateStdDevValid && expenseRatioValid;
      case 2: // Income & Tax
        // Check for valid number formats
        const dividendRateStr = formData.dividendRate.trim();
        const dividendRateStdDevStr = formData.dividendRateStdDev
          ? formData.dividendRateStdDev.trim()
          : "";

        // Check if inputs are valid numbers
        const dividendRateValid = is_valid_number_input(dividendRateStr);
        const dividendRateStdDevValid =
          formData.dividendType !== DistributionType.NORMAL ||
          (dividendRateStdDevStr !== "" &&
            is_valid_number_input(dividendRateStdDevStr));

        return dividendRateValid && dividendRateStdDevValid;
      case 3: // Review
        return true; // All validations already happened in previous steps
      default:
        return false;
    }
  };

  // Helper function to validate number inputs
  const is_valid_number_input = (value: string): boolean => {
    // Empty string is invalid
    if (value === "") return false;

    // Check if it can be parsed as a valid number
    const parsedNum = parseFloat(value);
    if (isNaN(parsedNum)) return false;

    // Check for invalid formats like 01, 02, etc.
    // Allow 0 by itself, but not numbers starting with 0 followed by other digits
    if (
      value.length > 1 &&
      value.startsWith("0") &&
      !value.startsWith("0.") &&
      value[1] !== "."
    )
      return false;

    // Allow negative zero "-0"
    if (value === "-0") return true;

    // Allow negative numbers starting with decimal like "-.5"
    if (value.startsWith("-.") || value.startsWith("-0.")) return true;

    // Allow numbers starting with decimal like ".5"
    if (value.startsWith(".")) return false;

    return true;
  };

  // Helper functions for generating field labels
  const getReturnRateLabel = () => {
    if (formData.returnInputMode === ValueInputMode.PERCENT) {
      return formData.returnType === DistributionType.NORMAL
        ? "Average Annual Return Rate (%)"
        : "Annual Return Rate (%)";
    } else {
      return formData.returnType === DistributionType.NORMAL
        ? "Average Annual Return Amount ($)"
        : "Annual Return Amount ($)";
    }
  };

  const getDividendRateLabel = () => {
    if (formData.dividendInputMode === ValueInputMode.PERCENT) {
      return formData.dividendType === DistributionType.NORMAL
        ? "Average Annual Income Rate (%)"
        : "Annual Income Rate (%)";
    } else {
      return formData.dividendType === DistributionType.NORMAL
        ? "Average Annual Income Amount ($)"
        : "Annual Income Amount ($)";
    }
  };

  const getReturnRateDescription = () => {
    return formData.returnInputMode === ValueInputMode.PERCENT
      ? "The annual percentage change in value"
      : "The annual dollar amount change in value";
  };

  const getDividendRateDescription = () => {
    return formData.dividendInputMode === ValueInputMode.PERCENT
      ? "The annual percentage paid as income"
      : "The annual dollar amount paid as income";
  };

  // Colors
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBgColor = useColorModeValue("gray.50", "gray.700");
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const accentColor = useColorModeValue("purple.50", "purple.800");

  // Render different steps based on active step
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfoStep();
      case 1:
        return renderReturnDetailsStep();
      case 2:
        return renderIncomeAndTaxStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Step 1: Basic Information
  const renderBasicInfoStep = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Box p={4} bg={accentColor} borderRadius="md">
          <HStack>
            <Icon as={FiInfo} boxSize={6} color={highlightColor} />
            <Text fontWeight="medium">
              Enter the basic information about this investment type.
            </Text>
          </HStack>
        </Box>

        <FormControl id="name" isRequired>
          <FormLabel fontWeight="medium">Investment Name</FormLabel>
          <Input
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., S&P 500 Index Fund"
            size="md"
            borderRadius="md"
            borderColor={borderColor}
            _hover={{ borderColor: highlightColor }}
            _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
          />
        </FormControl>

        <FormControl id="description" isRequired>
          <FormLabel fontWeight="medium">Description</FormLabel>
          <Textarea
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe this investment type..."
            rows={4}
            borderRadius="md"
            borderColor={borderColor}
            _hover={{ borderColor: highlightColor }}
            _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
          />
        </FormControl>
      </VStack>
    );
  };

  // Step 2: Return Details
  const renderReturnDetailsStep = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Box p={4} bg={accentColor} borderRadius="md">
          <HStack>
            <Icon as={FiPieChart} boxSize={6} color={highlightColor} />
            <Text fontWeight="medium">
              Define how this investment's value is expected to change over
              time.
            </Text>
          </HStack>
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl mb={4}>
            <FormLabel fontWeight="medium">
              Return Amount or Percentage
            </FormLabel>
            <RadioGroup
              value={formData.returnInputMode}
              onChange={(value) =>
                handleRadioInputChange("returnInputMode", value)
              }
            >
              <Stack direction="row" spacing={6}>
                <Radio value={ValueInputMode.PERCENT} colorScheme="blue">
                  <HStack>
                    <Icon as={FiPercent} />
                    <Text>Percentage</Text>
                  </HStack>
                </Radio>
                <Radio value={ValueInputMode.AMOUNT} colorScheme="blue">
                  <HStack>
                    <Icon as={FiDollarSign} />
                    <Text>Fixed Amount</Text>
                  </HStack>
                </Radio>
              </Stack>
            </RadioGroup>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formData.returnInputMode === ValueInputMode.PERCENT
                ? "Return is calculated as a percentage of the investment value"
                : "Return is a fixed dollar amount regardless of investment value"}
            </Text>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontWeight="medium">Return Distribution</FormLabel>
            <Select
              id="returnType"
              value={formData.returnType}
              onChange={handleReturnTypeChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
            >
              <option value={DistributionType.FIXED}>Fixed</option>
              <option value={DistributionType.NORMAL}>
                Normal Distribution
              </option>
            </Select>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formData.returnType === DistributionType.FIXED
                ? "A constant return that doesn't vary year to year"
                : "Returns vary according to a normal (bell curve) distribution"}
            </Text>
          </FormControl>
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl mb={4}>
            <FormLabel fontWeight="medium" color="pink.500">
              {getReturnRateLabel()}
            </FormLabel>
            <Input
              id="returnRate"
              type="text"
              value={formData.returnRate}
              onChange={handleInputChange}
              onWheel={preventWheelChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
              placeholder="enter a number here(could be negative)"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              {getReturnRateDescription()}
            </Text>
          </FormControl>

          {formData.returnType === DistributionType.NORMAL && (
            <FormControl mb={4}>
              <FormLabel fontWeight="medium">
                {formData.returnInputMode === ValueInputMode.PERCENT
                  ? "Standard Deviation (%)"
                  : "Standard Deviation ($)"}
              </FormLabel>
              <Input
                id="returnRateStdDev"
                type="text"
                value={formData.returnRateStdDev || ""}
                onChange={handleInputChange}
                onWheel={preventWheelChange}
                borderRadius="md"
                borderColor={borderColor}
                _hover={{ borderColor: highlightColor }}
                _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
                placeholder="input the standard deviation here"
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Measures the volatility or variation in returns
              </Text>
            </FormControl>
          )}
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl>
            <FormLabel fontWeight="medium">Expense Ratio (%)</FormLabel>
            <Input
              id="expenseRatio"
              type="text"
              value={formData.expenseRatio}
              onChange={handleInputChange}
              onWheel={preventWheelChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
              placeholder="e.g., 0.5 for 0.5%"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              Annual percentage deducted from the investment to cover management
              costs
            </Text>
          </FormControl>
        </Box>
      </VStack>
    );
  };

  // Step 3: Income and Tax
  const renderIncomeAndTaxStep = () => {
    return (
      <VStack spacing={6} align="stretch">
        <Box p={4} bg={accentColor} borderRadius="md">
          <HStack>
            <Icon as={FiDollarSign} boxSize={6} color={highlightColor} />
            <Text fontWeight="medium">
              Define any income generated by this investment and its tax
              treatment.
            </Text>
          </HStack>
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl mb={4}>
            <FormLabel fontWeight="medium">
              Income Amount or Percentage
            </FormLabel>
            <RadioGroup
              value={formData.dividendInputMode}
              onChange={(value) =>
                handleRadioInputChange("dividendInputMode", value)
              }
            >
              <Stack direction="row" spacing={6}>
                <Radio value={ValueInputMode.PERCENT} colorScheme="blue">
                  <HStack>
                    <Icon as={FiPercent} />
                    <Text>Percentage</Text>
                  </HStack>
                </Radio>
                <Radio value={ValueInputMode.AMOUNT} colorScheme="blue">
                  <HStack>
                    <Icon as={FiDollarSign} />
                    <Text>Fixed Amount</Text>
                  </HStack>
                </Radio>
              </Stack>
            </RadioGroup>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formData.dividendInputMode === ValueInputMode.PERCENT
                ? "Income is calculated as a percentage of the investment value"
                : "Income is a fixed dollar amount regardless of investment value"}
            </Text>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel fontWeight="medium">Income Distribution</FormLabel>
            <Select
              id="dividendType"
              value={formData.dividendType}
              onChange={handleDividendTypeChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
            >
              <option value={DistributionType.FIXED}>Fixed</option>
              <option value={DistributionType.NORMAL}>
                Normal Distribution
              </option>
            </Select>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formData.dividendType === DistributionType.FIXED
                ? "A constant income that doesn't vary year to year"
                : "Income vary according to a normal (bell curve) distribution"}
            </Text>
          </FormControl>
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl mb={4}>
            <FormLabel fontWeight="medium" color="pink.500">
              {getDividendRateLabel()}
            </FormLabel>
            <Input
              id="dividendRate"
              type="text"
              value={formData.dividendRate}
              onChange={handleInputChange}
              onWheel={preventWheelChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
              placeholder="enter a number here(could be negative)"
            />
            <Text fontSize="sm" color="gray.500" mt={2}>
              {getDividendRateDescription()}
            </Text>
          </FormControl>

          {formData.dividendType === DistributionType.NORMAL && (
            <FormControl mb={4}>
              <FormLabel fontWeight="medium">
                {formData.dividendInputMode === ValueInputMode.PERCENT
                  ? "Standard Deviation (%)"
                  : "Standard Deviation ($)"}
              </FormLabel>
              <Input
                id="dividendRateStdDev"
                type="text"
                value={formData.dividendRateStdDev || ""}
                onChange={handleInputChange}
                onWheel={preventWheelChange}
                borderRadius="md"
                borderColor={borderColor}
                _hover={{ borderColor: highlightColor }}
                _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
                placeholder="input the standard deviation here"
              />
              <Text fontSize="sm" color="gray.500" mt={2}>
                Measures the volatility or variation in dividends
              </Text>
            </FormControl>
          )}
        </Box>

        <Box
          p={4}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
        >
          <FormControl>
            <FormLabel fontWeight="medium">Taxability</FormLabel>
            <Select
              id="taxability"
              value={formData.taxability ? "taxable" : "tax-exempt"}
              onChange={handleTaxabilityChange}
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: highlightColor }}
              _focus={{ borderColor: highlightColor, boxShadow: "outline" }}
            >
              <option value="taxable">Taxable</option>
              <option value="tax-exempt">Tax-Exempt</option>
            </Select>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {formData.taxability
                ? "Returns and income from this investment are subject to taxation"
                : "Returns and income from this investment are exempt from federal taxation"}
            </Text>
          </FormControl>

          {!formData.taxability && (
            <Alert status="info" borderRadius="md" mt={4}>
              <AlertIcon />
              <Text fontSize="sm">
                Tax-exempt investments are typically best held in taxable
                accounts, not tax-advantaged retirement accounts.
              </Text>
            </Alert>
          )}
        </Box>
      </VStack>
    );
  };

  // Step 4: Review
  const renderReviewStep = () => {
    // Format functions
    const formatPercent = (val: string | number) => {
      const numVal = typeof val === "string" ? parseFloat(val) : val;
      return `${numVal.toFixed(2)}%`;
    };
    const formatCurrency = (val: string | number) => {
      const numVal = typeof val === "string" ? parseFloat(val) : val;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(numVal);
    };

    return (
      <VStack spacing={6} align="stretch">
        <Box p={4} bg={accentColor} borderRadius="md">
          <HStack>
            <Icon as={FiCheck} boxSize={6} color={highlightColor} />
            <Text fontWeight="medium">
              Review your investment type details before saving
            </Text>
          </HStack>
        </Box>

        <Box
          p={6}
          borderWidth="1px"
          borderRadius="md"
          borderColor={borderColor}
          bg={cardBgColor}
        >
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h3" size="md" color={highlightColor} mb={2}>
                {formData.name}
              </Heading>
              <Text>{formData.description}</Text>
            </Box>

            <Divider />

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Return Type:
                </Text>
                <Tag
                  variant="solid"
                  colorScheme={
                    formData.returnType === DistributionType.FIXED
                      ? "green"
                      : "purple"
                  }
                >
                  {formData.returnType === DistributionType.FIXED
                    ? "Fixed"
                    : "Normal Distribution"}
                </Tag>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Return Input:
                </Text>
                <Tag
                  variant="solid"
                  colorScheme={
                    formData.returnInputMode === ValueInputMode.PERCENT
                      ? "blue"
                      : "teal"
                  }
                >
                  {formData.returnInputMode === ValueInputMode.PERCENT
                    ? "Percentage"
                    : "Fixed Amount"}
                </Tag>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  {getReturnRateLabel().replace(" (%)", "").replace(" ($)", "")}
                  :
                </Text>
                <Text fontWeight="medium" fontSize="lg">
                  {formData.returnInputMode === ValueInputMode.PERCENT
                    ? formatPercent(formData.returnRate)
                    : formatCurrency(formData.returnRate)}
                </Text>
              </Box>

              {formData.returnType === DistributionType.NORMAL && (
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Return Std Dev:
                  </Text>
                  <Text fontWeight="medium">
                    {formData.returnInputMode === ValueInputMode.PERCENT
                      ? formatPercent(formData.returnRateStdDev || 0)
                      : formatCurrency(formData.returnRateStdDev || 0)}
                  </Text>
                </Box>
              )}

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Expense Ratio:
                </Text>
                <Text fontWeight="medium">
                  {formatPercent(formData.expenseRatio)}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Dividend Type:
                </Text>
                <Tag
                  variant="solid"
                  colorScheme={
                    formData.dividendType === DistributionType.FIXED
                      ? "green"
                      : "purple"
                  }
                >
                  {formData.dividendType === DistributionType.FIXED
                    ? "Fixed"
                    : "Normal Distribution"}
                </Tag>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Dividend Input:
                </Text>
                <Tag
                  variant="solid"
                  colorScheme={
                    formData.dividendInputMode === ValueInputMode.PERCENT
                      ? "blue"
                      : "teal"
                  }
                >
                  {formData.dividendInputMode === ValueInputMode.PERCENT
                    ? "Percentage"
                    : "Fixed Amount"}
                </Tag>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={1}>
                  {getDividendRateLabel()
                    .replace(" (%)", "")
                    .replace(" ($)", "")}
                  :
                </Text>
                <Text fontWeight="medium" fontSize="lg">
                  {formData.dividendInputMode === ValueInputMode.PERCENT
                    ? formatPercent(formData.dividendRate)
                    : formatCurrency(formData.dividendRate)}
                </Text>
              </Box>

              {formData.dividendType === DistributionType.NORMAL && (
                <Box>
                  <Text fontWeight="bold" mb={1}>
                    Dividend Std Dev:
                  </Text>
                  <Text fontWeight="medium">
                    {formData.dividendInputMode === ValueInputMode.PERCENT
                      ? formatPercent(formData.dividendRateStdDev || 0)
                      : formatCurrency(formData.dividendRateStdDev || 0)}
                  </Text>
                </Box>
              )}

              <Box>
                <Text fontWeight="bold" mb={1}>
                  Taxability:
                </Text>
                <Badge
                  colorScheme={formData.taxability ? "red" : "green"}
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  {formData.taxability ? "Taxable" : "Tax-Exempt"}
                </Badge>
              </Box>
            </Grid>
          </VStack>
        </Box>
      </VStack>
    );
  };

  // Update modal title based on mode
  const modalTitle = isEditMode
    ? "Edit Investment Type"
    : "Add Investment Type";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size="xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="lg"
        boxShadow="xl"
        overflow="hidden"
      >
        <Box bg="linear-gradient(to right, #3182ce, #805ad5)" px={8} py={5}>
          <ModalHeader color="white" p={0} fontSize="2xl" fontWeight="bold">
            {modalTitle}
          </ModalHeader>
        </Box>
        <ModalCloseButton color="white" mt={2} mr={3} />

        <Box mx={8} my={4}>
          <Stepper index={activeStep} size="md" colorScheme="blue">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<Icon as={step.icon} />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>
                <Box flexShrink="0">
                  <StepTitle>{step.title}</StepTitle>
                </Box>
                <StepSeparator />
              </Step>
            ))}
          </Stepper>
        </Box>

        <ModalBody p={8}>{renderStep()}</ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor={borderColor} p={6}>
          <Flex width="100%" justify="space-between">
            {activeStep > 0 && (
              <Button
                mr={3}
                onClick={handleBack}
                variant="outline"
                leftIcon={
                  <Box transform="rotate(180deg)">
                    <FiCheck />
                  </Box>
                }
              >
                Back
              </Button>
            )}
            {activeStep === 0 && <Box></Box>}
            {activeStep < steps.length - 1 ? (
              <Button
                colorScheme="blue"
                onClick={handleNext}
                rightIcon={<FiCheck />}
                isDisabled={!validateCurrentStep()}
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="green"
                onClick={handleSave}
                leftIcon={<FiCheck />}
              >
                Save Investment Type
              </Button>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInvestmentTypeModal;
