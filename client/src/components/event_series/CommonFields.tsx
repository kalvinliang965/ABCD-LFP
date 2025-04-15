import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  NumberInput,
  NumberInputField,
  Select,
} from '@chakra-ui/react';
import React from 'react';

import { StartYearConfig, DistributionConfig } from '../../types/eventSeries';

interface CommonFieldsProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  startYear: StartYearConfig;
  setStartYear: (config: StartYearConfig) => void;
  duration: DistributionConfig;
  setDuration: (config: DistributionConfig) => void;
  existingEvents: { name: string }[];
}

export const CommonFields: React.FC<CommonFieldsProps> = ({
  name,
  setName,
  description,
  setDescription,
  startYear,
  setStartYear,
  duration,
  setDuration,
  existingEvents,
}) => {
  const startYearTypes = [
    { value: 'fixed', label: 'Fixed Year' },
    { value: 'uniform', label: 'Uniform Distribution' },
    { value: 'normal', label: 'Normal Distribution' },
    { value: 'startWith', label: 'Same as Existing Event' },
    { value: 'startAfter', label: 'After Existing Event Ends' },
  ];

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

  const renderStartYearFields = () => {
    switch (startYear.type) {
      case 'fixed':
        return (
          <FormControl isRequired>
            <FormLabel>Start Year</FormLabel>
            <NumberInput
              value={startYear.value || ''}
              onChange={valueString => {
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
                onChange={valueString => {
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
                onChange={valueString => {
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
                onChange={valueString => {
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
                onChange={valueString => {
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
              onChange={e => setStartYear({ ...startYear, eventSeries: e.target.value })}
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
      default:
        return null;
    }
  };

  const renderDistributionFields = (
    config: DistributionConfig,
    onChange: (values: Partial<DistributionConfig>) => void
  ) => {
    switch (config.type) {
      case 'fixed':
        return (
          <FormControl isRequired>
            <FormLabel>Duration (Years)</FormLabel>
            <NumberInput
              value={config.value || ''}
              onChange={valueString => {
                const value = valueString === '' ? undefined : parseInt(valueString);
                onChange({ type: 'fixed', value });
              }}
              min={1}
              max={100}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        );
      case 'uniform':
        return (
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Minimum Duration</FormLabel>
              <NumberInput
                value={config.min || ''}
                onChange={valueString => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, min: value });
                }}
                min={1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Maximum Duration</FormLabel>
              <NumberInput
                value={config.max || ''}
                onChange={valueString => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, max: value });
                }}
                min={1}
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
              <FormLabel>Mean Duration</FormLabel>
              <NumberInput
                value={config.mean || ''}
                onChange={valueString => {
                  const value = valueString === '' ? undefined : parseInt(valueString);
                  onChange({ ...config, mean: value });
                }}
                min={1}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Standard Deviation</FormLabel>
              <NumberInput
                value={config.stdDev || ''}
                onChange={valueString => {
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
      default:
        return null;
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter name"
          required
        />
      </FormControl>
      <FormControl>
        <FormLabel>Description (Optional)</FormLabel>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={2}
        />
      </FormControl>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired>
          <FormLabel>Start Year Type</FormLabel>
          <Select
            value={startYear.type}
            onChange={e => handleStartYearTypeChange(e.target.value as StartYearConfig['type'])}
            required
          >
            {startYearTypes.map(type => (
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
            onChange={e => {
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
            <option value="fixed">Fixed Value</option>
            <option value="uniform">Uniform Distribution</option>
            <option value="normal">Normal Distribution</option>
          </Select>
        </FormControl>
        {renderDistributionFields(duration, values => {
          const newDuration = { ...duration, ...values } as DistributionConfig;
          setDuration(newDuration);
        })}
      </VStack>
    </VStack>
  );
};
