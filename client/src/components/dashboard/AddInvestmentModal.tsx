import React from 'react';
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';

interface Investment {
  name: string;
  description: string;
  value: string;
  returnRate: number;
  status: string;
  returnType: string;
  expenseRatio: number;
  dividendType: string;
  taxability: string;
}

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  newInvestment: Investment;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleNumberInputChange: (id: string, value: string) => void;
  handleCreateInvestment: () => void;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({
  isOpen,
  onClose,
  newInvestment,
  handleInputChange,
  handleNumberInputChange,
  handleCreateInvestment
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Investment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form>
            <FormControl mb={4} isRequired>
              <FormLabel>Investment Name</FormLabel>
              <Input
                id="name"
                placeholder="Enter investment name"
                value={newInvestment.name}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Description</FormLabel>
              <Textarea
                id="description"
                placeholder="Enter investment description"
                value={newInvestment.description}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl mb={4} isRequired>
              <FormLabel>Current Value</FormLabel>
              <Input
                id="value"
                placeholder="Enter current value"
                value={newInvestment.value}
                onChange={handleInputChange}
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Expected Annual Return (%)</FormLabel>
              <NumberInput
                min={-100}
                max={100}
                step={0.1}
                value={newInvestment.returnRate}
                onChange={(value) => handleNumberInputChange("returnRate", value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Expected Annual Return Type</FormLabel>
              <Select
                id="returnType"
                value={newInvestment.returnType}
                onChange={handleInputChange}
              >
                <option value="fixed">Fixed Amount/Percentage</option>
                <option value="normal">Normal Distribution</option>
                <option value="gbm">Geometric Brownian Motion (GBM)</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Expense Ratio (%)</FormLabel>
              <NumberInput
                min={0}
                max={10}
                step={0.01}
                value={newInvestment.expenseRatio}
                onChange={(value) => handleNumberInputChange("expenseRatio", value)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Expected Annual Dividend Type</FormLabel>
              <Select
                id="dividendType"
                value={newInvestment.dividendType}
                onChange={handleInputChange}
              >
                <option value="fixed">Fixed Amount/Percentage</option>
                <option value="normal">Normal Distribution</option>
                <option value="gbm">Geometric Brownian Motion (GBM)</option>
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Taxability</FormLabel>
              <Select
                id="taxability"
                value={newInvestment.taxability}
                onChange={handleInputChange}
              >
                <option value="tax-exempt">Tax-Exempt (e.g., Municipal Bonds)</option>
                <option value="taxable">Taxable</option>
              </Select>
            </FormControl>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleCreateInvestment}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInvestmentModal; 