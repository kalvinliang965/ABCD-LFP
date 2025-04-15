/**
 * AI-generated code
 * Create a component for handling financial goal settings as part of decomposing AdditionalSettingsForm
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
} from '@chakra-ui/react';
import React from 'react';
import { FiTarget, FiDollarSign, FiInfo, FiShield } from 'react-icons/fi';

interface FinancialGoalSettingsProps {
  financialGoal: number;
  onChangeFinancialGoal: (value: number) => void;
}

const FinancialGoalSettings: React.FC<FinancialGoalSettingsProps> = ({
  financialGoal,
  onChangeFinancialGoal,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handle_change_financial_goal = (valueString: string, value: number) => {
    if (valueString === '') {
      onChangeFinancialGoal(0); // ensure non-negative
    } else {
      onChangeFinancialGoal(Math.max(0, value)); // ensure non-negative
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
          <Icon as={FiTarget} mr={2} color="blue.500" boxSize={5} />
          <Heading size="md">Financial Goal</Heading>
          <Tooltip
            label="A financial goal of $0 means meeting all expenses. Higher values represent safety margins and potential inheritance."
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
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box>
            <Text fontSize="md" color="gray.600" mb={4}>
              Set your annual financial goal. A value of $0 indicates that you wish to meet all your
              expenses. A positive value represents a desired minimum total value of your
              investments.
            </Text>

            <Flex mt={6} gap={4} align="center">
              <Icon as={FiShield} color="green.500" boxSize={12} opacity={0.8} />
              <Box>
                <Text fontWeight="medium" fontSize="sm" color="gray.500">
                  Recommended
                </Text>
                <Text fontWeight="bold">Set a safety margin of 10-20% of your annual expenses</Text>
              </Box>
            </Flex>
          </Box>

          <Box>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Annual Goal Amount ($)</FormLabel>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiDollarSign} color="blue.500" />
                </InputLeftElement>
                <NumberInput
                  min={0}
                  step={1000}
                  value={financialGoal}
                  onChange={handle_change_financial_goal}
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
          </Box>
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

export default FinancialGoalSettings;
