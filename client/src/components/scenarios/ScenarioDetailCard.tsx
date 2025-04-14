import React, { useState } from "react";
import {
  Box,
  Badge,
  Flex,
  Text,
  Link,
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
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaHourglass,
  FaChartLine,
  FaMoneyBillWave,
  FaPercentage,
  FaShoppingBag,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import { ScenarioRaw } from "../../types/Scenarios";
import { download_scenario_as_yaml } from "../../utils/yamlExport";

/**
 * AI prompt : help me design a card to show the scenario details by using the card component and the scenario type
 * I need to show the scenario name, type, birth year, life expectancy, financial goal, state, event count, investment count, and last modified date
 */
interface ScenarioDetailCardProps {
  scenario: ScenarioRaw;
  onDelete?: () => void;
}
//moved up
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

const ScenarioDetailCard: React.FC<ScenarioDetailCardProps> = ({
  scenario,
  onDelete
}) => {
  const toast = useToast();
  const highlightColor = useColorModeValue("blue.500", "blue.300");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("blue.500", "blue.600");

  const handle_download_yaml = () => {
    try {
      download_scenario_as_yaml(scenario);
      toast({
        title: "YAML Downloaded",
        description: `Scenario "${scenario.name}" has been downloaded as YAML`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading YAML:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the YAML file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
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
          <Flex gap={2} align="center">
            <Badge
              colorScheme={
                scenario.maritalStatus === 'individual' ? "purple" : "pink"
              }
              fontSize="0.8em"
              py={1}
              px={2}
              borderRadius="full"
              textTransform="capitalize"
            >
              {scenario.maritalStatus}
            </Badge>
          </Flex>
        </Flex>
      </Box>

      {/* Main content grid */}
      <Box position="relative">
        {onDelete && (
          <Box position="absolute" right="4" top="4">
            <IconButton
              aria-label="Delete scenario"
              icon={<FaTrash />}
              size="sm"
              colorScheme="red"
              variant="solid"
              bg="rgba(229, 62, 62, 0.85)"
              color="white"
              fontWeight="normal"
              _hover={{ bg: "rgba(229, 62, 62, 0.95)" }}
              onClick={onDelete}
            />
          </Box>
        )}
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
                : `${scenario.lifeExpectancy[0].mean} ± ${scenario.lifeExpectancy[0].stdev}`
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
      </Box>

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
                    {scenario.inflationAssumption.value}%
                  </Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

          <Tooltip label="Download as YAML" placement="top">
            <IconButton
              aria-label="Download YAML"
              icon={<Icon as={FaDownload} />}
              size="sm"
              colorScheme="green"
              variant="ghost"
              onClick={handle_download_yaml}
            />
          </Tooltip>
        </HStack>
        {/* <Link
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
        </Link> */}
        
      </Flex>
    </Box>
  );
};

export default ScenarioDetailCard;