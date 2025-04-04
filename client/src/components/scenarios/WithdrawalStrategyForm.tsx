import React from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  List,
  ListItem,
  Flex,
  Icon,
  Card,
  CardHeader,
  CardBody,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown, FaWallet } from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import withdrawalStrategyStorage from "../../services/withdrawalStrategyStorage";

// Simplified interface to match YAML format
export interface WithdrawalStrategy {
  id?: string;
  availableAccounts: string[];  // All available investment accounts
  accountPriority: string[];    // Selected accounts in priority order
}

interface WithdrawalStrategyFormProps {
  withdrawalStrategy: WithdrawalStrategy;
  onChangeWithdrawalStrategy: (strategy: WithdrawalStrategy) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const WithdrawalStrategyForm: React.FC<WithdrawalStrategyFormProps> = ({
  withdrawalStrategy,
  onChangeWithdrawalStrategy,
  onContinue,
  onBack,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const listItemBg = useColorModeValue("gray.50", "gray.700");
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(withdrawalStrategy.accountPriority);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    handleAccountPriorityChange(items);
  };

  // Add an account to the priority list
  const addAccount = (accountId: string) => {
    if (!withdrawalStrategy.accountPriority.includes(accountId)) {
      handleAccountPriorityChange([...withdrawalStrategy.accountPriority, accountId]);
    }
  };

  // Remove an account from the priority list
  const removeAccount = (accountId: string) => {
    handleAccountPriorityChange(withdrawalStrategy.accountPriority.filter(id => id !== accountId));
  };

  // Move an account up in priority
  const moveUp = (index: number) => {
    if (index <= 0) return;
    
    const newPriority = [...withdrawalStrategy.accountPriority];
    const temp = newPriority[index];
    newPriority[index] = newPriority[index - 1];
    newPriority[index - 1] = temp;
    
    handleAccountPriorityChange(newPriority);
  };

  // Move an account down in priority
  const moveDown = (index: number) => {
    if (index >= withdrawalStrategy.accountPriority.length - 1) return;
    
    const newPriority = [...withdrawalStrategy.accountPriority];
    const temp = newPriority[index];
    newPriority[index] = newPriority[index + 1];
    newPriority[index + 1] = temp;
    
    handleAccountPriorityChange(newPriority);
  };

  // Get available accounts that aren't already in the priority list
  const getAvailableAccounts = () => {
    return withdrawalStrategy.availableAccounts.filter(
      account => !withdrawalStrategy.accountPriority.includes(account)
    );
  };

  const handleAccountPriorityChange = (newPriority: string[]) => {
    const updatedStrategy = {
      ...withdrawalStrategy,
      accountPriority: newPriority
    };
    
    // Log the updated strategy
    console.log("Updated withdrawal strategy:", updatedStrategy);
    
    // Save to localStorage immediately for auto-save functionality
    try {
      if (updatedStrategy.id) {
        withdrawalStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      } else {
        // Only add to localStorage if this is the first change
        if (newPriority.length === 1) {
          const savedStrategy = withdrawalStrategyStorage.add(updatedStrategy);
          // Update with the new ID
          updatedStrategy.id = savedStrategy.id;
        }
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeWithdrawalStrategy(updatedStrategy);
  };

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <Card
        bg={bgColor}
        boxShadow="xl"
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <CardHeader bg="blue.600" color="white" p={4}>
          <Heading size="lg">Withdrawal Strategy</Heading>
          <Text mt={2}>
            Define the order in which your investments will be used to cover expenses
          </Text>
        </CardHeader>
        
        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4} display="flex" alignItems="center">
                <Icon as={FaWallet} mr={2} color="blue.500" />
                Withdrawal Priority Order
              </Heading>
              <Text mb={4}>
                Arrange your investment accounts in the order you want them to be used for withdrawals.
                Accounts at the top will be used first.
              </Text>
              
              {withdrawalStrategy.accountPriority.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="withdrawal-priority">
                    {(provided) => (
                      <List 
                        spacing={3} 
                        mt={4}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {withdrawalStrategy.accountPriority.map((account, index) => (
                          <Draggable key={account} draggableId={account} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                p={3}
                                bg={listItemBg}
                                borderRadius="md"
                                boxShadow="sm"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                _hover={{ bg: listItemHoverBg }}
                              >
                                <Text fontWeight="medium">
                                  {index + 1}. {account}
                                </Text>
                                <Flex>
                                  <Tooltip label="Move up" placement="top">
                                    <IconButton
                                      aria-label="Move up"
                                      icon={<FaArrowUp />}
                                      size="sm"
                                      variant="ghost"
                                      isDisabled={index === 0}
                                      onClick={() => moveUp(index)}
                                      mr={1}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Move down" placement="top">
                                    <IconButton
                                      aria-label="Move down"
                                      icon={<FaArrowDown />}
                                      size="sm"
                                      variant="ghost"
                                      isDisabled={index === withdrawalStrategy.accountPriority.length - 1}
                                      onClick={() => moveDown(index)}
                                      mr={1}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Remove" placement="top">
                                    <IconButton
                                      aria-label="Remove account"
                                      icon={<Icon name="close" />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => removeAccount(account)}
                                    />
                                  </Tooltip>
                                </Flex>
                              </ListItem>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </List>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  No accounts selected for withdrawal priority
                </Text>
              )}
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="sm" mb={3}>Available Accounts:</Heading>
              {getAvailableAccounts().length > 0 ? (
                <List spacing={2}>
                  {getAvailableAccounts().map((account) => (
                    <ListItem 
                      key={account} 
                      p={2} 
                      borderRadius="md" 
                      _hover={{ bg: "gray.50", cursor: "pointer" }}
                      onClick={() => addAccount(account)}
                    >
                      <Flex align="center">
                        <Text>{account}</Text>
                        <Text ml={2} fontSize="sm" color="blue.500">
                          (Click to add)
                        </Text>
                      </Flex>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  All accounts have been added to the priority list
                </Text>
              )}
            </Box>
          </VStack>
        </CardBody>
      </Card>
      
      <Flex justify="space-between" mt={6}>
        <Button onClick={onBack} size="lg" variant="outline">
          Back
        </Button>
        <Button onClick={onContinue} size="lg" colorScheme="blue">
          Continue
        </Button>
      </Flex>
    </Box>
  );
};

export default WithdrawalStrategyForm; 