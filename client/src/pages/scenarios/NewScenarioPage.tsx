import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  HStack,
  Tooltip,
  VStack,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { Building2, Wallet, TrendingUp, BarChart } from "lucide-react";
import { DeleteIcon } from "@chakra-ui/icons";
import { EventSeriesForm } from "../../components/event_series/EventSeriesForm";
import { EventSeriesType, EventSeries } from "../../types/eventSeries";
import { useEventSeries } from "../../contexts/EventSeriesContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ScenarioDetailsForm, {
  ScenarioDetails,
  ScenarioType,
} from "../../components/scenarios/ScenarioDetailsForm";
import LifeExpectancyForm, {
  LifeExpectancyConfig,
  ExpectancyType,
} from "../../components/scenarios/LifeExpectancyForm";
import InvestmentsForm, {
  InvestmentsConfig,
  Investment,
  TaxStatus,
} from "../../components/scenarios/InvestmentsForm";
import { InvestmentTypesForm } from "../../components/scenarios/InvestmentTypesForm";
import AdditionalSettingsForm, {
  AdditionalSettingsConfig,
  InflationConfig,
  FinancialGoalConfig,
  StateOfResidence,
} from "../../components/scenarios/AdditionalSettingsForm";
import RothConversionOptimizerForm from "../../components/roth_conversion_optimizer/RothConversionForm";
import ScenarioTypeSelector, {
  ScenarioCreationType,
} from "../../components/scenarios/ScenarioTypeSelector";
import YamlImportForm from "../../components/scenarios/YamlImportForm";
import RMDSettingsForm, {
  RMDSettings,
} from "../../components/scenarios/RMDSettingsForm";
import SpendingStrategyForm, {
  SpendingStrategy,
} from "../../components/scenarios/SpendingStrategyForm";
import WithdrawalStrategyForm, {
  WithdrawalStrategy,
} from "../../components/scenarios/WithdrawalStrategyForm";
//import { InvestmentTaxStatus } from "../../types/scenario";

// Omit the id from EventSeries and add it as optional
type AddedEvent = Omit<EventSeries, "id"> & {
  id?: string;
  _id?: string;
  amount?: number;
  frequency?: string;
};

const eventTypeOptions = [
  {
    id: "income",
    name: "Income",
    description: "Regular or one-time income sources",
    icon: Building2,
    header: "Sources of Income",
    subheader:
      "Do your best to think of every source of income you expect to have throughout your life. Use the Income widget below to add different kinds of income streams. Some may happen one time, others may occur annually or monthly, and may increase or decrease over time.",
  },
  {
    id: "expense",
    name: "Expense",
    description: "Regular or one-time expenses",
    icon: Wallet,
    header: "Expenses",
    subheader:
      "Add your expected expenses throughout your life. Consider both regular recurring expenses and one-time costs. Remember to account for changes in expenses over time.",
  },
  {
    id: "invest",
    name: "Investment Strategy",
    description: "Define how to invest excess cash",
    icon: TrendingUp,
    header: "Investment Strategy",
    subheader:
      "Define how your excess cash should be invested. Set your asset allocation and maximum cash holdings to automate your investment strategy.",
  },
  {
    id: "rebalance",
    name: "Rebalancing Strategy",
    description: "Define how to rebalance investments",
    icon: BarChart,
    header: "Rebalancing Strategy",
    subheader:
      "Specify how your investment portfolio should be rebalanced over time. Set target allocations and conditions for maintaining your desired investment mix.",
  },
];

