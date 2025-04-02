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
} from "../../components/scenarios/LifeExpectancyForm";
import InvestmentsForm, {
  InvestmentsConfig,
  Investment,
  TaxStatus,
} from "../../components/scenarios/InvestmentsForm";
import { InvestmentTypesForm } from "../../components/scenarios/InvestmentTypesForm";
import AdditionalSettingsForm, {
  AdditionalSettingsConfig,
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

//! Roth Conversion Optimizer should be at the end of the investment

function NewScenarioPage() {
  //! belong to Kate, don't touch
  const { selectedType, setSelectedType } = useEventSeries();
  const navigate = useNavigate();
  const [addedEvents, setAddedEvents] = useState<AddedEvent[]>([]);

  //! the correct order of the steps
  const [step, setStep] = useState<
    | "typeSelection" // for user to select how they wanna create the scenario
    | "Scenario_name&type" // for user to input the scenario name and user's age and use is single or couple
    | "lifeExpectancy" // for user to input their life expectancy for both if couple
    | "investmentTypes" // for user to input the investment types
    | "investments" // for user to input the investment details
    | "rothConversionOptimizer" // for user to input the roth conversion optimizer
    | "eventSelection" // for user to select the event series
    | "rmdSettings" // for user to input the rmd settings
    | "spendingStrategy" // for user to input the spending strategy
    | "withdrawalStrategy" // for user to input the withdrawal strategy
    | "additionalSettings" // for user to input the additional settings
    | "yamlImport" // for user to import the yaml file
  >("typeSelection");

  // Add useEffect to track step changes
  useEffect(() => {
    console.log("NewScenarioPage: Step changed to:", step);
  }, [step]);

  const [scenarioDetails, setScenarioDetails] = useState<ScenarioDetails>({
    name: "",
    type: "individual",
    userBirthYear: new Date().getFullYear() - 20, //! 这里会帮助用户填写一个默认的值，这个值是当前的日期-20年
  });
  const [lifeExpectancyConfig, setLifeExpectancyConfig] =
    //这个部分是couple的默认值
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
        value: 2.5, //! 这边2.5是默认值 也就是用户什么都不输入就这这个值
      },
      financialGoal: {
        value: 0, //! 这边0是默认值 也就是用户什么都不输入就这这个值
      },
      stateOfResidence: "NY", // ! state of residence 当前只有三个值，NY, NJ, CT。之后需要拓展时需要修改。
    });

  const toast = useToast();
  //! 这个部分是海风写的，不要我来查看。
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
  //! 一直到这里。

  // *这边需要看谁叫了这个function，传入的type可以检查一下。
  // *这边的ScenarioCreationType只有两个值，FROM_SCRATCH和IMPORT_YAML。
  //! 如果用户选择的是IMPORT_YAML，那么直接跳转到yamlImport这个步骤。
  const handle_scenario_type_select = (type: ScenarioCreationType) => {
    console.log(
      "NewScenarioPage: handle_scenario_type_select called with:",
      type
    );
    if (type === ScenarioCreationType.FROM_SCRATCH) {
      console.log("NewScenarioPage: Changing step to 'Scenario_name&type'");
      setStep("Scenario_name&type");
    } else {
      console.log("NewScenarioPage: Changing step to 'yamlImport'");
      setStep("yamlImport");
    }
    console.log("NewScenarioPage: Current step after setState:", step); // This will still show the old value due to React's state update timing
  };

  //! 这边需要检查一下，如果用户选择的是IMPORT_YAML，那么应该直接跳转到yamlImport这个步骤。
  const handle_yaml_import_complete = (data: any) => {
    // Here you would process the imported data
    // For now, we'll just show a success message and redirect
    //! 这里面需要写一个function，来处理导入的数据。那么就直接发给后端。让后端来生成ID然后存入数据库。
    toast({
      title: "Import Successful",
      description: `Scenario "${data.data.name}" imported successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/scenarios");
  };

  //! 从这里开始把所有的back和continue都改成to，然后调用同一个function。
  const handle_to_type_selection = () => {
    setStep("typeSelection");
  };

  //! 这部分是kate写的，不要动。
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
  //! kate的部分到这里

  //! 海风写的，不要动
  const handleSaveAndContinue = () => {
    // Navigate to spending strategy instead of directly to additional settings
    handle_continue_to_spending_strategy();
  };
  //! 到这里都是海风写的，不要动。

  const handle_to_life_expectancy = () => {
    setStep("lifeExpectancy");
  };

  const handle_to_Scenario_name_type = () => {
    setStep("Scenario_name&type");
  };

  const handle_to_investment_types = () => {
    setStep("investmentTypes");
  };

  const handle_to_investments = () => {
    setStep("investments");
  };

  const handle_to_event_selection = () => {
    setStep("eventSelection");
  };

  const handle_to_roth_conversion_optimizer = () => {
    setStep("rothConversionOptimizer");
  };

  //! 海风写的，不要动。
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

  //?????? 你在干嘛？？？？？ 那我为什么不直接叫continue_to_withdrawal_strategy？？？？？？？？？？？？？？？？？？？？？？
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

  const handle_to_additional_settings = () => {
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

  const handle_to_spending_strategy = () => {
    setStep("spendingStrategy");
  };
  //! 这部分是海风写的，不要动。

  //* 这是我们最后最重要的代码
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

  //! 这部分是海风写的，不要动。（why 有俩？？？？全是setStep（“rmdSettings”））
  const handle_back_to_rmd_settings = () => {
    setStep("rmdSettings");
  };

  const handle_back_to_rmd = () => {
    setStep("rmdSettings");
  };
  //! 这部分是海风写的，不要动。

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
          onBack={handle_to_type_selection}
        />
      </Box>
    );
  }

  // Scenario Details Form
  if (step === "Scenario_name&type") {
    console.log("NewScenarioPage: Rendering ScenarioDetailsForm");
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <ScenarioDetailsForm
          scenarioDetails={scenarioDetails}
          onChangeScenarioType={handle_change_scenario_type}
          onChangeScenarioDetails={setScenarioDetails}
          onContinue={handle_to_life_expectancy}
          onBack={handle_to_type_selection}
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
        onContinue={handle_to_investment_types}
        onBack={handle_to_Scenario_name_type}
        onChangeLifeExpectancy={setLifeExpectancyConfig}
      />
    );
  }

  if (step === "rothConversionOptimizer") {
    return (
      <RothConversionOptimizerForm
        onBack={handle_to_spending_strategy}
        onContinue={handle_to_additional_settings}
      />
    );
  }

  // Investment Types Form
  //! AI modified this to be the first step
  if (step === "investmentTypes") {
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <InvestmentTypesForm
          onBack={handle_to_life_expectancy}
          onContinue={handle_to_investments}
        />
      </Box>
    );
  }

  // Investments Configuration Form
  //! AI modified this to be the second step
  if (step === "investments") {
    return (
      <Box position="relative" zIndex={10} width="100%" height="100%">
        <InvestmentsForm
          investmentsConfig={investmentsConfig}
          onChangeInvestmentsConfig={setInvestmentsConfig}
          onContinue={handle_continue_to_rmd_settings}
          onBack={handle_to_investment_types}
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
        onBack={handle_to_roth_conversion_optimizer}
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
        onBack={handle_to_investments}
      />
    );
  }

  // Spending Strategy Form
  if (step === "spendingStrategy") {
    return (
      <SpendingStrategyForm
        spendingStrategy={spendingStrategy}
        onChangeSpendingStrategy={setSpendingStrategy}
        onContinue={handle_to_roth_conversion_optimizer}
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
                    onClick={handle_continue_from_rmd}
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
