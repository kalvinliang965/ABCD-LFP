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
  Container,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';
import {
  FiActivity,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiUser,
  FiUsers,
} from 'react-icons/fi';

import lifeExpectancyStorage from '../../services/lifeExpectancyStorage';

export type ExpectancyType = 'fixed' | 'normal';

export interface LifeExpectancyConfig {
  id?: string;
  userExpectancyType: ExpectancyType;
  userFixedAge?: number;
  userMeanAge?: number;
  userStandardDeviation?: number;
  spouseExpectancyType?: ExpectancyType;
  spouseFixedAge?: number;
  spouseMeanAge?: number;
  spouseStandardDeviation?: number;
}

export interface LifeExpectancyFormProps {
  lifeExpectancyConfig: LifeExpectancyConfig;
  isCouple: boolean;
  userBirthYear: number;
  spouseBirthYear?: number;
  onChangeLifeExpectancy: (config: LifeExpectancyConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const LifeExpectancyForm: React.FC<LifeExpectancyFormProps> = ({
  lifeExpectancyConfig,
  isCouple,
  userBirthYear,
  spouseBirthYear,
  onChangeLifeExpectancy: onChangeConfig,
  onBack,
  onContinue,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const user_current_age = new Date().getFullYear() - userBirthYear;
  const spouse_current_age = spouseBirthYear ? new Date().getFullYear() - spouseBirthYear : 0;

  const boxShadow = useColorModeValue(
    '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
    '0 4px 20px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)'
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      } as any,
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 } as any,
    },
  };

  const handle_change_user_expectancy_type = (value: string) => {
    const newType = value as ExpectancyType;
    const updates: Partial<LifeExpectancyConfig> = {
      userExpectancyType: newType,
    };

    // Initialize appropriate fields based on the type
    if (newType === 'fixed' && !lifeExpectancyConfig.userFixedAge) {
      updates.userFixedAge = 85;
    } else if (newType === 'normal') {
      if (!lifeExpectancyConfig.userMeanAge) updates.userMeanAge = 85;
      if (!lifeExpectancyConfig.userStandardDeviation) updates.userStandardDeviation = 5;
    }

    handleLifeExpectancyChange({
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
    if (newType === 'fixed' && !lifeExpectancyConfig.spouseFixedAge) {
      updates.spouseFixedAge = 85;
    } else if (newType === 'normal') {
      if (!lifeExpectancyConfig.spouseMeanAge) updates.spouseMeanAge = 85;
      if (!lifeExpectancyConfig.spouseStandardDeviation) updates.spouseStandardDeviation = 5;
    }

    handleLifeExpectancyChange({
      ...lifeExpectancyConfig,
      ...updates,
    });
  };

  const handleLifeExpectancyChange = (updatedConfig: LifeExpectancyConfig) => {
    console.log('Updated life expectancy config:', updatedConfig);

    try {
      if (updatedConfig.id) {
        lifeExpectancyStorage.update(updatedConfig.id, updatedConfig);
      } else {
        const savedConfig = lifeExpectancyStorage.add(updatedConfig);
        updatedConfig.id = savedConfig.id;
      }
    } catch (error) {
      console.error('Error auto-saving to localStorage:', error);
    }

    onChangeConfig(updatedConfig);
  };

  return (
    <MotionBox
      initial="hidden"
      animate="show"
      variants={container}
      minH="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
      py={{ base: 8, md: 12 }}
    >
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <MotionBox variants={item}>
          <Card
            borderRadius="2xl"
            boxShadow="xl"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
            bg={cardBg}
          >
            <CardHeader bg={headerBg} py={6} px={6} position="relative" overflow="hidden">
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="5px"
                bgGradient="linear(to-r, blue.400, teal.400)"
              />

              <Flex justify="space-between" align="center">
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, blue.500, teal.500)"
                  bgClip="text"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiActivity} mr={3} />
                  Life Expectancy
                </Heading>
              </Flex>
            </CardHeader>

            <CardBody p={{ base: 5, md: 8 }}>
              <MotionBox variants={item}>
                <Box
                  bg="teal.50"
                  p={4}
                  borderRadius="xl"
                  mb={8}
                  position="relative"
                  overflow="hidden"
                  borderLeft="4px solid"
                  borderLeftColor="teal.400"
                >
                  <Text color="teal.700" fontSize="md">
                    Configure life expectancy settings for your scenario. These settings help
                    simulate how long your financial plan needs to support you.
                  </Text>
                </Box>
              </MotionBox>

              <VStack spacing={8} align="stretch">
                {/* User Life Expectancy */}
                <MotionBox
                  variants={item}
                  p={6}
                  borderRadius="xl"
                  borderWidth="1px"
                  borderColor="blue.200"
                  bg="blue.50"
                  position="relative"
                  overflow="hidden"
                  boxShadow={boxShadow}
                >
                  <Flex
                    position="absolute"
                    top={0}
                    right={0}
                    bg="blue.400"
                    color="white"
                    px={3}
                    py={1}
                    borderBottomLeftRadius="md"
                  >
                    <Icon as={FiUser} mr={2} />
                    <Text fontWeight="medium">You</Text>
                  </Flex>

                  <Heading
                    size="md"
                    color="blue.700"
                    mb={5}
                    mt={4}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FiHeart} mr={3} boxSize={5} color="blue.500" />
                    Your Life Expectancy
                  </Heading>

