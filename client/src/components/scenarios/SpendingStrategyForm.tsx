import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Switch,
  VStack,
  HStack,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  Tooltip,
  Container,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { FiInfo, FiArrowRight, FiDollarSign } from "react-icons/fi";
import { motion } from "framer-motion";

export interface SpendingStrategy {
  enableCustomStrategy: boolean;
  strategyType: "prioritized" | "proportional";
  expensePriority: string[];
  availableExpenses: string[];
}

interface SpendingStrategyFormProps {
  spendingStrategy: SpendingStrategy;
  onChangeSpendingStrategy: (settings: SpendingStrategy) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MotionBox = motion(Box);

const SpendingStrategyForm: React.FC<SpendingStrategyFormProps> = ({
  spendingStrategy,
  onChangeSpendingStrategy,
  onContinue,
  onBack,
}) => {
  const [selectedExpense, setSelectedExpense] = useState<string>("");

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleAddExpense = () => {
    if (selectedExpense && !spendingStrategy.expensePriority.includes(selectedExpense)) {
      const updatedPriority = [...spendingStrategy.expensePriority, selectedExpense];
      onChangeSpendingStrategy({
        ...spendingStrategy,
        expensePriority: updatedPriority,
      });
      setSelectedExpense("");
    }
  };

  const handleRemoveExpense = (expense: string) => {
    const updatedPriority = spendingStrategy.expensePriority.filter(
      (exp) => exp !== expense
    );
    onChangeSpendingStrategy({
      ...spendingStrategy,
      expensePriority: updatedPriority,
    });
  };

  const handleMoveExpense = (expense: string, direction: "up" | "down") => {
    const currentIndex = spendingStrategy.expensePriority.indexOf(expense);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= spendingStrategy.expensePriority.length) return;

    const updatedPriority = [...spendingStrategy.expensePriority];
    updatedPriority.splice(currentIndex, 1);
    updatedPriority.splice(newIndex, 0, expense);

    onChangeSpendingStrategy({
      ...spendingStrategy,
      expensePriority: updatedPriority,
    });
  };

  // Filter out expenses that are already in the priority list
  const availableExpensesToAdd = spendingStrategy.availableExpenses.filter(
    (expense) => !spendingStrategy.expensePriority.includes(expense)
  );

  return (
    <Container maxW="container.md" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          borderRadius="lg"
          boxShadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
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
              bgGradient="linear(to-r, purple.400, blue.500)"
            />

            <Heading
              size="lg"
              bgGradient="linear(to-r, purple.500, blue.500)"
              bgClip="text"
            >
              Spending Strategy Settings
            </Heading>
          </CardHeader>

          <CardBody p={6}>
            <Alert
              status="info"
              variant="subtle"
              borderRadius="lg"
              mb={6}
            >
              <AlertIcon />
              <Box>
                <AlertTitle mb={1} fontSize="md">What is a Spending Strategy?</AlertTitle>
                <AlertDescription fontSize="sm">
                  A spending strategy determines how your discretionary expenses are prioritized when your income is insufficient to cover all expenses. You can choose to prioritize certain expenses over others or allocate funds proportionally.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={8} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="enable-custom-strategy" mb="0" fontWeight="medium">
                  Enable Custom Spending Strategy
                </FormLabel>
                <Switch
                  id="enable-custom-strategy"
                  colorScheme="purple"
                  size="lg"
                  isChecked={spendingStrategy.enableCustomStrategy}
                  onChange={(e) =>
                    onChangeSpendingStrategy({
                      ...spendingStrategy,
                      enableCustomStrategy: e.target.checked,
                    })
                  }
                />
              </FormControl>

              {spendingStrategy.enableCustomStrategy && (
                <>
                  <Divider />

                  <FormControl>
                    <FormLabel display="flex" alignItems="center">
                      Strategy Type
                      <Tooltip
                        label="Choose how to allocate funds when income is insufficient for all expenses."
                        placement="right"
                        hasArrow
                      >
                        <Box display="inline-block">
                          <Icon as={FiInfo} ml={2} color="blue.400" />
                        </Box>
                      </Tooltip>
                    </FormLabel>
                    <RadioGroup
                      value={spendingStrategy.strategyType}
                      onChange={(value) =>
                        onChangeSpendingStrategy({
                          ...spendingStrategy,
                          strategyType: value as "prioritized" | "proportional",
                        })
                      }
                    >
                      <Stack direction="column" spacing={4}>
                        <Radio value="prioritized" colorScheme="purple">
                          <HStack align="start">
                            <Text fontWeight="medium">Prioritized</Text>
                            <Text fontSize="sm" color={textColor}>
                              (Fund expenses in order of priority)
                            </Text>
                          </HStack>
                        </Radio>
                        <Radio value="proportional" colorScheme="purple">
                          <HStack align="start">
                            <Text fontWeight="medium">Proportional</Text>
                            <Text fontSize="sm" color={textColor}>
                              (Reduce all expenses proportionally)
                            </Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {spendingStrategy.strategyType === "prioritized" && (
                    <>
                      <Divider />

                      <Box>
                        <FormLabel display="flex" alignItems="center">
                          Expense Priority Order
                          <Tooltip 
                            label="The order in which discretionary expenses will be funded. Expenses at the top will be funded first."
                            placement="right"
                            hasArrow
                          >
                            <Box display="inline-block">
                              <Icon as={FiInfo} ml={2} color="blue.400" />
                            </Box>
                          </Tooltip>
                        </FormLabel>
                        
                        <HStack spacing={4} mb={4}>
                          <Select
                            placeholder="Select expense"
                            value={selectedExpense}
                            onChange={(e) => setSelectedExpense(e.target.value)}
                            maxW="300px"
                            isDisabled={availableExpensesToAdd.length === 0}
                          >
                            {availableExpensesToAdd.map((expense) => (
                              <option key={expense} value={expense}>
                                {expense}
                              </option>
                            ))}
                          </Select>
                          <Button
                            colorScheme="purple"
                            onClick={handleAddExpense}
                            isDisabled={!selectedExpense}
                            leftIcon={<Icon as={FiDollarSign} />}
                          >
                            Add
                          </Button>
                        </HStack>

                        {spendingStrategy.expensePriority.length > 0 ? (
                          <VStack
                            spacing={2}
                            align="stretch"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            p={4}
                            borderRadius="md"
                          >
                            {spendingStrategy.expensePriority.map((expense, index) => (
                              <HStack
                                key={expense}
                                justify="space-between"
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={cardBg}
                              >
                                <HStack>
                                  <Text fontWeight="bold">{index + 1}.</Text>
                                  <Text>{expense}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMoveExpense(expense, "up")}
                                    isDisabled={index === 0}
                                    variant="ghost"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMoveExpense(expense, "down")}
                                    isDisabled={index === spendingStrategy.expensePriority.length - 1}
                                    variant="ghost"
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveExpense(expense)}
                                  >
                                    ✕
                                  </Button>
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text color={textColor}>
                            No expenses added. Add expenses to set funding priority.
                          </Text>
                        )}
                      </Box>
                    </>
                  )}
                </>
              )}
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <HStack spacing={4} width="100%" justifyContent="space-between">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button
                colorScheme="blue"
                rightIcon={<FiArrowRight />}
                onClick={onContinue}
              >
                Continue
              </Button>
            </HStack>
          </CardFooter>
        </Card>
      </MotionBox>
    </Container>
  );
};

export default SpendingStrategyForm; 