import React, { useState } from "react";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
} from "@chakra-ui/react";
import { ReturnType } from "../../types/investment";

// Define the input modes
export enum ValueInputMode {
  PERCENTAGE = "percentage",
  FIXED_AMOUNT = "fixed_amount",
}

// Define the investment type interface
export interface InvestmentType {
  name: string;
  description: string;
  returnType: ReturnType | string;
  returnRate: number; // For fixed return or mean of normal distribution
  returnRateStdDev?: number; // For normal distribution
  returnInputMode: ValueInputMode; // Whether the return is a percentage or fixed amount
  expenseRatio: number;
  dividendType: ReturnType | string;
  dividendRate: number; // For fixed dividend or mean of normal distribution
  dividendRateStdDev?: number; // For normal distribution
  dividendInputMode: ValueInputMode; // Whether the dividend is a percentage or fixed amount
  taxability: "taxable" | "tax-exempt";
}

// Define props for the component
interface AddInvestmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investmentType: InvestmentType) => void;
}

// Create the component
const AddInvestmentTypeModal: React.FC<AddInvestmentTypeModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  // Define the steps
  const steps = [
    { title: "Basic Info", description: "Name and description" },
    {
      title: "Return Details",
      description: "Expected returns and expense ratio",
    },
    {
      title: "Income & Tax",
      description: "Dividend income and taxability",
    },
    { title: "Review", description: "Review and save" },
  ];

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: steps.length,
  });

  // Initialize state for the investment type
  const [investmentType, setInvestmentType] = useState<InvestmentType>({
    name: "",
    description: "",
    returnType: ReturnType.FIXED,
    returnRate: 0,
    returnInputMode: ValueInputMode.PERCENTAGE,
    expenseRatio: 0,
    dividendType: ReturnType.FIXED,
    dividendRate: 0,
    dividendInputMode: ValueInputMode.PERCENTAGE,
    taxability: "taxable",
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setInvestmentType({ ...investmentType, [id]: value });
  };

  // Handle number input changes
  const handleNumberInputChange = (id: string, value: string) => {
    setInvestmentType({ ...investmentType, [id]: parseFloat(value) });
  };

  // Handle radio input changes
  const handleRadioInputChange = (id: string, value: string) => {
    setInvestmentType({ ...investmentType, [id]: value });
  };

  // Handle return type change
  const handleReturnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ReturnType;
    setInvestmentType({
      ...investmentType,
      returnType: value,
      // Reset the standard deviation when switching to fixed
      returnRateStdDev:
        value === ReturnType.FIXED
          ? undefined
          : investmentType.returnRateStdDev || 0,
    });
  };

  // Handle dividend type change
  const handleDividendTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as ReturnType;
    setInvestmentType({
      ...investmentType,
      dividendType: value,
      // Reset the standard deviation when switching to fixed
      dividendRateStdDev:
        value === ReturnType.FIXED
          ? undefined
          : investmentType.dividendRateStdDev || 0,
    });
  };

  // Navigation functions
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((step: number) => Math.min(step + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((step: number) => Math.max(step - 1, 0));
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      onSave(investmentType);
      onClose();
    }
  };

  // Validation function
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        return !!investmentType.name && !!investmentType.description;
      case 1: // Return Details
        return investmentType.returnRate !== undefined;
      case 2: // Income & Tax
        return true; // All fields have defaults
      case 3: // Review
        return true; // All validations already happened in previous steps
      default:
        return false;
    }
  };

  // Helper functions for generating field labels
  const getReturnRateLabel = () => {
    if (investmentType.returnInputMode === ValueInputMode.PERCENTAGE) {
      return investmentType.returnType === ReturnType.NORMAL
        ? "Average Annual Return Rate (%)"
        : "Annual Return Rate (%)";
    } else {
      return investmentType.returnType === ReturnType.NORMAL
        ? "Average Annual Return Amount ($)"
        : "Annual Return Amount ($)";
    }
  };

  const getDividendRateLabel = () => {
    if (investmentType.dividendInputMode === ValueInputMode.PERCENTAGE) {
      return investmentType.dividendType === ReturnType.NORMAL
        ? "Average Annual Dividend Rate (%)"
        : "Annual Dividend Rate (%)";
    } else {
      return investmentType.dividendType === ReturnType.NORMAL
        ? "Average Annual Dividend Amount ($)"
        : "Annual Dividend Amount ($)";
    }
  };

  const getReturnRateDescription = () => {
    return investmentType.returnInputMode === ValueInputMode.PERCENTAGE
      ? "The annual percentage change in value"
      : "The annual dollar amount change in value";
  };

  const getDividendRateDescription = () => {
    return investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
      ? "The annual percentage paid as dividends or interest"
      : "The annual dollar amount paid as dividends or interest";
  };

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
      <Box>
        <Text mb={4}>
          Enter the basic information about this investment type.
        </Text>

        <FormControl id="name" isRequired mb={4}>
          <FormLabel>Investment Name</FormLabel>
          <Input
            value={investmentType.name}
            onChange={handleInputChange}
            placeholder="e.g., S&P 500 Index Fund"
          />
        </FormControl>

        <FormControl id="description" isRequired mb={4}>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={investmentType.description}
            onChange={handleInputChange}
            placeholder="Describe this investment type..."
            rows={4}
          />
        </FormControl>
      </Box>
    );
  };

  // Step 2: Return Details
  const renderReturnDetailsStep = () => {
    return (
      <Box>
        <Text mb={4}>
          Define how this investment's value is expected to change over time.
        </Text>

        <FormControl mb={4}>
          <FormLabel>Return Input Mode</FormLabel>
          <RadioGroup
            value={investmentType.returnInputMode}
            onChange={(value) =>
              handleRadioInputChange("returnInputMode", value)
            }
          >
            <Stack direction="row">
              <Radio value={ValueInputMode.PERCENTAGE}>Percentage</Radio>
              <Radio value={ValueInputMode.FIXED_AMOUNT}>Fixed Amount</Radio>
            </Stack>
          </RadioGroup>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {investmentType.returnInputMode === ValueInputMode.PERCENTAGE
              ? "Return is calculated as a percentage of the investment value"
              : "Return is a fixed dollar amount regardless of investment value"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Return Type</FormLabel>
          <Select
            id="returnType"
            value={investmentType.returnType}
            onChange={handleReturnTypeChange}
          >
            <option value={ReturnType.FIXED}>Fixed</option>
            <option value={ReturnType.NORMAL}>Normal Distribution</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {investmentType.returnType === ReturnType.FIXED
              ? "A constant return that doesn't vary year to year"
              : "Returns vary according to a normal (bell curve) distribution"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>{getReturnRateLabel()}</FormLabel>
          <NumberInput
            value={investmentType.returnRate}
            onChange={(value) => handleNumberInputChange("returnRate", value)}
            min={0}
            step={
              investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                ? 0.1
                : 100
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {getReturnRateDescription()}
          </Text>
        </FormControl>

        {investmentType.returnType === ReturnType.NORMAL && (
          <FormControl mb={4}>
            <FormLabel>
              {investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                ? "Standard Deviation (%)"
                : "Standard Deviation ($)"}
            </FormLabel>
            <NumberInput
              value={investmentType.returnRateStdDev || 0}
              onChange={(value) =>
                handleNumberInputChange("returnRateStdDev", value)
              }
              min={0}
              step={
                investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                  ? 0.1
                  : 100
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Measures the volatility or variation in returns
            </Text>
          </FormControl>
        )}

        <FormControl mb={4}>
          <FormLabel>Expense Ratio (%)</FormLabel>
          <NumberInput
            value={investmentType.expenseRatio}
            onChange={(value) => handleNumberInputChange("expenseRatio", value)}
            min={0}
            max={10}
            step={0.01}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Annual percentage deducted from the investment to cover management
            costs
          </Text>
        </FormControl>
      </Box>
    );
  };

  // Step 3: Income and Tax
  const renderIncomeAndTaxStep = () => {
    return (
      <Box>
        <Text mb={4}>
          Define any income generated by this investment and its tax treatment.
        </Text>

        <FormControl mb={4}>
          <FormLabel>Dividend Input Mode</FormLabel>
          <RadioGroup
            value={investmentType.dividendInputMode}
            onChange={(value) =>
              handleRadioInputChange("dividendInputMode", value)
            }
          >
            <Stack direction="row">
              <Radio value={ValueInputMode.PERCENTAGE}>Percentage</Radio>
              <Radio value={ValueInputMode.FIXED_AMOUNT}>Fixed Amount</Radio>
            </Stack>
          </RadioGroup>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
              ? "Dividend is calculated as a percentage of the investment value"
              : "Dividend is a fixed dollar amount regardless of investment value"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Dividend Type</FormLabel>
          <Select
            id="dividendType"
            value={investmentType.dividendType}
            onChange={handleDividendTypeChange}
          >
            <option value={ReturnType.FIXED}>Fixed</option>
            <option value={ReturnType.NORMAL}>Normal Distribution</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {investmentType.dividendType === ReturnType.FIXED
              ? "A constant dividend that doesn't vary year to year"
              : "Dividends vary according to a normal (bell curve) distribution"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>{getDividendRateLabel()}</FormLabel>
          <NumberInput
            value={investmentType.dividendRate}
            onChange={(value) => handleNumberInputChange("dividendRate", value)}
            min={0}
            step={
              investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
                ? 0.1
                : 100
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {getDividendRateDescription()}
          </Text>
        </FormControl>

        {investmentType.dividendType === ReturnType.NORMAL && (
          <FormControl mb={4}>
            <FormLabel>
              {investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
                ? "Standard Deviation (%)"
                : "Standard Deviation ($)"}
            </FormLabel>
            <NumberInput
              value={investmentType.dividendRateStdDev || 0}
              onChange={(value) =>
                handleNumberInputChange("dividendRateStdDev", value)
              }
              min={0}
              step={
                investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
                  ? 0.1
                  : 100
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Measures the volatility or variation in dividends
            </Text>
          </FormControl>
        )}

        <FormControl mb={4}>
          <FormLabel>Taxability</FormLabel>
          <Select
            id="taxability"
            value={investmentType.taxability}
            onChange={handleInputChange}
          >
            <option value="taxable">Taxable</option>
            <option value="tax-exempt">Tax-Exempt</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {investmentType.taxability === "taxable"
              ? "Returns and income from this investment are subject to taxation"
              : "Returns and income from this investment are exempt from federal taxation"}
          </Text>
        </FormControl>

        {investmentType.taxability === "tax-exempt" && (
          <Alert status="info" borderRadius="md" mb={4}>
            <AlertIcon />
            <Text fontSize="sm">
              Tax-exempt investments are typically best held in taxable
              accounts, not tax-advantaged retirement accounts.
            </Text>
          </Alert>
        )}
      </Box>
    );
  };

  // Step 4: Review
  const renderReviewStep = () => {
    // Format functions
    const formatPercent = (val: number) => `${val.toFixed(2)}%`;
    const formatCurrency = (val: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(val);

    return (
      <Box>
        <Text mb={4} fontWeight="bold">
          Review your investment type details before saving
        </Text>

        <Box mb={4} p={4} borderWidth="1px" borderRadius="md">
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            {investmentType.name}
          </Text>
          <Text mb={4}>{investmentType.description}</Text>

          <Divider mb={4} />

          <Grid templateColumns="1fr 1fr" gap={4}>
            <Box>
              <Text fontWeight="bold" mb={1}>
                Return Type:
              </Text>
              <Text mb={3}>
                {investmentType.returnType === ReturnType.FIXED
                  ? "Fixed"
                  : "Normal Distribution"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Return Input:
              </Text>
              <Text mb={3}>
                {investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                  ? "Percentage"
                  : "Fixed Amount"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                {getReturnRateLabel().replace(" (%)", "").replace(" ($)", "")}:
              </Text>
              <Text mb={3}>
                {investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                  ? formatPercent(investmentType.returnRate)
                  : formatCurrency(investmentType.returnRate)}
              </Text>
            </Box>

            {investmentType.returnType === ReturnType.NORMAL && (
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Return Std Dev:
                </Text>
                <Text mb={3}>
                  {investmentType.returnInputMode === ValueInputMode.PERCENTAGE
                    ? formatPercent(investmentType.returnRateStdDev || 0)
                    : formatCurrency(investmentType.returnRateStdDev || 0)}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" mb={1}>
                Expense Ratio:
              </Text>
              <Text mb={3}>{formatPercent(investmentType.expenseRatio)}</Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Dividend Type:
              </Text>
              <Text mb={3}>
                {investmentType.dividendType === ReturnType.FIXED
                  ? "Fixed"
                  : "Normal Distribution"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Dividend Input:
              </Text>
              <Text mb={3}>
                {investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
                  ? "Percentage"
                  : "Fixed Amount"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                {getDividendRateLabel().replace(" (%)", "").replace(" ($)", "")}
                :
              </Text>
              <Text mb={3}>
                {investmentType.dividendInputMode === ValueInputMode.PERCENTAGE
                  ? formatPercent(investmentType.dividendRate)
                  : formatCurrency(investmentType.dividendRate)}
              </Text>
            </Box>

            {investmentType.dividendType === ReturnType.NORMAL && (
              <Box>
                <Text fontWeight="bold" mb={1}>
                  Dividend Std Dev:
                </Text>
                <Text mb={3}>
                  {investmentType.dividendInputMode ===
                  ValueInputMode.PERCENTAGE
                    ? formatPercent(investmentType.dividendRateStdDev || 0)
                    : formatCurrency(investmentType.dividendRateStdDev || 0)}
                </Text>
              </Box>
            )}

            <Box>
              <Text fontWeight="bold" mb={1}>
                Taxability:
              </Text>
              <Text mb={3}>
                {investmentType.taxability === "taxable"
                  ? "Taxable"
                  : "Tax-Exempt"}
              </Text>
            </Box>
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Investment Type</ModalHeader>
        <ModalCloseButton />

        <ModalBody p={4}>
          <Stepper index={activeStep} mb={8} size="sm">
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator>
                  <StepStatus
                    complete={<StepIcon />}
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

          {renderStep()}
        </ModalBody>

        <ModalFooter>
          {activeStep > 0 && (
            <Button mr={3} onClick={handleBack}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button colorScheme="blue" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button colorScheme="green" onClick={handleSave}>
              Save Investment Type
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInvestmentTypeModal;
