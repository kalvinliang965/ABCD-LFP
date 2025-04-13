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
  //TaxStatus,
} from "../../components/scenarios/InvestmentsForm";
import { InvestmentTypesForm } from "../../components/scenarios/InvestmentTypesForm";
import AdditionalSettingsForm, {
  AdditionalSettingsConfig,
} from "../../components/scenarios/AdditionalSettingsForm";
import RothConversionOptimizerForm, {
  RothConversionStrategy,
} from "../../components/scenarios/RothConversionForm";
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
import { spendingStrategyApi } from "../../services/spendingStrategyApi";
import spendingStrategyStorage from "../../services/spendingStrategyStorage";
import { withdrawalStrategyApi } from "../../services/withdrawalStrategyApi";
import withdrawalStrategyStorage from "../../services/withdrawalStrategyStorage";
import rmdStrategyStorage from "../../services/rmdStrategyStorage";
import lifeExpectancyStorage from "../../services/lifeExpectancyStorage";
import { scenarioApi } from "../../services/scenario";
import { convert_scenario_to_yaml } from "../../utils/yamlExport";

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
    userBirthYear: new Date().getFullYear() - 20, //! this will help the user fill in a default value, which is the current date - 20 years
  });
  const [lifeExpectancyConfig, setLifeExpectancyConfig] =
    //this part is the default value for couple
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
        value: 2.5, //! 2.5 is the default value, which means the user doesn't input anything, then it's 2.5
      },
      afterTaxContributionLimit: 0,
      financialGoal: {
        value: 0, //! 0 is the default value, which means the user doesn't input anything, then it's 0
      },
      stateOfResidence: "NY", // ! state of residence, currently only has 3 values, NY, NJ, CT. need to modify when expanding.
    });

  const toast = useToast();
  //! don't touch
  const [rmdSettings, setRmdSettings] = useState<RMDSettings>({
    //enableRMD: true,
    currentAge: 0, // Will be calculated based on birth year
    accountPriority: [],
    availableAccounts: [],
  });
  const [spendingStrategy, setSpendingStrategy] = useState<SpendingStrategy>({
    availableExpenses: [],
    selectedExpenses: [],
  });
  const [withdrawalStrategy, setWithdrawalStrategy] =
    useState<WithdrawalStrategy>({
      availableAccounts: [],
      accountPriority: [],
    });

  const [rothConversionStrategy, setRothConversionStrategy] =
    useState<RothConversionStrategy>({
      roth_conversion_start: 0,
      roth_conversion_end: 0,
      roth_conversion_opt: false,
      availableAccounts: [],
      accountPriority: [],
    });
  //! don't touch

  // *this part is called by who? check the type.
  // *this part only has two values, FROM_SCRATCH and IMPORT_YAML.
  //! if the user choose IMPORT_YAML, then jump to yamlImport step.
  const handle_scenario_type_select = (type: ScenarioCreationType) => {
    console.log(
      "NewScenarioPage: handle_scenario_type_select called with:",
      type
    );
    investmentTypeStorage.clear();
    clearLocalStorage();
    if (type === ScenarioCreationType.FROM_SCRATCH) {
      console.log("NewScenarioPage: Changing step to 'Scenario_name&type'");
      setStep("Scenario_name&type");
    } else {
      console.log("NewScenarioPage: Changing step to 'yamlImport'");
      setStep("yamlImport");
    }
    console.log("NewScenarioPage: Current step after setState:", step); // This will still show the old value due to React's state update timing
  };

  //! check if the user choose IMPORT_YAML, then jump to yamlImport step.
  const handle_yaml_import_complete = async (data: any) => {
    investmentTypeStorage.clear();
    // const yaml = convert_scenario_to_yaml(data.data);
    // console.log("NewScenarioPage: yaml:", yaml);
    try {
      const savedScenario = await scenarioApi.create(data.rawYaml);
      console.log("Scenario created:", savedScenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
    }

    toast({
      title: "Import Successful",
      description: `Scenario "${data.data.name}" imported successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    navigate("/scenarios");
  };

  //! from here on, all back and continue are changed to to, and call the same function.
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

  //! don't touch
  // const handleSaveAndContinue = () => {
  //   // Navigate to spending strategy instead of directly to additional settings
  //   handle_continue_to_spending_strategy();
  // };
  //! don't touch

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

  const handle_to_investment_types = async () => {
    await saveLifeExpectancyConfig();
    setStep("investmentTypes");
  };

  const handle_to_roth_conversion_optimizer = () => {
    // AI-generated code
    // Filter investments to only include those with tax status "pre-tax" or "PRE_TAX_RETIREMENT"
    const preTaxInvestments = investmentsConfig.investments.filter(
      (inv) =>
        inv.taxStatus === "pre-tax" || inv.taxStatus === "PRE_TAX_RETIREMENT"
    );

    const allAccounts = preTaxInvestments.map((inv) => ({
      id: inv.id || `inv-${Math.random().toString(36).substring(2, 9)}`,
      name:
        inv.investmentType ||
        `Investment ${inv.id || Math.random().toString(36).substr(2, 9)}`,
    }));

    console.log("Pre-tax accounts for Roth conversion:", allAccounts);

    setRothConversionStrategy({
      roth_conversion_opt: false,
      roth_conversion_start: new Date().getFullYear(),
      roth_conversion_end: new Date().getFullYear() + 5,
      availableAccounts: allAccounts,
      accountPriority: rothConversionStrategy.accountPriority || [],
    });
    setStep("rothConversionOptimizer");
  };

  const handle_continue_to_rmd_settings = () => {
    // Calculate current age based on birth year
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - scenarioDetails.userBirthYear;

    console.log("Investments before filtering:", investmentsConfig.investments);

    // Change this filter to match the actual tax status value
    const preTaxInvestments = investmentsConfig.investments.filter((inv) => {
      console.log("Investment tax status:", inv.taxStatus);
      // Check for both possible formats to be safe
      return (
        inv.taxStatus === "pre-tax" || inv.taxStatus === "PRE_TAX_RETIREMENT"
      );
    });

    // Map to the format needed for RMDSettings
    const preTaxAccounts = preTaxInvestments.map((inv) => ({
      id: inv.id || `inv-${Math.random().toString(36).substring(2, 9)}`,
      name:
        inv.investmentType ||
        `Investment ${inv.id || Math.random().toString(36).substring(2, 9)}`,
    }));

    console.log("Filtered pre-tax accounts:", preTaxAccounts);
    console.log("Current age:", currentAge);

    setRmdSettings({
      ...rmdSettings,
      currentAge: currentAge, // Set the calculated current age
      availableAccounts: preTaxAccounts,
    });

    console.log("RMD Settings after update:", {
      ...rmdSettings,
      currentAge: currentAge,
      availableAccounts: preTaxAccounts,
    });

    setStep("rmdSettings");
  };

  const handle_continue_to_spending_strategy = () => {
    // Get all expenses from added events
    const allExpenses = addedEvents
      .filter(
        (event) => event.type === "expense" && event.discretionary === true
      )
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
    // Get all accounts from investments with their IDs
    //console.log("Investments:", investmentsConfig.investments);
    const allAccounts = investmentsConfig.investments.map((inv) => ({
      id: inv.id || `inv-${Math.random().toString(36).substring(2, 9)}`,
      name:
        inv.investmentType ||
        `Investment ${inv.id || Math.random().toString(36).substring(2, 9)}`,
    }));

    console.log("Available accounts for withdrawal:", allAccounts);

    setWithdrawalStrategy({
      availableAccounts: allAccounts,
      accountPriority: withdrawalStrategy.accountPriority || [],
    });

    setStep("withdrawalStrategy");
  };

  const handle_continue_from_withdrawal_strategy = async () => {
    await saveWithdrawalStrategy();
    setStep("eventSelection");
  };

  const handle_to_spending_strategy = () => {
    setStep("spendingStrategy");
  };
  //! don't touch

  //* the final step
  const handle_finish_scenario = async () => {
    // Map form data to ScenarioRaw
    const scenarioRaw = map_form_to_scenario_raw(
      scenarioDetails,
      lifeExpectancyConfig,
      investmentsConfig,
      additionalSettings,
      rmdSettings,
      spendingStrategy,
      withdrawalStrategy,
      rothConversionStrategy,
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
      start_year: scenarioRaw.RothConversionStart,
      end_yaer: scenarioRaw.RothConversionEnd,
      strategy: scenarioRaw.RothConversionStrategy,
    });
    console.log("Inflation Assumption");
    console.log("type:", scenarioRaw.inflationAssumption["type"]);
    console.log("value: ", scenarioRaw.inflationAssumption["value"]);
    console.log("min", scenarioRaw.inflationAssumption["min"]);
    console.log("max:", scenarioRaw.inflationAssumption["max"]);
    console.log("mean: ", scenarioRaw.inflationAssumption["mean"]);
    console.log("stdev", scenarioRaw.inflationAssumption["stdev"]);
    console.log("Financial Goal:", scenarioRaw.financialGoal);
    console.log("Complete ScenarioRaw Object:", scenarioRaw);
    console.log("=====================================================");

    // AI-generated code
    // Send scenario to backend using scenarioApi
    try {
      const yaml = convert_scenario_to_yaml(scenarioRaw);
      const savedScenario = await scenarioApi.create(yaml);
      console.log("Scenario saved to backend:", savedScenario);

      // Clean investment type data from localStorage
      investmentTypeStorage.clear();
      //need to check what is the correct way to clear the local storage
      clearLocalStorage();
      // Show success toast and navigate to scenarios page
      toast({
        title: "Scenario Created",
        description: "Your scenario has been created successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      console.log("Attempting to navigate to /scenarios...");
      navigate("/scenarios");
      console.log("Navigation function called");

      // After successfully saving the complete scenario
    } catch (error) {
      console.error("Error saving scenario:", error);
      toast({
        title: "Error Creating Scenario",
        description:
          "There was a problem creating your scenario. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
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
  //! don't touch

  // const saveSpendingStrategy = async () => {
  //   try {
  //     // Save to API
  //     if (spendingStrategy.id) {
  //       await spendingStrategyApi.update(spendingStrategy.id, spendingStrategy);
  //     } else {
  //       const savedStrategy = await spendingStrategyApi.create(spendingStrategy);
  //       setSpendingStrategy(savedStrategy);
  //     }

  //     // Also save to localStorage
  //     if (spendingStrategy.id) {
  //       spendingStrategyStorage.update(spendingStrategy.id, spendingStrategy);
  //     } else {
  //       const savedLocalStrategy = spendingStrategyStorage.add(spendingStrategy);
  //       // Update with the ID generated by localStorage if we didn't get one from the API
  //       if (!spendingStrategy.id) {
  //         setSpendingStrategy(savedLocalStrategy);
  //       }
  //     }

  //     toast({
  //       title: "Spending strategy saved",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     console.error("Error saving spending strategy:", error);

  //     // If API fails, still try to save to localStorage
  //     try {
  //       if (spendingStrategy.id) {
  //         spendingStrategyStorage.update(spendingStrategy.id, spendingStrategy);
  //       } else {
  //         const savedLocalStrategy = spendingStrategyStorage.add(spendingStrategy);
  //         setSpendingStrategy(savedLocalStrategy);
  //       }

  //       toast({
  //         title: "Spending strategy saved locally",
  //         description: "Could not connect to server, saved to browser storage",
  //         status: "warning",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     } catch (localError) {
  //       console.error("Error saving to localStorage:", localError);
  //       toast({
  //         title: "Error saving spending strategy",
  //         description: "Please try again later",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   }
  // };

  // const handle_continue_from_spending_strategy = async () => {
  //   await saveSpendingStrategy();
  //   setStep("withdrawalStrategy");
  // };

  // Add this function to clear localStorage when a scenario is completed
  const clearLocalStorage = () => {
    try {
      spendingStrategyStorage.clear();
      withdrawalStrategyStorage.clear();
      rmdStrategyStorage.clear();
      lifeExpectancyStorage.clear();
      console.log("Cleared all strategies from localStorage");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // Add a useEffect to load withdrawal strategy from localStorage
  useEffect(() => {
    // Try to load existing withdrawal strategy from localStorage
    const savedStrategies = withdrawalStrategyStorage.get_all();
    if (savedStrategies.length > 0) {
      // Use the most recent one
      setWithdrawalStrategy(savedStrategies[savedStrategies.length - 1]);
      console.log(
        "Loaded withdrawal strategy from localStorage:",
        savedStrategies[savedStrategies.length - 1]
      );
    }
  }, []);

  // Add this function to NewScenarioPage.tsx
  const saveWithdrawalStrategy = async () => {
    try {
      // Skip API calls for now
      // if (withdrawalStrategy.id) {
      //   await withdrawalStrategyApi.update(withdrawalStrategy.id, withdrawalStrategy);
      // } else {
      //   const savedStrategy = await withdrawalStrategyApi.create(withdrawalStrategy);
      //   setWithdrawalStrategy(savedStrategy);
      // }

      // Only use localStorage
      if (withdrawalStrategy.id) {
        withdrawalStrategyStorage.update(
          withdrawalStrategy.id,
          withdrawalStrategy
        );
      } else {
        const savedLocalStrategy =
          withdrawalStrategyStorage.add(withdrawalStrategy);
        setWithdrawalStrategy(savedLocalStrategy);
      }

      toast({
        title: "Withdrawal strategy saved locally",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving withdrawal strategy:", error);
      toast({
        title: "Error saving withdrawal strategy",
        description: "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Add this near your other useEffects
  // useEffect(() => {
  //   console.log("investmentsConfig changed:", investmentsConfig);
  //   console.log("Number of investments:", investmentsConfig.investments.length);
  //   console.log("Pre-tax investments:", investmentsConfig.investments.filter(
  //     inv => inv.taxStatus === "PRE_TAX_RETIREMENT"
  //   ));
  // }, [investmentsConfig]);

  // // Inside the NewScenarioPage component, add this function
  // const saveRMDStrategy = async () => {
  //   try {
  //     // Only use localStorage
  //     if (rmdSettings.id) {
  //       rmdStrategyStorage.update(rmdSettings.id, rmdSettings);
  //     } else {
  //       const savedSettings = rmdStrategyStorage.add(rmdSettings);
  //       setRmdSettings(savedSettings);
  //     }

  //     toast({
  //       title: "RMD settings saved locally",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (error) {
  //     console.error("Error saving RMD settings:", error);
  //     toast({
  //       title: "Error saving RMD settings",
  //       description: "Please try again later",
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // };

  // Update the handle_continue_from_rmd_settings function
  // const handle_continue_from_rmd_settings = async () => {
  //   await saveRMDStrategy();
  //   handle_continue_to_withdrawal_strategy();
  // };

  // Add a useEffect to load RMD settings from localStorage
  useEffect(() => {
    // Try to load existing RMD settings from localStorage
    const savedSettings = rmdStrategyStorage.get_all();
    if (savedSettings.length > 0) {
      // Use the most recent one
      setRmdSettings(savedSettings[savedSettings.length - 1]);
      console.log(
        "Loaded RMD settings from localStorage:",
        savedSettings[savedSettings.length - 1]
      );
    }
  }, []);

  // Inside the NewScenarioPage component, add this function
  const saveLifeExpectancyConfig = async () => {
    try {
      // Only use localStorage
      if (lifeExpectancyConfig.id) {
        lifeExpectancyStorage.update(
          lifeExpectancyConfig.id,
          lifeExpectancyConfig
        );
      } else {
        const savedConfig = lifeExpectancyStorage.add(lifeExpectancyConfig);
        setLifeExpectancyConfig(savedConfig);
      }

      toast({
        title: "Life expectancy settings saved locally",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving life expectancy settings:", error);
      toast({
        title: "Error saving life expectancy settings",
        description: "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

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
