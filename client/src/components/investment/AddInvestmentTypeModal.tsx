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
import { InvestmentTypeRaw } from "../../types/Scenarios";
import { DistributionType } from "../../types/Enum";

// AI-generated code
// Define value input modes for form handling
export enum ValueInputMode {
  PERCENT = "percentage",
  AMOUNT = "amount",
}

// Define form state interface that's more friendly for the UI
interface InvestmentTypeForm {
  name: string;
  description: string;
  returnType: string;
  returnRate: number;
  returnInputMode: string;
  returnRateStdDev?: number;
  expenseRatio: number;
  dividendType: string;
  dividendRate: number;
  dividendInputMode: string;
  dividendRateStdDev?: number;
  taxability: boolean;
}

// Define props for the component
interface AddInvestmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investmentType: InvestmentTypeRaw) => void;
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

  // Initialize state for the investment type form
  const [formData, setFormData] = useState<InvestmentTypeForm>({
    name: "",
    description: "",
    returnType: DistributionType.FIXED,
    returnRate: 0,
    returnInputMode: ValueInputMode.PERCENT,
    expenseRatio: 0,
    dividendType: DistributionType.FIXED,
    dividendRate: 0,
    dividendInputMode: ValueInputMode.PERCENT,
    taxability: true,
  });

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle number input changes
  const handleNumberInputChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: parseFloat(value) });
  };

  // Handle radio input changes
  const handleRadioInputChange = (id: string, value: string) => {
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
          : formData.returnRateStdDev || 0,
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
          : formData.dividendRateStdDev || 0,
    });
  };

  // Navigation functions
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep(Math.min(activeStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep(Math.max(activeStep - 1, 0));
  };

  const handleSave = () => {
    if (validateCurrentStep()) {
      // Create distribution maps properly
      const returnDistMap = new Map<string, any>();
      returnDistMap.set("type", formData.returnType);
      returnDistMap.set(
        formData.returnType === DistributionType.FIXED ? "value" : "mean",
        formData.returnRate
      );
      if (formData.returnType === DistributionType.NORMAL) {
        returnDistMap.set("stdev", formData.returnRateStdDev || 0);
      }

      const incomeDistMap = new Map<string, any>();
      incomeDistMap.set("type", formData.dividendType);
      incomeDistMap.set(
        formData.dividendType === DistributionType.FIXED ? "value" : "mean",
        formData.dividendRate
      );
      if (formData.dividendType === DistributionType.NORMAL) {
        incomeDistMap.set("stdev", formData.dividendRateStdDev || 0);
      }

      // Convert the form data to the actual InvestmentTypeRaw format
      const formattedInvestment: InvestmentTypeRaw = {
        name: formData.name,
        description: formData.description,
        returnAmtOrPct: formData.returnInputMode,
        returnDistribution: returnDistMap,
        expenseRatio: formData.expenseRatio,
        incomeAmtOrPct: formData.dividendInputMode,
        incomeDistribution: incomeDistMap,
        taxability: formData.taxability,
      };

      onSave(formattedInvestment);
      onClose();
    }
  };

  // Validation function
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        return !!formData.name && !!formData.description;
      case 1: // Return Details
        return formData.returnRate !== undefined;
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
        ? "Average Annual Dividend Rate (%)"
        : "Annual Dividend Rate (%)";
    } else {
      return formData.dividendType === DistributionType.NORMAL
        ? "Average Annual Dividend Amount ($)"
        : "Annual Dividend Amount ($)";
    }
  };

  const getReturnRateDescription = () => {
    return formData.returnInputMode === ValueInputMode.PERCENT
      ? "The annual percentage change in value"
      : "The annual dollar amount change in value";
  };

  const getDividendRateDescription = () => {
    return formData.dividendInputMode === ValueInputMode.PERCENT
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
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., S&P 500 Index Fund"
          />
        </FormControl>

        <FormControl id="description" isRequired mb={4}>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={formData.description}
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
            value={formData.returnInputMode}
            onChange={(value) =>
              handleRadioInputChange("returnInputMode", value)
            }
          >
            <Stack direction="row">
              <Radio value={ValueInputMode.PERCENT}>Percentage</Radio>
              <Radio value={ValueInputMode.AMOUNT}>Fixed Amount</Radio>
            </Stack>
          </RadioGroup>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formData.returnInputMode === ValueInputMode.PERCENT
              ? "Return is calculated as a percentage of the investment value"
              : "Return is a fixed dollar amount regardless of investment value"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Return Type</FormLabel>
          <Select
            id="returnType"
            value={formData.returnType}
            onChange={handleReturnTypeChange}
          >
            <option value={DistributionType.FIXED}>Fixed</option>
            <option value={DistributionType.NORMAL}>Normal Distribution</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formData.returnType === DistributionType.FIXED
              ? "A constant return that doesn't vary year to year"
              : "Returns vary according to a normal (bell curve) distribution"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>{getReturnRateLabel()}</FormLabel>
          <NumberInput
            value={formData.returnRate}
            onChange={(value) => handleNumberInputChange("returnRate", value)}
            min={0}
            step={
              formData.returnInputMode === ValueInputMode.PERCENT ? 0.1 : 100
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

        {formData.returnType === DistributionType.NORMAL && (
          <FormControl mb={4}>
            <FormLabel>
              {formData.returnInputMode === ValueInputMode.PERCENT
                ? "Standard Deviation (%)"
                : "Standard Deviation ($)"}
            </FormLabel>
            <NumberInput
              value={formData.returnRateStdDev || 0}
              onChange={(value) =>
                handleNumberInputChange("returnRateStdDev", value)
              }
              min={0}
              step={
                formData.returnInputMode === ValueInputMode.PERCENT ? 0.1 : 100
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
            value={formData.expenseRatio}
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
            value={formData.dividendInputMode}
            onChange={(value) =>
              handleRadioInputChange("dividendInputMode", value)
            }
          >
            <Stack direction="row">
              <Radio value={ValueInputMode.PERCENT}>Percentage</Radio>
              <Radio value={ValueInputMode.AMOUNT}>Fixed Amount</Radio>
            </Stack>
          </RadioGroup>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formData.dividendInputMode === ValueInputMode.PERCENT
              ? "Dividend is calculated as a percentage of the investment value"
              : "Dividend is a fixed dollar amount regardless of investment value"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Dividend Type</FormLabel>
          <Select
            id="dividendType"
            value={formData.dividendType}
            onChange={handleDividendTypeChange}
          >
            <option value={DistributionType.FIXED}>Fixed</option>
            <option value={DistributionType.NORMAL}>Normal Distribution</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formData.dividendType === DistributionType.FIXED
              ? "A constant dividend that doesn't vary year to year"
              : "Dividends vary according to a normal (bell curve) distribution"}
          </Text>
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>{getDividendRateLabel()}</FormLabel>
          <NumberInput
            value={formData.dividendRate}
            onChange={(value) => handleNumberInputChange("dividendRate", value)}
            min={0}
            step={
              formData.dividendInputMode === ValueInputMode.PERCENT ? 0.1 : 100
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

        {formData.dividendType === DistributionType.NORMAL && (
          <FormControl mb={4}>
            <FormLabel>
              {formData.dividendInputMode === ValueInputMode.PERCENT
                ? "Standard Deviation (%)"
                : "Standard Deviation ($)"}
            </FormLabel>
            <NumberInput
              value={formData.dividendRateStdDev || 0}
              onChange={(value) =>
                handleNumberInputChange("dividendRateStdDev", value)
              }
              min={0}
              step={
                formData.dividendInputMode === ValueInputMode.PERCENT
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
            value={formData.taxability ? "taxable" : "tax-exempt"}
            onChange={handleTaxabilityChange}
          >
            <option value="taxable">Taxable</option>
            <option value="tax-exempt">Tax-Exempt</option>
          </Select>
          <Text fontSize="sm" color="gray.500" mt={1}>
            {formData.taxability
              ? "Returns and income from this investment are subject to taxation"
              : "Returns and income from this investment are exempt from federal taxation"}
          </Text>
        </FormControl>

        {!formData.taxability && (
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
            {formData.name}
          </Text>
          <Text mb={4}>{formData.description}</Text>

          <Divider mb={4} />

          <Grid templateColumns="1fr 1fr" gap={4}>
            <Box>
              <Text fontWeight="bold" mb={1}>
                Return Type:
              </Text>
              <Text mb={3}>
                {formData.returnType === DistributionType.FIXED
                  ? "Fixed"
                  : "Normal Distribution"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Return Input:
              </Text>
              <Text mb={3}>
                {formData.returnInputMode === ValueInputMode.PERCENT
                  ? "Percentage"
                  : "Fixed Amount"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                {getReturnRateLabel().replace(" (%)", "").replace(" ($)", "")}:
              </Text>
              <Text mb={3}>
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
                <Text mb={3}>
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
              <Text mb={3}>{formatPercent(formData.expenseRatio)}</Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Dividend Type:
              </Text>
              <Text mb={3}>
                {formData.dividendType === DistributionType.FIXED
                  ? "Fixed"
                  : "Normal Distribution"}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold" mb={1}>
                Dividend Input:
              </Text>
              <Text mb={3}>
                {formData.dividendInputMode === ValueInputMode.PERCENT
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
                <Text mb={3}>
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
              <Text mb={3}>
                {formData.taxability ? "Taxable" : "Tax-Exempt"}
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
