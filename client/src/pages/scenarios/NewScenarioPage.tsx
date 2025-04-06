import React, { useState, useEffect } from "react";
import { Box, Text, useToast, Button, HStack } from "@chakra-ui/react";
import { useEventSeries } from "../../contexts/EventSeriesContext";
import { useNavigate } from "react-router-dom";
import ScenarioDetailsForm, {
  ScenarioDetails,
  ScenarioType,
} from "../../components/scenarios/ScenarioDetailsForm";
import LifeExpectancyForm, {
  LifeExpectancyConfig,
} from "../../components/scenarios/LifeExpectancyForm";
import InvestmentsForm, {
  InvestmentsConfig,
  TaxStatus,
} from "../../components/scenarios/InvestmentsForm";
import { InvestmentTypesForm } from "../../components/scenarios/InvestmentTypesForm";
import AdditionalSettingsForm, {
  AdditionalSettingsConfig,
} from "../../components/scenarios/AdditionalSettingsForm";
import RothConversionOptimizerForm, { RothConversionStrategy } from "../../components/roth_conversion_optimizer/RothConversionForm";
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
import EventSeriesSection, {
  AddedEvent,
} from "../../components/event_series/EventSeriesSection";
import { investmentTypeStorage } from "../../services/investmentTypeStorage";
import { map_form_to_scenario_raw } from "../../utils/scenarioMapper";

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
    availableExpenses: [],
    selectedExpenses: [],
  });
  const [withdrawalStrategy, setWithdrawalStrategy] = useState<WithdrawalStrategy>({
      availableAccounts: [],
      accountPriority: [],
    });

  const [rothConversionStrategy, setRothConversionStrategy] = useState<RothConversionStrategy>({
      availableAccounts: [],
      accountPriority: [],
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
    investmentTypeStorage.clear();
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
    investmentTypeStorage.clear();
    // Here you would process the imported data
    // For now, we'll just show a success message and redirect
    //! 这里面需要写一个function，来处理导入的数据。那么就直接发给后端。让后端来生成ID然后存入数据库。
    //TODO：

    // Clean investment type data from localStorage
    investmentTypeStorage.clear();

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

  //! 海风写的，不要动
  // const handleSaveAndContinue = () => {
  //   // Navigate to spending strategy instead of directly to additional settings
  //   handle_continue_to_spending_strategy();
  // };
  //! 到这里都是海风写的，不要动。

  const handle_to_life_expectancy = () => {
    setStep("lifeExpectancy");
  };

  const handle_to_Scenario_name_type = () => {
    setStep("Scenario_name&type");
  };

  const handle_to_investments = () => {
    // Log investment types before clearing
    console.log("Investment types", investmentTypeStorage.get_all());
    setStep("investments");
  };

  const handle_to_investment_types = () => {
    setStep("investmentTypes");
  };

  const handle_to_roth_conversion_optimizer = () => {
    const allAccounts = investmentsConfig.investments.map(
      (inv) =>
        inv.investmentType ||
        `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`
    );
    setRothConversionStrategy({
      availableAccounts: allAccounts,
      accountPriority: rothConversionStrategy.accountPriority || [],
    });
    setStep("rothConversionOptimizer");
  };

  const handle_continue_to_rmd_settings = () => {
    // Update available accounts based on investments
    const preTaxAccounts = investmentsConfig.investments
      .filter((inv) => inv.taxStatus === ("PRE_TAX_RETIREMENT" as TaxStatus))
      .map((inv) => {
        return (
          inv.investmentType ||
          `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`
        );
      });

    setRmdSettings({
      ...rmdSettings,
      availableAccounts: preTaxAccounts,
    });

    setStep("rmdSettings");
  };

  const handle_continue_to_spending_strategy = () => {
    // Get all expenses from added events
    const allExpenses = addedEvents
      .filter((event) => event.type === "expense")
      .map((event) => event.name);

    setSpendingStrategy({
      availableExpenses: allExpenses,
      selectedExpenses: spendingStrategy.selectedExpenses || [],
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
        inv.investmentType ||
        `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`
    );

    setWithdrawalStrategy({
      availableAccounts: allAccounts,
      accountPriority: withdrawalStrategy.accountPriority || [],
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
    // Map form data to ScenarioRaw
    const scenarioRaw = map_form_to_scenario_raw(
      scenarioDetails,
      lifeExpectancyConfig,
      investmentsConfig,
      additionalSettings,
      rmdSettings,
      spendingStrategy,
      withdrawalStrategy,
      addedEvents
    );

    // Console log the final ScenarioRaw object with helpful formatting
    console.log("============== Final ScenarioRaw Object ==============");
    console.log("Basic Info:", {
      name: scenarioRaw.name,
      martialStatus: scenarioRaw.martialStatus,
      birthYears: scenarioRaw.birthYears,
      residenceState: scenarioRaw.residenceState,
    });
    console.log("Life Expectancy:", scenarioRaw.lifeExpectancy);
    console.log("Investment Types:", Array.from(scenarioRaw.investmentTypes));
    console.log("Investments:", Array.from(scenarioRaw.investments));
    console.log("Event Series:", Array.from(scenarioRaw.eventSeries));
    console.log("Inflation Assumption:", scenarioRaw.inflationAssumption);
    console.log("Spending Strategy:", scenarioRaw.spendingStrategy);
    console.log("Withdrawal Strategy:", scenarioRaw.expenseWithdrawalStrategy);
    console.log("RMD Strategy:", scenarioRaw.RMDStrategy);
    console.log("Roth Conversion:", {
      enabled: scenarioRaw.RothConversionOpt,
      startAge: scenarioRaw.RothConversionStart,
      endAge: scenarioRaw.RothConversionEnd,
      strategy: scenarioRaw.RothConversionStrategy,
    });
    console.log("Financial Goal:", scenarioRaw.financialGoal);
    console.log("Complete ScenarioRaw Object:", scenarioRaw);
    console.log("=====================================================");

    // Clean investment type data from localStorage
    investmentTypeStorage.clear();

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

  const handle_back_to_rmd = () => {
    setStep("rmdSettings");
  };
  //! 这部分是海风写的，不要动。

  // Selection between creating from scratch or importing YAML
  if (step === "typeSelection") {
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
        rothConversionStrategy={rothConversionStrategy}
        onChangeRothConversionStrategy={setRothConversionStrategy}
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
        onContinue={handle_continue_to_withdrawal_strategy}
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
  if (step === "eventSelection") {
    return (
      <EventSeriesSection
        addedEvents={addedEvents}
        handleDeleteEvent={handleDeleteEvent}
        handleSaveAndContinue={handle_continue_to_spending_strategy}
        handleBackToInvestments={handle_continue_to_withdrawal_strategy}
        handleEventAdded={handleEventAdded}
        investments={investmentsConfig.investments}
      />
    );
  }

  // Default fallback (shouldn't reach here)
  return <Text>Loading...</Text>;
}

export default NewScenarioPage;