function NewScenarioPage() {
  const { selectedType, setSelectedType } = useEventSeries();
  const navigate = useNavigate();
  const [addedEvents, setAddedEvents] = useState<AddedEvent[]>([]);
  const [step, setStep] = useState<
    | "typeSelection"
    | "details"
    | "lifeExpectancy"
    | "investmentTypes"
    | "investments"
    | "eventSelection"
    | "additionalSettings"
    | "rothConversionOptimizer"
    | "yamlImport"
    | "rmdSettings"
    | "spendingStrategy"
    | "withdrawalStrategy"
  >("typeSelection");

  // Add useEffect to track step changes
  useEffect(() => {
    console.log("NewScenarioPage: Step changed to:", step);
  }, [step]);

  const [scenarioDetails, setScenarioDetails] = useState<ScenarioDetails>({
    name: "",
    type: "individual",
    userBirthYear: new Date().getFullYear() - 30,
  });
  const [lifeExpectancyConfig, setLifeExpectancyConfig] =
    useState<LifeExpectancyConfig>({
      userExpectancyType: "fixed",
      userFixedAge: 85,
      spouseExpectancyType: "fixed",
      spouseFixedAge: 85,
    });
  const [investmentsConfig, setInvestmentsConfig] = useState<InvestmentsConfig>(
    {
      investments: [],
    }
  );
  const [additionalSettings, setAdditionalSettings] =
    useState<AdditionalSettingsConfig>({
      inflationConfig: {
        type: "fixed",
        value: 2.5, // Default 2.5% inflation
      },
      financialGoal: {
        value: 0, // Default to 0 (just meeting expenses)
      },
      stateOfResidence: "NY", // Default to NY
    });
  const toast = useToast();
  const [rmdSettings, setRmdSettings] = useState<RMDSettings>({
    enableRMD: true,
    startAge: 72, //default start age
    accountPriority: [],
    availableAccounts: [],
  });
  const [spendingStrategy, setSpendingStrategy] = useState<SpendingStrategy>({
    enableCustomStrategy: true,
    strategyType: "prioritized",
    expensePriority: [],
    availableExpenses: [],
  });
  const [withdrawalStrategy, setWithdrawalStrategy] =
    useState<WithdrawalStrategy>({
      enableCustomStrategy: true,
      strategyType: "prioritized",
      accountPriority: [],
      availableAccounts: [],
    });

  const handle_scenario_type_select = (type: ScenarioCreationType) => {
    console.log(
      "NewScenarioPage: handle_scenario_type_select called with:",
      type
    );
    if (type === ScenarioCreationType.FROM_SCRATCH) {
      console.log("NewScenarioPage: Changing step to 'details'");
      setStep("details");
    } else {
      console.log("NewScenarioPage: Changing step to 'yamlImport'");
      setStep("yamlImport");
    }
    console.log("NewScenarioPage: Current step after setState:", step); // This will still show the old value due to React's state update timing
  };

  const handle_yaml_import_complete = (data: any) => {
    // Here you would process the imported data
    // For now, we'll just show a success message and redirect
    toast({
      title: "Import Successful",
      description: `Scenario "${data.data.name}" imported successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/scenarios");
  };

  const handle_back_to_type_selection = () => {
    setStep("typeSelection");
  };

  const handleEventAdded = async (event: AddedEvent) => {
    try {
      if (!event || !event._id) {
        throw new Error("Invalid event data");
      }

      // Update the local state with the event from the server
      setAddedEvents((prev) => [event, ...prev]);
      setSelectedType(null);
    } catch (error) {
      console.error("Error handling event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/eventSeries/${id}`, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Update the local state to remove the deleted event
      setAddedEvents((prev) =>
        prev.filter((event) => (event.id || event._id) !== id)
      );
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  const handleSaveAndContinue = () => {
    // Navigate to spending strategy instead of directly to additional settings
    handle_continue_to_spending_strategy();
  };

  const handle_continue_to_life_expectancy = () => {
    setStep("lifeExpectancy");
  };

  const handle_back_to_details = () => {
    setStep("details");
  };

  const handle_continue_to_investments = () => {
    setStep("investmentTypes");
  };

  const handle_back_to_investments = () => {
    setStep("investments");
  };

  const handle_back_to_life_expectancy = () => {
    setStep("lifeExpectancy");
  };

  const handle_continue_to_event_selection = () => {
    setStep("eventSelection");
  };

  const handle_back_to_event_selection = () => {
    setStep("eventSelection");
  };

  const handle_continue_to_roth_conversion_optimizer = () => {
    setStep("rothConversionOptimizer");
  };

  const handle_back_to_roth_conversion = () => {
    setStep("rothConversionOptimizer");
  };

  const handle_continue_from_roth_to_investments = () => {
    setStep("investments");
  };

  const handle_continue_to_rmd_settings = () => {
    // Update available accounts based on investments
    const preTaxAccounts = investmentsConfig.investments
      .filter((inv) => inv.taxStatus === ("PRE_TAX_RETIREMENT" as TaxStatus))
      .map((inv) => {
        return (
          inv.investmentTypeId ||
          `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`
        );
      });

    setRmdSettings({
      ...rmdSettings,
      availableAccounts: preTaxAccounts,
    });

    setStep("rmdSettings");
  };

  const handle_continue_from_rmd = () => {
    handle_continue_to_withdrawal_strategy();
  };

  const handle_continue_to_spending_strategy = () => {
    // Get discretionary expenses from added events
    const discretionaryExpenses = addedEvents
      .filter(
        (event) => event.type === "expense" && event.isDiscretionary === true
      )
      .map((event) => event.name);

    setSpendingStrategy({
      ...spendingStrategy,
      availableExpenses: discretionaryExpenses,
    });

    setStep("spendingStrategy");
  };

  const handle_continue_from_spending_strategy = () => {
    setStep("additionalSettings");
  };

  const handle_continue_to_withdrawal_strategy = () => {
    // Get all investment accounts
    const allAccounts = investmentsConfig.investments.map(
      (inv) =>
        inv.investmentTypeId ||
        `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`
    );

    setWithdrawalStrategy({
      ...withdrawalStrategy,
      availableAccounts: allAccounts,
    });

    setStep("withdrawalStrategy");
  };

  const handle_continue_from_withdrawal_strategy = () => {
    setStep("eventSelection");
  };

  const handle_continue_from_event_selection = () => {
    setStep("spendingStrategy");
  };

  const handle_finish_scenario = () => {
    // Create the final scenario object
    const finalScenario = {
      // existing properties
      name: scenarioDetails.name,
      type: scenarioDetails.type,
      // ...other properties

      // Add RMD settings
      rmdStrategy: rmdSettings.enableRMD ? rmdSettings.accountPriority : [],
      rmdStartAge: rmdSettings.enableRMD ? rmdSettings.startAge : 72,

      // Add withdrawal strategy
      expenseWithdrawalStrategy: withdrawalStrategy.enableCustomStrategy
        ? {
            type: withdrawalStrategy.strategyType,
            investmentOrder: withdrawalStrategy.accountPriority,
          }
        : null,

      // Add spending strategy
      spendingStrategy: spendingStrategy.enableCustomStrategy
        ? {
            type: spendingStrategy.strategyType,
            expensePriority: spendingStrategy.expensePriority,
          }
        : null,
    };

    // Submit the scenario
    toast({
      title: "Scenario Created",
      description: "Your scenario has been created successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/scenarios");
  };

  const handle_change_scenario_type = (value: string) => {
    setScenarioDetails((prev) => ({
      ...prev,
      type: value as ScenarioType,
    }));

    // Update spouse expectancy type if needed
    if (value === "couple" && !lifeExpectancyConfig.spouseExpectancyType) {
      setLifeExpectancyConfig((prev) => ({
        ...prev,
        spouseExpectancyType: "fixed",
        spouseFixedAge: 85,
      }));
    }
  };

  const handle_back_to_rmd_settings = () => {
    setStep("rmdSettings");
  };

  const handle_back_to_rmd = () => {
    setStep("rmdSettings");
  };

  // Add handler to continue from investment types to investments
  const handle_continue_to_investment_portfolio = () => {
    setStep("investments");
  };

  // Add handler to go back to investment types
  const handle_back_to_investment_types = () => {
    setStep("investmentTypes");
  };

  // Selection between creating from scratch or importing YAML
  if (step === "typeSelection") {
    console.log("NewScenarioPage: Rendering ScenarioTypeSelector");
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <ScenarioTypeSelector onTypeSelect={handle_scenario_type_select} />
      </Box>
    );
  }

  // YAML Import Form
  if (step === "yamlImport") {
    console.log("NewScenarioPage: Rendering YamlImportForm");
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <YamlImportForm
          onImportComplete={handle_yaml_import_complete}
          onBack={handle_back_to_type_selection}
        />
      </Box>
    );
  }

  // Scenario Details Form
  if (step === "details") {
    console.log("NewScenarioPage: Rendering ScenarioDetailsForm");
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <ScenarioDetailsForm
          scenarioDetails={scenarioDetails}
          onChangeScenarioType={handle_change_scenario_type}
          onChangeScenarioDetails={setScenarioDetails}
          onContinue={handle_continue_to_life_expectancy}
          onSkip={handle_continue_to_life_expectancy}
          onBack={handle_back_to_type_selection}
        />
      </Box>
    );
  }

  // Life Expectancy Configuration Form
  if (step === "lifeExpectancy") {
    return (
      <LifeExpectancyForm
        lifeExpectancyConfig={lifeExpectancyConfig}
        isCouple={scenarioDetails.type === "couple"}
        userBirthYear={scenarioDetails.userBirthYear}
        spouseBirthYear={scenarioDetails.spouseBirthYear}
        onContinue={handle_continue_to_roth_conversion_optimizer}
        onBack={handle_back_to_details}
        onChangeLifeExpectancy={setLifeExpectancyConfig}
      />
    );
  }

  // Roth Conversion Optimizer Form
  if (step === "rothConversionOptimizer") {
    return (
      <RothConversionOptimizerForm
        onBack={handle_back_to_life_expectancy}
        onContinue={handle_continue_from_roth_to_investments}
      />
    );
  }

  // Investment Types Form
  if (step === "investmentTypes") {
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <InvestmentTypesForm
          onBack={handle_back_to_life_expectancy}
          onContinue={handle_continue_to_investment_portfolio}
        />
      </Box>
    );
  }

  // Investments Configuration Form
  if (step === "investments") {
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <InvestmentsForm
          investmentsConfig={investmentsConfig}
          onChangeInvestmentsConfig={setInvestmentsConfig}
          onContinue={handle_continue_to_event_selection}
          onBack={handle_back_to_investment_types}
        />
      </Box>
    );
  }

  // Additional Settings Form
  if (step === "additionalSettings") {
    return (
      <AdditionalSettingsForm
        additionalSettings={additionalSettings}
        onChangeAdditionalSettings={setAdditionalSettings}
        onBack={() => setStep("spendingStrategy")}
        onContinue={handle_finish_scenario}
      />
    );
  }

  // RMD Settings Form
  if (step === "rmdSettings") {
    return (
      <RMDSettingsForm
        rmdSettings={rmdSettings}
        onChangeRMDSettings={setRmdSettings}
        onContinue={handle_continue_from_rmd}
        onBack={handle_back_to_investments}
      />
    );
  }

  // Spending Strategy Form
  if (step === "spendingStrategy") {
    return (
      <SpendingStrategyForm
        spendingStrategy={spendingStrategy}
        onChangeSpendingStrategy={setSpendingStrategy}
        onContinue={handle_continue_from_spending_strategy}
        onBack={() => setStep("eventSelection")}
      />
    );
  }

  // Withdrawal Strategy Form
  if (step === "withdrawalStrategy") {
    return (
      <WithdrawalStrategyForm
        withdrawalStrategy={withdrawalStrategy}
        onChangeWithdrawalStrategy={setWithdrawalStrategy}
        onContinue={handle_continue_from_withdrawal_strategy}
        onBack={handle_back_to_rmd}
      />
    );
  }

  // Event Series Selection
  if (step === "eventSelection" && !selectedType) {
    return (
      <Box minH="100vh" bg="gray.50">
        <Box maxW="4xl" mx="auto" py={12} px={4}>
          <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
            <Box p={6}>
              <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg" color="gray.900">
                  New Event Series
                </Heading>
                <HStack spacing={2}>
                  <Button
                    variant="ghost"
                    colorScheme="blue"
                    onClick={handle_back_to_rmd_settings}
                  >
                    Back
                  </Button>
                  <Button colorScheme="blue" onClick={handleSaveAndContinue}>
                    Save & Continue
                  </Button>
                </HStack>
              </Flex>

              {addedEvents.length > 0 && (
                <VStack spacing={4} mb={8} align="stretch">
                  <Heading size="md" color="gray.700">
                    Added Events
                  </Heading>
                  <Box bg="gray.50" p={4} borderRadius="md">
                    {addedEvents.map((event) => (
                      <Flex
                        key={event.id || event._id}
                        p={4}
                        bg="white"
                        borderRadius="md"
                        shadow="sm"
                        mb={2}
                        justify="space-between"
                        align="center"
                      >
                        <Box>
                          <Text fontWeight="medium">{event.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            ${event.initialAmount} • Starting{" "}
                            {event.startYear.type === "fixed"
                              ? event.startYear.value
                              : "Variable"}{" "}
                            •{" "}
                            {event.duration.type === "fixed"
                              ? event.duration.value
                              : "Variable"}{" "}
                            years
                          </Text>
                        </Box>
                        <HStack>
                          <Text
                            px={2}
                            py={1}
                            borderRadius="md"
                            fontSize="sm"
                            bg={
                              event.type === "income"
                                ? "green.100"
                                : event.type === "expense"
                                ? "red.100"
                                : "blue.100"
                            }
                            color={
                              event.type === "income"
                                ? "green.700"
                                : event.type === "expense"
                                ? "red.700"
                                : "blue.700"
                            }
                          >
                            {event.type.charAt(0).toUpperCase() +
                              event.type.slice(1)}
                          </Text>
                          <IconButton
                            aria-label="Delete event"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() =>
                              handleDeleteEvent(event.id || event._id || "")
                            }
                          />
                        </HStack>
                      </Flex>
                    ))}
                  </Box>
                </VStack>
              )}

              <Text color="gray.600" mb={6}>
                Select the type of event series you want to add to your
                financial plan.
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {eventTypeOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Box
                      key={option.id}
                      as="button"
                      onClick={() =>
                        setSelectedType(option.id as EventSeriesType)
                      }
                      bg="white"
                      p={6}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      _hover={{ borderColor: "blue.500", bg: "blue.50" }}
                      transition="all 0.2s"
                      height="100%"
                      textAlign="left"
                      display="flex"
                      flexDirection="column"
                      alignItems="flex-start"
                    >
                      <Icon
                        as={IconComponent}
                        w={8}
                        h={8}
                        color="blue.500"
                        mb={4}
                      />
                      <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        color="gray.900"
                        mb={2}
                      >
                        {option.name}
                      </Text>
                      <Text color="gray.600">{option.description}</Text>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Event Series Form when a type is selected
  if (step === "eventSelection" && selectedType) {
    const typeInfo = eventTypeOptions.find((opt) => opt.id === selectedType)!;

    return (
      <Box minH="100vh" bg="gray.50">
        <Box maxW="4xl" mx="auto" py={12} px={4}>
          <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
            <Box p={6}>
              <Button
                onClick={() => setSelectedType(null)}
                variant="ghost"
                colorScheme="blue"
                mb={6}
                leftIcon={<Text>←</Text>}
              >
                Back to event types
              </Button>

              <Heading size="xl" color="gray.900">
                {typeInfo.header}
              </Heading>
              <Text mt={2} mb={6} color="gray.600">
                {typeInfo.subheader}
              </Text>
              <EventSeriesForm
                initialType={selectedType}
                onBack={() => setSelectedType(null)}
                onEventAdded={handleEventAdded}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Default fallback (shouldn't reach here)
  return <Text>Loading...</Text>;
}

export default NewScenarioPage;
