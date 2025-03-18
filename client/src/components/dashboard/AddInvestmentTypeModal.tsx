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
} from "@chakra-ui/react";
import { ReturnType } from "../../types/investment";

// Define the investment type interface
export interface InvestmentType {
  name: string;
  description: string;
  returnType: ReturnType | string;
  returnRate: number; // For fixed return or mean of normal distribution
  returnRateStdDev?: number; // For normal distribution
  expenseRatio: number;
  dividendType: ReturnType | string;
  dividendRate: number; // For fixed dividend or mean of normal distribution
  dividendRateStdDev?: number; // For normal distribution
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
    expenseRatio: 0,
    dividendType: ReturnType.FIXED,
    dividendRate: 0,
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

  // Handle next step
  const handleNext = () => {
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
  };

  // Handle previous step
  const handleBack = () => {
    const prevStep = activeStep - 1;
    setActiveStep(prevStep);
  };

  // Handle save
  const handleSave = () => {
    onSave(investmentType);
    onClose();
  };

  // Validate form before proceeding to next step
  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basic Info
        return !!investmentType.name && !!investmentType.description;
      case 1: // Return Details
        return true; // All fields have default values
      case 2: // Income & Tax
        return true; // All fields have default values
      default:
        return true;
    }
  };

  // Check if current step is valid
  const isCurrentStepValid = validateCurrentStep();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Investment Type</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={6}>
            <Stepper index={activeStep} colorScheme="blue" size="sm">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box flexShrink={0}>
                    <StepTitle>{step.title}</StepTitle>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step 1: Basic Info */}
          {activeStep === 0 && (
            <Box>
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                Enter basic information about the investment type.
              </Alert>

              <FormControl mb={4} isRequired>
                <FormLabel>Investment Name</FormLabel>
                <Input
                  id="name"
                  placeholder="Enter investment name"
                  value={investmentType.name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  id="description"
                  placeholder="Enter investment description"
                  value={investmentType.description}
                  onChange={handleInputChange}
                  rows={4}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Describe the investment type, its characteristics, and any
                  relevant information.
                </Text>
              </FormControl>
            </Box>
          )}

          {/* Step 2: Return Details */}
          {activeStep === 1 && (
            <Box>
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                Define how the investment's value changes annually.
              </Alert>

              <FormControl mb={4}>
                <FormLabel>Return Type</FormLabel>
                <Select
                  id="returnType"
                  value={investmentType.returnType}
                  onChange={handleReturnTypeChange}
                >
                  <option value={ReturnType.FIXED}>Fixed Value</option>
                  <option value={ReturnType.NORMAL}>Normal Distribution</option>
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {investmentType.returnType === ReturnType.FIXED
                    ? "Constant return rate each year"
                    : "Return varies following a normal (bell curve) distribution"}
                </Text>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>
                  Expected Annual Return{" "}
                  {investmentType.returnType === ReturnType.FIXED
                    ? "(%) Fixed"
                    : "Mean (%)"}
                </FormLabel>
                <NumberInput
                  min={-100}
                  max={100}
                  step={0.1}
                  value={investmentType.returnRate}
                  onChange={(value) =>
                    handleNumberInputChange("returnRate", value)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Percentage relative to the investment's value at the beginning
                  of the year
                </Text>
              </FormControl>

              {investmentType.returnType === ReturnType.NORMAL && (
                <FormControl mb={4}>
                  <FormLabel>Annual Return Standard Deviation (%)</FormLabel>
                  <NumberInput
                    min={0}
                    max={50}
                    step={0.1}
                    value={investmentType.returnRateStdDev || 0}
                    onChange={(value) =>
                      handleNumberInputChange("returnRateStdDev", value)
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Determines how much the annual return varies from the mean
                  </Text>
                </FormControl>
              )}

              <FormControl mb={4}>
                <FormLabel>Expense Ratio (%)</FormLabel>
                <NumberInput
                  min={0}
                  max={10}
                  step={0.01}
                  value={investmentType.expenseRatio}
                  onChange={(value) =>
                    handleNumberInputChange("expenseRatio", value)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Annual percentage subtracted by the investment provider.
                  Calculated from the average of the beginning and ending value.
                </Text>
              </FormControl>
            </Box>
          )}

          {/* Step 3: Income & Tax */}
          {activeStep === 2 && (
            <Box>
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                Define dividend income and tax status.
              </Alert>

              <FormControl mb={4}>
                <FormLabel>Dividend Type</FormLabel>
                <Select
                  id="dividendType"
                  value={investmentType.dividendType}
                  onChange={handleDividendTypeChange}
                >
                  <option value={ReturnType.FIXED}>Fixed Value</option>
                  <option value={ReturnType.NORMAL}>Normal Distribution</option>
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {investmentType.dividendType === ReturnType.FIXED
                    ? "Constant dividend/interest payment each year"
                    : "Dividend/interest varies following a normal distribution"}
                </Text>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>
                  Expected Annual Income{" "}
                  {investmentType.dividendType === ReturnType.FIXED
                    ? "(%) Fixed"
                    : "Mean (%)"}
                </FormLabel>
                <NumberInput
                  min={0}
                  max={50}
                  step={0.1}
                  value={investmentType.dividendRate}
                  onChange={(value) =>
                    handleNumberInputChange("dividendRate", value)
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Annual income from dividends or interest as a percentage of
                  investment value
                </Text>
              </FormControl>

              {investmentType.dividendType === ReturnType.NORMAL && (
                <FormControl mb={4}>
                  <FormLabel>Annual Income Standard Deviation (%)</FormLabel>
                  <NumberInput
                    min={0}
                    max={20}
                    step={0.1}
                    value={investmentType.dividendRateStdDev || 0}
                    onChange={(value) =>
                      handleNumberInputChange("dividendRateStdDev", value)
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Determines how much the annual income varies from the mean
                  </Text>
                </FormControl>
              )}

              <Divider my={4} />

              <FormControl mb={4}>
                <FormLabel>Taxability</FormLabel>
                <Select
                  id="taxability"
                  value={investmentType.taxability}
                  onChange={handleInputChange}
                >
                  <option value="taxable">Taxable</option>
                  <option value="tax-exempt">
                    Tax-Exempt (e.g., Municipal Bonds)
                  </option>
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {investmentType.taxability === "taxable"
                    ? "Gains and income are subject to taxation"
                    : "Gains and income may be exempt from certain taxes (e.g., municipal bonds)"}
                </Text>

                {investmentType.taxability === "tax-exempt" && (
                  <Alert status="warning" mt={2} size="sm" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Tax-exempt investments should not be held in retirement
                      accounts, as they would not provide additional tax
                      benefits.
                    </Text>
                  </Alert>
                )}
              </FormControl>
            </Box>
          )}

          {/* Step 4: Review */}
          {activeStep === 3 && (
            <Box>
              <Text fontWeight="bold" mb={4} fontSize="lg">
                Review Investment Type Details
              </Text>

              <Box
                mb={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor="gray.200"
              >
                <Text fontWeight="bold" mb={2} fontSize="md">
                  Basic Information
                </Text>
                <Grid templateColumns="1fr 2fr" gap={2} mb={4}>
                  <Text fontWeight="semibold">Name:</Text>
                  <Text>{investmentType.name}</Text>

                  <Text fontWeight="semibold">Description:</Text>
                  <Text noOfLines={2}>{investmentType.description}</Text>
                </Grid>
              </Box>

              <Box
                mb={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor="gray.200"
              >
                <Text fontWeight="bold" mb={2} fontSize="md">
                  Return Details
                </Text>
                <Grid templateColumns="1fr 2fr" gap={2} mb={2}>
                  <Text fontWeight="semibold">Return Type:</Text>
                  <Text>
                    {investmentType.returnType === ReturnType.FIXED
                      ? "Fixed Value"
                      : "Normal Distribution"}
                  </Text>

                  <Text fontWeight="semibold">Return Rate:</Text>
                  <Text>{investmentType.returnRate}%</Text>

                  {investmentType.returnType === ReturnType.NORMAL && (
                    <>
                      <Text fontWeight="semibold">Return Std Dev:</Text>
                      <Text>{investmentType.returnRateStdDev}%</Text>
                    </>
                  )}

                  <Text fontWeight="semibold">Expense Ratio:</Text>
                  <Text>{investmentType.expenseRatio}%</Text>
                </Grid>
              </Box>

              <Box
                mb={4}
                p={4}
                borderWidth={1}
                borderRadius="md"
                borderColor="gray.200"
              >
                <Text fontWeight="bold" mb={2} fontSize="md">
                  Income & Tax
                </Text>
                <Grid templateColumns="1fr 2fr" gap={2}>
                  <Text fontWeight="semibold">Dividend Type:</Text>
                  <Text>
                    {investmentType.dividendType === ReturnType.FIXED
                      ? "Fixed Value"
                      : "Normal Distribution"}
                  </Text>

                  <Text fontWeight="semibold">Dividend Rate:</Text>
                  <Text>{investmentType.dividendRate}%</Text>

                  {investmentType.dividendType === ReturnType.NORMAL && (
                    <>
                      <Text fontWeight="semibold">Dividend Std Dev:</Text>
                      <Text>{investmentType.dividendRateStdDev}%</Text>
                    </>
                  )}

                  <Text fontWeight="semibold">Taxability:</Text>
                  <Text>
                    {investmentType.taxability === "taxable"
                      ? "Taxable"
                      : "Tax-Exempt"}
                  </Text>
                </Grid>
              </Box>
            </Box>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button variant="outline" onClick={handleBack} mr={3}>
              Back
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button
              colorScheme="blue"
              onClick={handleNext}
              isDisabled={!isCurrentStepValid}
            >
              Next
            </Button>
          ) : (
            <Button colorScheme="blue" onClick={handleSave}>
              Save Investment Type
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInvestmentTypeModal;