                  <SimpleGrid
                    columns={{ base: 1, md: 2 }}
                    spacing={6}
                    mb={6}
                    bg="white"
                    p={4}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="blue.100"
                  >
                    <Stat>
                      <StatLabel color="gray.600">Current Age</StatLabel>
                      <StatNumber color="blue.500">{user_current_age}</StatNumber>
                      <StatHelpText>Born in {userBirthYear}</StatHelpText>
                    </Stat>

                    <Stat>
                      <StatLabel color="gray.600">Expected Lifespan</StatLabel>
                      <StatNumber color="blue.500">
                        {lifeExpectancyConfig.userExpectancyType === 'fixed'
                          ? lifeExpectancyConfig.userFixedAge
                          : lifeExpectancyConfig.userMeanAge}
                      </StatNumber>
                      <StatHelpText>
                        {lifeExpectancyConfig.userExpectancyType === 'fixed'
                          ? 'Fixed Age'
                          : 'Mean Age (with variation)'}
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>

                  <Box mb={5}>
                    <FormControl as="fieldset" mb={4}>
                      <FormLabel as="legend" fontWeight="semibold" color="blue.700">
                        Calculation Method
                      </FormLabel>
                      <RadioGroup
                        value={lifeExpectancyConfig.userExpectancyType}
                        onChange={handle_change_user_expectancy_type}
                      >
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={5}>
                          <Box
                            as="label"
                            borderWidth="2px"
                            borderRadius="lg"
                            px={4}
                            py={3}
                            cursor="pointer"
                            borderColor={
                              lifeExpectancyConfig.userExpectancyType === 'fixed'
                                ? 'blue.400'
                                : 'gray.200'
                            }
                            bg={
                              lifeExpectancyConfig.userExpectancyType === 'fixed'
                                ? 'white'
                                : 'gray.50'
                            }
                            transition="all 0.2s"
                            _hover={{
                              borderColor: 'blue.300',
                            }}
                            flex={1}
                          >
                            <Flex align="center">
                              <Radio value="fixed" colorScheme="blue" size="lg" mr={3} />
                              <Box>
                                <Text fontWeight="medium">Fixed Age</Text>
                                <Text fontSize="sm" color="gray.500">
                                  Exact age at death
                                </Text>
                              </Box>
                            </Flex>
                          </Box>

                          <Box
                            as="label"
                            borderWidth="2px"
                            borderRadius="lg"
                            px={4}
                            py={3}
                            cursor="pointer"
                            borderColor={
                              lifeExpectancyConfig.userExpectancyType === 'normal'
                                ? 'blue.400'
                                : 'gray.200'
                            }
                            bg={
                              lifeExpectancyConfig.userExpectancyType === 'normal'
                                ? 'white'
                                : 'gray.50'
                            }
                            transition="all 0.2s"
                            _hover={{
                              borderColor: 'blue.300',
                            }}
                            flex={1}
                          >
                            <Flex align="center">
                              <Radio value="normal" colorScheme="blue" size="lg" mr={3} />
                              <Box>
                                <Text fontWeight="medium">Normal Distribution</Text>
                                <Text fontSize="sm" color="gray.500">
                                  Statistical probability
                                </Text>
                              </Box>
                            </Flex>
                          </Box>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  {lifeExpectancyConfig.userExpectancyType === 'fixed' ? (
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" color="blue.700">
                        Expected Age
                      </FormLabel>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={user_current_age + 1}
                          max={120}
                          value={lifeExpectancyConfig.userFixedAge}
                          onChange={(_, value) =>
                            handleLifeExpectancyChange({
                              ...lifeExpectancyConfig,
                              userFixedAge: value,
                            })
                          }
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            borderRadius="lg"
                            borderWidth="2px"
                            borderColor="blue.300"
                            _hover={{ borderColor: 'blue.400' }}
                            fontSize="md"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="blue.700">
                          Mean Age (μ)
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiCalendar} color="blue.500" />
                          </InputLeftElement>
                          <NumberInput
                            min={user_current_age + 1}
                            max={120}
                            value={lifeExpectancyConfig.userMeanAge}
                            onChange={(_, value) =>
                              handleLifeExpectancyChange({
                                ...lifeExpectancyConfig,
                                userMeanAge: value,
                              })
                            }
                            w="100%"
                          >
                            <NumberInputField
                              pl={10}
                              borderRadius="lg"
                              borderWidth="2px"
                              borderColor="blue.300"
                              _hover={{ borderColor: 'blue.400' }}
                              fontSize="md"
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="blue.700">
                          Standard Deviation (σ)
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiActivity} color="blue.500" />
                          </InputLeftElement>
                          <NumberInput
                            min={1}
                            max={20}
                            value={lifeExpectancyConfig.userStandardDeviation}
                            onChange={(_, value) =>
                              handleLifeExpectancyChange({
                                ...lifeExpectancyConfig,
                                userStandardDeviation: value,
                              })
                            }
                            w="100%"
                          >
                            <NumberInputField
                              pl={10}
                              borderRadius="lg"
                              borderWidth="2px"
                              borderColor="blue.300"
                              _hover={{ borderColor: 'blue.400' }}
                              fontSize="md"
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
                </MotionBox>

