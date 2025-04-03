import React, { useState } from "react";
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
  Heading,
  Icon,
  Grid,
  GridItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  IconButton,
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
  FaExchangeAlt,
  FaWallet,
  FaShoppingBag,
  FaPiggyBank,
  FaInfoCircle,
  FaChevronRight,
} from "react-icons/fa";
import Card from "../common/Card";
import { ScenarioRaw } from "../../types/Scenarios";

/**
 * AI prompt : help me design a card to show the scenario details by using the card component and the scenario type
 * I need to show the scenario name, type, birth year, life expectancy, financial goal, state, event count, investment count, and last modified date
 */
interface ScenarioDetailCardProps {
  scenario: ScenarioRaw;
}

const ScenarioDetailCard: React.FC<ScenarioDetailCardProps> = ({
  scenario,
}) => {
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.500", "blue.600");
  const iconBg = useColorModeValue("blue.50", "blue.900");

  // Badge colors for the scenario type
  const getBadgeInfo = () => {
    if (scenario.martialStatus === "single") {
      return {
        text: "INDIVIDUAL",
        colorScheme: "blue",
      };
    } else {
      return {
        text: "COUPLE",
        colorScheme: "pink",
      };
    }
  };

  // Count the number of event series if they exist
  const eventCount = scenario.eventSeries.size || 0;
  const investmentCount = scenario.investments.size || 0;

  // Get relevant tooltips
  const getFinancialGoalTooltip = () => {
    return "A financial goal is a non-negative number specifying the desired minimum total value of your investments. If a financial goal of 0 is achieved, it means you are always able to meet your expenses.";
  };

  const getLifeExpectancyTooltip = () => {
    return "The age at which the scenario simulation will end for the individual or couple.";
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bg={cardBg}
      borderColor={cardBorder}
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "xl",
        borderColor: "blue.300",
      }}
    >
      {/* Header with name and badge */}
      <Box bg={headerBg} color="white" p={4}>
        <Flex justify="space-between" align="center">
          <Heading size="md" fontWeight="bold">
            {scenario.name}
          </Heading>
          <Badge
            colorScheme={
              scenario.martialStatus === "single" ? "purple" : "pink"
            }
            fontSize="0.8em"
            py={1}
            px={2}
            borderRadius="full"
            textTransform="capitalize"
          >
            {scenario.martialStatus}
          </Badge>
        </Flex>
      </Box>

      {/* Main content grid */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4} p={4}>
        {/* Financial Goal */}
        <InfoItem
          icon={FaDollarSign}
          label="Financial Goal"
          value={`$${scenario.financialGoal.toLocaleString()}`}
          tooltipContent="Target financial goal for this scenario"
        />

        {/* Residence State */}
        <InfoItem
          icon={FaMapMarkerAlt}
          label="Residence State"
          value={scenario.residenceState}
          tooltipContent="State of residence for tax calculations"
        />

        {/* Life Expectancy */}
        <InfoItem
          icon={FaHourglass}
          label="Life Expectancy"
          value={
            scenario.lifeExpectancy[0].type === "fixed"
              ? scenario.lifeExpectancy[0].value
              : `${scenario.lifeExpectancy[0].mean} ± ${scenario.lifeExpectancy[0].std}`
          }
          tooltipContent="Projected life expectancy for planning"
        />

        {/* Birth Year */}
        <InfoItem
          icon={FaCalendarAlt}
          label="Birth Year"
          value={scenario.birthYears.join(", ")}
          tooltipContent="Birth year(s) for scenario participants"
        />
      </Grid>

      {/* Spending Strategy */}
      {scenario.spendingStrategy && scenario.spendingStrategy.length > 0 && (
        <Box px={4} pb={4}>
          <Divider my={2} />
          <Heading size="sm" mb={2} display="flex" alignItems="center">
            <Icon as={FaShoppingBag} mr={2} color={highlightColor} />
            Spending Strategy
          </Heading>
          <Flex flexWrap="wrap" gap={2}>
            {scenario.spendingStrategy.map((strategy, index) => (
              <Badge
                key={strategy}
                colorScheme="blue"
                variant="subtle"
                px={2}
                py={1}
                borderRadius="md"
              >
                {strategy}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}

      {/* Additional info indicators */}
      <Divider mb={2} />
      <Flex justify="space-between" align="center" p={3}>
        <HStack spacing={3}>
          {scenario.investments.size > 0 && (
            <Popover placement="top" trigger="hover">
              <PopoverTrigger>
                <IconButton
                  aria-label="Investment details"
                  icon={<Icon as={FaMoneyBillWave} />}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold">Investments</PopoverHeader>
                <PopoverBody>
                  <Text fontSize="sm">
                    {scenario.investments.size} investment types configured
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

          {scenario.eventSeries.size > 0 && (
            <Popover placement="top" trigger="hover">
              <PopoverTrigger>
                <IconButton
                  aria-label="Event details"
                  icon={<Icon as={FaChartLine} />}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold">Events</PopoverHeader>
                <PopoverBody>
                  <Text fontSize="sm">
                    {scenario.eventSeries.size} events configured
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

          {scenario.inflationAssumption && (
            <Popover placement="top" trigger="hover">
              <PopoverTrigger>
                <IconButton
                  aria-label="Inflation details"
                  icon={<Icon as={FaPercentage} />}
                  size="sm"
                  colorScheme="blue"
                  variant="ghost"
                />
              </PopoverTrigger>
              <PopoverContent>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader fontWeight="bold">Inflation</PopoverHeader>
                <PopoverBody>
                  <Text fontSize="sm">
                    Inflation rate:{" "}
                    {scenario.inflationAssumption[0].value * 100}%
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}
        </HStack>

        <Link
          as={RouterLink}
          to={`/scenarios/${encodeURIComponent(scenario.name)}`}
          color={highlightColor}
          fontWeight="medium"
          _hover={{
            textDecoration: "none",
          }}
        >
          <Flex align="center">
            <Text mr={1}>View Details</Text>
            <Icon as={FaChevronRight} boxSize={3} />
          </Flex>
        </Link>
      </Flex>
    </Box>
  );
};

// Helper component for displaying info items
const InfoItem = ({
  icon,
  label,
  value,
  tooltipContent,
}: {
  icon: React.ComponentType;
  label: string;
  value: string | number;
  tooltipContent: string;
}) => {
  const iconBg = useColorModeValue("blue.50", "blue.900");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  return (
    <GridItem>
      <Tooltip label={tooltipContent} placement="top">
        <Flex align="center">
          <Flex
            p={2}
            borderRadius="md"
            bg={iconBg}
            alignItems="center"
            justifyContent="center"
            mr={3}
          >
            <Icon as={icon} color="blue.500" boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="xs" color={labelColor} fontWeight="medium">
              {label}
            </Text>
            <Text fontWeight="semibold">{value}</Text>
          </Box>
        </Flex>
      </Tooltip>
    </GridItem>
  );
};

export default ScenarioDetailCard;
