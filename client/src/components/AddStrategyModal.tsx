import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Box,
  Flex,
  Text,
  IconButton,
  useColorModeValue,
  OrderedList,
  ListItem
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface AddStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (strategy: any) => void;
  type: 'spending' | 'withdrawal';
  investments: any[];
  expenses: any[];
}

const AddStrategyModal: React.FC<AddStrategyModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  type,
  investments,
  expenses
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleAddItem = () => {
    const availableItems = type === 'spending' ? expenses : investments;
    const unusedItems = availableItems.filter(item => !formData.items.includes(item.name));
    
    if (unusedItems.length > 0) {
      setFormData({
        ...formData,
        items: [...formData.items, unusedItems[0].name]
      });
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formData.items.length - 1)
    ) {
      return;
    }

    const newItems = [...formData.items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    setFormData({ ...formData, items: newItems });
  };

  const handleChangeItem = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.name) {
      alert('Please enter a name for the strategy');
      return;
    }

    if (formData.items.length === 0) {
      alert(`Please add at least one ${type === 'spending' ? 'expense' : 'investment'} to the strategy`);
      return;
    }

    // Create strategy object
    const strategy = {
      id: Date.now(),
      name: formData.name,
      type,
      description: formData.description,
      items: formData.items
    };

    // Add strategy
    onAdd(strategy);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {type === 'spending' ? 'Add Spending Strategy' : 'Add Withdrawal Strategy'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4} isRequired>
            <FormLabel>Strategy Name</FormLabel>
            <Input
              id="name"
              placeholder="Enter strategy name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              id="description"
              placeholder="Enter strategy description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>
              {type === 'spending' 
                ? 'Discretionary Expense Priority' 
                : 'Investment Withdrawal Order'}
            </FormLabel>
            <Box
              borderWidth="1px"
              borderRadius="md"
              p={3}
              mb={2}
              bg={useColorModeValue('gray.50', 'gray.700')}
            >
              {formData.items.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No items added. Click the button below to add items.
                </Text>
              ) : (
                <OrderedList pl={4} spacing={2}>
                  {formData.items.map((item, index) => (
                    <ListItem key={index}>
                      <Flex alignItems="center">
                        <Select
                          size="sm"
                          value={item}
                          onChange={(e) => handleChangeItem(index, e.target.value)}
                          mr={2}
                          flex="1"
                        >
                          {(type === 'spending' ? expenses : investments).map((option) => (
                            <option 
                              key={option.id} 
                              value={option.name}
                              disabled={formData.items.includes(option.name) && formData.items.indexOf(option.name) !== index}
                            >
                              {option.name}
                            </option>
                          ))}
                        </Select>
                        <IconButton
                          aria-label="Move up"
                          icon={<FaArrowUp />}
                          size="sm"
                          variant="ghost"
                          isDisabled={index === 0}
                          onClick={() => handleMoveItem(index, 'up')}
                          mr={1}
                        />
                        <IconButton
                          aria-label="Move down"
                          icon={<FaArrowDown />}
                          size="sm"
                          variant="ghost"
                          isDisabled={index === formData.items.length - 1}
                          onClick={() => handleMoveItem(index, 'down')}
                          mr={1}
                        />
                        <IconButton
                          aria-label="Remove item"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveItem(index)}
                        />
                      </Flex>
                    </ListItem>
                  ))}
                </OrderedList>
              )}
            </Box>
            <Button
              leftIcon={<FaPlus />}
              size="sm"
              onClick={handleAddItem}
              isDisabled={
                type === 'spending' 
                  ? expenses.length === formData.items.length
                  : investments.length === formData.items.length
              }
            >
              Add {type === 'spending' ? 'Expense' : 'Investment'}
            </Button>
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddStrategyModal; 