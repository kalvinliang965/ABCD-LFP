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
} from '@chakra-ui/react';
import React, { useState, useEffect, useCallback } from 'react';
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
  FaEdit,
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { ScenarioRaw } from '../../types/Scenarios';
import { download_scenario_as_yaml } from '../../utils/yamlExport';
import { check_state_tax_exists } from '../../services/taxService';
import { StateType } from '../../types/Enum';

/**
 * AI prompt : help me design a card to show the scenario details by using the card component and the scenario type
 * I need to show the scenario name, type, birth year, life expectancy, financial goal, state, event count, investment count, and last modified date
 */

//! problem happens at this component
interface ScenarioDetailCardProps {
  scenario: ScenarioRaw;
  onDelete?: () => void;
  onEdit?: () => void;
  hideFooter?: boolean;
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
  const iconBg = useColorModeValue('blue.50', 'blue.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

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
  onDelete,
  onEdit,
  hideFooter = false,
}) => {
  const toast = useToast();
  const highlightColor = useColorModeValue('blue.500', 'blue.300');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('blue.500', 'blue.600');
  const [stateTaxExists, set_state_tax_exists] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // AI-generated code
  // Memoize the check_tax_data function to prevent unnecessary re-renders
  const check_tax_data = useCallback(async () => {
    try {
      const exists = await check_state_tax_exists(scenario.residenceState as StateType);
      set_state_tax_exists(exists);
    } catch (error) {
      console.error('Error checking state tax data:', error);
      set_state_tax_exists(false);
    }
  }, [scenario.residenceState]);

  useEffect(() => {
    check_tax_data();

    window.addEventListener('tax-data-updated', check_tax_data);

    return () => {
      window.removeEventListener('tax-data-updated', check_tax_data);
    };
  }, [scenario.residenceState, check_tax_data]);

  const handle_download_yaml = () => {
    try {
      console.log('ScenarioDetailCard: scenario:', scenario);
      download_scenario_as_yaml(scenario);
      toast({
        title: 'YAML Downloaded',
        description: `Scenario "${scenario.name}" has been downloaded as YAML`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading YAML:', error);
      toast({
        title: 'Download Failed',
        description: 'There was an error downloading the YAML file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handle_view_simulation_result = () => {
    // Check if scenario has _id, otherwise fall back to name
    console.log('ScenarioDetailCard: Full scenario object:', scenario);
    // Check for both _id formats: direct property or nested in data
    const id = (scenario as any)._id || (scenario as any).data?._id;
    const scenarioIdentifier = id || encodeURIComponent(scenario.name);
    console.log('ScenarioDetailCard: Using identifier for navigation:', scenarioIdentifier);
    navigate(`/scenarios/${scenarioIdentifier}/results`);
  };

  const handle_edit_scenario = () => {
    // Use the same identifier logic as in handle_view_simulation_result
    const id = (scenario as any)._id || (scenario as any).data?._id;
    const scenarioIdentifier = id || encodeURIComponent(scenario.name);
    console.log('ScenarioDetailCard: Navigating to edit scenario:', scenarioIdentifier);
    navigate(`/scenarios/${scenarioIdentifier}`);
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
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        borderColor: 'blue.300',
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
              colorScheme={scenario.maritalStatus === 'individual' ? 'purple' : 'pink'}
              fontSize="0.8em"
              py={1}
              px={2}
              borderRadius="full"
              textTransform="capitalize"
            >
              {scenario.maritalStatus}
            </Badge>
            {stateTaxExists !== null && (
              <Tooltip
                label={stateTaxExists ? 'State tax data is available' : 'State tax data is missing'}
              >
                <Badge
                  colorScheme={stateTaxExists ? 'green' : 'red'}
                  fontSize="0.8em"
                  py={1}
                  px={2}
                  borderRadius="full"
                >
                  <Flex align="center" gap={1}>
                    <Icon as={FaPercentage} boxSize={3} />
                    {stateTaxExists ? 'Tax Data' : 'No Tax Data'}
                  </Flex>
                </Badge>
              </Tooltip>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Main content grid */}
      <Box position="relative">
        {onDelete && (
          <Box position="absolute" right="4" top="4">
            <Flex gap={2}>
              <IconButton
                aria-label="Delete scenario"
                icon={<FaTrash />}
                size="sm"
                colorScheme="red"
                variant="solid"
                bg="rgba(229, 62, 62, 0.85)"
                color="white"
                fontWeight="normal"
                _hover={{ bg: 'rgba(229, 62, 62, 0.95)' }}
                onClick={onDelete}
              />

              {/* ! we don't have time, so no edit feature now*/}
              {/* <IconButton
                aria-label="Edit scenario"
                icon={<FaEdit />}
                size="sm"
                colorScheme="blue"
                variant="solid"
                bg="rgba(66, 153, 225, 0.85)"
                color="white"
                fontWeight="normal"
                _hover={{ bg: 'rgba(66, 153, 225, 0.95)' }}
                onClick={onEdit || handle_edit_scenario}
              /> */}
            </Flex>
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
              scenario.lifeExpectancy[0].type === 'fixed'
                ? scenario.lifeExpectancy[0].value
                : `${scenario.lifeExpectancy[0].mean} ± ${scenario.lifeExpectancy[0].stdev}`
            }
            tooltipContent="Projected life expectancy for planning"
          />

          {/* Birth Year */}
          <InfoItem
            icon={FaCalendarAlt}
            label="Birth Year"
            value={scenario.birthYears.join(', ')}
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

      {/* Additional info indicators - Only show if hideFooter is false */}
      {!hideFooter && (
        <>
          <Divider mb={2} />
          <Flex justify="space-between" align="center" p={3}>
            <HStack spacing={3}>
              {(scenario.investments as any) &&
                ((scenario.investments instanceof Set && scenario.investments.size > 0) ||
                  (Array.isArray(scenario.investments) &&
                    (scenario.investments as any[]).length > 0)) && (
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
                          {scenario.investments instanceof Set
                            ? scenario.investments.size
                            : Array.isArray(scenario.investments)
                            ? (scenario.investments as any[]).length
                            : 0}{' '}
                          investment types configured
                        </Text>
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}

              {(scenario.eventSeries as any) &&
                ((scenario.eventSeries instanceof Set && scenario.eventSeries.size > 0) ||
                  (Array.isArray(scenario.eventSeries) &&
                    (scenario.eventSeries as any[]).length > 0)) && (
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
                          {scenario.eventSeries instanceof Set
                            ? scenario.eventSeries.size
                            : Array.isArray(scenario.eventSeries)
                            ? (scenario.eventSeries as any[]).length
                            : 0}{' '}
                          events configured
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
                        Inflation rate: {scenario.inflationAssumption.value * 100}%
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

            {/* AI-generated code: Move simulation result button to the right side */}
            <Tooltip label="View Simulation Result" placement="top">
              <IconButton
                aria-label="View Simulation Result"
                icon={<FaChartLine />}
                size="sm"
                colorScheme="purple"
                variant="ghost"
                onClick={handle_view_simulation_result}
              />
            </Tooltip>

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
        </>
      )}
    </Box>
  );
};

export default ScenarioDetailCard;
