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
import { FiInfo, FiArrowRight, FiBriefcase } from "react-icons/fi";
import { motion } from "framer-motion";

export interface WithdrawalStrategy {
  enableCustomStrategy: boolean;
  strategyType: "prioritized" | "proportional" | "tax-efficient";
  accountPriority: string[];
  availableAccounts: string[];
}

interface WithdrawalStrategyFormProps {
  withdrawalStrategy: WithdrawalStrategy;
  onChangeWithdrawalStrategy: (settings: WithdrawalStrategy) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MotionBox = motion(Box);

const WithdrawalStrategyForm: React.FC<WithdrawalStrategyFormProps> = ({
  withdrawalStrategy,
  onChangeWithdrawalStrategy,
  onContinue,
  onBack,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleAddAccount = () => {
    if (selectedAccount && !withdrawalStrategy.accountPriority.includes(selectedAccount)) {
      const updatedPriority = [...withdrawalStrategy.accountPriority, selectedAccount];
      onChangeWithdrawalStrategy({
        ...withdrawalStrategy,
        accountPriority: updatedPriority,
      });
      setSelectedAccount("");
    }
  };

  const handleRemoveAccount = (account: string) => {
    const updatedPriority = withdrawalStrategy.accountPriority.filter(
      (acc) => acc !== account
    );
    onChangeWithdrawalStrategy({
      ...withdrawalStrategy,
      accountPriority: updatedPriority,
    });
  };

  const handleMoveAccount = (account: string, direction: "up" | "down") => {
    const currentIndex = withdrawalStrategy.accountPriority.indexOf(account);
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= withdrawalStrategy.accountPriority.length) return;

    const updatedPriority = [...withdrawalStrategy.accountPriority];
    updatedPriority.splice(currentIndex, 1);
    updatedPriority.splice(newIndex, 0, account);

    onChangeWithdrawalStrategy({
      ...withdrawalStrategy,
      accountPriority: updatedPriority,
    });
  };

  // Filter out accounts that are already in the priority list
  const availableAccountsToAdd = withdrawalStrategy.availableAccounts.filter(
    (account) => !withdrawalStrategy.accountPriority.includes(account)
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
              bgGradient="linear(to-r, green.400, teal.500)"
            />

            <Heading
              size="lg"
              bgGradient="linear(to-r, green.500, teal.500)"
              bgClip="text"
            >
              Withdrawal Strategy Settings
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
                <AlertTitle mb={1} fontSize="md">What is a Withdrawal Strategy?</AlertTitle>
                <AlertDescription fontSize="sm">
                  A withdrawal strategy determines which investment accounts to withdraw from when funding your expenses. This can significantly impact your tax situation and the longevity of your portfolio.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={8} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="enable-custom-strategy" mb="0" fontWeight="medium">
                  Enable Custom Withdrawal Strategy
                </FormLabel>
                <Switch
                  id="enable-custom-strategy"
                  colorScheme="teal"
                  size="lg"
                  isChecked={withdrawalStrategy.enableCustomStrategy}
                  onChange={(e) =>
                    onChangeWithdrawalStrategy({
                      ...withdrawalStrategy,
                      enableCustomStrategy: e.target.checked,
                    })
                  }
                />
              </FormControl>

              {withdrawalStrategy.enableCustomStrategy && (
                <>
                  <Divider />

                  <FormControl>
                    <FormLabel display="flex" alignItems="center">
                      Strategy Type
                      <Tooltip
                        label="Choose how to determine which accounts to withdraw from."
                        placement="right"
                        hasArrow
                      >
                        <Box display="inline-block">
                          <Icon as={FiInfo} ml={2} color="teal.400" />
                        </Box>
                      </Tooltip>
                    </FormLabel>
                    <RadioGroup
                      value={withdrawalStrategy.strategyType}
                      onChange={(value) =>
                        onChangeWithdrawalStrategy({
                          ...withdrawalStrategy,
                          strategyType: value as "prioritized" | "proportional" | "tax-efficient",
                        })
                      }
                    >
                      <Stack direction="column" spacing={4}>
                        <Radio value="prioritized" colorScheme="teal">
                          <HStack align="start">
                            <Text fontWeight="medium">Prioritized</Text>
                            <Text fontSize="sm" color={textColor}>
                              (Withdraw from accounts in order of priority)
                            </Text>
                          </HStack>
                        </Radio>
                        <Radio value="proportional" colorScheme="teal">
                          <HStack align="start">
                            <Text fontWeight="medium">Proportional</Text>
                            <Text fontSize="sm" color={textColor}>
                              (Withdraw proportionally from all accounts)
                            </Text>
                          </HStack>
                        </Radio>
                        <Radio value="tax-efficient" colorScheme="teal">
                          <HStack align="start">
                            <Text fontWeight="medium">Tax-Efficient</Text>
                            <Text fontSize="sm" color={textColor}>
                              (Optimize withdrawals for tax efficiency)
                            </Text>
                          </HStack>
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  </FormControl>

                  {withdrawalStrategy.strategyType === "prioritized" && (
                    <>
                      <Divider />

                      <Box>
                        <FormLabel display="flex" alignItems="center">
                          Account Withdrawal Priority
                          <Tooltip 
                            label="The order in which accounts will be used for withdrawals. Accounts at the top will be used first."
                            placement="right"
                            hasArrow
                          >
                            <Box display="inline-block">
                              <Icon as={FiInfo} ml={2} color="teal.400" />
                            </Box>
                          </Tooltip>
                        </FormLabel>
                        
                        <HStack spacing={4} mb={4}>
                          <Select
                            placeholder="Select account"
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            maxW="300px"
                            isDisabled={availableAccountsToAdd.length === 0}
                          >
                            {availableAccountsToAdd.map((account) => (
                              <option key={account} value={account}>
                                {account}
                              </option>
                            ))}
                          </Select>
                          <Button
                            colorScheme="teal"
                            onClick={handleAddAccount}
                            isDisabled={!selectedAccount}
                            leftIcon={<Icon as={FiBriefcase} />}
                          >
                            Add
                          </Button>
                        </HStack>

                        {withdrawalStrategy.accountPriority.length > 0 ? (
                          <VStack
                            spacing={2}
                            align="stretch"
                            bg={useColorModeValue("gray.50", "gray.700")}
                            p={4}
                            borderRadius="md"
                          >
                            {withdrawalStrategy.accountPriority.map((account, index) => (
                              <HStack
                                key={account}
                                justify="space-between"
                                p={2}
                                borderWidth="1px"
                                borderRadius="md"
                                bg={cardBg}
                              >
                                <HStack>
                                  <Text fontWeight="bold">{index + 1}.</Text>
                                  <Text>{account}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMoveAccount(account, "up")}
                                    isDisabled={index === 0}
                                    variant="ghost"
                                  >
                                    ↑
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleMoveAccount(account, "down")}
                                    isDisabled={index === withdrawalStrategy.accountPriority.length - 1}
                                    variant="ghost"
                                  >
                                    ↓
                                  </Button>
                                  <Button
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => handleRemoveAccount(account)}
                                  >
                                    ✕
                                  </Button>
                                </HStack>
                              </HStack>
                            ))}
                          </VStack>
                        ) : (
                          <Text color={textColor}>
                            No accounts added. Add accounts to set withdrawal priority.
                          </Text>
                        )}
                      </Box>
                    </>
                  )}

                  {withdrawalStrategy.strategyType === "tax-efficient" && (
                    <Alert
                      status="success"
                      variant="subtle"
                      borderRadius="lg"
                      mt={4}
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle mb={1} fontSize="md">Tax-Efficient Strategy Selected</AlertTitle>
                        <AlertDescription fontSize="sm">
                          The simulator will automatically optimize withdrawals to minimize taxes based on your tax situation each year. This typically means using taxable accounts first, then tax-deferred accounts, and tax-free accounts last.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {withdrawalStrategy.strategyType === "proportional" && (
                    <Alert
                      status="success"
                      variant="subtle"
                      borderRadius="lg"
                      mt={4}
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle mb={1} fontSize="md">Proportional Strategy Selected</AlertTitle>
                        <AlertDescription fontSize="sm">
                          The simulator will withdraw from all accounts in proportion to their balances. This helps maintain your asset allocation across account types.
                        </AlertDescription>
                      </Box>
                    </Alert>
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
                colorScheme="teal"
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

export default WithdrawalStrategyForm; 