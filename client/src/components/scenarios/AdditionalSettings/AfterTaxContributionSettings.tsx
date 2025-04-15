/**
 * AI-generated code
 * Create a component for handling after tax contribution limit settings as part of decomposing AdditionalSettingsForm
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
  Tooltip,
} from '@chakra-ui/react';
import React from 'react';
import { FiMinusCircle, FiInfo } from 'react-icons/fi';

interface AfterTaxContributionSettingsProps {
  afterTaxContributionLimit: number;
  onChangeAfterTaxContributionLimit: (value: number) => void;
}

const AfterTaxContributionSettings: React.FC<AfterTaxContributionSettingsProps> = ({
  afterTaxContributionLimit,
  onChangeAfterTaxContributionLimit,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handle_change_after_tax_contribution = (valueString: string, value: number) => {
    if (valueString === '') {
      onChangeAfterTaxContributionLimit(0);
    } else {
      onChangeAfterTaxContributionLimit(value);
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
          <Icon as={FiMinusCircle} mr={2} color="green.500" boxSize={5} />
          <Heading size="md">After Tax Contribution Limit</Heading>
          <Tooltip
            label="After tax contribution limit is an annual limit on contributions to after-tax retirement accounts"
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
          Set the maximum amount you plan to contribute to after-tax accounts in your financial
          plan. This helps model savings beyond traditional retirement limits and can be adjusted to
          reflect your specific goals or income strategies.
        </Text>
        <FormControl isRequired>
          <FormLabel fontWeight="medium">After Tax Contribution Limit</FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiMinusCircle} color="green.500" />
            </InputLeftElement>
            <NumberInput
              min={0}
              step={1}
              value={afterTaxContributionLimit}
              onChange={handle_change_after_tax_contribution}
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
      </CardBody>
    </Card>
  );
};

export default AfterTaxContributionSettings;
