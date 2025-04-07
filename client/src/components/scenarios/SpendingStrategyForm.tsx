import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  Checkbox,
  Divider,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Flex,
  Icon,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Tooltip,
  Badge,
} from "@chakra-ui/react";
import { MdCheckCircle } from "react-icons/md";
import { FaMoneyBillWave, FaArrowUp, FaArrowDown, FaTimes } from "react-icons/fa";
import spendingStrategyStorage from "../../services/spendingStrategyStorage";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export interface SpendingStrategy {
  id?: string;
  // This will be an array of expense names that are considered discretionary
  availableExpenses: string[];  // All available expenses
  selectedExpenses: string[];   // Selected discretionary expenses
}

interface SpendingStrategyFormProps {
  spendingStrategy: SpendingStrategy;
  onChangeSpendingStrategy: (strategy: SpendingStrategy) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const SpendingStrategyForm: React.FC<SpendingStrategyFormProps> = ({
  spendingStrategy,
  onChangeSpendingStrategy,
  onContinue,
  onBack,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const listItemBg = useColorModeValue("gray.50", "gray.700");
  const listItemHoverBg = useColorModeValue("gray.100", "gray.600");
  
  // Add useEffect to log the current spending strategy whenever it changes
  useEffect(() => {
    console.log("Current spending strategy:", spendingStrategy);
  }, [spendingStrategy]);
  
  // Handle checkbox changes
  const handleExpenseToggle = (expenseName: string) => {
    const isSelected = spendingStrategy.selectedExpenses.includes(expenseName);
    
    let updatedSelectedExpenses;
    if (isSelected) {
      // Remove from selected
      updatedSelectedExpenses = spendingStrategy.selectedExpenses.filter(
        (name) => name !== expenseName
      );
    } else {
      // Add to selected
      updatedSelectedExpenses = [...spendingStrategy.selectedExpenses, expenseName];
    }
    
    const updatedStrategy = {
      ...spendingStrategy,
      selectedExpenses: updatedSelectedExpenses,
    };
    
    // Log the updated strategy before sending it to parent
    console.log("Updated spending strategy:", updatedStrategy);
    
    // Save to localStorage immediately for auto-save functionality
    try {
      if (updatedStrategy.id) {
        spendingStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      } else {
        // Only add to localStorage if this is the first change
        if (updatedSelectedExpenses.length === 1 && !isSelected) {
          const savedStrategy = spendingStrategyStorage.add(updatedStrategy);
          // Update with the new ID
          updatedStrategy.id = savedStrategy.id;
        }
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeSpendingStrategy(updatedStrategy);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(spendingStrategy.selectedExpenses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const updatedStrategy = {
      ...spendingStrategy,
      selectedExpenses: items,
    };
    
    // Save to localStorage
    try {
      if (updatedStrategy.id) {
        spendingStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeSpendingStrategy(updatedStrategy);
  };

  // Move an expense up in priority
  const moveUp = (index: number) => {
    if (index <= 0) return;
    
    const newSelectedExpenses = [...spendingStrategy.selectedExpenses];
    const temp = newSelectedExpenses[index];
    newSelectedExpenses[index] = newSelectedExpenses[index - 1];
    newSelectedExpenses[index - 1] = temp;
    
    const updatedStrategy = {
      ...spendingStrategy,
      selectedExpenses: newSelectedExpenses,
    };
    
    // Save to localStorage
    try {
      if (updatedStrategy.id) {
        spendingStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeSpendingStrategy(updatedStrategy);
  };

  // Move an expense down in priority
  const moveDown = (index: number) => {
    if (index >= spendingStrategy.selectedExpenses.length - 1) return;
    
    const newSelectedExpenses = [...spendingStrategy.selectedExpenses];
    const temp = newSelectedExpenses[index];
    newSelectedExpenses[index] = newSelectedExpenses[index + 1];
    newSelectedExpenses[index + 1] = temp;
    
    const updatedStrategy = {
      ...spendingStrategy,
      selectedExpenses: newSelectedExpenses,
    };
    
    // Save to localStorage
    try {
      if (updatedStrategy.id) {
        spendingStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeSpendingStrategy(updatedStrategy);
  };

  // Remove an expense from the selected list
  const removeExpense = (expenseName: string) => {
    const updatedSelectedExpenses = spendingStrategy.selectedExpenses.filter(
      (name) => name !== expenseName
    );
    
    const updatedStrategy = {
      ...spendingStrategy,
      selectedExpenses: updatedSelectedExpenses,
    };
    
    // Save to localStorage
    try {
      if (updatedStrategy.id) {
        spendingStrategyStorage.update(updatedStrategy.id, updatedStrategy);
      }
    } catch (error) {
      console.error("Error auto-saving to localStorage:", error);
    }
    
    onChangeSpendingStrategy(updatedStrategy);
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
          <Heading size="lg">Spending Strategy</Heading>
          <Text mt={2}>
            Select which expenses are discretionary and can be reduced in difficult financial times
          </Text>
        </CardHeader>
        
        <CardBody p={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4} display="flex" alignItems="center">
                <Icon as={FaMoneyBillWave} mr={2} color="blue.500" />
                Discretionary Expenses
              </Heading>
              <Text mb={4}>
                Discretionary expenses are non-essential costs that can be reduced or eliminated 
                during financial hardship. Select the expenses that you consider discretionary:
              </Text>
              
              {spendingStrategy.availableExpenses.length > 0 ? (
                <List spacing={3} mt={4}>
                  {spendingStrategy.availableExpenses.map((expense) => (
                    <ListItem key={expense} p={2} borderRadius="md" _hover={{ bg: "gray.50" }}>
                      <Checkbox
                        isChecked={spendingStrategy.selectedExpenses.includes(expense)}
                        onChange={() => handleExpenseToggle(expense)}
                        colorScheme="blue"
                        size="lg"
                      >
                        <Text fontWeight="medium">{expense}</Text>
                      </Checkbox>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Text color="gray.500" fontStyle="italic">
                  No expenses available. Please add expense events first.
                </Text>
              )}
            </Box>
            
            <Divider />
            
            <Box>
              <Heading size="sm" mb={3}>Selected Discretionary Expenses: </Heading>
              <Text mb={4}>The order represents priority — the higher the item, the earlier it will be reduced.</Text>
              
              {spendingStrategy.selectedExpenses.length > 0 ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="discretionary-expenses">
                    {(provided) => (
                      <List 
                        spacing={2} 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {spendingStrategy.selectedExpenses.map((expense, index) => (
                          <Draggable key={expense} draggableId={expense} index={index}>
                            {(provided) => (
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={3}
                                bg={listItemBg}
                                borderRadius="md"
                                borderWidth="1px"
                                borderColor={borderColor}
                                mb={2}
                                _hover={{ bg: listItemHoverBg }}
                              >
                                <Flex align="center">
                                  <ListIcon as={MdCheckCircle} color="green.500" />
                                  <Text fontWeight="medium">{expense}</Text>
                                </Flex>
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
                                      isDisabled={index === spendingStrategy.selectedExpenses.length - 1}
                                      onClick={() => moveDown(index)}
                                      mr={1}
                                    />
                                  </Tooltip>
                                  <Tooltip label="Remove" placement="top">
                                    <IconButton
                                      aria-label="Remove expense"
                                      icon={<FaTimes />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => removeExpense(expense)}
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
                  No discretionary expenses selected
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

export default SpendingStrategyForm; 