                {/* Spouse Life Expectancy, only shown for couples */}
                {isCouple && (
                  <MotionBox
                    variants={item}
                    p={6}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor="purple.200"
                    bg="purple.50"
                    position="relative"
                    overflow="hidden"
                    boxShadow={boxShadow}
                  >
                    <Flex
                      position="absolute"
                      top={0}
                      right={0}
                      bg="purple.400"
                      color="white"
                      px={3}
                      py={1}
                      borderBottomLeftRadius="md"
                    >
                      <Icon as={FiUsers} mr={2} />
                      <Text fontWeight="medium">Spouse</Text>
                    </Flex>

                    <Heading
                      size="md"
                      color="purple.700"
                      mb={5}
                      mt={4}
                      display="flex"
                      alignItems="center"
                    >
                      <Icon as={FiHeart} mr={3} boxSize={5} color="purple.500" />
                      Spouse Life Expectancy
                    </Heading>

                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      spacing={6}
                      mb={6}
                      bg="white"
                      p={4}
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="purple.100"
                    >
                      <Stat>
                        <StatLabel color="gray.600">Current Age</StatLabel>
                        <StatNumber color="purple.500">{spouse_current_age}</StatNumber>
                        <StatHelpText>Born in {spouseBirthYear}</StatHelpText>
                      </Stat>

                      <Stat>
                        <StatLabel color="gray.600">Expected Lifespan</StatLabel>
                        <StatNumber color="purple.500">
                          {lifeExpectancyConfig.spouseExpectancyType === 'fixed'
                            ? lifeExpectancyConfig.spouseFixedAge
                            : lifeExpectancyConfig.spouseMeanAge}
                        </StatNumber>
                        <StatHelpText>
                          {lifeExpectancyConfig.spouseExpectancyType === 'fixed'
                            ? 'Fixed Age'
                            : 'Mean Age (with variation)'}
                        </StatHelpText>
                      </Stat>
                    </SimpleGrid>

                    <Box mb={5}>
                      <FormControl as="fieldset" mb={4}>
                        <FormLabel as="legend" fontWeight="semibold" color="purple.700">
                          Calculation Method
                        </FormLabel>
                        <RadioGroup
                          value={lifeExpectancyConfig.spouseExpectancyType}
                          onChange={handle_change_spouse_expectancy_type}
                        >
                          <Stack direction={{ base: 'column', md: 'row' }} spacing={5}>
                            <Box
                              as="label"
                              borderWidth="2px"
                              borderRadius="lg"
                              px={4}
                              py={3}
                              cursor="pointer"
                              borderColor={
                                lifeExpectancyConfig.spouseExpectancyType === 'fixed'
                                  ? 'purple.400'
                                  : 'gray.200'
                              }
                              bg={
                                lifeExpectancyConfig.spouseExpectancyType === 'fixed'
                                  ? 'white'
                                  : 'gray.50'
                              }
                              transition="all 0.2s"
                              _hover={{
                                borderColor: 'purple.300',
                              }}
                              flex={1}
                            >
                              <Flex align="center">
                                <Radio value="fixed" colorScheme="purple" size="lg" mr={3} />
                                <Box>
                                  <Text fontWeight="medium">Fixed Age</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    Exact age at death
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>

                            <Box
                              as="label"
                              borderWidth="2px"
                              borderRadius="lg"
                              px={4}
                              py={3}
                              cursor="pointer"
                              borderColor={
                                lifeExpectancyConfig.spouseExpectancyType === 'normal'
                                  ? 'purple.400'
                                  : 'gray.200'
                              }
                              bg={
                                lifeExpectancyConfig.spouseExpectancyType === 'normal'
                                  ? 'white'
                                  : 'gray.50'
                              }
                              transition="all 0.2s"
                              _hover={{
                                borderColor: 'purple.300',
                              }}
                              flex={1}
                            >
                              <Flex align="center">
                                <Radio value="normal" colorScheme="purple" size="lg" mr={3} />
                                <Box>
                                  <Text fontWeight="medium">Normal Distribution</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    Statistical probability
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {lifeExpectancyConfig.spouseExpectancyType === 'fixed' ? (
                      <FormControl isRequired>
                        <FormLabel fontWeight="medium" color="purple.700">
                          Expected Age
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiCalendar} color="purple.500" />
                          </InputLeftElement>
                          <NumberInput
                            min={spouse_current_age + 1}
                            max={120}
                            value={lifeExpectancyConfig.spouseFixedAge}
                            onChange={(_, value) =>
                              handleLifeExpectancyChange({
                                ...lifeExpectancyConfig,
                                spouseFixedAge: value,
                              })
                            }
                            w="100%"
                          >
                            <NumberInputField
                              pl={10}
                              borderRadius="lg"
                              borderWidth="2px"
                              borderColor="purple.300"
                              _hover={{ borderColor: 'purple.400' }}
                              fontSize="md"
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <FormControl isRequired>
                          <FormLabel fontWeight="medium" color="purple.700">
                            Mean Age (μ)
                          </FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiCalendar} color="purple.500" />
                            </InputLeftElement>
                            <NumberInput
                              min={spouse_current_age + 1}
                              max={120}
                              value={lifeExpectancyConfig.spouseMeanAge}
                              onChange={(_, value) =>
                                handleLifeExpectancyChange({
                                  ...lifeExpectancyConfig,
                                  spouseMeanAge: value,
                                })
                              }
                              w="100%"
                            >
                              <NumberInputField
                                pl={10}
                                borderRadius="lg"
                                borderWidth="2px"
                                borderColor="purple.300"
                                _hover={{ borderColor: 'purple.400' }}
                                fontSize="md"
                              />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                          </InputGroup>
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel fontWeight="medium" color="purple.700">
                            Standard Deviation (σ)
                          </FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiActivity} color="purple.500" />
                            </InputLeftElement>
                            <NumberInput
                              min={1}
                              max={20}
                              value={lifeExpectancyConfig.spouseStandardDeviation}
                              onChange={(_, value) =>
                                handleLifeExpectancyChange({
                                  ...lifeExpectancyConfig,
                                  spouseStandardDeviation: value,
                                })
                              }
                              w="100%"
                            >
                              <NumberInputField
                                pl={10}
                                borderRadius="lg"
                                borderWidth="2px"
                                borderColor="purple.300"
                                _hover={{ borderColor: 'purple.400' }}
                                fontSize="md"
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
                  </MotionBox>
                )}
              </VStack>
            </CardBody>

            <CardFooter
              p={6}
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              <Flex justifyContent="space-between" width="100%">
                <MotionBox
                  variants={item}
                  whileHover={{ scale: 1.03 } as any}
                  whileTap={{ scale: 0.98 } as any}
                >
                  <Button
                    variant="outline"
                    onClick={onBack}
                    leftIcon={<FiChevronLeft />}
                    size="lg"
                    rounded="lg"
                    borderColor="blue.300"
                    px={8}
                  >
                    Back
                  </Button>
                </MotionBox>

                <MotionBox
                  variants={item}
                  whileHover={{ scale: 1.03 } as any}
                  whileTap={{ scale: 0.98 } as any}
                >
                  <Button
                    colorScheme="blue"
                    onClick={onContinue}
                    rightIcon={<FiChevronRight />}
                    size="lg"
                    rounded="lg"
                    px={8}
                    bgGradient="linear(to-r, blue.400, teal.500)"
                    _hover={{
                      bgGradient: 'linear(to-r, blue.500, teal.600)',
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    Continue
                  </Button>
                  {import.meta.env.MODE === 'development' && (
                    <Button
                      colorScheme="blue"
                      onClick={onContinue}
                      rightIcon={<FiChevronRight />}
                      size="lg"
                      rounded="lg"
                      px={8}
                      bgGradient="linear(to-r, blue.400, teal.500)"
                      _hover={{
                        bgGradient: 'linear(to-r, blue.500, teal.600)',
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      transition="all 0.2s"
                      ml={4}
                    >
                      Skip
                    </Button>
                  )}
                </MotionBox>
              </Flex>
            </CardFooter>
          </Card>
        </MotionBox>
      </Container>
    </MotionBox>
  );
};

export default LifeExpectancyForm;
