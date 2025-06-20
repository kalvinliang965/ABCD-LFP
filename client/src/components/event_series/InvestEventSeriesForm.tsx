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
  FormErrorMessage,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

import { TaxStatus } from '../../components/scenarios/InvestmentsForm';
import { AmountChangeType } from '../../types/eventSeries';
import { InvestmentRaw } from '../../types/Scenarios';

import { CommonFields } from './CommonFields';

interface InvestEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
  investments?: InvestmentRaw[];
}

export const InvestEventSeriesForm: React.FC<InvestEventSeriesFormProps> = ({
  onBack,
  onEventAdded,
  existingEvents,
  investments = [],
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startYear, setStartYear] = useState<any>({
    type: 'fixed',
    value: new Date().getFullYear(),
  });
  const [duration, setDuration] = useState<any>({
    type: 'fixed',
    value: 1,
  });
  const [maxCash, setMaxCash] = useState<number>(0);
  const [maxCashError, setMaxCashError] = useState<string>('');
  const [useGlidePath, setUseGlidePath] = useState(false);
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({});
  const [finalAllocations, setFinalAllocations] = useState<{ [key: string]: number }>({});

  //filter out pre-tax investments
  useEffect(() => {
    // Filter out pre-tax investments AND cash investments
    const validInvestments = investments.filter(
      inv => inv.taxStatus !== ('pre-tax' as TaxStatus) && 
             !inv.id.toLowerCase().includes('cash')
    );

    const initialAllocations: { [key: string]: number } = {};
    validInvestments.forEach(inv => {
      initialAllocations[inv.id] = 0;
    });
    setAllocations(initialAllocations);
    setFinalAllocations(initialAllocations);
  }, [investments]);

  const validateAllocationPercentages = (percentages: { [key: string]: number }) => {
    const sum = Object.values(percentages).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 100) < 0.01;
  };

  const handleAllocationChange = (
    investmentId: string,
    value: number,
    isFinal: boolean = false
  ) => {
    const targetAllocations = isFinal ? finalAllocations : allocations;
    const setTargetAllocations = isFinal ? setFinalAllocations : setAllocations;

    const newAllocations = { ...targetAllocations };
    newAllocations[investmentId] = value;
    setTargetAllocations(newAllocations);
  };

  const renderAllocationInputs = (isFinal: boolean = false) => {
    const targetAllocations = isFinal ? finalAllocations : allocations;
    // Filter out pre-tax investments AND cash investments
    const validInvestments = investments.filter(
      inv => inv.taxStatus !== ('pre-tax' as TaxStatus) && 
             !inv.id.toLowerCase().includes('cash')
    );

    if (validInvestments.length === 0) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>No valid investments available</AlertTitle>
            <AlertDescription>
              Please add non-cash investments in the previous step before creating an invest event.
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
              Enter your desired asset allocation. Percentages must sum to 100%. For glide paths,
              specify both starting and ending percentages.
            </AlertDescription>
          </Box>
        </Alert>
        {validInvestments.map(inv => (
          <FormControl key={inv.id} isRequired>
            <FormLabel>{inv.id} (%)</FormLabel>
            <NumberInput
              value={targetAllocations[inv.id] || 0}
              onChange={value => handleAllocationChange(inv.id, parseFloat(value) || 0, isFinal)}
              min={0}
              max={100}
              precision={2}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        ))}
        <Text color={validateAllocationPercentages(targetAllocations) ? 'green.500' : 'red.500'}>
          Total:{' '}
          {Object.values(targetAllocations)
            .reduce((acc, val) => acc + val, 0)
            .toFixed(2)}
          %{!validateAllocationPercentages(targetAllocations) && ' (must equal 100%)'}
        </Text>
      </VStack>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    //reset error states
    setMaxCashError('');

    let hasErrors = false;

    //validate max cash is greater than 0
    if (maxCash <= 0) {
      setMaxCashError('Maximum cash must be greater than 0');
      hasErrors = true;
    }

    if (
      hasErrors ||
      !validateAllocationPercentages(allocations) ||
      (useGlidePath && !validateAllocationPercentages(finalAllocations))
    ) {
      return;
    }

    //convert allocations to direct object format
    const assetAllocation = Object.entries(allocations).reduce(
      (acc, [type, value]) => {
        acc[type] = value / 100; //convert percentage to decimal
        return acc;
      },
      {} as { [key: string]: number }
    );

    //convert final allocations to direct object format if using glide path
    const assetAllocation2 = useGlidePath
      ? Object.entries(finalAllocations).reduce(
          (acc, [type, value]) => {
            acc[type] = value / 100; //convert percentage to decimal
            return acc;
          },
          {} as { [key: string]: number }
        )
      : {};

    const eventData = {
      type: 'invest',
      name,
      description,
      start: startYear,
      duration,
      maxCash: Number(maxCash) || 0,
      assetAllocation,
      assetAllocation2,
      glidePath: useGlidePath,
      initialAmount: 0, //required by EventSeries type
      inflationAdjusted: false, //required by EventSeries type
    };

    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setMaxCash(0);
    setMaxCashError('');
    setUseGlidePath(false);
    //reset allocations to equal distribution
    // Filter out pre-tax AND cash investments
    const validInvestments = investments.filter(
      inv => inv.taxStatus !== ('pre-tax' as TaxStatus) && 
             !inv.id.toLowerCase().includes('cash')
    );
    const equalShare = validInvestments.length > 0 ? 100 / validInvestments.length : 0;
    const initialAllocations: { [key: string]: number } = {};
    validInvestments.forEach(inv => {
      initialAllocations[inv.id] = equalShare;
    });
    setAllocations(initialAllocations);
    setFinalAllocations(initialAllocations);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              There should be only one invest event per year, and invest events should not overlap with each other.
            </AlertDescription>
          </Box>
        </Alert>
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
        <FormControl isRequired isInvalid={!!maxCashError}>
          <FormLabel>Maximum Cash Holdings ($)</FormLabel>
          <NumberInput
            value={maxCash}
            onChange={valueString => {
              const value = Number(valueString) || 0;
              setMaxCash(value);
              if (value > 0) setMaxCashError('');
            }}
            min={0}
          >
            <NumberInputField placeholder="0" />
          </NumberInput>
          {maxCashError && <FormErrorMessage>{maxCashError}</FormErrorMessage>}
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Use Glide Path</FormLabel>
          <Switch isChecked={useGlidePath} onChange={e => setUseGlidePath(e.target.checked)} />
        </FormControl>
        <Box>
          <Text fontWeight="medium" mb={4}>
            Initial Asset Allocation
          </Text>
          {renderAllocationInputs(false)}
        </Box>
        {useGlidePath && (
          <Box>
            <Text fontWeight="medium" mb={4}>
              Final Asset Allocation
            </Text>
            {renderAllocationInputs(true)}
          </Box>
        )}
        <HStack spacing={4} justify="flex-end">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              Cancel
            </Button>
          )}
          <Button type="submit" colorScheme="blue">
            Save
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};
