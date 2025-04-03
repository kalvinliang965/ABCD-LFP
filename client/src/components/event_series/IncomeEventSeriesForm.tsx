import React, { useState } from "react";
import {
  VStack,
  Select,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  Switch,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  Stack,
  Button,
  Box,
} from "@chakra-ui/react";
import { CommonFields } from "./CommonFields";
import { AmountChangeType } from "../../types/eventSeries";

interface IncomeEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
}

export const IncomeEventSeriesForm: React.FC<IncomeEventSeriesFormProps> = ({
  onBack,
  onEventAdded,
  existingEvents,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startYear, setStartYear] = useState<any>({
    type: "fixed",
    value: new Date().getFullYear(),
  });
  const [duration, setDuration] = useState<any>({
    type: "fixed",
    value: 1,
  });

  const [amount, setAmount] = useState("");
  const [annualChange, setAnnualChange] = useState<AmountChangeType>({
    type: "fixed",
    value: undefined,
  });
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [isSocialSecurity, setIsSocialSecurity] = useState(false);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);

  const handlePercentageChange = (isUser: boolean, value: string) => {
    const numValue = value === "" ? 0 : Math.min(100, Math.max(0, parseInt(value) || 0));
    if (isUser) {
      setUserPercentage(numValue);
      setSpousePercentage(100 - numValue);
    } else {
      setSpousePercentage(numValue);
      setUserPercentage(100 - numValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      type: "income",
      name,
      description,
      startYear,
      duration,
      initialAmount: Number(amount) || 0,
      annualChange,
      inflationAdjusted,
      userPercentage,
      spousePercentage,
      isSocialSecurity,
    };
    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setAmount("");
    setInflationAdjusted(false);
    setIsSocialSecurity(false);
    setUserPercentage(100);
    setSpousePercentage(0);
    setStartYear({ type: "fixed", value: new Date().getFullYear() });
    setDuration({ type: "fixed", value: 1 });
    setAnnualChange({ type: "fixed", value: undefined });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <CommonFields
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          startYear={startYear}
          setStartYear={setStartYear}
          duration={duration}
          setDuration={setDuration}
          existingEvents={existingEvents}
        />
        <FormControl isRequired>
          <FormLabel>Initial Amount</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.500" children="$" />
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              min="0"
              step="1"
              pl={7}
            />
          </InputGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Annual Change Type</FormLabel>
          <Select
            value={annualChange.type}
            onChange={(e) => {
              const type = e.target.value as AmountChangeType["type"];
              switch (type) {
                case "fixed":
                  setAnnualChange({ type: "fixed", value: undefined });
                  break;
                case "fixedPercent":
                  setAnnualChange({ type: "fixedPercent", value: undefined });
                  break;
                case "uniform":
                  setAnnualChange({ type: "uniform", min: undefined, max: undefined });
                  break;
                case "normal":
                  setAnnualChange({ type: "normal", mean: undefined, stdDev: undefined });
                  break;
              }
            }}
          >
            <option value="fixed">Fixed Amount</option>
            <option value="fixedPercent">Fixed Percentage</option>
            <option value="uniform">Uniform Distribution</option>
            <option value="normal">Normal Distribution</option>
          </Select>
        </FormControl>
        {annualChange.type === "fixed" && (
          <FormControl isRequired>
            <FormLabel>Annual Change ($)</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" color="gray.500" children="$" />
              <Input
                type="number"
                value={annualChange.value ?? ""}
                onChange={(e) =>
                  setAnnualChange({ type: "fixed", value: parseInt(e.target.value) })
                }
                placeholder="0"
                min="0"
                step="1"
                pl={7}
              />
            </InputGroup>
          </FormControl>
        )}
        {annualChange.type === "fixedPercent" && (
          <FormControl isRequired>
            <FormLabel>Annual Change (%)</FormLabel>
            <Input
              type="number"
              value={annualChange.value ?? ""}
              onChange={(e) =>
                setAnnualChange({ type: "fixedPercent", value: parseInt(e.target.value) })
              }
              min="0"
              step="1"
            />
          </FormControl>
        )}
        {annualChange.type === "uniform" && (
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Minimum Change ($)</FormLabel>
              <Input
                type="number"
                value={annualChange.min ?? ""}
                onChange={(e) =>
                  setAnnualChange({ ...annualChange, min: parseInt(e.target.value) })
                }
                min="0"
                step="1"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Maximum Change ($)</FormLabel>
              <Input
                type="number"
                value={annualChange.max ?? ""}
                onChange={(e) =>
                  setAnnualChange({ ...annualChange, max: parseInt(e.target.value) })
                }
                min="0"
                step="1"
              />
            </FormControl>
          </Stack>
        )}
        {annualChange.type === "normal" && (
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Mean Change ($)</FormLabel>
              <Input
                type="number"
                value={annualChange.mean ?? ""}
                onChange={(e) =>
                  setAnnualChange({ ...annualChange, mean: parseInt(e.target.value) })
                }
                min="0"
                step="1"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Standard Deviation ($)</FormLabel>
              <Input
                type="number"
                value={annualChange.stdDev ?? ""}
                onChange={(e) =>
                  setAnnualChange({ ...annualChange, stdDev: parseInt(e.target.value) })
                }
                min="0"
                step="1"
              />
            </FormControl>
          </Stack>
        )}
        <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel mb={0}>Inflation Adjusted</FormLabel>
            <Switch isChecked={inflationAdjusted} onChange={(e) => setInflationAdjusted(e.target.checked)} />
          </FormControl>
        </Box>
        <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel mb={0}>Social Security Income</FormLabel>
            <Switch isChecked={isSocialSecurity} onChange={(e) => setIsSocialSecurity(e.target.checked)} />
          </FormControl>
        </Box>
        <Box p={4} bg="gray.50" borderRadius="lg" width="100%">
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            Income Split
          </Text>
          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>User Percentage</FormLabel>
              <NumberInput
                value={userPercentage}
                onChange={(value) => handlePercentageChange(true, value)}
                min={0}
                max={100}
                clampValueOnBlur={true}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Spouse Percentage</FormLabel>
              <NumberInput
                value={spousePercentage}
                onChange={(value) => handlePercentageChange(false, value)}
                min={0}
                max={100}
                clampValueOnBlur={true}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </HStack>
          <Text
            mt={2}
            fontSize="sm"
            color={userPercentage + spousePercentage === 100 ? "green.500" : "red.500"}
          >
            Total: {userPercentage + spousePercentage}%
            {userPercentage + spousePercentage !== 100 && " (must equal 100%)"}
          </Text>
        </Box>
        <HStack spacing={4} justify="flex-end">
          {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
          <Button type="submit" colorScheme="blue">Save</Button>
        </HStack>
      </VStack>
    </form>
  );
};
