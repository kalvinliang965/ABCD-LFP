import React from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  HStack,
  VStack,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";

export type ExpectancyType = "fixed" | "distribution";

export type LifeExpectancyConfig = {
  userExpectancyType: ExpectancyType;
  userFixedAge?: number;
  userMeanAge?: number;
  userStandardDeviation?: number;
  spouseExpectancyType?: ExpectancyType;
  spouseFixedAge?: number;
  spouseMeanAge?: number;
  spouseStandardDeviation?: number;
};

interface LifeExpectancyFormProps {
  lifeExpectancyConfig: LifeExpectancyConfig;
  isCouple: boolean;
  userBirthYear: number;
  spouseBirthYear?: number;
  onChangeLifeExpectancy: (config: LifeExpectancyConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const LifeExpectancyForm: React.FC<LifeExpectancyFormProps> = ({
  lifeExpectancyConfig,
  isCouple,
  userBirthYear,
  spouseBirthYear,
  onChangeLifeExpectancy,
  onBack,
  onContinue,
}) => {
  const handle_change_user_expectancy_type = (value: string) => {
    const newType = value as ExpectancyType;
    const updates: Partial<LifeExpectancyConfig> = {
      userExpectancyType: newType,
    };

    // Initialize appropriate fields based on the type
    if (newType === "fixed" && !lifeExpectancyConfig.userFixedAge) {
      updates.userFixedAge = 85;
    } else if (newType === "distribution") {
      if (!lifeExpectancyConfig.userMeanAge) updates.userMeanAge = 85;
      if (!lifeExpectancyConfig.userStandardDeviation)
        updates.userStandardDeviation = 5;
    }

    onChangeLifeExpectancy({
      ...lifeExpectancyConfig,
      ...updates,
    });
  };

  const handle_change_spouse_expectancy_type = (value: string) => {
    const newType = value as ExpectancyType;
    const updates: Partial<LifeExpectancyConfig> = {
      spouseExpectancyType: newType,
    };

    // Initialize appropriate fields based on the type
    if (newType === "fixed" && !lifeExpectancyConfig.spouseFixedAge) {
      updates.spouseFixedAge = 85;
    } else if (newType === "distribution") {
      if (!lifeExpectancyConfig.spouseMeanAge) updates.spouseMeanAge = 85;
      if (!lifeExpectancyConfig.spouseStandardDeviation)
        updates.spouseStandardDeviation = 5;
    }

    onChangeLifeExpectancy({
      ...lifeExpectancyConfig,
      ...updates,
    });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="4xl" mx="auto" py={12} px={4}>
        <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
          <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color="gray.900">
                Life Expectancy Configuration
              </Heading>
              <HStack spacing={2}>
                <Button variant="ghost" colorScheme="blue" onClick={onBack}>
                  Back
                </Button>
                <Button colorScheme="blue" onClick={onContinue}>
                  Next
                </Button>
              </HStack>
            </Flex>

            <Flex align="center" mb={6}>
              <Icon as={CalendarIcon} color="blue.500" boxSize={5} mr={2} />
              <Text color="gray.600">
                Configure life expectancy settings for your financial planning
                scenario.
              </Text>
            </Flex>

            <VStack spacing={8} align="stretch">
              {/* User Life Expectancy */}
              <Box
                p={5}
                bg="blue.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
              >
                <Heading size="md" color="gray.700" mb={4}>
                  Your Life Expectancy Type
                </Heading>

                <FormControl as="fieldset" mb={4}>
                  <RadioGroup
                    value={lifeExpectancyConfig.userExpectancyType}
                    onChange={handle_change_user_expectancy_type}
                  >
                    <Stack direction="row" spacing={5}>
                      <Radio value="fixed">Fixed Age</Radio>
                      <Radio value="distribution">Normal Distribution</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {lifeExpectancyConfig.userExpectancyType === "fixed" ? (
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium">Expected Age</FormLabel>
                    <NumberInput
                      min={userBirthYear + 1}
                      max={userBirthYear + 120}
                      value={lifeExpectancyConfig.userFixedAge}
                      onChange={(_, value) =>
                        onChangeLifeExpectancy({
                          ...lifeExpectancyConfig,
                          userFixedAge: value,
                        })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Mean Age (μ)</FormLabel>
                      <NumberInput
                        min={userBirthYear + 1}
                        max={userBirthYear + 120}
                        value={lifeExpectancyConfig.userMeanAge}
                        onChange={(_, value) =>
                          onChangeLifeExpectancy({
                            ...lifeExpectancyConfig,
                            userMeanAge: value,
                          })
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">
                        Standard Deviation (σ)
                      </FormLabel>
                      <NumberInput
                        min={1}
                        max={20}
                        value={lifeExpectancyConfig.userStandardDeviation}
                        onChange={(_, value) =>
                          onChangeLifeExpectancy({
                            ...lifeExpectancyConfig,
                            userStandardDeviation: value,
                          })
                        }
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                )}
              </Box>

              {/* Spouse Life Expectancy (if couple) */}
              {isCouple && (
                <>
                  <Divider />
                  <Box
                    p={5}
                    bg="purple.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor="purple.500"
                  >
                    <Heading size="md" color="gray.700" mb={4}>
                      Spouse's Life Expectancy Type
                    </Heading>

                    <FormControl as="fieldset" mb={4}>
                      <RadioGroup
                        value={lifeExpectancyConfig.spouseExpectancyType}
                        onChange={handle_change_spouse_expectancy_type}
                      >
                        <Stack direction="row" spacing={5}>
                          <Radio value="fixed">Fixed Age</Radio>
                          <Radio value="distribution">
                            Normal Distribution
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    {lifeExpectancyConfig.spouseExpectancyType === "fixed" ? (
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">Expected Age</FormLabel>
                        <NumberInput
                          min={spouseBirthYear ? spouseBirthYear + 1 : 1}
                          max={spouseBirthYear ? spouseBirthYear + 120 : 120}
                          value={lifeExpectancyConfig.spouseFixedAge}
                          onChange={(_, value) =>
                            onChangeLifeExpectancy({
                              ...lifeExpectancyConfig,
                              spouseFixedAge: value,
                            })
                          }
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">
                            Mean Age (μ)
                          </FormLabel>
                          <NumberInput
                            min={spouseBirthYear ? spouseBirthYear + 1 : 1}
                            max={spouseBirthYear ? spouseBirthYear + 120 : 120}
                            value={lifeExpectancyConfig.spouseMeanAge}
                            onChange={(_, value) =>
                              onChangeLifeExpectancy({
                                ...lifeExpectancyConfig,
                                spouseMeanAge: value,
                              })
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">
                            Standard Deviation (σ)
                          </FormLabel>
                          <NumberInput
                            min={1}
                            max={20}
                            value={lifeExpectancyConfig.spouseStandardDeviation}
                            onChange={(_, value) =>
                              onChangeLifeExpectancy({
                                ...lifeExpectancyConfig,
                                spouseStandardDeviation: value,
                              })
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </SimpleGrid>
                    )}
                  </Box>
                </>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LifeExpectancyForm;
