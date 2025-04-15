/**
 * AI-generated code
 * Create a component for handling state of residence selection as part of decomposing AdditionalSettingsForm
 */

import {
  Box,
  Text,
  Flex,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  SimpleGrid,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import React from 'react';
import { FiMapPin, FiInfo } from 'react-icons/fi';

import { StateType } from '../../../types/Enum';

interface StateOfResidenceSettingsProps {
  stateOfResidence: StateType;
  onChangeStateOfResidence: (state: StateType) => void;
}

const StateOfResidenceSettings: React.FC<StateOfResidenceSettingsProps> = ({
  stateOfResidence,
  onChangeStateOfResidence,
}) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Get state name from code(this is for display purpose)
  const get_state_name = (code: StateType) => {
    switch (code) {
      case StateType.NY:
        return 'New York';
      case StateType.NJ:
        return 'New Jersey';
      case StateType.CT:
        return 'Connecticut';
      default:
        return code;
    }
  };

  // State card options
  const render_state_options = () => {
    return (
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {['NY', 'NJ', 'CT'].map(stateCode => (
          <Box
            key={stateCode}
            as="button"
            type="button"
            p={4}
            borderWidth="2px"
            borderRadius="lg"
            borderColor={stateOfResidence === stateCode ? 'blue.500' : 'gray.200'}
            bg={stateOfResidence === stateCode ? 'blue.50' : 'transparent'}
            _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
            _dark={{
              borderColor: stateOfResidence === stateCode ? 'blue.500' : 'gray.600',
              bg: stateOfResidence === stateCode ? 'blue.900' : 'transparent',
              _hover: { bg: 'blue.900', borderColor: 'blue.700' },
            }}
            transition="all 0.2s"
            onClick={() => onChangeStateOfResidence(stateCode as StateType)}
          >
            <Flex direction="column" align="center">
              <Flex
                mb={3}
                bg={useColorModeValue('blue.100', 'blue.800')}
                color={useColorModeValue('blue.600', 'blue.300')}
                p={2}
                borderRadius="md"
              >
                <Icon as={FiMapPin} boxSize={5} />
              </Flex>
              <Text fontWeight="bold" fontSize="md" mb={1}>
                {get_state_name(stateCode as StateType)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {stateCode}
              </Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Card
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
          <Icon as={FiMapPin} mr={2} color="blue.500" boxSize={5} />
          <Heading size="md">State of Residence</Heading>
          <Tooltip
            label="Your state of residence affects tax calculations and other location-specific factors."
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
          Select your state of residence. This will be used for tax planning purposes and other
          state-specific financial considerations.
        </Text>

        {render_state_options()}
      </CardBody>
    </Card>
  );
};

export default StateOfResidenceSettings;
