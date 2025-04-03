import React, { useState, useEffect } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Box,
  Switch,
  Text,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { CommonFields } from "./CommonFields";
import { AmountChangeType } from "../../types/eventSeries";
import { Investment, TaxStatus } from "../../components/scenarios/InvestmentsForm";

interface InvestEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
  investments?: Investment[];
}

export const InvestEventSeriesForm: React.FC<InvestEventSeriesFormProps> = ({
  onBack,
  onEventAdded,
  existingEvents,
  investments = [],
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
  const [maxCash, setMaxCash] = useState("");
  const [useGlidePath, setUseGlidePath] = useState(false);
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({});
  const [finalAllocations, setFinalAllocations] = useState<{ [key: string]: number }>({});

  //filter out pre-tax investments
  useEffect(() => {
    const nonPreTaxInvestments = investments.filter(
      inv => inv.taxStatus !== "pre-tax" as TaxStatus
    );
    
    const initialAllocations: { [key: string]: number } = {};
    nonPreTaxInvestments.forEach(inv => {
      initialAllocations[inv.investmentTypeId || `Investment ${inv.id}`] = 0;
    });
    setAllocations(initialAllocations);
    setFinalAllocations(initialAllocations);
  }, [investments]);

  const validateAllocationPercentages = (percentages: { [key: string]: number }) => {
    const sum = Object.values(percentages).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 100) < 0.01;
  };

  const handleAllocationChange = (investmentId: string, value: number, isFinal: boolean = false) => {
    const targetAllocations = isFinal ? finalAllocations : allocations;
    const setTargetAllocations = isFinal ? setFinalAllocations : setAllocations;
    
    const newAllocations = { ...targetAllocations };
    newAllocations[investmentId] = value;
    setTargetAllocations(newAllocations);
  };

  const renderAllocationInputs = (isFinal: boolean = false) => {
    const targetAllocations = isFinal ? finalAllocations : allocations;
    const nonPreTaxInvestments = investments.filter(
      inv => inv.taxStatus !== "pre-tax" as TaxStatus
    );

    if (nonPreTaxInvestments.length === 0) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>No investments available</AlertTitle>
            <AlertDescription>
              Please add investments in the previous step before creating an invest event.
            </AlertDescription>
          </Box>
        </Alert>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Asset Allocation</AlertTitle>
            <AlertDescription>
              Enter your desired asset allocation. Percentages must sum to 100%. For glide paths, specify both starting and ending percentages.
            </AlertDescription>
          </Box>
        </Alert>
        {nonPreTaxInvestments.map((inv) => (
          <FormControl key={inv.id} isRequired>
            <FormLabel>
              {inv.investmentTypeId || `Investment ${inv.id}`} (%)
            </FormLabel>
            <NumberInput
              value={targetAllocations[inv.investmentTypeId || `Investment ${inv.id}`] || 0}
              onChange={(value) => handleAllocationChange(
                inv.investmentTypeId || `Investment ${inv.id}`,
                parseFloat(value) || 0,
                isFinal
              )}
              min={0}
              max={100}
              precision={2}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        ))}
        <Text color={validateAllocationPercentages(targetAllocations) ? "green.500" : "red.500"}>
          Total: {Object.values(targetAllocations).reduce((acc, val) => acc + val, 0).toFixed(2)}%
          {!validateAllocationPercentages(targetAllocations) && " (must equal 100%)"}
        </Text>
      </VStack>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllocationPercentages(allocations) || 
        (useGlidePath && !validateAllocationPercentages(finalAllocations))) {
      return;
    }

    const eventData = {
      type: "invest",
      name,
      description,
      startYear,
      duration,
      maxCash: Number(maxCash) || 0,
      assetAllocation: allocations,
      glidePath: useGlidePath,
      ...(useGlidePath && { assetAllocation2: finalAllocations })
    };

    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMaxCash("");
    setUseGlidePath(false);
    //reset allocations to equal distribution
    const nonPreTaxInvestments = investments.filter(
      inv => inv.taxStatus !== "pre-tax" as TaxStatus
    );
    const equalShare = 100 / nonPreTaxInvestments.length;
    const initialAllocations: { [key: string]: number } = {};
    nonPreTaxInvestments.forEach(inv => {
      initialAllocations[inv.investmentTypeId || `Investment ${inv.id}`] = equalShare;
    });
    setAllocations(initialAllocations);
    setFinalAllocations(initialAllocations);
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
          <FormLabel>Maximum Cash Holdings ($)</FormLabel>
          <Input
            type="number"
            value={maxCash}
            onChange={(e) => setMaxCash(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
          />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Use Glide Path</FormLabel>
          <Switch
            isChecked={useGlidePath}
            onChange={(e) => setUseGlidePath(e.target.checked)}
          />
        </FormControl>
        <Box>
          <Text fontWeight="medium" mb={4}>Initial Asset Allocation</Text>
          {renderAllocationInputs(false)}
        </Box>
        {useGlidePath && (
          <Box>
            <Text fontWeight="medium" mb={4}>Final Asset Allocation</Text>
            {renderAllocationInputs(true)}
          </Box>
        )}
        <HStack spacing={4} justify="flex-end">
          {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
          <Button type="submit" colorScheme="blue">Save</Button>
        </HStack>
      </VStack>
    </form>
  );
};
