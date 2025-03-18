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
  StepDescription,
  StepSeparator,
  useSteps,
  Grid,
  SimpleGrid,
  Flex,
  Text,
  Icon,
} from "@chakra-ui/react";

// FA6 icons
import {
  FaDollarSign,
  FaChartPie,
  FaWallet,
  FaLandmark,
  FaMoneyBillTrendUp,
  FaCircleDollarToSlot,
  FaBuildingColumns,
  FaArrowTrendUp,
  FaChartColumn,
} from "react-icons/fa6";

// FA icons
import { FaChartLine, FaChartBar, FaRegBuilding } from "react-icons/fa";

// Aliases for clarity
const FaCircleDollar = FaCircleDollarToSlot;
const FaBarChart = FaChartColumn;
const FaLineChart = FaChartLine;
const FaTrendingUp = FaChartLine;
const FaCandlestick = FaChartBar;

// Define the investment type interface
export interface InvestmentType {
  name: string;
  description: string;
  icon: string;
  returnType: "fixed" | "normal"; // Removed GBM per requirements
  returnRate: number; // For fixed return
  returnRateStdDev?: number; // For normal distribution
  expenseRatio: number;
  dividendType: "fixed" | "normal";
  dividendRate: number; // For fixed dividend
  dividendRateStdDev?: number; // For normal distribution
  taxability: "taxable" | "tax-exempt";
}

// Define props for the component
interface AddInvestmentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (investmentType: InvestmentType) => void;
}

