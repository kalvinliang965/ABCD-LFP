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
  Switch,
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
  FormHelperText,
  List,
  ListItem,
  ListIcon,
  Badge,
  Container,
} from "@chakra-ui/react";

import {
  FiRefreshCcw,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiInfo,
  FiDollarSign,
  FiTrendingUp,
  FiCheck,
  FiRepeat,
} from "react-icons/fi";

import { useImmer } from "use-immer";

export type RothConversionOptimizer = {
  roth_conversion_start: number;
  roth_conversion_end: number;
  roth_conversion_strategy: Array<String>;
};

export interface RothConversionOptimizerFormProps {
  onBack: () => void;
  onFinish?: () => void;
  onContinue?: () => void;
}

export const RothConversionOptimizerForm: React.FC<
  RothConversionOptimizerFormProps
> = ({ onBack, onFinish, onContinue }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const infoBg = useColorModeValue("blue.50", "blue.900");
  const stepBg = useColorModeValue("blue.100", "blue.800");
  const cardShadow = useColorModeValue(
    "0 4px 6px rgba(0, 0, 0, 0.1)",
    "0 4px 6px rgba(0, 0, 0, 0.3)"
  );

  const current_year = new Date().getFullYear();

  const [roth, update_roth] = useImmer({
    opt: "opt-out",
    start_year: current_year,
    end_year: current_year + 5,
    strategy: [],
  });

  function handle_opt_change(checked) {
    update_roth((draft) => {
      draft.opt = checked ? "opt-in" : "opt-out";
    });
  }

  function handle_start_year_change(value) {
    update_roth((draft) => {
      draft.start_year = value;
      // Ensure end year is not before start year
      if (draft.end_year < value) {
        draft.end_year = value;
      }
    });
  }

  function handle_end_year_change(value) {
    update_roth((draft) => {
      draft.end_year = value;
    });
  }

  const is_opt_in = roth.opt === "opt-in";
  const conversion_years = roth.end_year - roth.start_year + 1;

  return (
    <Box minH="100vh" bg={useColorModeValue("gray.50", "gray.900")} py={8}>
      <Container maxW="4xl" px={{ base: 4, md: 6 }}>
        <Card
          borderRadius="xl"
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
            borderBottom="1px"
            borderColor={borderColor}
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
                <Icon as={FiRefreshCcw} mr={3} boxSize={6} />
                Roth Conversion Optimizer
              </Heading>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  colorScheme="blue"
                  onClick={onBack}
                  leftIcon={<Icon as={FiChevronLeft} />}
                  size="md"
                  rounded="lg"
                >
                  Back
                </Button>
              </HStack>
            </Flex>
          </CardHeader>

          <CardBody p={{ base: 5, md: 8 }}>
            <VStack spacing={8} align="stretch">
              <Box
                p={5}
                borderRadius="lg"
                bg={infoBg}
                borderLeft="4px solid"
                borderLeftColor="blue.400"
              >
                <Text color="blue.700" fontSize="md">
                  Roth conversion allows you to transfer funds from traditional
                  retirement accounts to Roth accounts. While you'll pay taxes
                  on the converted amount now, all future growth and qualified
                  withdrawals will be tax-free.
                </Text>
              </Box>

              {/* Toggle Switch Section */}
              <Card p={6} borderRadius="lg" shadow={cardShadow}>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap={{ base: "wrap", md: "nowrap" }}
                  gap={4}
                >
                  <Box flex="1">
                    <Heading
                      size="md"
                      mb={2}
                      display="flex"
                      alignItems="center"
                    >
                      <Icon as={FiRepeat} mr={2} color="purple.500" />
                      Enable Roth Conversion Strategy
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      Automatically convert traditional IRA funds to Roth IRA
                      over time to minimize tax impact
                    </Text>
                  </Box>
                  <FormControl display="flex" alignItems="center" width="auto">
                    <Switch
                      id="roth-opt-in"
                      colorScheme="purple"
                      size="lg"
                      isChecked={is_opt_in}
                      onChange={(e) => handle_opt_change(e.target.checked)}
                    />
                    <FormLabel htmlFor="roth-opt-in" mb="0" ml={3}>
                      <Badge
                        colorScheme={is_opt_in ? "green" : "gray"}
                        fontSize="sm"
                        py={1}
                        px={2}
                        borderRadius="full"
                      >
                        {is_opt_in ? "Enabled" : "Disabled"}
                      </Badge>
                    </FormLabel>
                  </FormControl>
                </Flex>
              </Card>

              {/* Year Range Section */}
              {is_opt_in && (
                <Card p={6} borderRadius="lg" shadow={cardShadow}>
                  <Heading size="md" mb={4} display="flex" alignItems="center">
                    <Icon as={FiCalendar} mr={2} color="blue.500" />
                    Conversion Time Period
                  </Heading>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={4}>
                    <FormControl>
                      <FormLabel
                        htmlFor="roth-start-year"
                        fontWeight="medium"
                        color="gray.700"
                      >
                        Start Year
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={current_year}
                          max={current_year + 50}
                          value={roth.start_year}
                          onChange={handle_start_year_change}
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            id="roth-start-year"
                            borderRadius="md"
                            borderColor="blue.300"
                            _hover={{ borderColor: "blue.400" }}
                            fontSize="md"
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel
                        htmlFor="roth-end-year"
                        fontWeight="medium"
                        color="gray.700"
                      >
                        End Year
                      </FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiCalendar} color="blue.500" />
                        </InputLeftElement>
                        <NumberInput
                          min={roth.start_year}
                          max={current_year + 50}
                          value={roth.end_year}
                          onChange={handle_end_year_change}
                          w="100%"
                        >
                          <NumberInputField
                            pl={10}
                            id="roth-end-year"
                            borderRadius="md"
                            borderColor="blue.300"
                            _hover={{ borderColor: "blue.400" }}
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

                  <Flex
                    bg="purple.50"
                    p={3}
                    borderRadius="md"
                    align="center"
                    borderLeft="3px solid"
                    borderLeftColor="purple.400"
                  >
                    <Icon as={FiInfo} mr={3} color="purple.500" />
                    <Text fontSize="sm" color="purple.800">
                      Your conversion will be spread over{" "}
                      <strong>{conversion_years} years</strong> (
                      {roth.start_year} - {roth.end_year}) to minimize tax
                      impact.
                    </Text>
                  </Flex>
                </Card>
              )}

              {/* How it Works Section */}
              <Card p={6} borderRadius="lg" shadow={cardShadow}>
                <Heading size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FiInfo} mr={2} color="teal.500" />
                  How Roth Conversion Works
                </Heading>

                <List spacing={4}>
                  <ListItem display="flex" alignItems="flex-start">
                    <Flex
                      minW="2rem"
                      h="2rem"
                      bg={stepBg}
                      borderRadius="full"
                      justify="center"
                      align="center"
                      mr={4}
                      color="blue.600"
                      fontWeight="bold"
                    >
                      1
                    </Flex>
                    <Box>
                      <Text fontWeight="medium" mb={1}>
                        Convert Traditional to Roth IRA
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Move funds from tax-deferred accounts to Roth accounts
                        where they'll grow tax-free.
                      </Text>
                    </Box>
                  </ListItem>

                  <ListItem display="flex" alignItems="flex-start">
                    <Flex
                      minW="2rem"
                      h="2rem"
                      bg={stepBg}
                      borderRadius="full"
                      justify="center"
                      align="center"
                      mr={4}
                      color="blue.600"
                      fontWeight="bold"
                    >
                      2
                    </Flex>
                    <Box>
                      <Text fontWeight="medium" mb={1}>
                        Pay Taxes Now
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        The converted amount is added to your taxable income for
                        the year of conversion.
                      </Text>
                    </Box>
                  </ListItem>

                  <ListItem display="flex" alignItems="flex-start">
                    <Flex
                      minW="2rem"
                      h="2rem"
                      bg={stepBg}
                      borderRadius="full"
                      justify="center"
                      align="center"
                      mr={4}
                      color="blue.600"
                      fontWeight="bold"
                    >
                      3
                    </Flex>
                    <Box>
                      <Text fontWeight="medium" mb={1}>
                        Enjoy Tax-Free Growth
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Future growth and qualified withdrawals will be
                        completely tax-free in retirement.
                      </Text>
                    </Box>
                  </ListItem>
                </List>

                <Flex
                  bg="green.50"
                  p={4}
                  borderRadius="md"
                  mt={5}
                  align="center"
                  borderLeft="3px solid"
                  borderLeftColor="green.400"
                >
                  <Icon
                    as={FiTrendingUp}
                    boxSize={5}
                    mr={3}
                    color="green.500"
                  />
                  <Text fontSize="sm" color="green.800">
                    Our optimizer will fill lower tax brackets each year to
                    minimize your tax burden while maximizing future tax-free
                    growth.
                  </Text>
                </Flex>
              </Card>
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            borderTopWidth="1px"
            borderColor={borderColor}
            bg={useColorModeValue("gray.50", "gray.700")}
          >
            <Flex width="100%" justify="space-between">
              <Button
                variant="outline"
                leftIcon={<Icon as={FiChevronLeft} />}
                onClick={onBack}
                size="lg"
                rounded="lg"
              >
                Back
              </Button>
              <Button
                colorScheme="blue"
                rightIcon={<Icon as={FiChevronRight} />}
                onClick={onFinish || onContinue}
                size="lg"
                rounded="lg"
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
            </Flex>
          </CardFooter>
        </Card>
      </Container>
    </Box>
  );
};

export default RothConversionOptimizerForm;
