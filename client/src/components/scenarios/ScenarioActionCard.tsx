import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  HStack,
  Tooltip,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Icon,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { FiUser, FiUsers, FiCalendar, FiEdit3 } from 'react-icons/fi';

export type ScenarioType = 'individual' | 'couple';

export type ScenarioDetails = {
  name: string;
  type: ScenarioType;
  userBirthYear: number;
  spouseBirthYear?: number;
};

interface ScenarioDetailsFormProps {
  scenarioDetails: ScenarioDetails;
  onChangeScenarioType: (value: string) => void;
  onChangeScenarioDetails: (details: ScenarioDetails) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export const ScenarioDetailsForm: React.FC<ScenarioDetailsFormProps> = ({
  scenarioDetails,
  onChangeScenarioType,
  onChangeScenarioDetails,
  onContinue,
  onSkip,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Box maxW="4xl" mx="auto" px={4}>
        <Card
          rounded="lg"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
        >
          <CardHeader bg={headerBg} py={5} px={6}>
            <Flex justify="space-between" align="center">
              <Heading size="lg" color="gray.800" display="flex" alignItems="center">
                <Icon as={FiEdit3} mr={2} />
                New Scenario
              </Heading>
              <HStack spacing={2}>
                <Tooltip label="Skip this step" placement="left">
                  <Button variant="ghost" colorScheme="blue" onClick={onSkip}>
                    Skip
                  </Button>
                </Tooltip>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <Text color="gray.600" mb={6} fontSize="md">
              Enter the basic details for your financial scenario. This information will help
              personalize your financial planning experience.
            </Text>

            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Scenario Name</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiEdit3} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    value={scenarioDetails.name}
                    onChange={e =>
                      onChangeScenarioDetails({
                        ...scenarioDetails,
                        name: e.target.value,
                      })
                    }
                    placeholder="My Financial Plan"
                    pl={10}
                    borderRadius="md"
                    focusBorderColor="blue.400"
                  />
                </InputGroup>
              </FormControl>

              <FormControl as="fieldset">
                <FormLabel as="legend" fontWeight="medium">
                  Scenario Type
                </FormLabel>
                <RadioGroup value={scenarioDetails.type} onChange={onChangeScenarioType}>
                  <Stack direction="row" spacing={5}>
                    <Radio value="individual" colorScheme="blue" size="lg">
                      <HStack spacing={2}>
                        <Icon as={FiUser} />
                        <Text>Individual</Text>
                      </HStack>
                    </Radio>
                    <Radio value="couple" colorScheme="blue" size="lg">
                      <HStack spacing={2}>
                        <Icon as={FiUsers} />
                        <Text>Couple</Text>
                      </HStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Divider my={2} />

              <Box
                p={4}
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontWeight="medium" mb={4}>
                  Birth Information
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium">Your Birth Year</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiCalendar} color="gray.400" />
                      </InputLeftElement>
                      <NumberInput
                        min={1900}
                        max={new Date().getFullYear()}
                        value={scenarioDetails.userBirthYear}
                        onChange={(_, value) =>
                          onChangeScenarioDetails({
                            ...scenarioDetails,
                            userBirthYear: value,
                          })
                        }
                        w="100%"
                      >
                        <NumberInputField pl={10} borderRadius="md" borderColor="blue.400" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                  </FormControl>

                  {scenarioDetails.type === 'couple' && (
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Spouse Birth Year</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="gray.400" />
                        </InputLeftElement>
                        <NumberInput
                          min={1900}
                          max={new Date().getFullYear()}
                          value={scenarioDetails.spouseBirthYear}
                          onChange={(_, value) =>
                            onChangeScenarioDetails({
                              ...scenarioDetails,
                              spouseBirthYear: value,
                            })
                          }
                          w="100%"
                        >
                          <NumberInputField pl={10} borderRadius="md" borderColor="blue.400" />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  )}
                </SimpleGrid>
              </Box>
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="flex-end" width="100%">
              <Button
                colorScheme="blue"
                size="lg"
                onClick={onContinue}
                isDisabled={!scenarioDetails.name}
                px={8}
                rightIcon={<Icon as={FiUser} />}
              >
                Continue
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </Box>
    </Box>
  );
};

export default ScenarioDetailsForm;
