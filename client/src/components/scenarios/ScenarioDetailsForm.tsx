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
  Input,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Icon,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import {
  FiUser,
  FiUsers,
  FiCalendar,
  FiEdit3,
  FiArrowRight,
} from "react-icons/fi";
import { motion } from "framer-motion";

export type ScenarioType = "individual" | "couple";

export type ScenarioDetails = {
  name: string;
  type: ScenarioType;
  userBirthYear: number;
  spouseBirthYear?: number;
};

export interface ScenarioDetailsFormProps {
  scenarioDetails: ScenarioDetails;
  onChangeScenarioType: (value: string) => void;
  onChangeScenarioDetails: (details: ScenarioDetails) => void;
  onContinue: () => void;
  onBack?: () => void;
}

const MotionBox = motion(Box);

export const ScenarioDetailsForm: React.FC<ScenarioDetailsFormProps> = ({
  scenarioDetails,
  onChangeScenarioType,
  onChangeScenarioDetails,
  onContinue,
  onBack,
}) => {
  console.log("ScenarioDetailsForm: Rendering with details:", scenarioDetails);

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

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

  console.log(import.meta.env.MODE);

  return (
    <MotionBox
      initial="hidden"
      animate="show"
      variants={container}
      minH="100vh"
      bg={useColorModeValue("gray.50", "gray.900")}
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
            <CardHeader
              bg={headerBg}
              py={6}
              px={6}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="5px"
                bgGradient="linear(to-r, blue.400, purple.500)"
              />

              <Flex justify="space-between" align="center">
                <Heading
                  size="lg"
                  bgGradient="linear(to-r, blue.500, purple.500)"
                  bgClip="text"
                  display="flex"
                  alignItems="center"
                >
                  <Icon as={FiEdit3} mr={3} />
                  Scenario Details
                </Heading>
                <HStack spacing={3}>
                  {onBack && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log("ScenarioDetailsForm: Back button clicked");
                        onBack();
                      }}
                      size="md"
                      rounded="lg"
                      borderColor="blue.300"
                      _hover={{ bg: "blue.50" }}
                    >
                      Back
                    </Button>
                  )}
                </HStack>
              </Flex>
            </CardHeader>

            <CardBody p={{ base: 5, md: 8 }}>
              <MotionBox variants={item}>
                <Box
                  bg="blue.50"
                  p={4}
                  borderRadius="xl"
                  mb={8}
                  position="relative"
                  overflow="hidden"
                  borderLeft="4px solid"
                  borderLeftColor="blue.400"
                >
                  <Text color="blue.700" fontSize="md">
                    Enter the basic details for your financial scenario. This
                    information will help personalize your financial planning
                    experience.
                  </Text>
                </Box>
              </MotionBox>

              <VStack spacing={8} align="stretch">
                <MotionBox variants={item}>
                  <FormControl isRequired>
                    <FormLabel
                      fontWeight="medium"
                      fontSize="md"
                      color={useColorModeValue("gray.700", "gray.300")}
                      mb={2}
                    >
                      Scenario Name
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiEdit3} color="blue.400" />
                      </InputLeftElement>
                      <Input
                        value={scenarioDetails.name}
                        onChange={(e) =>
                          onChangeScenarioDetails({
                            ...scenarioDetails,
                            name: e.target.value,
                          })
                        }
                        placeholder="My Financial Plan"
                        pl={10}
                        borderRadius="lg"
                        focusBorderColor="blue.400"
                        borderWidth="2px"
                        _hover={{ borderColor: "blue.300" }}
                        fontSize="md"
                      />
                    </InputGroup>
                  </FormControl>
                </MotionBox>

                <MotionBox variants={item}>
                  <FormControl as="fieldset" mb={4}>
                    <FormLabel
                      as="legend"
                      fontWeight="medium"
                      fontSize="md"
                      color={useColorModeValue("gray.700", "gray.300")}
                      mb={3}
                    >
                      Scenario Type
                    </FormLabel>
                    <RadioGroup
                      value={scenarioDetails.type}
                      onChange={onChangeScenarioType}
                    >
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box
                          as="label"
                          borderWidth="2px"
                          borderRadius="xl"
                          px={5}
                          py={4}
                          cursor="pointer"
                          borderColor={
                            scenarioDetails.type === "individual"
                              ? "blue.400"
                              : "gray.200"
                          }
                          bg={
                            scenarioDetails.type === "individual"
                              ? "blue.50"
                              : "white"
                          }
                          transition="all 0.2s"
                          _hover={{
                            borderColor: "blue.300",
                            bg:
                              scenarioDetails.type === "individual"
                                ? "blue.50"
                                : "gray.50",
                          }}
                        >
                          <Flex align="center">
                            <Radio
                              value="individual"
                              colorScheme="blue"
                              size="lg"
                              mr={3}
                            />
                            <Box>
                              <Flex align="center" mb={1}>
                                <Icon
                                  as={FiUser}
                                  color="blue.500"
                                  mr={2}
                                  boxSize={5}
                                />
                                <Text fontWeight="semibold">Individual</Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500">
                                Plan for a single person
                              </Text>
                            </Box>
                          </Flex>
                        </Box>

                        <Box
                          as="label"
                          borderWidth="2px"
                          borderRadius="xl"
                          px={5}
                          py={4}
                          cursor="pointer"
                          borderColor={
                            scenarioDetails.type === "couple"
                              ? "purple.400"
                              : "gray.200"
                          }
                          bg={
                            scenarioDetails.type === "couple"
                              ? "purple.50"
                              : "white"
                          }
                          transition="all 0.2s"
                          _hover={{
                            borderColor: "purple.300",
                            bg:
                              scenarioDetails.type === "couple"
                                ? "purple.50"
                                : "gray.50",
                          }}
                        >
                          <Flex align="center">
                            <Radio
                              value="couple"
                              colorScheme="purple"
                              size="lg"
                              mr={3}
                            />
                            <Box>
                              <Flex align="center" mb={1}>
                                <Icon
                                  as={FiUsers}
                                  color="purple.500"
                                  mr={2}
                                  boxSize={5}
                                />
                                <Text fontWeight="semibold">Couple</Text>
                              </Flex>
                              <Text fontSize="sm" color="gray.500">
                                Plan for two people
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      </SimpleGrid>
                    </RadioGroup>
                  </FormControl>
                </MotionBox>

                <MotionBox variants={item}>
                  <Divider />
                </MotionBox>

                <MotionBox variants={item}>
                  <Box
                    p={6}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Flex align="center" mb={5}>
                      <Icon
                        as={FiCalendar}
                        color="teal.500"
                        mr={3}
                        boxSize={5}
                      />
                      <Heading size="md" color="teal.600">
                        Birth Information
                      </Heading>
                    </Flex>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl isRequired>
                        <FormLabel
                          fontWeight="medium"
                          color={useColorModeValue("gray.700", "gray.300")}
                        >
                          Your Birth Year
                        </FormLabel>
                        <InputGroup size="lg">
                          <InputLeftElement pointerEvents="none">
                            <Icon as={FiCalendar} color="teal.400" />
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
                            <NumberInputField
                              pl={10}
                              borderRadius="lg"
                              borderWidth="2px"
                              borderColor="teal.300"
                              _hover={{ borderColor: "teal.400" }}
                              fontSize="md"
                            />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </InputGroup>
                      </FormControl>

                      {scenarioDetails.type === "couple" && (
                        <FormControl isRequired>
                          <FormLabel
                            fontWeight="medium"
                            color={useColorModeValue("gray.700", "gray.300")}
                          >
                            Spouse Birth Year
                          </FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiCalendar} color="purple.400" />
                            </InputLeftElement>
                            <NumberInput
                              min={1900}
                              max={new Date().getFullYear()}
                              value={
                                scenarioDetails.spouseBirthYear ||
                                new Date().getFullYear() - 30
                              }
                              onChange={(_, value) =>
                                onChangeScenarioDetails({
                                  ...scenarioDetails,
                                  spouseBirthYear: value,
                                })
                              }
                              w="100%"
                            >
                              <NumberInputField
                                pl={10}
                                borderRadius="lg"
                                borderWidth="2px"
                                borderColor="purple.300"
                                _hover={{ borderColor: "purple.400" }}
                                fontSize="md"
                              />
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
                </MotionBox>
              </VStack>
            </CardBody>

            <CardFooter
              p={6}
              bg={useColorModeValue("gray.50", "gray.700")}
              borderTopWidth="1px"
              borderColor={borderColor}
            >
              <Flex justifyContent="flex-end" width="100%">
                <MotionBox
                  variants={item}
                  whileHover={{ scale: 1.03 } as any}
                  whileTap={{ scale: 0.98 } as any}
                >
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={() => {
                      console.log(
                        "ScenarioDetailsForm: Continue button clicked"
                      );
                      onContinue();
                    }}
                    isDisabled={!scenarioDetails.name}
                    rightIcon={<FiArrowRight />}
                    px={8}
                    borderRadius="lg"
                    bgGradient="linear(to-r, blue.400, purple.500)"
                    _hover={{
                      bgGradient: "linear(to-r, blue.500, purple.600)",
                      transform: "translateY(-2px)",
                      boxShadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    Continue
                  </Button>
                  {/* Will only display during development mode*/}
                  {(import.meta.env.MODE === "development") && (
                      <Button
                      colorScheme="blue"
                      size="lg"
                      onClick={() => {
                        console.log(
                          "ScenarioDetailsForm: Skip button clicked"
                        );
                        onContinue();
                      }}
                      rightIcon={<FiArrowRight />}
                      px={8}
                      ml={4}
                      borderRadius="lg"
                      bgGradient="linear(to-r, blue.400, purple.500)"
                      _hover={{
                        bgGradient: "linear(to-r, blue.500, purple.600)",
                        transform: "translateY(-2px)",
                        boxShadow: "lg",
                      }}
                      transition="all 0.2s"
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

export default ScenarioDetailsForm;
