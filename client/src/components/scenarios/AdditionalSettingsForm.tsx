/**
 * Now I want you to help me design another page after the event series to ask the user about his
1. inflation assumption
2. financial goal
3. user's state of residence

This is the demand for financial goals
2.1 Financial goal
A financial goal is a non-negative number specifying the desired minimum total value of the user's investments. If a financial goal of 0 is achieved, it means the user is always able to meet their expenses. A positive value for the financial goal represents a safety margin during the user's lifetime and an estate to bequeath afterward.

We only assume a financial goal for one year, not for the entire plan.

The demand for inflation assumption is as follows:
2.6 Inflation assumption
An inflation assumption is defined by (1) a fixed percentage, or (2) a percentage sampled from a specified uniform or normal distribution.

For residence state, we only consider Ny, NJ and CT

Please use sequential thinking to think about how to add this new page after the event series and implement it
 */

import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  HStack,
  Icon,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Container,
  Badge,
} from "@chakra-ui/react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiTarget,
  FiMapPin,
  FiPercent,
} from "react-icons/fi";
import { StateType, DistributionType } from "../../types/Enum";
import { DistributionTypeConfig } from "../../types/ConfigTypes";
import { get_distribution_display } from "../../utils/DistributionTypeSwitch";

import {
  InflationSettings,
  FinancialGoalSettings,
  StateOfResidenceSettings,
  AfterTaxContributionSettings,
} from "./AdditionalSettings";

export type AdditionalSettingsConfig = {
  inflationConfig: DistributionTypeConfig;
  financialGoal: number;
  stateOfResidence: StateType;
  afterTaxContributionLimit: number;
};

