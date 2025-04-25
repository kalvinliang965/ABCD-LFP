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
  Badge,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FiInfo, FiDollarSign, FiCalendar, FiArrowRight } from 'react-icons/fi';

import rmdStrategyStorage from '../../services/rmdStrategyStorage';

export interface RMDSettings {
  id?: string;
  //   enableRMD: boolean;
  currentAge: number;
  accountPriority: string[]; // Account IDs in priority order
  availableAccounts: Array<{
    id: string;
    name: string;
  }>; // Available accounts with ID and name
}

// Helper to get account name by ID
const getAccountNameById = (accounts: Array<{ id: string; name: string }>, id: string): string => {
  const account = accounts.find(acc => acc.id === id);
  return account ? account.name : id; // Fallback to ID if name not found
};

interface RMDSettingsFormProps {
  rmdSettings: RMDSettings;
  onChangeRMDSettings: (settings: RMDSettings) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MotionBox = motion(Box);

export const RMDSettingsForm: React.FC<RMDSettingsFormProps> = ({
  rmdSettings,
  onChangeRMDSettings,
  onContinue,
  onBack,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const headerBg = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Calculate if RMD is required based on age
  const isRmdRequired = rmdSettings.currentAge >= 72;

  const handleAddAccount = () => {
    if (selectedAccount && !rmdSettings.accountPriority.includes(selectedAccount)) {
      handleRMDSettingsChange({
        ...rmdSettings,
        accountPriority: [...rmdSettings.accountPriority, selectedAccount],
      });
      setSelectedAccount('');
    }
  };

  const handleRemoveAccount = (accountId: string) => {
    handleRMDSettingsChange({
      ...rmdSettings,
      accountPriority: rmdSettings.accountPriority.filter(id => id !== accountId),
    });
  };

  const handleMoveAccount = (accountId: string, direction: 'up' | 'down') => {
    const currentIndex = rmdSettings.accountPriority.indexOf(accountId);
    if (currentIndex === -1) return;

    const newPriority = [...rmdSettings.accountPriority];

    if (direction === 'up' && currentIndex > 0) {
      // Swap with previous item
      [newPriority[currentIndex - 1], newPriority[currentIndex]] = [
        newPriority[currentIndex],
        newPriority[currentIndex - 1],
      ];
    } else if (direction === 'down' && currentIndex < newPriority.length - 1) {
      // Swap with next item
      [newPriority[currentIndex], newPriority[currentIndex + 1]] = [
        newPriority[currentIndex + 1],
        newPriority[currentIndex],
      ];
    }

    handleRMDSettingsChange({
      ...rmdSettings,
      accountPriority: newPriority,
    });
  };

  const handleRMDSettingsChange = (newSettings: RMDSettings) => {
    // Log the updated settings
    console.log('Updated RMD settings:', newSettings);

    // Save to localStorage immediately for auto-save functionality
    try {
      if (newSettings.id) {
        rmdStrategyStorage.update(newSettings.id, newSettings);
      } else {
        // Only add to localStorage if this is the first change
        const savedSettings = rmdStrategyStorage.add(newSettings);
        // Update with the new ID
        newSettings.id = savedSettings.id;
      }
    } catch (error) {
      console.error('Error auto-saving to localStorage:', error);
    }

    onChangeRMDSettings(newSettings);
  };

  // Get available accounts that aren't already in the priority list
  const availableAccountsToAdd = rmdSettings.availableAccounts.filter(
    account => !rmdSettings.accountPriority.includes(account.id)
  );

  console.log('Available accounts to add:', availableAccountsToAdd);

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
          <CardHeader bg={headerBg} py={6} px={6} position="relative" overflow="hidden">
            <Box
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="5px"
              bgGradient="linear(to-r, teal.400, blue.500)"
            />

            <Heading size="lg" bgGradient="linear(to-r, teal.500, blue.500)" bgClip="text">
              Required Minimum Distribution (RMD) Settings
            </Heading>
          </CardHeader>

          <CardBody p={6}>
            <Alert status="info" variant="subtle" borderRadius="lg" mb={6}>
              <AlertIcon />
              <Box>
                <AlertTitle mb={1} fontSize="md">
                  What are RMDs?
                </AlertTitle>
                <AlertDescription fontSize="sm">
                  Required Minimum Distributions (RMDs) are the minimum amounts you must withdraw
                  from your retirement accounts each year, typically starting at age 72. These
                  withdrawals are taxed as ordinary income.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={8} align="stretch">
              {/* {rmdSettings.enableRMD && ( */}
              <>
                <Divider />

                <FormControl>
                  <FormLabel display="flex" alignItems="center">
                    Your Current Age
                    <Tooltip
                      label="RMDs typically begin at age 72. This is your current age based on your birth year."
                      placement="right"
                      hasArrow
                    >
                      <Box display="inline-block">
                        <Icon as={FiInfo} ml={2} color="blue.400" />
                      </Box>
                    </Tooltip>
                  </FormLabel>
                  <HStack>
                    <Text fontSize="lg" fontWeight="medium">
                      {rmdSettings.currentAge}
                    </Text>
                    <Badge
                      colorScheme={isRmdRequired ? 'red' : 'green'}
                      fontSize="sm"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {isRmdRequired ? 'RMDs Required' : 'RMDs Not Yet Required'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    {isRmdRequired
                      ? 'You are 72 or older, so RMDs are required from your pre-tax retirement accounts.'
                      : `RMDs will be required when you reach age 72 (in ${72 - rmdSettings.currentAge} years).`}
                  </Text>
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
                      onChange={e => setSelectedAccount(e.target.value)}
                      maxW="300px"
                      isDisabled={availableAccountsToAdd.length === 0}
                    >
                      {availableAccountsToAdd.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} (ID: {account.id})
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
                      bg={useColorModeValue('gray.50', 'gray.700')}
                      p={4}
                      borderRadius="md"
                    >
                      {rmdSettings.accountPriority.map((accountId, index) => (
                        <HStack
                          key={accountId}
                          justify="space-between"
                          p={2}
                          borderWidth="1px"
                          borderRadius="md"
                          bg={cardBg}
                        >
                          <HStack>
                            <Text fontWeight="bold">{index + 1}.</Text>
                            <Text>
                              {getAccountNameById(rmdSettings.availableAccounts, accountId)}
                            </Text>
                            <Badge colorScheme="blue" ml={2}>
                              ID: {accountId}
                            </Badge>
                          </HStack>
                          <HStack>
                            {index > 0 && (
                              <Button
                                size="sm"
                                onClick={() => handleMoveAccount(accountId, 'up')}
                                variant="ghost"
                              >
                                ↑
                              </Button>
                            )}
                            {index < rmdSettings.accountPriority.length - 1 && (
                              <Button
                                size="sm"
                                onClick={() => handleMoveAccount(accountId, 'down')}
                                variant="ghost"
                              >
                                ↓
                              </Button>
                            )}
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoveAccount(accountId)}
                            >
                              ✕
                            </Button>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500" fontStyle="italic">
                      No accounts selected for RMD priority
                    </Text>
                  )}
                </Box>
              </>
              {/* )} */}
            </VStack>
          </CardBody>

          <CardFooter
            p={6}
            bg={useColorModeValue('gray.50', 'gray.700')}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <HStack spacing={4} width="100%" justifyContent="space-between">
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button colorScheme="blue" rightIcon={<FiArrowRight />} onClick={onContinue}>
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
