import React, { useState, useEffect } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  HStack,
  NumberInput,
  NumberInputField,
  Text,
  Button,
  Box,
  Stack,
} from "@chakra-ui/react";
import { CommonFields } from "./CommonFields";
import axios from "axios";

interface RebalanceEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
}

export const RebalanceEventSeriesForm: React.FC<RebalanceEventSeriesFormProps> = ({
  onBack,
  onEventAdded,
  existingEvents,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startYear, setStartYear] = useState<any>({
    type: "fixed",
    value: new Date().getFullYear(),
  });
  const [duration, setDuration] = useState<any>({
    type: "fixed",
    value: 1,
  });

  const [selectedTaxStatus, setSelectedTaxStatus] = useState<"non-retirement" | "pre-tax" | "after-tax" | "">("");
  const [investments, setInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [assetAllocation, setAssetAllocation] = useState<{
    type: "fixed" | "glidePath";
    investments: {
      investment: string;
      initialPercentage: number;
      finalPercentage?: number;
    }[];
  }>({
    type: "fixed",
    investments: [],
  });

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/investments", {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setInvestments(response.data);
      } catch (error) {
        console.error("Failed to fetch investments:", error);
      } finally {
        setLoadingInvestments(false);
      }
    };
    fetchInvestments();
  }, []);

  const handleTaxStatusChange = (value: string) => {
    setSelectedTaxStatus(value as "non-retirement" | "pre-tax" | "after-tax");
    setAssetAllocation({
      type: "fixed",
      investments: investments.map((inv) => ({
        investment: inv.id,
        initialPercentage: 0,
      })),
    });
  };

  const validateAllocationPercentages = (percentages: number[]) => {
    const sum = percentages.reduce((acc, val) => acc + (val || 0), 0);
    return Math.abs(sum - 100) < 0.01;
  };

  const renderAllocationInputs = (
    values: number[],
    onChange: (index: number, value: number) => void
  ) => {
    const filteredInvestments = investments.filter(
      (inv) => inv.taxStatus === selectedTaxStatus
    );
    return (
      <VStack spacing={4} align="stretch">
        {filteredInvestments.length === 0 ? (
          <Text>No investments with selected tax status available.</Text>
        ) : (
          <>
            {filteredInvestments.map((inv, index) => {
              const originalIndex = investments.findIndex(
                (originalInv) => originalInv.id === inv.id
              );
              return (
                <FormControl key={inv.id} isRequired>
                  <FormLabel>
                    {inv.investmentType} ({inv.taxStatus}) (%)
                  </FormLabel>
                  <NumberInput
                    value={values[originalIndex] || 0}
                    onChange={(value) => onChange(originalIndex, parseFloat(value) || 0)}
                    min={0}
                    max={100}
                    precision={2}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              );
            })}
            <Text color={validateAllocationPercentages(values) ? "green.500" : "red.500"}>
              Total: {values.reduce((acc, val) => acc + (val || 0), 0).toFixed(2)}%
              {!validateAllocationPercentages(values) && " (must equal 100%)"}
            </Text>
          </>
        )}
      </VStack>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      type: "rebalance",
      name,
      description,
      startYear,
      duration,
      selectedTaxStatus,
      assetAllocation: {
        type: assetAllocation.type,
        investments: assetAllocation.investments.map((inv) => ({
          investment: inv.investment,
          initialPercentage: inv.initialPercentage || 0,
          ...(assetAllocation.type === "glidePath" ? { finalPercentage: inv.finalPercentage || 0 } : {}),
        })),
      },
    };
    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedTaxStatus("");
    setStartYear({ type: "fixed", value: new Date().getFullYear() });
    setDuration({ type: "fixed", value: 1 });
    setAssetAllocation({
      type: "fixed",
      investments: investments.map((inv) => ({
        investment: inv.id,
        initialPercentage: 0,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <CommonFields
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          startYear={startYear}
          setStartYear={setStartYear}
          duration={duration}
          setDuration={setDuration}
          existingEvents={existingEvents}
        />
        <FormControl isRequired>
          <FormLabel>Account Tax Status</FormLabel>
          <Select
            value={selectedTaxStatus}
            onChange={(e) => handleTaxStatusChange(e.target.value)}
            placeholder="Select account type"
          >
            <option value="non-retirement">Non-Retirement</option>
            <option value="pre-tax">Pre-Tax</option>
            <option value="after-tax">After-Tax</option>
          </Select>
        </FormControl>
        {loadingInvestments ? (
          <Box p={4} bg="gray.50" borderRadius="lg">
            <Text>Loading investments...</Text>
          </Box>
        ) : investments.length === 0 ? (
          <Box p={4} bg="gray.50" borderRadius="lg">
            <Text>No investments available. Please add some investments first.</Text>
          </Box>
        ) : !selectedTaxStatus ? (
          <Box p={4} bg="gray.50" borderRadius="lg">
            <Text>Please select an account tax status first.</Text>
          </Box>
        ) : (
          <Box p={4} bg="gray.50" borderRadius="lg">
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Asset Allocation Type</FormLabel>
                <Select
                  value={assetAllocation.type}
                  onChange={(e) => {
                    const type = e.target.value as "fixed" | "glidePath";
                    setAssetAllocation({
                      type,
                      investments: investments.map((inv) => ({
                        investment: inv.id,
                        initialPercentage: 0,
                        ...(type === "glidePath" ? { finalPercentage: 0 } : {}),
                      })),
                    });
                  }}
                >
                  <option value="fixed">Fixed Percentages</option>
                  <option value="glidePath">Glide Path</option>
                </Select>
              </FormControl>
              {assetAllocation.type === "fixed" ? (
                <Box>
                  <Text fontSize="lg" mb={4}>
                    Fixed Asset Allocation
                  </Text>
                  {renderAllocationInputs(
                    assetAllocation.investments.map((inv) => inv.initialPercentage),
                    (index, value) => {
                      const newInvestments = [...assetAllocation.investments];
                      newInvestments[index] = { ...newInvestments[index], initialPercentage: value };
                      setAssetAllocation({
                        ...assetAllocation,
                        investments: newInvestments,
                      });
                    }
                  )}
                </Box>
              ) : (
                <Box>
                  <Text fontSize="lg" mb={4}>
                    Initial Asset Allocation
                  </Text>
                  {renderAllocationInputs(
                    assetAllocation.investments.map((inv) => inv.initialPercentage),
                    (index, value) => {
                      const newInvestments = [...assetAllocation.investments];
                      newInvestments[index] = { ...newInvestments[index], initialPercentage: value };
                      setAssetAllocation({
                        ...assetAllocation,
                        investments: newInvestments,
                      });
                    }
                  )}
                  <Text fontSize="lg" mt={6} mb={4}>
                    Final Asset Allocation
                  </Text>
                  {renderAllocationInputs(
                    assetAllocation.investments.map((inv) => inv.finalPercentage || 0),
                    (index, value) => {
                      const newInvestments = [...assetAllocation.investments];
                      newInvestments[index] = { ...newInvestments[index], finalPercentage: value };
                      setAssetAllocation({
                        ...assetAllocation,
                        investments: newInvestments,
                      });
                    }
                  )}
                </Box>
              )}
            </VStack>
          </Box>
        )}
        <HStack spacing={4} justify="flex-end">
          {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
          <Button type="submit" colorScheme="blue">Save</Button>
        </HStack>
      </VStack>
    </form>
  );
};
