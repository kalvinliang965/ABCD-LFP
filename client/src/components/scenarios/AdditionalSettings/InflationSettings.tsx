/**
 * AI-generated code
 * Create a component for handling inflation settings as part of decomposing AdditionalSettingsForm
 */

import {
  Box,
  Text,
  Flex,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Heading,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { FiPercent, FiBarChart, FiInfo } from 'react-icons/fi';

import { DistributionTypeConfig } from '../../../types/ConfigTypes';
import { DistributionType } from '../../../types/Enum';
import { create_distribution_config } from '../../../utils/DistributionTypeSwitch';

interface InflationSettingsProps {
  inflationConfig: DistributionTypeConfig;
  onChangeInflationConfig: (config: DistributionTypeConfig) => void;
}

const InflationSettings: React.FC<InflationSettingsProps> = ({
  inflationConfig,
  onChangeInflationConfig,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [inflation_buffer1, set_inflation_buffer1] = useState('');
  const [inflation_buffer2, set_inflation_buffer2] = useState('');

  const reset_inflation_buffer = () => {
    set_inflation_buffer1('');
    set_inflation_buffer2('');
  };

  const handle_change_inflation_type = (type: DistributionType) => {
    const updatedConfig = create_distribution_config(type, inflationConfig);

    onChangeInflationConfig(updatedConfig);
  };

  // Render inflation card options
  const render_inflation_type_options = () => {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
        <Box
          as="button"
          type="button"
          p={4}
          borderWidth="2px"
          borderRadius="lg"
          borderColor={inflationConfig.type === DistributionType.FIXED ? 'green.500' : 'gray.200'}
          bg={inflationConfig.type === DistributionType.FIXED ? 'green.50' : 'transparent'}
          _hover={{ bg: 'green.50', borderColor: 'green.300' }}
          _dark={{
            borderColor: inflationConfig.type === DistributionType.FIXED ? 'green.500' : 'gray.600',
            bg: inflationConfig.type === DistributionType.FIXED ? 'green.900' : 'transparent',
            _hover: { bg: 'green.900', borderColor: 'green.700' },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type(DistributionType.FIXED);
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue('green.100', 'green.800')}
              color={useColorModeValue('green.600', 'green.300')}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiPercent} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Fixed Rate
            </Text>
            <Text fontSize="sm" color="gray.500">
              Single percentage value
            </Text>
          </Flex>
        </Box>

        <Box
          as="button"
          type="button"
          p={4}
          borderWidth="2px"
          borderRadius="lg"
          borderColor={
            inflationConfig.type === DistributionType.UNIFORM ? 'orange.500' : 'gray.200'
          }
          bg={inflationConfig.type === DistributionType.UNIFORM ? 'orange.50' : 'transparent'}
          _hover={{ bg: 'orange.50', borderColor: 'orange.300' }}
          _dark={{
            borderColor:
              inflationConfig.type === DistributionType.UNIFORM ? 'orange.500' : 'gray.600',
            bg: inflationConfig.type === DistributionType.UNIFORM ? 'orange.900' : 'transparent',
            _hover: { bg: 'orange.900', borderColor: 'orange.700' },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type(DistributionType.UNIFORM);
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue('orange.100', 'orange.800')}
              color={useColorModeValue('orange.600', 'orange.300')}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiBarChart} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Uniform Distribution
            </Text>
            <Text fontSize="sm" color="gray.500">
              Range between min and max
            </Text>
          </Flex>
        </Box>

        <Box
          as="button"
          type="button"
          p={4}
          borderWidth="2px"
          borderRadius="lg"
          borderColor={inflationConfig.type === DistributionType.NORMAL ? 'purple.500' : 'gray.200'}
          bg={inflationConfig.type === DistributionType.NORMAL ? 'purple.50' : 'transparent'}
          _hover={{ bg: 'purple.50', borderColor: 'purple.300' }}
          _dark={{
            borderColor:
              inflationConfig.type === DistributionType.NORMAL ? 'purple.500' : 'gray.600',
            bg: inflationConfig.type === DistributionType.NORMAL ? 'purple.900' : 'transparent',
            _hover: { bg: 'purple.900', borderColor: 'purple.700' },
          }}
          transition="all 0.2s"
          onClick={() => {
            reset_inflation_buffer();
            handle_change_inflation_type(DistributionType.NORMAL);
          }}
          height="full"
        >
          <Flex direction="column" align="center" height="100%">
            <Flex
              mb={3}
              bg={useColorModeValue('purple.100', 'purple.800')}
              color={useColorModeValue('purple.600', 'purple.300')}
              p={2}
              borderRadius="md"
            >
              <Icon as={FiBarChart} boxSize={5} />
            </Flex>
            <Text fontWeight="bold" fontSize="md" mb={1}>
              Normal Distribution
            </Text>
            <Text fontSize="sm" color="gray.500">
              Mean and standard deviation
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>
    );
  };

  // Render inflation fields based on type
  const render_inflation_fields = () => {
    const convertToValidNumber = (value: string): number => {
      if (value === '' || value === '.') return 0;
      const numValue = parseFloat(value);
      return isNaN(numValue) ? 0 : numValue;
    };

    const handle_change_inflation = (
      field: string,
      value: string,
      update_func: (value: string) => void
    ) => {
      let processedValue = value;
      processedValue = processedValue
        .replace(/,/g, '.')
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*)\./g, '$1');
      if (
        processedValue.startsWith('0') &&
        processedValue.length > 1 &&
        !processedValue.startsWith('0.')
      ) {
        processedValue = processedValue.substring(1);
      } else if (processedValue.startsWith('.')) {
        processedValue = `0${processedValue}`;
      }
      update_func(processedValue);

      let finalValue_user_input = convertToValidNumber(processedValue);
      let finalValue = finalValue_user_input / 100;
      switch (field) {
        case 'value':
        case 'mean':
          finalValue = Math.min(20, Math.max(0, finalValue));
          break;
        case 'min':
          finalValue = Math.min(inflationConfig.max ?? 20, Math.max(0, finalValue));
          break;
        case 'max':
          finalValue = Math.max(inflationConfig.min ?? 0, Math.min(20, finalValue));
          break;
        case 'standardDeviation':
          finalValue = Math.min(10, Math.max(0.1, finalValue));
          break;
      }
      const newInflationConfig = {
        ...inflationConfig,
        [field]: Number(finalValue.toFixed(4)),
      };

      onChangeInflationConfig(newInflationConfig);
    };

    switch (inflationConfig.type) {
      case DistributionType.FIXED:
        return (
          <FormControl isRequired>
            <FormLabel fontWeight="medium">Inflation Rate (%)</FormLabel>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <Icon as={FiPercent} color="green.500" />
              </InputLeftElement>
              <NumberInput
                min={0}
                max={20}
                inputMode="decimal"
                pattern="[0-9.,]*"
                step={0.0001}
                precision={4}
                value={inflation_buffer1}
                onChange={(valueAsString: string) =>
                  handle_change_inflation('value', valueAsString, set_inflation_buffer1)
                }
                w="100%"
              >
                <NumberInputField pl={10} borderRadius="md" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </InputGroup>
          </FormControl>
        );

      case DistributionType.UNIFORM:
        return (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Minimum Rate (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="orange.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={inflation_buffer1}
                  onChange={(valueAsString: string) =>
                    handle_change_inflation('min', valueAsString, set_inflation_buffer1)
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Maximum Rate (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="orange.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  pattern="[0-9.,]*"
                  value={inflation_buffer2}
                  onChange={(valueAsString: string) =>
                    handle_change_inflation('max', valueAsString, set_inflation_buffer2)
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>
          </SimpleGrid>
        );

      case DistributionType.NORMAL:
        return (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Mean (μ) Rate (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="purple.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  max={20}
                  step={0.1}
                  inputMode="decimal"
                  value={inflation_buffer1}
                  onChange={(valueAsString: string) =>
                    handle_change_inflation('mean', valueAsString, set_inflation_buffer1)
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="medium">Standard Deviation (σ) (%)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiPercent} color="purple.500" />
                </InputLeftElement>
                <NumberInput
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={inflation_buffer2}
                  onChange={(valueAsString: string) =>
                    handle_change_inflation(
                      'standardDeviation',
                      valueAsString,
                      set_inflation_buffer2
                    )
                  }
                  w="100%"
                >
                  <NumberInputField pl={10} borderRadius="md" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </InputGroup>
            </FormControl>
          </SimpleGrid>
        );
    }
  };

  return (
    <Card
      mb={8}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <CardHeader
        bg={useColorModeValue('gray.50', 'gray.700')}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        py={4}
        px={6}
      >
        <Flex alignItems="center">
          <Icon as={FiPercent} mr={2} color="green.500" boxSize={5} />
          <Heading size="md">Inflation Assumptions</Heading>
          <Tooltip
            label="Inflation impacts how costs increase over time and affects investment growth"
            placement="top"
            hasArrow
          >
            <Box ml={2}>
              <Icon as={FiInfo} color="gray.400" boxSize={5} />
            </Box>
          </Tooltip>
        </Flex>
      </CardHeader>
      <CardBody p={6}>
        <Text fontSize="md" color="gray.600" mb={6}>
          Choose how you want to model inflation in your financial plan. You can use a fixed rate or
          statistical distributions for more sophisticated modeling.
        </Text>

        {render_inflation_type_options()}

        {render_inflation_fields()}
      </CardBody>
    </Card>
  );
};

export default InflationSettings;
