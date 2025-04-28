// AI-generated code
// Prompt: Create a component for handling Roth optimizer parameter selection that shows the original value and allows changing it for one-dimensional scenario exploration

import React, { useState, useEffect } from 'react';
import { ScenarioRaw } from '../../../types/Scenarios';
import {
  Box,
  FormControl,
  FormLabel,
  Switch,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Badge,
  Divider,
  HStack,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';

interface RothOptimizerParameterProps {
  onValueChange: (newValue: boolean) => void;
  originalValue: boolean;
}

const RothOptimizerParameter: React.FC<RothOptimizerParameterProps> = ({
  onValueChange,
  originalValue,
}) => {
  // Use state to track the current selected value
  const [currentValue, set_current_value] = useState<boolean>(originalValue);

  // Update component if originalValue changes
  useEffect(() => {
    set_current_value(originalValue);
  }, [originalValue]);

  // Handle toggle change
  const handle_toggle_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    set_current_value(newValue);
    onValueChange(newValue);
  };

  // Check if the value has changed from the original
  const has_value_changed = currentValue !== originalValue;

  // Colors for better UI
  const infoBg = useColorModeValue('blue.50', 'blue.900');
  const infoTextColor = useColorModeValue('blue.700', 'blue.200');
  const changedBg = useColorModeValue('green.50', 'green.900');
  const unchangedBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <VStack spacing={4} align="stretch">
      <Box p={4} borderRadius="md" bg={infoBg} borderLeft="4px solid" borderLeftColor="blue.400">
        <Text color={infoTextColor} fontSize="sm">
          <Icon as={FiInfo} mr={2} />
          The Roth optimizer automatically determines the optimal amount to convert from traditional
          retirement accounts to Roth accounts each year to minimize lifetime taxes.
        </Text>
      </Box>

      <Box
        p={4}
        borderRadius="md"
        bg={has_value_changed ? changedBg : unchangedBg}
        borderLeft={has_value_changed ? '4px solid green.400' : 'none'}
      >
        <Text fontWeight="medium" mb={3}>
          Original scenario setting:
        </Text>
        <HStack>
          <Text>Roth Optimizer:</Text>
          <Badge
            colorScheme={originalValue ? 'green' : 'red'}
            px={2}
            py={1}
            borderRadius="full"
          >
            {originalValue ? 'Enabled' : 'Disabled'}
          </Badge>
        </HStack>
      </Box>

      <Divider />

      <FormControl display="flex" alignItems="center" justifyContent="space-between">
        <FormLabel htmlFor="roth-optimizer-toggle" mb="0" fontWeight="medium">
          Enable Roth Optimizer for this exploration:
        </FormLabel>
        <HStack>
          <Switch
            id="roth-optimizer-toggle"
            colorScheme="purple"
            size="lg"
            isChecked={currentValue}
            onChange={handle_toggle_change}
          />
          <Badge
            colorScheme={currentValue ? 'green' : 'gray'}
            fontSize="sm"
            py={1}
            px={2}
            borderRadius="full"
          >
            {currentValue ? 'Enabled' : 'Disabled'}
          </Badge>
        </HStack>
      </FormControl>

      {has_value_changed ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          Comparing scenario results with Roth Optimizer {currentValue ? 'enabled' : 'disabled'}
          versus the original setting of {originalValue ? 'enabled' : 'disabled'}.
        </Alert>
      ) : (
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          The selected value is the same as the original setting. Change it to enable comparison.
        </Alert>
      )}
    </VStack>
  );
};

export default RothOptimizerParameter;
