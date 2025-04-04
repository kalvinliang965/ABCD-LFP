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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  Tooltip,
  Container,
} from "@chakra-ui/react";
import { FiInfo, FiDollarSign, FiCalendar, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import rmdStrategyStorage from "../../services/rmdStrategyStorage";

export interface RMDSettings {
  id?: string;
  enableRMD: boolean;
  startAge: number;
  accountPriority: string[];
  availableAccounts: string[];
}

interface RMDSettingsFormProps {
  rmdSettings: RMDSettings;
  onChangeRMDSettings: (settings: RMDSettings) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MotionBox = motion(Box);

const RMDSettingsForm: React.FC<RMDSettingsFormProps> = ({
  rmdSettings,
  onChangeRMDSettings,
  onContinue,
  onBack,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  const handleAddAccount = () => {
    if (selectedAccount && !rmdSettings.accountPriority.includes(selectedAccount)) {
      const updatedPriority = [...rmdSettings.accountPriority, selectedAccount];
      const updatedSettings = {
        ...rmdSettings,
        accountPriority: updatedPriority,
      };
      
      // Log the updated settings
      console.log("Updated RMD settings:", updatedSettings);
      
      // Save to localStorage immediately for auto-save functionality
      try {
        if (updatedSettings.id) {
          rmdStrategyStorage.update(updatedSettings.id, updatedSettings);
        } else {
          // Only add to localStorage if this is a significant change
          const savedSettings = rmdStrategyStorage.add(updatedSettings);
          // Update with the new ID
          updatedSettings.id = savedSettings.id;
        }
      } catch (error) {
        console.error("Error auto-saving to localStorage:", error);
      }
      
      onChangeRMDSettings(updatedSettings);
      setSelectedAccount("");
    }
  };

  const handleRemoveAccount = (account: string) => {
    const updatedPriority = rmdSettings.accountPriority.filter(
      (acc) => acc !== account
    );
    const updatedSettings = {
      ...rmdSettings,
      accountPriority: updatedPriority,
    };
    
    // Log the updated settings
    console.log("Updated RMD settings:", updatedSettings);
    
    // Save to localStorage immediately for auto-save functionality
    try {
      if (updatedSettings.id) {
        rmdStrategyStorage.update(updatedSettings.id, updatedSettings);
      } else {
        // Only add to localStorage if this is a significant change
        const savedSettings = rmdStrategyStorage.add(updatedSettings);
        // Update with the new ID
        updatedSettings.id = savedSettings.id;
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeRMDSettings(updatedSettings);
  };

  const handleMoveAccount = (account: string, direction: "up" | "down") => {
    const currentIndex = rmdSettings.accountPriority.indexOf(account);
    if (
      (direction === "up" && currentIndex > 0) ||
      (direction === "down" && currentIndex < rmdSettings.accountPriority.length - 1)
    ) {
      const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      const updatedPriority = [...rmdSettings.accountPriority];
      updatedPriority.splice(currentIndex, 1);
      updatedPriority.splice(newIndex, 0, account);
      const updatedSettings = {
        ...rmdSettings,
        accountPriority: updatedPriority,
      };
      
      // Log the updated settings
      console.log("Updated RMD settings:", updatedSettings);
      
      // Save to localStorage immediately for auto-save functionality
      try {
        if (updatedSettings.id) {
          rmdStrategyStorage.update(updatedSettings.id, updatedSettings);
        } else {
          // Only add to localStorage if this is a significant change
          const savedSettings = rmdStrategyStorage.add(updatedSettings);
          // Update with the new ID
          updatedSettings.id = savedSettings.id;
        }
      } catch (error) {
        console.error("Error auto-saving to localStorage:", error);
      }
      
      onChangeRMDSettings(updatedSettings);
    }
  };

  const availableAccountsToAdd = rmdSettings.availableAccounts.filter(
    (account) => !rmdSettings.accountPriority.includes(account)
  );
  console.log("Available accounts to add:", availableAccountsToAdd);

  return (
    <Container maxW="4xl" py={8}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="5px"
              bgGradient="linear(to-r, teal.400, blue.500)"
            />

            <Heading
              size="lg"
              bgGradient="linear(to-r, teal.500, blue.500)"
              bgClip="text"
            >
              Required Minimum Distribution (RMD) Settings
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
                <AlertTitle mb={1} fontSize="md">What are RMDs?</AlertTitle>
                <AlertDescription fontSize="sm">
                  Required Minimum Distributions (RMDs) are the minimum amounts you must withdraw from your retirement accounts each year, typically starting at age 72. These withdrawals are taxed as ordinary income.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={8} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel htmlFor="enable-rmd" mb="0" fontWeight="medium">
                  Enable RMD Calculations
                </FormLabel>
                <Switch
                  id="enable-rmd"
                  colorScheme="teal"
                  size="lg"
                  isChecked={rmdSettings.enableRMD}
                  onChange={(e) =>
                    onChangeRMDSettings({
                      ...rmdSettings,
                      enableRMD: e.target.checked,
                    })
                  }
                />
              </FormControl>

              {rmdSettings.enableRMD && (
                <>
                  <Divider />

                  <FormControl>
                    <FormLabel display="flex" alignItems="center">
                      RMD Start Age
                      <Tooltip
                        label="The age at which you must begin taking RMDs. Current law requires starting at age 72."
                        placement="right"
                        hasArrow
                      >
                        <Box display="inline-block">
                            <Icon as={FiInfo} ml={2} color="blue.400" />
                        </Box>
                      </Tooltip>
                    </FormLabel>
                    <NumberInput
                      min={70}
                      max={100}
                      value={rmdSettings.startAge}
                      onChange={(_, value) =>
                        onChangeRMDSettings({
                          ...rmdSettings,
                          startAge: value,
                        })
                      }
                      maxW="200px"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <Divider />

                  <Box>
                    <FormLabel display="flex" alignItems="center">
                      RMD Withdrawal Priority
                      <Tooltip 
                        label="The order in which accounts will be used for RMD withdrawals. Accounts at the top will be used first."
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
                      >
                        Add
                      </Button>
                    </HStack>

                    {rmdSettings.accountPriority.length > 0 ? (
                      <VStack
                        spacing={2}
                        align="stretch"
                        bg={useColorModeValue("gray.50", "gray.700")}
                        p={4}
                        borderRadius="md"
                      >
                        {rmdSettings.accountPriority.map((account, index) => (
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
                                isDisabled={index === rmdSettings.accountPriority.length - 1}
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

export default RMDSettingsForm; 