// Define available icons with their components
const iconOptions = [
  { name: "TrendingUp", component: FaTrendingUp, label: "Trending Up" },
  { name: "DollarSign", component: FaDollarSign, label: "Dollar Sign" },
  { name: "PieChart", component: FaChartPie, label: "Pie Chart" },
  { name: "Wallet", component: FaWallet, label: "Wallet" },
  { name: "BarChart", component: FaBarChart, label: "Bar Chart" },
  { name: "LineChart", component: FaLineChart, label: "Line Chart" },
  { name: "Building", component: FaRegBuilding, label: "Building" },
  { name: "Landmark", component: FaLandmark, label: "Landmark" },
  {
    name: "CircleDollarSign",
    component: FaCircleDollar,
    label: "Circle Dollar Sign",
  },
  {
    name: "CandlestickChart",
    component: FaCandlestick,
    label: "Candlestick Chart",
  },
  { name: "Bank", component: FaBuildingColumns, label: "Bank Building" },
  { name: "MoneyTrend", component: FaMoneyBillTrendUp, label: "Money Trend" },
];

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
    icon: "TrendingUp", // Default icon
    returnType: "fixed",
    returnRate: 0,
    expenseRatio: 0,
    dividendType: "fixed",
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

  // Handle icon selection
  const handleIconSelect = (iconName: string) => {
    setInvestmentType({ ...investmentType, icon: iconName });
  };

  // Handle return type change
  const handleReturnTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "fixed" | "normal";
    setInvestmentType({
      ...investmentType,
      returnType: value,
      // Reset the standard deviation when switching to fixed
      returnRateStdDev:
        value === "fixed" ? undefined : investmentType.returnRateStdDev || 0,
    });
  };

  // Handle dividend type change
  const handleDividendTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value as "fixed" | "normal";
    setInvestmentType({
      ...investmentType,
      dividendType: value,
      // Reset the standard deviation when switching to fixed
      dividendRateStdDev:
        value === "fixed" ? undefined : investmentType.dividendRateStdDev || 0,
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
            <Text textAlign="right" fontSize="sm" color="gray.500" mt={2}>
              Step {activeStep + 1} of {steps.length}
            </Text>
          </Box>

          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <FormControl mb={4} isRequired>
                <FormLabel>Investment Name</FormLabel>
                <Input
                  id="name"
                  placeholder="Enter investment name"
                  value={investmentType.name}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  id="description"
                  placeholder="Enter investment description"
                  value={investmentType.description}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Icon</FormLabel>
                <SimpleGrid columns={6} spacing={3}>
                  {iconOptions.map((icon) => (
                    <Box
                      key={icon.name}
                      p={2}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={
                        investmentType.icon === icon.name
                          ? "blue.500"
                          : "gray.200"
                      }
                      bg={
                        investmentType.icon === icon.name ? "blue.50" : "white"
                      }
                      cursor="pointer"
                      onClick={() => handleIconSelect(icon.name)}
                      textAlign="center"
                    >
                      <Icon as={icon.component} boxSize={6} mb={1} />
                      <Text fontSize="xs">{icon.label}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </FormControl>
            </Box>
          )}

          {/* Step 2: Return Details */}
          {activeStep === 1 && (
            <Box>
              <FormControl mb={4}>
                <FormLabel>Return Type</FormLabel>
                <Select
                  id="returnType"
                  value={investmentType.returnType}
                  onChange={handleReturnTypeChange}
                >
                  <option value="fixed">Fixed Value</option>
                  <option value="normal">Normal Distribution</option>
                </Select>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {investmentType.returnType === "fixed"
                    ? "Constant return rate"
                    : "Bell curve distribution"}
                </Text>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>
                  Expected Annual Return{" "}
                  {investmentType.returnType === "fixed"
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
              </FormControl>

              {investmentType.returnType === "normal" && (
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
                  Annual percentage subtracted from investment value
                </Text>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Dividend Type</FormLabel>
                <Select
                  id="dividendType"
                  value={investmentType.dividendType}
                  onChange={handleDividendTypeChange}
                >
                  <option value="fixed">Fixed Value</option>
                  <option value="normal">Normal Distribution</option>
                </Select>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>
                  Expected Annual Dividend{" "}
                  {investmentType.dividendType === "fixed"
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
              </FormControl>

              {investmentType.dividendType === "normal" && (
                <FormControl mb={4}>
                  <FormLabel>Annual Dividend Standard Deviation (%)</FormLabel>
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
                </FormControl>
              )}

              <FormControl mb={4}>
                <FormLabel>Taxability</FormLabel>
                <Select
                  id="taxability"
                  value={investmentType.taxability}
                  onChange={handleInputChange}
                >
                  <option value="tax-exempt">
                    Tax-Exempt (e.g., Municipal Bonds)
                  </option>
                  <option value="taxable">Taxable</option>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
            <Box>
              <Text fontWeight="bold" mb={2}>
                Review Investment Type Details
              </Text>
              <Grid templateColumns="1fr 2fr" gap={2} mb={4}>
                <Text fontWeight="semibold">Name:</Text>
                <Text>{investmentType.name}</Text>

                <Text fontWeight="semibold">Description:</Text>
                <Text>{investmentType.description}</Text>

                <Text fontWeight="semibold">Return Type:</Text>
                <Text>
                  {investmentType.returnType === "fixed"
                    ? "Fixed Value"
                    : "Normal Distribution"}
                </Text>

                <Text fontWeight="semibold">Return Rate:</Text>
                <Text>{investmentType.returnRate}%</Text>

                {investmentType.returnType === "normal" && (
                  <>
                    <Text fontWeight="semibold">Return Std Dev:</Text>
                    <Text>{investmentType.returnRateStdDev}%</Text>
                  </>
                )}

                <Text fontWeight="semibold">Expense Ratio:</Text>
                <Text>{investmentType.expenseRatio}%</Text>

                <Text fontWeight="semibold">Dividend Type:</Text>
                <Text>
                  {investmentType.dividendType === "fixed"
                    ? "Fixed Value"
                    : "Normal Distribution"}
                </Text>

                <Text fontWeight="semibold">Dividend Rate:</Text>
                <Text>{investmentType.dividendRate}%</Text>

                {investmentType.dividendType === "normal" && (
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
            <Button colorScheme="blue" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInvestmentTypeModal;
