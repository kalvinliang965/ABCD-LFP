import React, { useState } from 'react';
import { EventSeriesType, DistributionConfig, StartYearConfig, SeriesReference, AmountChangeType } from '../../types/eventSeries';
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
  useToast,
  InputGroup,
  InputLeftElement,
  Stack,
} from '@chakra-ui/react';

interface EventSeriesFormProps {
  initialType: EventSeriesType;
  onBack: () => void;
  onEventAdded?: (event: {
    type: EventSeriesType;
    name: string;
    amount: string;
    startYear: string;
    duration: string;
  }) => void;
}

const distributionTypes = [
  { value: 'fixed', label: 'Fixed Value' },
  { value: 'uniform', label: 'Uniform Distribution' },
  { value: 'normal', label: 'Normal Distribution' },
  { value: 'withSeries', label: 'Same Year as Event Series' },
  { value: 'afterSeries', label: 'After Event Series Ends' }
];

const durationDistributionTypes = [
  { value: 'fixed', label: 'Fixed Value' },
  { value: 'uniform', label: 'Uniform Distribution' },
  { value: 'normal', label: 'Normal Distribution' }
];

export function EventSeriesForm({ initialType, onBack, onEventAdded }: EventSeriesFormProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [inflationAdjusted, setInflationAdjusted] = useState(true);
  const [isDiscretionary, setIsDiscretionary] = useState(false);
  const [isSocialSecurity, setIsSocialSecurity] = useState(false);
  const [isWages, setIsWages] = useState(false);
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
    investments: { id: string; initialPercentage: number; finalPercentage?: number }[];
  }>({
    type: 'fixed',
    investments: []
  });
  const [annualChange, setAnnualChange] = useState<AmountChangeType>({ type: 'fixed', value: 0 });

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
                case 'withSeries':
                  newConfig = { type: 'withSeries', seriesName: '' };
                  break;
                case 'afterSeries':
                  newConfig = { type: 'afterSeries', seriesName: '' };
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
              value={config.value}
              onChange={(value) => onChange({ type: 'fixed', value: parseInt(value) })}
              min={isStartYear ? 1900 : 1}
              max={isStartYear ? 2100 : 100}
            >
              <NumberInputField required />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        );
      case 'uniform':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>{isStartYear ? 'Minimum Year' : 'Minimum Years'}</FormLabel>
              <NumberInput
                value={config.min}
                onChange={(value) => onChange({ type: 'uniform', min: parseInt(value), max: config.max })}
                min={isStartYear ? 1900 : 1}
                max={isStartYear ? 2100 : 100}
              >
                <NumberInputField required />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{isStartYear ? 'Maximum Year' : 'Maximum Years'}</FormLabel>
              <NumberInput
                value={config.max}
                onChange={(value) => onChange({ type: 'uniform', min: config.min, max: parseInt(value) })}
                min={isStartYear ? 1900 : 1}
                max={isStartYear ? 2100 : 100}
              >
                <NumberInputField required />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'normal':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>{isStartYear ? 'Mean Year' : 'Mean Years'}</FormLabel>
              <NumberInput
                value={config.mean}
                onChange={(value) => onChange({ type: 'normal', mean: parseInt(value), stdDev: config.stdDev })}
                min={isStartYear ? 1900 : 1}
                max={isStartYear ? 2100 : 100}
              >
                <NumberInputField required />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>{isStartYear ? 'Standard Deviation (Years)' : 'Std Dev (Years)'}</FormLabel>
              <NumberInput
                value={config.stdDev}
                onChange={(value) => onChange({ type: 'normal', mean: config.mean, stdDev: parseInt(value) })}
                min={1}
                max={10}
              >
                <NumberInputField required />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
        );
      case 'withSeries':
      case 'afterSeries':
        if (!isStartYear) return null;
        return (
          <FormControl isRequired>
            <FormLabel>Reference Event Series</FormLabel>
            <Select
              value={(config as SeriesReference).seriesName}
              onChange={(e) => onChange({ type: config.type, seriesName: e.target.value })}
            >
              <option value="">Select event series...</option>
              <option value="example">Example Series</option>
            </Select>
          </FormControl>
        );
      default:
        return null;
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
                  {distributionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </FormControl>

        {renderDistributionFields(startYear, (values) => {
          const newStartYear = {
            ...startYear,
            ...values
          } as StartYearConfig;
          setStartYear(newStartYear);
        }, true)}
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
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
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
                      setAnnualChange({ type: 'fixed', value: 0 });
                      break;
                    case 'fixedPercent':
                      setAnnualChange({ type: 'fixedPercent', value: 0 });
                      break;
                    case 'uniform':
                      setAnnualChange({ type: 'uniform', min: 0, max: 0 });
                      break;
                    case 'normal':
                      setAnnualChange({ type: 'normal', mean: 0, stdDev: 1 });
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
                  value={annualChange.value}
                  onChange={(e) => setAnnualChange({ type: 'fixed', value: parseFloat(e.target.value) })}
                />
              </FormControl>
            )}

            {annualChange.type === 'fixedPercent' && (
              <FormControl isRequired>
                <FormLabel>Annual Change (%)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value}
                  onChange={(e) => setAnnualChange({ type: 'fixedPercent', value: parseFloat(e.target.value) })}
                />
              </FormControl>
            )}

            {annualChange.type === 'uniform' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Minimum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.min}
                    onChange={(e) => setAnnualChange({ ...annualChange, min: parseFloat(e.target.value) })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Maximum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.max}
                    onChange={(e) => setAnnualChange({ ...annualChange, max: parseFloat(e.target.value) })}
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
                    value={annualChange.mean}
                    onChange={(e) => setAnnualChange({ ...annualChange, mean: parseFloat(e.target.value) })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Standard Deviation ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.stdDev}
                    onChange={(e) => setAnnualChange({ ...annualChange, stdDev: parseFloat(e.target.value) })}
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
              <Text fontSize="lg" fontWeight="medium" mb={4}>Income Split</Text>
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>User Percentage</FormLabel>
                  <NumberInput
                    value={userPercentage}
                    onChange={(value) => setUserPercentage(parseInt(value))}
                    min={0}
                    max={100}
                    isRequired
                  >
                    <NumberInputField required />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Spouse Percentage</FormLabel>
                  <NumberInput
                    value={spousePercentage}
                    onChange={(value) => setSpousePercentage(parseInt(value))}
                    min={0}
                    max={100}
                    isRequired
                  >
                    <NumberInputField required />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
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
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
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
                      setAnnualChange({ type: 'fixed', value: 0 });
                      break;
                    case 'fixedPercent':
                      setAnnualChange({ type: 'fixedPercent', value: 0 });
                      break;
                    case 'uniform':
                      setAnnualChange({ type: 'uniform', min: 0, max: 0 });
                      break;
                    case 'normal':
                      setAnnualChange({ type: 'normal', mean: 0, stdDev: 1 });
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
                  value={annualChange.value}
                  onChange={(e) => setAnnualChange({ type: 'fixed', value: parseFloat(e.target.value) })}
                />
              </FormControl>
            )}

            {annualChange.type === 'fixedPercent' && (
              <FormControl isRequired>
                <FormLabel>Annual Change (%)</FormLabel>
                <Input
                  type="number"
                  value={annualChange.value}
                  onChange={(e) => setAnnualChange({ type: 'fixedPercent', value: parseFloat(e.target.value) })}
                />
              </FormControl>
            )}

            {annualChange.type === 'uniform' && (
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Minimum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.min}
                    onChange={(e) => setAnnualChange({ ...annualChange, min: parseFloat(e.target.value) })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Maximum Change ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.max}
                    onChange={(e) => setAnnualChange({ ...annualChange, max: parseFloat(e.target.value) })}
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
                    value={annualChange.mean}
                    onChange={(e) => setAnnualChange({ ...annualChange, mean: parseFloat(e.target.value) })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Standard Deviation ($)</FormLabel>
                  <Input
                    type="number"
                    value={annualChange.stdDev}
                    onChange={(e) => setAnnualChange({ ...annualChange, stdDev: parseFloat(e.target.value) })}
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
              <Text fontSize="lg" fontWeight="medium" mb={4}>Expense Split</Text>
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>User Percentage</FormLabel>
                  <NumberInput
                    value={userPercentage}
                    onChange={(value) => setUserPercentage(parseInt(value))}
                    min={0}
                    max={100}
                    isRequired
                  >
                    <NumberInputField required />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Spouse Percentage</FormLabel>
                  <NumberInput
                    value={spousePercentage}
                    onChange={(value) => setSpousePercentage(parseInt(value))}
                    min={0}
                    max={100}
                    isRequired
                  >
                    <NumberInputField required />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>
            </Box>
          </VStack>
        );
      case 'invest':
        return (
          <VStack spacing={6} align="stretch">
            {renderCommonFields()}
            <FormControl isRequired>
              <FormLabel>Maximum Cash Holdings</FormLabel>
              <NumberInput
                value={maxCash}
                onChange={(value) => setMaxCash(value)}
                min={0}
                precision={2}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel>Asset Allocation Type</FormLabel>
              <Select
                value={assetAllocation.type}
                onChange={(e) => setAssetAllocation({
                  ...assetAllocation,
                  type: e.target.value as 'fixed' | 'glidePath'
                })}
              >
                <option value="fixed">Fixed</option>
                <option value="glidePath">Glide Path</option>
              </Select>
            </FormControl>
          </VStack>
        );
      case 'rebalance':
        return (
          <VStack spacing={6} align="stretch">
            {renderCommonFields()}
            <FormControl>
              <FormLabel>Asset Allocation Type</FormLabel>
              <Select
                  value={assetAllocation.type}
                onChange={(e) => setAssetAllocation({
                  ...assetAllocation,
                  type: e.target.value as 'fixed' | 'glidePath'
                })}
              >
                <option value="fixed">Fixed</option>
                <option value="glidePath">Glide Path</option>
              </Select>
            </FormControl>
          </VStack>
        );
      default:
        return null;
    }
  };

  const validateForm = () => {
    //validations
    if (!name.trim()) {
      toast({
        title: "Name is required",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    //validate start year and duration based on type
    if (startYear.type === 'fixed' && !startYear.value) {
      toast({
        title: "Start year is required",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    if (duration.type === 'fixed' && !duration.value) {
      toast({
        title: "Duration is required",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    //income&expense specific validations
    if (initialType === 'income' || initialType === 'expense') {
      if (!amount) {
        toast({
          title: "Initial amount is required",
          status: "error",
          duration: 3000,
        });
        return false;
      }

      //validate annual change based on type
      if (annualChange.type === 'fixed' && annualChange.value === undefined) {
        toast({
          title: "Annual change amount is required",
          status: "error",
          duration: 3000,
        });
        return false;
      }

      //validate user/spouse percentages
      if (userPercentage === undefined || spousePercentage === undefined) {
        toast({
          title: "User and spouse percentages are required",
          status: "error",
          duration: 3000,
        });
        return false;
      }

      if (userPercentage + spousePercentage !== 100) {
        toast({
          title: "User and spouse percentages must sum to 100%",
          status: "error",
          duration: 3000,
        });
        return false;
      }
    }

    //invest type validations
    if (initialType === 'invest' && !maxCash) {
      toast({
        title: "Maximum cash holdings is required",
        status: "error",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    //onEventAdded with the form data
    onEventAdded?.({
      type: initialType,
      name,
      amount,
      startYear: startYear.type === 'fixed' ? startYear.value.toString() : 'Variable',
      duration: duration.type === 'fixed' ? duration.value.toString() : 'Variable'
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
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