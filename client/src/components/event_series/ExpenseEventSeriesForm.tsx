import {
  VStack,
  Box,
  Select,
  FormControl,
  FormLabel,
  Switch,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  Stack,
  Button,
  FormErrorMessage,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { AmountChangeType } from '../../types/eventSeries';

import { CommonFields } from './CommonFields';

interface ExpenseEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
}

export const ExpenseEventSeriesForm: React.FC<ExpenseEventSeriesFormProps> = ({
  onBack,
  onEventAdded,
  existingEvents,
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

  const [amount, setAmount] = useState<number>(0);
  const [amountError, setAmountError] = useState<string>('');
  const [annualChange, setAnnualChange] = useState<AmountChangeType>({
    type: 'fixed',
    value: 0,
  });
  const [annualChangeError, setAnnualChangeError] = useState<string>('');
  const [changeAmtOrPct, setChangeAmtOrPct] = useState<'amount' | 'percent'>('amount');
  const [isDiscretionary, setIsDiscretionary] = useState(false);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);
  const [inflationAdjusted, setInflationAdjusted] = useState(false);

  const handlePercentageChange = (isUser: boolean, value: string) => {
    const numValue = value === '' ? 0 : Math.min(100, Math.max(0, parseInt(value) || 0));
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

    //reset error states
    setAmountError('');
    setAnnualChangeError('');

    let hasErrors = false;

    //validate that amount is greater than 0
    if (amount < 0) {
      setAmountError('Amount cannot be less than 0');
      hasErrors = true;
    }

    //validate that annual change values are specified if needed
    if (
      annualChange.type === 'fixed' &&
      (annualChange.value === undefined || annualChange.value < 0)
    ) {
      setAnnualChangeError('Annual change cannot be less than 0');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    //create the changeDistribution based on the annualChange type
    let changeDistribution;

    if (annualChange.type === 'fixed') {
      changeDistribution = {
        type: 'fixed',
        value:
          changeAmtOrPct === 'percent' ? (annualChange.value || 0) / 100 : annualChange.value || 0,
      };
    } else if (annualChange.type === 'uniform') {
      changeDistribution = {
        type: 'uniform',
        lower: changeAmtOrPct === 'percent' ? (annualChange.min || 0) / 100 : annualChange.min || 0,
        upper: changeAmtOrPct === 'percent' ? (annualChange.max || 0) / 100 : annualChange.max || 0,
      };
    } else if (annualChange.type === 'normal') {
      changeDistribution = {
        type: 'normal',
        mean:
          changeAmtOrPct === 'percent' ? (annualChange.mean || 0) / 100 : annualChange.mean || 0,
        stdev:
          changeAmtOrPct === 'percent' ? (annualChange.stdev || 0) / 100 : annualChange.stdev || 0,
      };
    }

    const eventData = {
      type: 'expense',
      name,
      description,
      start: startYear,
      duration,
      initialAmount: amount || 0,
      annualChange,
      changeAmtOrPct,
      changeType: changeAmtOrPct,
      changeDistribution,
      discretionary: isDiscretionary,
      userPercentage,
      spousePercentage,
      inflationAdjusted,
    };
    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAmount(0);
    setAmountError('');
    setIsDiscretionary(false);
    setUserPercentage(100);
    setSpousePercentage(0);
    setInflationAdjusted(false);
    setStartYear({ type: 'fixed', value: new Date().getFullYear() });
    setDuration({ type: 'fixed', value: 1 });
    setAnnualChange({ type: 'fixed', value: 0 });
    setAnnualChangeError('');
    setChangeAmtOrPct('amount');
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
        <FormControl isRequired isInvalid={!!amountError}>
          <FormLabel>Initial Amount</FormLabel>
          <NumberInput
            value={amount}
            onChange={valueString => {
              setAmount(Number(valueString) || 0);
              if (Number(valueString) > 0) setAmountError('');
            }}
            min={0}
          >
            <NumberInputField placeholder="0" />
          </NumberInput>
          {amountError && <FormErrorMessage>{amountError}</FormErrorMessage>}
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Annual Change Type</FormLabel>
          <Select
            value={annualChange.type}
            onChange={e => {
              const type = e.target.value as AmountChangeType['type'];
              switch (type) {
                case 'fixed':
                  setAnnualChange({ type: 'fixed', value: undefined });
                  break;
                case 'uniform':
                  setAnnualChange({ type: 'uniform', min: undefined, max: undefined });
                  break;
                case 'normal':
                  setAnnualChange({ type: 'normal', mean: undefined, stdev: undefined });
                  break;
              }
            }}
          >
            <option value="fixed">Fixed</option>
            <option value="uniform">Uniform Distribution</option>
            <option value="normal">Normal Distribution</option>
          </Select>
        </FormControl>
        {annualChange.type === 'fixed' && (
          <>
            <FormControl>
              <FormLabel>Change Type</FormLabel>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'amount' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('amount')}
                  type="button"
                >
                  Amount ($)
                </Button>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'percent' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('percent')}
                  type="button"
                >
                  Percentage (%)
                </Button>
              </HStack>
            </FormControl>
            <FormControl isRequired isInvalid={!!annualChangeError}>
              <FormLabel>Annual Change {changeAmtOrPct === 'amount' ? '($)' : '(%)'}</FormLabel>
              <NumberInput
                value={annualChange.value}
                onChange={valueString => {
                  const value = Number(valueString) || 0;
                  setAnnualChange({ type: 'fixed', value });
                  if (value >= 0) setAnnualChangeError('');
                }}
                min={0}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
              {annualChangeError && <FormErrorMessage>{annualChangeError}</FormErrorMessage>}
            </FormControl>
          </>
        )}
        {annualChange.type === 'uniform' && (
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Change Type</FormLabel>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'amount' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('amount')}
                >
                  Amount ($)
                </Button>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'percent' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('percent')}
                >
                  Percentage (%)
                </Button>
              </HStack>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Minimum Change {changeAmtOrPct === 'amount' ? '($)' : '(%)'}</FormLabel>
              <NumberInput
                value={annualChange.min ?? 0}
                onChange={valueString =>
                  setAnnualChange({ ...annualChange, min: Number(valueString) || 0 })
                }
                min={0}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Maximum Change {changeAmtOrPct === 'amount' ? '($)' : '(%)'}</FormLabel>
              <NumberInput
                value={annualChange.max ?? 0}
                onChange={valueString =>
                  setAnnualChange({ ...annualChange, max: Number(valueString) || 0 })
                }
                min={0}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
            </FormControl>
          </Stack>
        )}
        {annualChange.type === 'normal' && (
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Change Type</FormLabel>
              <HStack spacing={4}>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'amount' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('amount')}
                >
                  Amount ($)
                </Button>
                <Button
                  size="sm"
                  colorScheme={changeAmtOrPct === 'percent' ? 'blue' : 'gray'}
                  onClick={() => setChangeAmtOrPct('percent')}
                >
                  Percentage (%)
                </Button>
              </HStack>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Mean Change {changeAmtOrPct === 'amount' ? '($)' : '(%)'}</FormLabel>
              <NumberInput
                value={annualChange.mean ?? 0}
                onChange={valueString =>
                  setAnnualChange({ ...annualChange, mean: Number(valueString) || 0 })
                }
                min={0}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>
                Standard Deviation {changeAmtOrPct === 'amount' ? '($)' : '(%)'}
              </FormLabel>
              <NumberInput
                value={annualChange.stdev ?? 0}
                onChange={valueString =>
                  setAnnualChange({ ...annualChange, stdev: Number(valueString) || 0 })
                }
                min={0}
              >
                <NumberInputField placeholder="0" />
              </NumberInput>
            </FormControl>
          </Stack>
        )}
        <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel mb={0}>Inflation Adjusted</FormLabel>
            <Switch
              isChecked={inflationAdjusted}
              onChange={e => setInflationAdjusted(e.target.checked)}
            />
          </FormControl>
        </Box>
        <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
          <FormControl display="flex" alignItems="center" justifyContent="space-between">
            <FormLabel mb={0}>Discretionary</FormLabel>
            <Switch
              isChecked={isDiscretionary}
              onChange={e => setIsDiscretionary(e.target.checked)}
            />
          </FormControl>
        </Box>
        <Box p={4} bg="gray.50" borderRadius="lg" width="100%">
          <Text fontSize="lg" fontWeight="medium" mb={4}>
            Expense Split
          </Text>
          <HStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>User Percentage</FormLabel>
              <NumberInput
                value={userPercentage}
                onChange={value => handlePercentageChange(true, value)}
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
                onChange={value => handlePercentageChange(false, value)}
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
            color={userPercentage + spousePercentage === 100 ? 'green.500' : 'red.500'}
          >
            Total: {userPercentage + spousePercentage}%
            {userPercentage + spousePercentage !== 100 && ' (must equal 100%)'}
          </Text>
        </Box>
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
