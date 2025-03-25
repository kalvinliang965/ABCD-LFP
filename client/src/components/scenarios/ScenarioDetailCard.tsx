import React from "react";
import {
  Box,
  Badge,
  Flex,
  Text,
  Link,
  VStack,
  HStack,
  Tooltip,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUser,
  FaUsers,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHourglass,
  FaChartLine,
  FaMoneyBillWave,
  FaPercentage,
} from "react-icons/fa";
import Card from "../common/Card";
import { Scenario, ScenarioType } from "../../types/scenario";

/**
 * AI prompt : help me design a card to show the scenario details by using the card component and the scenario type
 * I need to show the scenario name, type, birth year, life expectancy, financial goal, state, event count, investment count, and last modified date
 */
interface ScenarioDetailCardProps {
  scenario: Scenario;
}

const ScenarioDetailCard: React.FC<ScenarioDetailCardProps> = ({
  scenario,
}) => {
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const badgeBg = useColorModeValue("gray.100", "gray.700");

  // Badge colors for the scenario type
  const getBadgeInfo = () => {
    if (scenario.type === ScenarioType.INDIVIDUAL) {
      return {
        text: "Individual",
        colorScheme: "blue",
      };
    } else {
      return {
        text: "Couple",
        colorScheme: "pink",
      };
    }
  };

  // Count the number of event series if they exist
  const eventCount = scenario.eventSeries?.length || 0;
  const investmentCount = scenario.investments?.length || 0;

  // Get relevant tooltips
  const getFinancialGoalTooltip = () => {
    return "A financial goal is a non-negative number specifying the desired minimum total value of your investments. If a financial goal of 0 is achieved, it means you are always able to meet your expenses.";
  };

  const getLifeExpectancyTooltip = () => {
    return "The age at which the scenario simulation will end for the individual or couple.";
  };

  return (
    <Card title={scenario.name} minHeight="260px" leftBadge={getBadgeInfo()}>
      <VStack spacing={3} align="start" mt={2}>
        <Flex align="center">
          <Box
            as={scenario.type === ScenarioType.INDIVIDUAL ? FaUser : FaUsers}
            color={highlightColor}
            mr={2}
          />
          <Text fontSize="sm">
            <Text as="span" fontWeight="bold">
              Birth Year:
            </Text>{" "}
            {scenario.birthYear}
          </Text>
        </Flex>

        <Tooltip label={getLifeExpectancyTooltip()}>
          <Flex align="center">
            <Box as={FaHourglass} color={highlightColor} mr={2} />
            <Text fontSize="sm">
              <Text as="span" fontWeight="bold">
                Life Expectancy:
              </Text>{" "}
              {scenario.lifeExpectancy}
            </Text>
          </Flex>
        </Tooltip>

        <Tooltip label={getFinancialGoalTooltip()}>
          <Flex align="center">
            <Box as={FaDollarSign} color={highlightColor} mr={2} />
            <Text fontSize="sm">
              <Text as="span" fontWeight="bold">
                Financial Goal:
              </Text>{" "}
              {scenario.financialGoal}
            </Text>
          </Flex>
        </Tooltip>

        <Flex align="center">
          <Box as={FaMapMarkerAlt} color={highlightColor} mr={2} />
          <Text fontSize="sm">
            <Text as="span" fontWeight="bold">
              State:
            </Text>{" "}
            {scenario.state}
          </Text>
        </Flex>

        {/* Show additional badges if the scenario has more data */}
        {(eventCount > 0 ||
          investmentCount > 0 ||
          scenario.inflationAssumption) && (
          <>
            <Divider my={1} />
            <HStack spacing={2} wrap="wrap">
              {eventCount > 0 && (
                <Tooltip label={`${eventCount} event series defined`}>
                  <Badge bg={badgeBg} px={2} py={1} borderRadius="md">
                    <Flex align="center">
                      <Box as={FaChartLine} fontSize="xs" mr={1} />
                      <Text fontSize="xs">{eventCount} Events</Text>
                    </Flex>
                  </Badge>
                </Tooltip>
              )}

              {investmentCount > 0 && (
                <Tooltip label={`${investmentCount} investments defined`}>
                  <Badge bg={badgeBg} px={2} py={1} borderRadius="md">
                    <Flex align="center">
                      <Box as={FaMoneyBillWave} fontSize="xs" mr={1} />
                      <Text fontSize="xs">{investmentCount} Investments</Text>
                    </Flex>
                  </Badge>
                </Tooltip>
              )}

              {scenario.inflationAssumption && (
                <Tooltip
                  label={`Inflation assumption: ${scenario.inflationAssumption.value}%`}
                >
                  <Badge bg={badgeBg} px={2} py={1} borderRadius="md">
                    <Flex align="center">
                      <Box as={FaPercentage} fontSize="xs" mr={1} />
                      <Text fontSize="xs">Inflation</Text>
                    </Flex>
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          </>
        )}

        <Flex align="center" mt={2}>
          <Box as={FaCalendarAlt} color={secondaryTextColor} mr={2} />
          <Text fontSize="xs" color={secondaryTextColor}>
            Last modified: {scenario.lastModified}
          </Text>
        </Flex>
      </VStack>

      <Box mt={4} textAlign="right">
        <Link
          as={RouterLink}
          to={`/scenarios/${scenario.id}`}
          color={highlightColor}
          fontSize="sm"
          fontWeight="medium"
        >
          View Details &rarr;
        </Link>
      </Box>
    </Card>
  );
};

export default ScenarioDetailCard;