export interface AdditionalSettingsFormProps {
  additionalSettings: AdditionalSettingsConfig;
  onChangeAdditionalSettings: (settings: AdditionalSettingsConfig) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const AdditionalSettingsForm: React.FC<AdditionalSettingsFormProps> = ({
  additionalSettings,
  onChangeAdditionalSettings: onChangeSettings,
  onBack,
  onContinue,
}) => {
  // UI color values
  const bg = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const statIconBg = useColorModeValue("blue.100", "blue.800");
  const statTextColor = useColorModeValue("gray.600", "gray.400");

  // Handler functions for each component
  const handle_change_inflation_config = (config: DistributionTypeConfig) => {
    onChangeSettings({
      ...additionalSettings,
      inflationConfig: config,
    });
  };

  const handle_change_financial_goal = (value: number) => {
    onChangeSettings({
      ...additionalSettings,
      financialGoal: value,
    });
  };

  const handle_change_state_of_residence = (state: StateType) => {
    onChangeSettings({
      ...additionalSettings,
      stateOfResidence: state,
    });
  };

  const handle_change_after_tax_contribution_limit = (value: number) => {
    onChangeSettings({
      ...additionalSettings,
      afterTaxContributionLimit: value,
    });
  };

  // Get state name from code(this is for display purpose)
  const get_state_name = (code: StateType) => {
    switch (code) {
      case StateType.NY:
        return "New York";
      case StateType.NJ:
        return "New Jersey";
      case StateType.CT:
        return "Connecticut";
      default:
        return code;
    }
  };

  // Get colored inflation type badge
  const get_inflation_type_badge = (type: DistributionType) => {
    switch (type) {
      case DistributionType.FIXED:
        return (
          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
            Fixed Rate
          </Badge>
        );
      case DistributionType.UNIFORM:
        return (
          <Badge colorScheme="orange" borderRadius="full" px={3} py={1}>
            Uniform Distribution
          </Badge>
        );
      case DistributionType.NORMAL:
        return (
          <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
            Normal Distribution
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Box minH="100vh" bg={bg} py={8}>
      <Container maxW="6xl" px={4}>
        <Card
          rounded="xl"
          shadow="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
          mb={8}
        >
          <CardHeader
            bg={useColorModeValue("blue.50", "blue.900")}
            py={6}
            px={8}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
          >
            <Flex justify="space-between" align="center">
              <HStack spacing={3}>
                <Icon as={FiSettings} boxSize={6} color="blue.500" />
                <Heading size="lg" fontWeight="bold">
                  Additional Settings
                </Heading>
              </HStack>
              <Button
                variant="ghost"
                colorScheme="blue"
                onClick={onBack}
                leftIcon={<Icon as={FiChevronLeft} />}
                size="md"
              >
                Back
              </Button>
            </Flex>
          </CardHeader>

          <CardBody p={0}>
            {/* Stats Overview */}
            <Flex
              direction={{ base: "column", md: "row" }}
              borderBottomWidth="1px"
              borderBottomColor={borderColor}
            >
              <Box
                p={6}
                borderRightWidth={{ base: 0, md: "1px" }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: "1px", md: 0 }}
                borderBottomColor={borderColor}
                flex="1"
              >
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiPercent} color="green.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Inflation Model
                  </Text>
                </HStack>
                <Flex align="center" gap={2}>
                  <Heading size="md" fontWeight="bold">
                    {get_inflation_type_badge(
                      additionalSettings.inflationConfig.type
                    )}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    {get_distribution_display(
                      additionalSettings.inflationConfig
                    )}
                  </Text>
                </Flex>
              </Box>

              <Box
                p={6}
                borderRightWidth={{ base: 0, md: "1px" }}
                borderRightColor={borderColor}
                borderBottomWidth={{ base: "1px", md: 0 }}
                borderBottomColor={borderColor}
                flex="1"
              >
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiTarget} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    Financial Goal
                  </Text>
                </HStack>
                <Heading size="lg" fontWeight="bold" color="green.500">
                  ${additionalSettings.financialGoal.toLocaleString()}
                </Heading>
              </Box>

              <Box p={6} flex="1">
                <HStack mb={2} spacing={3}>
                  <Flex
                    bg={statIconBg}
                    p={2}
                    borderRadius="md"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={FiMapPin} color="blue.500" boxSize={5} />
                  </Flex>
                  <Text fontSize="sm" fontWeight="medium" color={statTextColor}>
                    State of Residence
                  </Text>
                </HStack>
                <Heading size="md" fontWeight="bold">
                  {get_state_name(additionalSettings.stateOfResidence)}
                  <Badge ml={2} colorScheme="blue">
                    {additionalSettings.stateOfResidence}
                  </Badge>
                </Heading>
              </Box>
            </Flex>

            <Box p={8}>
              <Text fontSize="lg" fontWeight="medium" mb={6}>
                Configure additional important settings for your financial
                scenario, including inflation assumptions, financial goals, and
                state of residence.
              </Text>

              {/* After tax contribution limit */}
              <AfterTaxContributionSettings
                afterTaxContributionLimit={
                  additionalSettings.afterTaxContributionLimit
                }
                onChangeAfterTaxContributionLimit={
                  handle_change_after_tax_contribution_limit
                }
              />

              {/* Inflation Configuration */}
              <InflationSettings
                inflationConfig={additionalSettings.inflationConfig}
                onChangeInflationConfig={handle_change_inflation_config}
              />

              {/* Financial Goal */}
              <FinancialGoalSettings
                financialGoal={additionalSettings.financialGoal}
                onChangeFinancialGoal={handle_change_financial_goal}
              />

              {/* State of Residence */}
              <StateOfResidenceSettings
                stateOfResidence={additionalSettings.stateOfResidence}
                onChangeStateOfResidence={handle_change_state_of_residence}
              />
            </Box>
          </CardBody>

          <CardFooter
            py={6}
            px={8}
            bg={useColorModeValue("gray.50", "gray.700")}
            borderTopWidth="1px"
            borderColor={borderColor}
          >
            <Flex justifyContent="flex-end" width="100%" alignItems="center">
              <Text color="gray.500" fontSize="sm" mr="auto">
                All settings completed
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={onContinue}
                px={8}
                rightIcon={<Icon as={FiChevronRight} />}
                fontWeight="bold"
              >
                Save and Finish
              </Button>
            </Flex>
          </CardFooter>
        </Card>
      </Container>
    </Box>
  );
};

export default AdditionalSettingsForm;
