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
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Flex,
  Text,
  Divider,
  IconButton,
  useColorModeValue
} from '@chakra-ui/react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface AssetAllocation {
  investment: string;
  percentage: number;
}

interface AddEventSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (eventSeries: any) => void;
  existingEventSeries: any[];
  investments: any[];
}

const AddEventSeriesModal: React.FC<AddEventSeriesModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingEventSeries,
  investments
}) => {
  const [eventType, setEventType] = useState<'income' | 'expense' | 'invest' | 'rebalance'>('income');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startYearType: 'fixed',
    startYearValue: new Date().getFullYear(),
    startYearMin: new Date().getFullYear(),
    startYearMax: new Date().getFullYear() + 10,
    startYearMean: new Date().getFullYear() + 5,
    startYearStdDev: 2,
    startYearEventSeries: '',
    durationType: 'fixed',
    durationValue: 1,
    durationMin: 1,
    durationMax: 30,
    durationMean: 10,
    durationStdDev: 3,
    amount: '',
    annualChangeType: 'fixed',
    annualChangeValue: '0',
    annualChangeMin: '0',
    annualChangeMax: '5',
    annualChangeMean: '2',
    annualChangeStdDev: '1',
    inflationAdjusted: false,
    isSocialSecurity: false,
    isDiscretionary: false,
    assetAllocation: [] as AssetAllocation[],
    maxCash: '10000'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSwitchChange = (id: string) => {
    setFormData({ ...formData, [id]: !formData[id as keyof typeof formData] });
  };

  const handleNumberInputChange = (id: string, value: string) => {
    setFormData({ ...formData, [id]: value });
  };

  const handleAddAllocation = () => {
    if (investments.length > 0) {
      setFormData({
        ...formData,
        assetAllocation: [
          ...formData.assetAllocation,
          { investment: investments[0].name, percentage: 0 }
        ]
      });
    }
  };

  const handleRemoveAllocation = (index: number) => {
    const newAllocation = [...formData.assetAllocation];
    newAllocation.splice(index, 1);
    setFormData({ ...formData, assetAllocation: newAllocation });
  };

  const handleAllocationChange = (index: number, field: 'investment' | 'percentage', value: string | number) => {
    const newAllocation = [...formData.assetAllocation];
    if (field === 'percentage') {
      newAllocation[index].percentage = Number(value);
    } else {
      newAllocation[index].investment = value as string;
    }
    setFormData({ ...formData, assetAllocation: newAllocation });
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.name) {
      alert('Please enter a name for the event series');
      return;
    }

    // Check if allocation percentages sum to 100 for invest and rebalance
    if ((eventType === 'invest' || eventType === 'rebalance') && 
        formData.assetAllocation.length > 0) {
      const sum = formData.assetAllocation.reduce((acc, curr) => acc + curr.percentage, 0);
      if (sum !== 100) {
        alert('Asset allocation percentages must sum to 100%');
        return;
      }
    }

    // Create event series object
    const eventSeries = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      type: eventType,
      startYear: formData.startYearType === 'fixed' 
        ? formData.startYearValue 
        : `${formData.startYearType} (${formData.startYearMin}-${formData.startYearMax})`,
      duration: formData.durationType === 'fixed'
        ? formData.durationValue
        : `${formData.durationType} (${formData.durationMin}-${formData.durationMax})`,
    };

    // Add type-specific properties
    if (eventType === 'income' || eventType === 'expense') {
      Object.assign(eventSeries, {
        amount: formData.amount,
        annualChange: formData.annualChangeType === 'fixed'
          ? formData.annualChangeValue + '%'
          : `${formData.annualChangeType} (${formData.annualChangeMin}%-${formData.annualChangeMax}%)`,
        inflationAdjusted: formData.inflationAdjusted
      });

      if (eventType === 'income') {
        Object.assign(eventSeries, {
          isSocialSecurity: formData.isSocialSecurity
        });
      } else if (eventType === 'expense') {
        Object.assign(eventSeries, {
          isDiscretionary: formData.isDiscretionary
        });
      }
    } else if (eventType === 'invest' || eventType === 'rebalance') {
      Object.assign(eventSeries, {
        assetAllocation: formData.assetAllocation
      });

      if (eventType === 'invest') {
        Object.assign(eventSeries, {
          maxCash: formData.maxCash
        });
      }
    }

    onAdd(eventSeries);
    onClose();
    
    // Reset form
    setEventType('income');
    setFormData({
      name: '',
      description: '',
      startYearType: 'fixed',
      startYearValue: new Date().getFullYear(),
      startYearMin: new Date().getFullYear(),
      startYearMax: new Date().getFullYear() + 10,
      startYearMean: new Date().getFullYear() + 5,
      startYearStdDev: 2,
      startYearEventSeries: '',
      durationType: 'fixed',
      durationValue: 1,
      durationMin: 1,
      durationMax: 30,
      durationMean: 10,
      durationStdDev: 3,
      amount: '',
      annualChangeType: 'fixed',
      annualChangeValue: '0',
      annualChangeMin: '0',
      annualChangeMax: '5',
      annualChangeMean: '2',
      annualChangeStdDev: '1',
      inflationAdjusted: false,
      isSocialSecurity: false,
      isDiscretionary: false,
      assetAllocation: [],
      maxCash: '10000'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Event Series</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl mb={4}>
            <FormLabel>Event Type</FormLabel>
            <Select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="invest">Investment Strategy</option>
              <option value="rebalance">Rebalance Strategy</option>
            </Select>
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Name</FormLabel>
            <Input
              id="name"
              placeholder="Enter event series name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea
              id="description"
              placeholder="Enter event series description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Start Year</FormLabel>
            <Select
              id="startYearType"
              value={formData.startYearType}
              onChange={handleInputChange}
              mb={2}
            >
              <option value="fixed">Fixed Year</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
              <option value="sameAs">Same as Another Event Series</option>
              <option value="afterEnd">After Another Event Series Ends</option>
            </Select>

            {formData.startYearType === 'fixed' && (
              <NumberInput
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 50}
                value={formData.startYearValue}
                onChange={(value) => handleNumberInputChange("startYearValue", value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}

            {(formData.startYearType === 'uniform' || formData.startYearType === 'normal') && (
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Min</FormLabel>
                  <NumberInput
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 50}
                    value={formData.startYearMin}
                    onChange={(value) => handleNumberInputChange("startYearMin", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Max</FormLabel>
                  <NumberInput
                    min={new Date().getFullYear()}
                    max={new Date().getFullYear() + 50}
                    value={formData.startYearMax}
                    onChange={(value) => handleNumberInputChange("startYearMax", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Flex>
            )}

            {(formData.startYearType === 'sameAs' || formData.startYearType === 'afterEnd') && (
              <Select
                id="startYearEventSeries"
                value={formData.startYearEventSeries}
                onChange={handleInputChange}
              >
                <option value="">Select an event series</option>
                {existingEventSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.name}
                  </option>
                ))}
              </Select>
            )}
          </FormControl>

          <FormControl mb={4}>
            <FormLabel>Duration (Years)</FormLabel>
            <Select
              id="durationType"
              value={formData.durationType}
              onChange={handleInputChange}
              mb={2}
            >
              <option value="fixed">Fixed Duration</option>
              <option value="uniform">Uniform Distribution</option>
              <option value="normal">Normal Distribution</option>
            </Select>

            {formData.durationType === 'fixed' && (
              <NumberInput
                min={1}
                max={50}
                value={formData.durationValue}
                onChange={(value) => handleNumberInputChange("durationValue", value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            )}

            {(formData.durationType === 'uniform' || formData.durationType === 'normal') && (
              <Flex gap={4}>
                <FormControl>
                  <FormLabel>Min</FormLabel>
                  <NumberInput
                    min={1}
                    max={50}
                    value={formData.durationMin}
                    onChange={(value) => handleNumberInputChange("durationMin", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel>Max</FormLabel>
                  <NumberInput
                    min={1}
                    max={50}
                    value={formData.durationMax}
                    onChange={(value) => handleNumberInputChange("durationMax", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Flex>
            )}
          </FormControl>

          {/* Income and Expense specific fields */}
          {(eventType === 'income' || eventType === 'expense') && (
            <>
              <FormControl mb={4}>
                <FormLabel>Initial Amount</FormLabel>
                <Input
                  id="amount"
                  placeholder="Enter initial amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Annual Change</FormLabel>
                <Select
                  id="annualChangeType"
                  value={formData.annualChangeType}
                  onChange={handleInputChange}
                  mb={2}
                >
                  <option value="fixed">Fixed Percentage</option>
                  <option value="uniform">Uniform Distribution</option>
                  <option value="normal">Normal Distribution</option>
                </Select>

                {formData.annualChangeType === 'fixed' && (
                  <NumberInput
                    min={-20}
                    max={20}
                    step={0.1}
                    value={formData.annualChangeValue}
                    onChange={(value) => handleNumberInputChange("annualChangeValue", value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                )}

                {(formData.annualChangeType === 'uniform' || formData.annualChangeType === 'normal') && (
                  <Flex gap={4}>
                    <FormControl>
                      <FormLabel>Min %</FormLabel>
                      <NumberInput
                        min={-20}
                        max={20}
                        step={0.1}
                        value={formData.annualChangeMin}
                        onChange={(value) => handleNumberInputChange("annualChangeMin", value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Max %</FormLabel>
                      <NumberInput
                        min={-20}
                        max={20}
                        step={0.1}
                        value={formData.annualChangeMax}
                        onChange={(value) => handleNumberInputChange("annualChangeMax", value)}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Flex>
                )}
              </FormControl>

              <FormControl display="flex" alignItems="center" mb={4}>
                <FormLabel mb="0">Inflation Adjusted</FormLabel>
                <Switch
                  isChecked={formData.inflationAdjusted}
                  onChange={() => handleSwitchChange('inflationAdjusted')}
                />
              </FormControl>

              {eventType === 'income' && (
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel mb="0">Social Security Income</FormLabel>
                  <Switch
                    isChecked={formData.isSocialSecurity}
                    onChange={() => handleSwitchChange('isSocialSecurity')}
                  />
                </FormControl>
              )}

              {eventType === 'expense' && (
                <FormControl display="flex" alignItems="center" mb={4}>
                  <FormLabel mb="0">Discretionary Expense</FormLabel>
                  <Switch
                    isChecked={formData.isDiscretionary}
                    onChange={() => handleSwitchChange('isDiscretionary')}
                  />
                </FormControl>
              )}
            </>
          )}

          {/* Invest and Rebalance specific fields */}
          {(eventType === 'invest' || eventType === 'rebalance') && (
            <>
              <FormControl mb={4}>
                <FormLabel>Asset Allocation</FormLabel>
                <Box
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  mb={2}
                  bg={useColorModeValue('gray.50', 'gray.700')}
                >
                  {formData.assetAllocation.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      No investments added. Click the button below to add investments.
                    </Text>
                  ) : (
                    formData.assetAllocation.map((allocation, index) => (
                      <Flex key={index} mb={2} alignItems="center">
                        <Select
                          size="sm"
                          value={allocation.investment}
                          onChange={(e) => handleAllocationChange(index, 'investment', e.target.value)}
                          mr={2}
                          flex="2"
                        >
                          {investments.map((investment) => (
                            <option key={investment.id} value={investment.name}>
                              {investment.name}
                            </option>
                          ))}
                        </Select>
                        <NumberInput
                          size="sm"
                          min={0}
                          max={100}
                          value={allocation.percentage}
                          onChange={(value) => handleAllocationChange(index, 'percentage', value)}
                          flex="1"
                          mr={2}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text mr={2}>%</Text>
                        <IconButton
                          aria-label="Remove investment"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleRemoveAllocation(index)}
                        />
                      </Flex>
                    ))
                  )}
                </Box>
                <Button
                  leftIcon={<FaPlus />}
                  size="sm"
                  onClick={handleAddAllocation}
                  isDisabled={investments.length === 0}
                >
                  Add Investment
                </Button>
                {formData.assetAllocation.length > 0 && (
                  <Text fontSize="sm" mt={1} color={
                    formData.assetAllocation.reduce((acc, curr) => acc + curr.percentage, 0) === 100
                      ? "green.500"
                      : "red.500"
                  }>
                    Total: {formData.assetAllocation.reduce((acc, curr) => acc + curr.percentage, 0)}% 
                    {formData.assetAllocation.reduce((acc, curr) => acc + curr.percentage, 0) !== 100 && 
                      " (must equal 100%)"}
                  </Text>
                )}
              </FormControl>

              {eventType === 'invest' && (
                <FormControl mb={4}>
                  <FormLabel>Maximum Cash</FormLabel>
                  <Input
                    id="maxCash"
                    placeholder="Enter maximum cash amount"
                    value={formData.maxCash}
                    onChange={handleInputChange}
                  />
                </FormControl>
              )}
            </>
          )}
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

export default AddEventSeriesModal; 