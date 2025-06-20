import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  Button,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';

import { TaxStatus } from '../../components/scenarios/InvestmentsForm';
import { InvestmentRaw } from '../../types/Scenarios';

import { CommonFields } from './CommonFields';

interface RebalanceEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
  investments?: InvestmentRaw[];
}

export const RebalanceEventSeriesForm: React.FC<RebalanceEventSeriesFormProps> = ({
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
  const [selectedTaxStatus, setSelectedTaxStatus] = useState<TaxStatus | ''>('');
  const [allocations, setAllocations] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (selectedTaxStatus) {
      //filter out cash investments from the allocations
      const matchingInvestments = investments.filter(
        inv => inv.taxStatus === selectedTaxStatus && !inv.id.toLowerCase().includes('cash')
      );

      //initialize allocations with empty values
      const initialAllocations: { [key: string]: number } = {};
      matchingInvestments.forEach(inv => {
        initialAllocations[inv.investmentType || `Investment ${inv.id}`] = 0;
      });
      setAllocations(initialAllocations);
    }
  }, [selectedTaxStatus, investments]);

  const validateAllocationPercentages = (percentages: { [key: string]: number }) => {
    const sum = Object.values(percentages).reduce((acc, val) => acc + val, 0);
    return Math.abs(sum - 100) < 0.01;
  };

  const handleAllocationChange = (investmentId: string, value: number) => {
    const newAllocations = { ...allocations };
    newAllocations[investmentId] = value;
    setAllocations(newAllocations);
  };

  const renderAllocationInputs = () => {
    if (!selectedTaxStatus) return null;

    //filter out cash investments from the displayed allocation options
    const matchingInvestments = investments.filter(
      inv => inv.taxStatus === selectedTaxStatus && !inv.id.toLowerCase().includes('cash')
    );

    if (matchingInvestments.length === 0) {
      return (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>No valid investments available</AlertTitle>
            <AlertDescription>
              Please add non-cash investments with this tax status in the previous step before creating a rebalance event.
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
              Enter your desired asset allocation. Percentages must sum to 100%.
            </AlertDescription>
          </Box>
        </Alert>
        {matchingInvestments.map(inv => (
          <FormControl key={inv.id} isRequired>
            <FormLabel>{inv.investmentType || `Investment ${inv.id}`} (%)</FormLabel>
            <NumberInput
              value={allocations[inv.investmentType || `Investment ${inv.id}`] || 0}
              onChange={value =>
                handleAllocationChange(
                  inv.investmentType || `Investment ${inv.id}`,
                  parseFloat(value) || 0
                )
              }
              min={0}
              max={100}
              precision={2}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        ))}
        <Text color={validateAllocationPercentages(allocations) ? 'green.500' : 'red.500'}>
          Total:{' '}
          {Object.values(allocations)
            .reduce((acc, val) => acc + val, 0)
            .toFixed(2)}
          %{!validateAllocationPercentages(allocations) && ' (must equal 100%)'}
        </Text>
      </VStack>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAllocationPercentages(allocations)) {
      return;
    }

    //convert allocations to direct object format
    const assetAllocation = Object.entries(allocations).reduce(
      (acc, [type, value]) => {
        const investment = investments.find(
          inv => inv.investmentType === type && inv.taxStatus === selectedTaxStatus
        );
        if (investment) {
          acc[investment.id] = value / 100; //convert percentage to decimal
        }
        return acc;
      },
      {} as { [key: string]: number }
    );

    const eventData = {
      type: 'rebalance',
      name,
      description,
      start: startYear,
      duration,
      selectedTaxStatus,
      assetAllocation,
      initialAmount: 0,
      inflationAdjusted: false,
    };

    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedTaxStatus('');
    setAllocations({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Alert status="info" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Important Note</AlertTitle>
            <AlertDescription>
              Rebalance events should not overlap with other rebalance events of the same tax status.
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
        <FormControl isRequired>
          <FormLabel>Account Tax Status</FormLabel>
          <Select
            value={selectedTaxStatus}
            onChange={e => setSelectedTaxStatus(e.target.value as TaxStatus)}
            placeholder="Select account type"
          >
            <option value="non-retirement">Non-Retirement</option>
            <option value="pre-tax">Pre-Tax</option>
            <option value="after-tax">After-Tax</option>
          </Select>
        </FormControl>
        {selectedTaxStatus && <Box>{renderAllocationInputs()}</Box>}
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
