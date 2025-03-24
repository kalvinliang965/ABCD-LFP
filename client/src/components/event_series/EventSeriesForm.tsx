import React, { useState, useEffect } from 'react';
import { 
  EventSeriesType, 
  DistributionConfig, 
  StartYearConfig, 
  SeriesReference, 
  AmountChangeType,
  EventSeries 
} from '../../types/eventSeries';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Switch,
  Button,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  InputGroup,
  InputLeftElement,
  Stack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { css } from '@emotion/react';
import axios from 'axios';

//use the existing EventSeries type for the API response
type AddedEvent = EventSeries & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

interface EventSeriesFormProps {
  initialType: EventSeriesType;
  onBack: () => void;
  onEventAdded?: (event: Omit<EventSeries, 'id'>) => void;
}

const distributionTypes = [
  { value: 'fixed', label: 'Fixed Value' },
  { value: 'uniform', label: 'Uniform Distribution' },
  { value: 'normal', label: 'Normal Distribution' },
  { value: 'startWith', label: 'Same Year as Event Series' },
  { value: 'startAfter', label: 'After Event Series Ends' }
];

const durationDistributionTypes = [
  { value: 'fixed', label: 'Fixed Value' },
  { value: 'uniform', label: 'Uniform Distribution' },
  { value: 'normal', label: 'Normal Distribution' }
];

interface Investment {
  _id: string;
  investmentType: string;
  value: number;
  taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax';
  id: string;
}

const startYearTypes = [
  { value: 'fixed', label: 'Fixed Year' },
  { value: 'uniform', label: 'Uniform Distribution' },
  { value: 'normal', label: 'Normal Distribution' },
  { value: 'startWith', label: 'Same as Existing Event' },
  { value: 'startAfter', label: 'After Existing Event Ends' }
];

