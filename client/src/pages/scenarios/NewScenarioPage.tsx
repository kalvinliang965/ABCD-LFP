import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  useToast,
} from "@chakra-ui/react";
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
    // Navigate to the additional settings step instead of directly to scenarios
    setStep("additionalSettings");
  };

  const handle_continue_to_life_expectancy = () => {
    setStep("lifeExpectancy");
  };

  const handle_back_to_details = () => {
    setStep("details");
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


  const handle_finish_scenario = async () => {
    // Submit the entire scenario and navigate to scenarios page
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
        onContinue={handle_continue_to_event_selection}
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
        onBack={handle_back_to_event_selection}
        onContinue={handle_finish_scenario}
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
    />
    );
  }


  // Default fallback (shouldn't reach here)
  return <Text>Loading...</Text>;
}

export default NewScenarioPage;
