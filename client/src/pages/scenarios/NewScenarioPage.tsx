import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  useToast,
  Button,
  HStack,
} from "@chakra-ui/react";
import { useEventSeries } from "../../contexts/EventSeriesContext";
import { useNavigate } from "react-router-dom";
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
import RMDSettingsForm, { RMDSettings } from "../../components/scenarios/RMDSettingsForm";
import SpendingStrategyForm, { SpendingStrategy } from "../../components/scenarios/SpendingStrategyForm";
import WithdrawalStrategyForm, { WithdrawalStrategy } from "../../components/scenarios/WithdrawalStrategyForm";
//import { InvestmentTaxStatus } from "../../types/scenario";
import EventSeriesSection, { AddedEvent } from "../../components/event_series/EventSeriesSection";

function NewScenarioPage() {
  const { selectedType, setSelectedType } = useEventSeries();
  const navigate = useNavigate();
  const [addedEvents, setAddedEvents] = useState<AddedEvent[]>([]);
  const [step, setStep] = useState<
    | "typeSelection"
    | "details"
    | "lifeExpectancy"
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
    startAge: 72,//default start age
    accountPriority: [],
    availableAccounts: []
  });
  const [spendingStrategy, setSpendingStrategy] = useState<SpendingStrategy>({
    enableCustomStrategy: true,
    strategyType: "prioritized",
    expensePriority: [],
    availableExpenses: []
  });
  const [withdrawalStrategy, setWithdrawalStrategy] = useState<WithdrawalStrategy>({
    enableCustomStrategy: true,
    strategyType: "prioritized",
    accountPriority: [],
    availableAccounts: []
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

  const handleEventAdded = (event: AddedEvent) => {
    if (!event) {
      console.error("Invalid event data");
      return;
    }
    //generate a temporary id 
    const newEvent = { ...event, id: event.id || `temp-${Date.now()}` };
    setAddedEvents((prev) => [newEvent, ...prev]);
    setSelectedType(null);
  };

  const handleDeleteEvent = async (id: string): Promise<void> => {
    setAddedEvents((prev) =>
      prev.filter((event) => (event.id || event._id) !== id)
    );
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


  const handle_back_to_investments = () => {
    setStep("withdrawalStrategy");
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
      .filter(inv => inv.taxStatus === "PRE_TAX_RETIREMENT" as TaxStatus)
      .map(inv => {
        return inv.investmentTypeId || `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`;
      });
      
    setRmdSettings({
      ...rmdSettings,
      availableAccounts: preTaxAccounts
    });
    
    setStep("rmdSettings");
  };

  const handle_continue_from_rmd = () => {
    handle_continue_to_withdrawal_strategy();
  };

  const handle_continue_to_spending_strategy = () => {
    // Get discretionary expenses from added events
    const discretionaryExpenses = addedEvents
      .filter(event => 
        event.type === "expense" && 
        event.isDiscretionary === true
      )
      .map(event => event.name);
      
    setSpendingStrategy({
      ...spendingStrategy,
      availableExpenses: discretionaryExpenses
    });
    
    setStep("spendingStrategy");
  };

  const handle_continue_from_spending_strategy = () => {
    setStep("additionalSettings");
  };

  const handle_continue_to_withdrawal_strategy = () => {
    // Get all investment accounts
    const allAccounts = investmentsConfig.investments
      .map(inv => inv.investmentTypeId || `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`);
      
    setWithdrawalStrategy({
      ...withdrawalStrategy,
      availableAccounts: allAccounts
    });
    
    setStep("withdrawalStrategy");
  };

  const handle_continue_from_withdrawal_strategy = () => {
    setStep("eventSelection");
  };

  const handle_continue_from_event_selection = () => {
    setStep("spendingStrategy");
  };


  const handle_finish_scenario = async () => {
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
      expenseWithdrawalStrategy: withdrawalStrategy.enableCustomStrategy ? {
        type: withdrawalStrategy.strategyType,
        investmentOrder: withdrawalStrategy.accountPriority
      } : null,
      
      // Add spending strategy
      spendingStrategy: spendingStrategy.enableCustomStrategy ? {
        type: spendingStrategy.strategyType,
        expensePriority: spendingStrategy.expensePriority
      } : null,
    };
    
    // Submit the scenario
//     const completeScenario = {
//       scenarioDetails,
//       lifeExpectancyConfig,
//       investmentsConfig,
//       additionalSettings,
//       events: addedEvents,
//     };
// //REMOVE HARDCODING AND MVOVE API CALLs
//     try {
//       await axios.post("http://localhost:3000/api/scenarios", completeScenario, {
//         withCredentials: true,
//         headers: { "Content-Type": "application/json" },
//       });

    toast({
      title: "Scenario Created",
      description: "Your scenario has been created successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/scenarios");}
  // }catch (error) {
  //     console.error("Failed to create scenario:", error)}};

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

  // Investments Configuration Form
  if (step === "investments") {
    return (
      <InvestmentsForm
        investmentsConfig={investmentsConfig}
        onChangeInvestmentsConfig={setInvestmentsConfig}
        onContinue={handle_continue_to_rmd_settings}
        onBack={handle_back_to_roth_conversion}
      />
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
  if (step === "eventSelection") {
    return (
      <EventSeriesSection
        addedEvents={addedEvents}
        handleDeleteEvent={handleDeleteEvent}
        handleSaveAndContinue={handleSaveAndContinue}
        handleBackToInvestments={handle_back_to_investments}
        handleEventAdded={handleEventAdded}
        investments={investmentsConfig.investments}
      />
    );
  }

  // Default fallback (shouldn't reach here)
  return <Text>Loading...</Text>;
}

export default NewScenarioPage;
