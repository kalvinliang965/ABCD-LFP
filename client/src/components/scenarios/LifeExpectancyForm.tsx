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
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FiActivity,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

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
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const userBg = useColorModeValue("blue.50", "blue.900");
  const spouseBg = useColorModeValue("purple.50", "purple.900");
  const user_current_age = new Date().getFullYear() - userBirthYear;

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
              <Heading
                size="lg"
                color="gray.800"
                display="flex"
                alignItems="center"
              >
                <Icon as={FiActivity} mr={2} />
                Life Expectancy Configuration
              </Heading>
              <HStack spacing={2}>
                <Button
                  variant="ghost"
                  colorScheme="blue"
                  onClick={onBack}
                  leftIcon={<Icon as={FiChevronLeft} />}
                >
                  Back
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={6}>
            <Text color="gray.600" mb={6} fontSize="md">
              Configure life expectancy settings for your financial planning
              scenario. These settings will help simulate your financial future
              more accurately.
            </Text>

            <VStack spacing={8} align="stretch">
              {/* User Life Expectancy */}
              <Box
                p={5}
                bg={userBg}
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
                shadow="sm"
              >
                <Heading
                  size="md"
                  color="gray.700"
                  mb={4}
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiActivity} mr={2} color="blue.500" />
                  Your Life Expectancy Type
                </Heading>

                <FormControl as="fieldset" mb={4}>
                  <RadioGroup
                    value={lifeExpectancyConfig.userExpectancyType}
                    onChange={handle_change_user_expectancy_type}
                  >
                    <Stack direction="row" spacing={5}>
                      <Radio value="fixed" colorScheme="blue" size="lg">
                        <Text fontSize="md">Fixed Age</Text>
                      </Radio>
                      <Radio value="distribution" colorScheme="blue" size="lg">
                        <Text fontSize="md">Normal Distribution</Text>
                      </Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                {lifeExpectancyConfig.userExpectancyType === "fixed" ? (
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium">Expected Age</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiCalendar} color="blue.500" />
                      </InputLeftElement>
                      <NumberInput
                        min={user_current_age + 1}
                        max={user_current_age + 120}
                        value={lifeExpectancyConfig.userFixedAge}
                        onChange={(_, value) =>
                          onChangeLifeExpectancy({
                            ...lifeExpectancyConfig,
                            userFixedAge: value,
                          })
                        }
                        w="100%"
                      >
                        <NumberInputField
                          pl={10}
                          borderRadius="md"
                          borderColor="blue.400"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </InputGroup>
                  </FormControl>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Mean Age (μ)</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={user_current_age + 1}
                          max={user_current_age + 120}
                          value={lifeExpectancyConfig.userMeanAge}
                          onChange={(_, value) =>
                            onChangeLifeExpectancy({
                              ...lifeExpectancyConfig,
                              userMeanAge: value,
                            })
                          }
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            borderRadius="md"
                            borderColor="blue.400"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">
                        Standard Deviation (σ)
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiActivity} color="blue.500" />
                        </InputLeftElement>
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
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            borderRadius="md"
                            borderColor="blue.400"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </SimpleGrid>
                )}
              </Box>

              {/* Spouse Life Expectancy (if couple) */}
              {isCouple && (
                <Box
                  p={5}
                  bg={spouseBg}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="purple.500"
                  shadow="sm"
                >
                  <Heading
                    size="md"
                    color="gray.700"
                    mb={4}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FiActivity} mr={2} color="purple.500" />
                    Spouse's Life Expectancy Type
                  </Heading>

                  <FormControl as="fieldset" mb={4}>
                    <RadioGroup
                      value={lifeExpectancyConfig.spouseExpectancyType}
                      onChange={handle_change_spouse_expectancy_type}
                    >
                      <Stack direction="row" spacing={5}>
                        <Radio value="fixed" colorScheme="purple" size="lg">
                          <Text fontSize="md">Fixed Age</Text>
                        </Radio>
                        <Radio
                          value="distribution"
                          colorScheme="purple"
                          size="lg"
                        >
                          <Text fontSize="md">Normal Distribution</Text>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {lifeExpectancyConfig.spouseExpectancyType === "fixed" ? (
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Expected Age</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="purple.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={spouseBirthYear ? spouseBirthYear + 1 : 1900}
                          max={spouseBirthYear ? spouseBirthYear + 120 : 2100}
                          value={lifeExpectancyConfig.spouseFixedAge}
                          onChange={(_, value) =>
                            onChangeLifeExpectancy({
                              ...lifeExpectancyConfig,
                              spouseFixedAge: value,
                            })
                          }
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            borderRadius="md"
                            borderColor="purple.400"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">Mean Age (μ)</FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiCalendar} color="purple.500" />
                          </InputLeftElement>
                          <NumberInput
                            min={spouseBirthYear ? spouseBirthYear + 1 : 1900}
                            max={spouseBirthYear ? spouseBirthYear + 120 : 2100}
                            value={lifeExpectancyConfig.spouseMeanAge}
                            onChange={(_, value) =>
                              onChangeLifeExpectancy({
                                ...lifeExpectancyConfig,
                                spouseMeanAge: value,
                              })
                            }
                            w="100%"
                          >
                            <NumberInputField
                              pl={10}
                              borderRadius="md"
                              borderColor="purple.400"
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="medium">
                          Standard Deviation (σ)
                        </FormLabel>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiActivity} color="purple.500" />
                          </InputLeftElement>
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
                            w="100%"
                          >
                            <NumberInputField
                              pl={10}
                              borderRadius="md"
                              borderColor="purple.400"
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>
                    </SimpleGrid>
                  )}
                </Box>
              )}
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="flex-end" width="100%">
              <Button
                colorScheme="blue"
                size="lg"
                onClick={onContinue}
                px={8}
                rightIcon={<Icon as={FiChevronRight} />}
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

export default LifeExpectancyForm;
