import React, { useState, useEffect } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Box,
} from "@chakra-ui/react";
import { CommonFields } from "./CommonFields";
import { AmountChangeType } from "../../types/eventSeries";
import axios from "axios";

interface InvestEventSeriesFormProps {
  onBack?: () => void;
  onEventAdded?: (event: any) => void;
  existingEvents: { name: string }[];
}

export const InvestEventSeriesForm: React.FC<InvestEventSeriesFormProps> = ({
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

  const [maxCash, setMaxCash] = useState("");
  const [annualChange, setAnnualChange] = useState<AmountChangeType>({
    type: "fixed",
    value: undefined,
  });
  const [userPercentage, setUserPercentage] = useState(100);
  const [spousePercentage, setSpousePercentage] = useState(0);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);

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

  const handlePercentageChange = (isUser: boolean, value: string) => {
    const numValue = value === "" ? 0 : Math.min(100, Math.max(0, parseInt(value) || 0));
    if (isUser) {
      setUserPercentage(numValue);
      setSpousePercentage(100 - numValue);
    } else {
      setSpousePercentage(numValue);
      setUserPercentage(100 - numValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventData = {
      type: "invest",
      name,
      description,
      startYear,
      duration,
      maxCash: Number(maxCash) || 0,
      annualChange,
      userPercentage,
      spousePercentage,
    };
    if (onEventAdded) {
      onEventAdded(eventData);
    }
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMaxCash("");
    setUserPercentage(100);
    setSpousePercentage(0);
    setStartYear({ type: "fixed", value: new Date().getFullYear() });
    setDuration({ type: "fixed", value: 1 });
    setAnnualChange({ type: "fixed", value: undefined });
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
          <FormLabel>Maximum Cash Holdings ($)</FormLabel>
          <Input
            type="number"
            value={maxCash}
            onChange={(e) => setMaxCash(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
          />
        </FormControl>
        <HStack spacing={4} justify="flex-end">
          {onBack && <Button variant="ghost" onClick={onBack}>Cancel</Button>}
          <Button type="submit" colorScheme="blue">Save</Button>
        </HStack>
      </VStack>
    </form>
  );
};
