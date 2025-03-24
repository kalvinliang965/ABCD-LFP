import React from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  HStack,
  Tooltip,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
} from "@chakra-ui/react";

export type ScenarioType = "individual" | "couple";

export type ScenarioDetails = {
  name: string;
  type: ScenarioType;
  userBirthYear: number;
  spouseBirthYear?: number;
};

interface ScenarioDetailsFormProps {
  scenarioDetails: ScenarioDetails;
  onChangeScenarioType: (value: string) => void;
  onChangeScenarioDetails: (details: ScenarioDetails) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export const ScenarioDetailsForm: React.FC<ScenarioDetailsFormProps> = ({
  scenarioDetails,
  onChangeScenarioType,
  onChangeScenarioDetails,
  onContinue,
  onSkip,
}) => {
  return (
    <Box minH="100vh" bg="gray.50">
      <Box maxW="4xl" mx="auto" py={12} px={4}>
        <Box bg="white" rounded="lg" shadow="lg" overflow="hidden">
          <Box p={6}>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="lg" color="gray.900">
                New Scenario
              </Heading>
              <HStack spacing={2}>
                <Tooltip label="Skip this step" placement="left">
                  <Button variant="ghost" colorScheme="blue" onClick={onSkip}>
                    Skip
                  </Button>
                </Tooltip>
                <Button
                  colorScheme="blue"
                  onClick={onContinue}
                  isDisabled={!scenarioDetails.name}
                >
                  Next
                </Button>
              </HStack>
            </Flex>

            <Text color="gray.600" mb={6}>
              Enter the basic details for your financial scenario.
            </Text>

            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Scenario Name</FormLabel>
                <Input
                  value={scenarioDetails.name}
                  onChange={(e) =>
                    onChangeScenarioDetails({
                      ...scenarioDetails,
                      name: e.target.value,
                    })
                  }
                  placeholder="My Financial Plan"
                />
              </FormControl>

              <FormControl as="fieldset">
                <FormLabel as="legend" fontWeight="medium">
                  Scenario Type
                </FormLabel>
                <RadioGroup
                  value={scenarioDetails.type}
                  onChange={onChangeScenarioType}
                >
                  <Stack direction="row" spacing={5}>
                    <Radio value="individual">Individual</Radio>
                    <Radio value="couple">Couple</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Your Birth Year</FormLabel>
                  <NumberInput
                    min={1900}
                    max={new Date().getFullYear()}
                    value={scenarioDetails.userBirthYear}
                    onChange={(_, value) =>
                      onChangeScenarioDetails({
                        ...scenarioDetails,
                        userBirthYear: value,
                      })
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              {scenarioDetails.type === "couple" && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium">Spouse Birth Year</FormLabel>
                    <NumberInput
                      min={1900}
                      max={new Date().getFullYear()}
                      value={scenarioDetails.spouseBirthYear}
                      onChange={(_, value) =>
                        onChangeScenarioDetails({
                          ...scenarioDetails,
                          spouseBirthYear: value,
                        })
                      }
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              )}
            </VStack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ScenarioDetailsForm;