export function EventSeriesForm({ initialType, onBack, onEventAdded }: EventSeriesFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [inflationAdjusted, setInflationAdjusted] = useState(false);
  const [isDiscretionary, setIsDiscretionary] = useState(false);
  const [isSocialSecurity, setIsSocialSecurity] = useState(false);
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);
  const [maxCash, setMaxCash] = useState('');
  const [startYear, setStartYear] = useState<StartYearConfig>({
    type: 'fixed',
    value: new Date().getFullYear()
  });
  const [duration, setDuration] = useState<DistributionConfig>({
    type: 'fixed',
    value: 1
  });
  const [assetAllocation, setAssetAllocation] = useState<{
    type: 'fixed' | 'glidePath';
    investments: { investment: string; initialPercentage: number; finalPercentage?: number }[];
  }>({
    type: 'fixed',
    investments: []
  });
  const [annualChange, setAnnualChange] = useState<AmountChangeType>({
    type: 'fixed',
    value: undefined
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [existingEvents, setExistingEvents] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get<Investment[]>('http://localhost:3000/api/investments', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setInvestments(response.data);
      } catch (error) {
        console.error('Failed to fetch investments:', error);
      } finally {
        setLoadingInvestments(false);
      }
    };

    fetchInvestments();
  }, []);

  useEffect(() => {
    if (investments.length > 0) {
      setAssetAllocation(prev => ({
        ...prev,
        investments: investments.map(inv => ({
          investment: inv.id,
          initialPercentage: 0,
          finalPercentage: prev.type === 'glidePath' ? 0 : undefined
        }))
      }));
    }
  }, [investments]);

  useEffect(() => {
    const fetchExistingEvents = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/eventSeries', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setExistingEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch existing events:', error);
      }
    };

    fetchExistingEvents();
  }, []);

  const handleStartYearTypeChange = (value: StartYearConfig['type']) => {
    let newConfig: StartYearConfig;
    switch (value) {
      case 'fixed':
        newConfig = { type: 'fixed', value: new Date().getFullYear() };
        break;
      case 'uniform':
        newConfig = { type: 'uniform', min: 2024, max: 2030 };
        break;
      case 'normal':
        newConfig = { type: 'normal', mean: 2024, stdDev: 2 };
        break;
      case 'startWith':
        newConfig = { type: 'startWith', eventSeries: '' };
        break;
      case 'startAfter':
        newConfig = { type: 'startAfter', eventSeries: '' };
        break;
      default:
        return;
    }
    setStartYear(newConfig);
  };

  const renderDistributionFields = (
    config: DistributionConfig | StartYearConfig,
    onChange: (values: Partial<DistributionConfig | StartYearConfig>) => void,
    isStartYear: boolean = false
  ) => {
    switch (config.type) {
      case 'fixed':
        return (
          <FormControl isRequired>
            <FormLabel>{isStartYear ? 'Start Year' : 'Duration (Years)'}</FormLabel>
            <NumberInput
              value={config.value || ''}
              onChange={(valueString) => {
                const value = valueString === '' ? undefined : parseInt(valueString);
                onChange({ type: 'fixed', value });
              }}
              min={isStartYear ? 1900 : 1}
              max={isStartYear ? 2100 : 100}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        );
      case 'uniform':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Minimum {isStartYear ? 'Year' : 'Duration'}</FormLabel>
              <NumberInput
                value={config.min || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, min: value });
                }}
                min={isStartYear ? 1900 : 1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Maximum {isStartYear ? 'Year' : 'Duration'}</FormLabel>
              <NumberInput
                value={config.max || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, max: value });
                }}
                min={isStartYear ? 1900 : 1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'normal':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Mean {isStartYear ? 'Year' : 'Duration'}</FormLabel>
              <NumberInput
                value={config.mean || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, mean: value });
                }}
                min={isStartYear ? 1900 : 1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Standard Deviation</FormLabel>
              <NumberInput
                value={config.stdDev || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, stdDev: value });
                }}
                min={0}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'startWith':
      case 'startAfter':
        if (!isStartYear) return null;
        return (
          <FormControl isRequired>
            <FormLabel>Reference Event Series</FormLabel>
            <Select
              value={(config as StartYearConfig).eventSeries || ''}
              onChange={(e) => onChange({ type: config.type, eventSeries: e.target.value })}
            >
              <option value="">Select event series...</option>
              {existingEvents.map(event => (
                <option key={event.name} value={event.name}>
                  {event.name}
                </option>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  const renderStartYearFields = () => {
    switch (startYear.type) {
      case 'fixed':
        return (
          <FormControl isRequired>
            <FormLabel>Start Year</FormLabel>
            <NumberInput
              value={startYear.value || ''}
              onChange={(valueString) => {
                const value = valueString === '' ? undefined : parseInt(valueString);
                setStartYear({ type: 'fixed', value });
              }}
              min={1900}
              max={2100}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        );
      case 'uniform':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Minimum Year</FormLabel>
              <NumberInput
                value={startYear.min || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  setStartYear({ ...startYear, min: value });
                }}
                min={1900}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Maximum Year</FormLabel>
              <NumberInput
                value={startYear.max || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  setStartYear({ ...startYear, max: value });
                }}
                min={1900}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'normal':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Mean Year</FormLabel>
              <NumberInput
                value={startYear.mean || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  setStartYear({ ...startYear, mean: value });
                }}
                min={1900}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Standard Deviation</FormLabel>
              <NumberInput
                value={startYear.stdDev || ''}
                onChange={(valueString) => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  setStartYear({ ...startYear, stdDev: value });
                }}
                min={1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'startWith':
      case 'startAfter':
        return (
          <FormControl isRequired>
            <FormLabel>Select Event Series</FormLabel>
            <Select
              value={startYear.eventSeries || ''}
              onChange={(e) => setStartYear({ ...startYear, eventSeries: e.target.value })}
            >
              <option value="">Select an event series</option>
              {existingEvents.map(event => (
                <option key={event.name} value={event.name}>
                  {event.name}
                </option>
              ))}
            </Select>
          </FormControl>
        );
    }
  };

  const renderCommonFields = () => (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
      </FormControl>

      <FormControl>
        <FormLabel>Description (Optional)</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={2}
        />
      </FormControl>

      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Start Year Type</FormLabel>
          <Select
            value={startYear.type}
            onChange={(e) => handleStartYearTypeChange(e.target.value as StartYearConfig['type'])}
            required
          >
                  {startYearTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {renderStartYearFields()}
      </VStack>

      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Duration Type</FormLabel>
          <Select
            value={duration.type}
            onChange={(e) => {
              const type = e.target.value as DistributionConfig['type'];
              switch (type) {
                case 'fixed':
                  setDuration({ type: 'fixed', value: 1 });
                  break;
                case 'uniform':
                  setDuration({ type: 'uniform', min: 1, max: 5 });
                  break;
                case 'normal':
                  setDuration({ type: 'normal', mean: 3, stdDev: 1 });
                  break;
              }
            }}
          >
                  {durationDistributionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {renderDistributionFields(duration, (values) => {
          const newDuration = {
            ...duration,
            ...values
          } as DistributionConfig;
          setDuration(newDuration);
        })}
      </VStack>
    </VStack>
  );

  const validateAllocationPercentages = (percentages: number[]) => {
    const sum = percentages.reduce((acc, val) => acc + (val || 0), 0);
    return Math.abs(sum - 100) < 0.01; //allow for small floating point differences
  };

  const renderAllocationInputs = (values: number[], onChange: (index: number, value: number) => void) => {
    // For invest event, filter out pre-tax investments
    let filteredInvestments = [...investments];
    
    if (initialType === 'invest') {
      // For invest events, only show non-retirement and after-tax investments
      filteredInvestments = investments.filter(inv => 
        inv.taxStatus === 'non-retirement' || inv.taxStatus === 'after-tax'
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        {filteredInvestments.length === 0 ? (
          <Alert status="warning">
            <AlertIcon />
            No suitable investments available. For invest events, only non-retirement and after-tax investments can be used.
          </Alert>
        ) : (
          <>
            {filteredInvestments.map((inv, index) => {
              // Get the corresponding index in the original investments array
              const originalIndex = investments.findIndex(originalInv => originalInv.id === inv.id);
              return (
                <FormControl key={inv.id} isRequired>
                  <FormLabel>{inv.investmentType} ({inv.taxStatus}) (%)</FormLabel>
                  <NumberInput
                    value={values[originalIndex] || 0}
                    onChange={(value) => onChange(originalIndex, parseFloat(value) || 0)}
                    min={0}
                    max={100}
                    precision={2}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              );
            })}
            <Text color={validateAllocationPercentages(values) ? "green.500" : "red.500"}>
              Total: {values.reduce((acc, val) => acc + (val || 0), 0).toFixed(2)}%
              {!validateAllocationPercentages(values) && " (must equal 100%)"}
            </Text>
          </>
        )}
      </VStack>
    );
  };

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

  const renderEventTypeForm = () => {
    switch (initialType) {
      case 'income':
        return (
          <VStack spacing={6} align="stretch">
            {renderCommonFields()}
            <FormControl isRequired>
              <FormLabel>Initial Amount</FormLabel>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  color="gray.500"
                  children="$"
                />
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
                  const type = e.target.value as AmountChangeType['type'];
                  switch (type) {
                case 'fixed':
                      setAnnualChange({ type: 'fixed', value: undefined });
                      break;
                    case 'fixedPercent':
                      setAnnualChange({ type: 'fixedPercent', value: undefined });
                  break;
                case 'uniform':
                      setAnnualChange({ type: 'uniform', min: undefined, max: undefined });
                  break;
                case 'normal':
                      setAnnualChange({ type: 'normal', mean: undefined, stdDev: undefined });
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

            {annualChange.type === 'fixed' && (
              <FormControl isRequired>
                <FormLabel>Annual Change ($)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value ?? ''}
                  onChange={(e) => setAnnualChange({ type: 'fixed', value: parseInt(e.target.value) })}
                  min="0"
                  step="1"
                />
              </FormControl>
            )}

            {annualChange.type === 'fixedPercent' && (
              <FormControl isRequired>
                <FormLabel>Annual Change (%)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value ?? ''}
                  onChange={(e) => setAnnualChange({ type: 'fixedPercent', value: parseInt(e.target.value) })}
                  min="0"
                  step="1"
                />
              </FormControl>
            )}

            {annualChange.type === 'uniform' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Minimum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.min ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, min: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Maximum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.max ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, max: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
              </Stack>
            )}

            {annualChange.type === 'normal' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Mean Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.mean ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, mean: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Standard Deviation ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.stdDev ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, stdDev: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
              </Stack>
            )}

            <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Inflation Adjusted</FormLabel>
                <Switch
                  isChecked={inflationAdjusted}
                  onChange={(e) => setInflationAdjusted(e.target.checked)}
                />
              </FormControl>
            </Box>

            {initialType === 'income' && (
              <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb={0}>Social Security Income</FormLabel>
                  <Switch
                    isChecked={isSocialSecurity}
                    onChange={(e) => setIsSocialSecurity(e.target.checked)}
                  />
                </FormControl>
              </Box>
            )}

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
          </VStack>
        );
      case 'expense':
        return (
          <VStack spacing={6} align="stretch">
            {renderCommonFields()}
            <FormControl isRequired>
              <FormLabel>Initial Amount</FormLabel>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  color="gray.500"
                  children="$"
                />
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
                  const type = e.target.value as AmountChangeType['type'];
                  switch (type) {
                    case 'fixed':
                      setAnnualChange({ type: 'fixed', value: undefined });
                      break;
                    case 'fixedPercent':
                      setAnnualChange({ type: 'fixedPercent', value: undefined });
                      break;
                    case 'uniform':
                      setAnnualChange({ type: 'uniform', min: undefined, max: undefined });
                      break;
                    case 'normal':
                      setAnnualChange({ type: 'normal', mean: undefined, stdDev: undefined });
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

            {annualChange.type === 'fixed' && (
              <FormControl isRequired>
                <FormLabel>Annual Change ($)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value ?? ''}
                  onChange={(e) => setAnnualChange({ type: 'fixed', value: parseInt(e.target.value) })}
                  min="0"
                  step="1"
                />
              </FormControl>
            )}

            {annualChange.type === 'fixedPercent' && (
              <FormControl isRequired>
                <FormLabel>Annual Change (%)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value ?? ''}
                  onChange={(e) => setAnnualChange({ type: 'fixedPercent', value: parseInt(e.target.value) })}
                  min="0"
                  step="1"
                />
              </FormControl>
            )}

            {annualChange.type === 'uniform' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Minimum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.min ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, min: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Maximum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.max ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, max: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
              </Stack>
            )}

            {annualChange.type === 'normal' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Mean Change ($)</FormLabel>
                  <Input
                  type="number"
                    value={annualChange.mean ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, mean: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Standard Deviation ($)</FormLabel>
                  <Input
                  type="number"
                    value={annualChange.stdDev ?? ''}
                    onChange={(e) => setAnnualChange({ ...annualChange, stdDev: parseInt(e.target.value) })}
                    min="0"
                    step="1"
                  />
                </FormControl>
              </Stack>
            )}

            <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>Inflation Adjusted</FormLabel>
                <Switch
                  isChecked={inflationAdjusted}
                  onChange={(e) => setInflationAdjusted(e.target.checked)}
                />
              </FormControl>
            </Box>

            {initialType === 'expense' && (
              <Box p={4} bg="indigo.50" borderRadius="lg" width="100%">
                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <FormLabel mb={0}>Discretionary</FormLabel>
                  <Switch
                    isChecked={isDiscretionary}
                    onChange={(e) => setIsDiscretionary(e.target.checked)}
                  />
                </FormControl>
              </Box>
            )}

            <Box p={4} bg="gray.50" borderRadius="lg" width="100%">
              <Text fontSize="lg" fontWeight="medium" mb={4}>
                Expense Split
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
          </VStack>
        );
      case 'invest':
      case 'rebalance':
        return (
          <VStack spacing={6} align="stretch">
            {renderCommonFields()}

              {initialType === 'invest' && (
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
            )}

            {loadingInvestments ? (
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text>Loading investments...</Text>
              </Box>
            ) : investments.length === 0 ? (
              <Box p={4} bg="gray.50" borderRadius="lg">
                <Text>No investments available. Please add some investments first.</Text>
              </Box>
            ) : (
              <Box p={4} bg="gray.50" borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Asset Allocation Type</FormLabel>
                    <Select
                      value={assetAllocation.type}
                      onChange={(e) => {
                        const type = e.target.value as 'fixed' | 'glidePath';
                        setAssetAllocation({
                          type,
                          investments: investments.map(inv => ({
                            investment: inv.id,
                            initialPercentage: 0,
                            ...(type === 'glidePath' && { finalPercentage: 0 })
                          }))
                        });
                      }}
                    >
                      <option value="fixed">Fixed Percentages</option>
                      <option value="glidePath">Glide Path</option>
                    </Select>
                  </FormControl>

                  {assetAllocation.type === 'fixed' ? (
                    <Box>
                      <Text fontSize="lg" mb={4}>Fixed Asset Allocation</Text>
                      {renderAllocationInputs(
                        assetAllocation.investments.map(inv => inv.initialPercentage),
                        (index, value) => {
                          const newInvestments = [...assetAllocation.investments];
                          newInvestments[index] = {
                            ...newInvestments[index],
                            initialPercentage: value
                          };
                          setAssetAllocation({
                            ...assetAllocation,
                            investments: newInvestments
                          });
                        }
                      )}
                    </Box>
                  ) : (
                    <Box>
                      <Text fontSize="lg" mb={4}>Initial Asset Allocation</Text>
                      {renderAllocationInputs(
                        assetAllocation.investments.map(inv => inv.initialPercentage),
                        (index, value) => {
                          const newInvestments = [...assetAllocation.investments];
                          newInvestments[index] = {
                            ...newInvestments[index],
                            initialPercentage: value
                          };
                          setAssetAllocation({
                            ...assetAllocation,
                            investments: newInvestments
                          });
                        }
                      )}
                      
                      <Text fontSize="lg" mt={6} mb={4}>Final Asset Allocation</Text>
                      {renderAllocationInputs(
                        assetAllocation.investments.map(inv => inv.finalPercentage || 0),
                        (index, value) => {
                          const newInvestments = [...assetAllocation.investments];
                          newInvestments[index] = {
                            ...newInvestments[index],
                            finalPercentage: value
                          };
                          setAssetAllocation({
                            ...assetAllocation,
                            investments: newInvestments
                          });
                        }
                      )}
                    </Box>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        );
      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!name) {
      newErrors.push("Please enter a name");
    }

    //only validate amount for income and expense types
    if ((initialType === 'income' || initialType === 'expense') && 
        (!amount || isNaN(Number(amount)) || Number(amount) <= 0)) {
      newErrors.push("Please enter a valid amount greater than 0");
    }

    if (startYear.type === 'fixed' && (!startYear.value || isNaN(Number(startYear.value)))) {
      newErrors.push("Please enter a valid start year");
    }

    if (duration.type === 'fixed' && (!duration.value || isNaN(Number(duration.value)))) {
      newErrors.push("Please enter a valid duration");
    }

    //add validation for asset allocation if its invest or rebalance type
    if ((initialType === 'invest' || initialType === 'rebalance') && 
        assetAllocation.investments.length > 0) {
      const initialPercentages = assetAllocation.investments.map(inv => inv.initialPercentage);
      if (!validateAllocationPercentages(initialPercentages)) {
        newErrors.push("Initial asset allocation percentages must sum to 100%");
      }

      if (assetAllocation.type === 'glidePath') {
        const finalPercentages = assetAllocation.investments.map(inv => inv.finalPercentage || 0);
        if (!validateAllocationPercentages(finalPercentages)) {
          newErrors.push("Final asset allocation percentages must sum to 100%");
        }
      }
    }

    //add validation for user and spouse split for income and expense types
    if ((initialType === 'income' || initialType === 'expense') && 
        (userPercentage + spousePercentage !== 100)) {
      newErrors.push("User and spouse percentages must sum to 100%");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      // For invest events, filter investments to only include non-retirement and after-tax ones
      let filteredAssetAllocation = { ...assetAllocation };
      
      if (initialType === 'invest') {
        // Filter investments by tax status
        const allowedInvestments = investments.filter(inv => 
          inv.taxStatus === 'non-retirement' || inv.taxStatus === 'after-tax'
        ).map(inv => inv.id);
        
        // Keep only the allowed investments
        filteredAssetAllocation.investments = assetAllocation.investments.filter(inv => 
          allowedInvestments.includes(inv.investment)
        );
      }
      
      // Calculate the total percentage after filtering
      const totalPercentage = filteredAssetAllocation.investments.reduce(
        (sum, inv) => sum + inv.initialPercentage, 
        0
      );
      
      // If the total is not 100% after filtering, show an error
      if (Math.abs(totalPercentage - 100) > 0.01 && 
          (initialType === 'invest' || initialType === 'rebalance') && 
          filteredAssetAllocation.investments.length > 0) {
        setErrors(['Asset allocation percentages must sum to 100%. Please adjust your allocation.']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const eventData = {
        type: initialType,
        name,
        description,
        startYear,
        duration,
        ...(initialType === 'income' || initialType === 'expense' ? {
          initialAmount: Number(amount) || 0,
          annualChange,
          inflationAdjust: inflationAdjusted,
          userPercentage,
          spousePercentage
        } : {}),
        ...(initialType === 'income' ? {
          isSocialSecurity
        } : {}),
        ...(initialType === 'expense' ? {
          isDiscretionary
        } : {}),
        ...((initialType === 'invest' || initialType === 'rebalance') ? {
          maxCash: initialType === 'invest' ? Number(maxCash) || 0 : undefined,
          assetAllocation: {
            type: filteredAssetAllocation.type,
            investments: filteredAssetAllocation.investments.map(inv => ({
              investment: inv.investment,
              initialPercentage: inv.initialPercentage,
              finalPercentage: filteredAssetAllocation.type === 'glidePath' ? inv.finalPercentage : undefined
            }))
          }
        } : {})
      };

      const { data } = await axios.post<AddedEvent>('http://localhost:3000/api/eventSeries', eventData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (onEventAdded) {
        onEventAdded(data);
      }
    } catch (error) {
      console.error('Failed to save event:', error);
      setErrors(['Failed to save event series. Please try again.']);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        {errors.length > 0 && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              {errors.map((error, index) => (
                <Text key={index}>{error}</Text>
              ))}
            </VStack>
          </Alert>
        )}
        
      {renderEventTypeForm()}
        <HStack spacing={4} justify="flex-end">
          <Button variant="ghost" onClick={onBack}>
            Cancel
          </Button>
          <Button 
          type="submit"
            colorScheme="blue"
          >
            Save
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

export default EventSeriesForm;