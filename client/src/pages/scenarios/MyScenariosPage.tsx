import React from "react";
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Flex,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Button,
  Icon,
  Tooltip,
  Badge,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  FaCog,
  FaInfoCircle,
  FaPlus,
  FaPlayCircle,
  FaChartLine,
  FaRegLightbulb,
} from "react-icons/fa";
import {
  ScenarioActionCard,
  ScenarioDetailCard,
} from "../../components/scenarios";
import { SAMPLE_SCENARIOS } from "../../types/scenario";
import { Link as RouterLink } from "react-router-dom";

const MyScenariosPage: React.FC = () => {
  const headingColor = useColorModeValue("gray.700", "white");
  const noteColor = useColorModeValue("blue.700", "blue.200");
  const noteBgColor = useColorModeValue("blue.50", "blue.900");
  const infoColor = useColorModeValue("gray.600", "gray.400");
  const bgColor = useColorModeValue("white", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");

  return (
    <Box py={4} px={4} w="100%" position="relative">
      {/* Header section with more visual appeal */}
      <Flex
        direction="column"
        mb={6}
        pb={4}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex justify="space-between" align="center" wrap="wrap" mb={2}>
          <Box>
            <Heading
              as="h1"
              size="xl"
              color={headingColor}
              fontWeight="extrabold"
            >
              Financial Scenarios
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Plan and simulate your financial future
            </Text>
          </Box>
          <HStack spacing={3}>
            <Tooltip label="Configure global simulation parameters">
              <Button
                as={RouterLink}
                to="/scenarios/settings"
                size="sm"
                leftIcon={<FaCog />}
                colorScheme="blue"
                variant="outline"
                _hover={{ bg: hoverBgColor }}
                boxShadow="sm"
              >
                Global Settings
              </Button>
            </Tooltip>
            <Button
              as={RouterLink}
              to="/scenarios/new"
              size="sm"
              colorScheme="blue"
              leftIcon={<FaPlus />}
              boxShadow="sm"
              _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              transition="all 0.2s"
            >
              New Scenario
            </Button>
          </HStack>
        </Flex>

        {/* Info box with improved styling */}
        <Box
          bg={bgColor}
          p={4}
          borderRadius="lg"
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor="blue.400"
        >
          <Flex align="start">
            <Icon
              as={FaInfoCircle}
              color="blue.400"
              mt={1}
              mr={3}
              boxSize={5}
            />
            <Text fontSize="sm" color={infoColor} lineHeight="1.6">
              A scenario is a collection of information defining your financial
              plan. It includes your financial goals, investment strategies,
              income/expense events, and market assumptions needed to run
              simulations. Each scenario can be for an individual or a couple,
              with different life expectancies and financial objectives.
            </Text>
          </Flex>
        </Box>
      </Flex>

      {/* Action Cards with enhanced visual appeal */}
      <Heading
        as="h2"
        size="md"
        mb={4}
        color={headingColor}
        fontWeight="semibold"
      >
        Quick Actions
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
        <Box
          bg={cardBgColor}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          borderTop="4px solid"
          borderTopColor="blue.500"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          transition="all 0.3s"
          cursor="pointer"
          onClick={() => (window.location.href = "/scenarios/new")}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Flex
              w="60px"
              h="60px"
              bg="blue.50"
              color="blue.500"
              borderRadius="full"
              justify="center"
              align="center"
              mb={3}
            >
              <Icon as={FaPlus} boxSize={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2} color="blue.500">
              Create New Scenario
            </Heading>
            <Text color={infoColor}>
              Start planning your financial future with a new scenario
            </Text>
          </Flex>
        </Box>

        <Box
          bg={cardBgColor}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          borderTop="4px solid"
          borderTopColor="purple.500"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          transition="all 0.3s"
          cursor="pointer"
          onClick={() => (window.location.href = "/simulation/run")}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Flex
              w="60px"
              h="60px"
              bg="purple.50"
              color="purple.500"
              borderRadius="full"
              justify="center"
              align="center"
              mb={3}
            >
              <Icon as={FaPlayCircle} boxSize={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2} color="purple.500">
              Run Simulation
            </Heading>
            <Text color={infoColor}>
              Test and validate your financial strategies
            </Text>
          </Flex>
        </Box>

        <Box
          bg={cardBgColor}
          p={5}
          borderRadius="lg"
          boxShadow="md"
          borderTop="4px solid"
          borderTopColor="teal.500"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          transition="all 0.3s"
          cursor="pointer"
          onClick={() => (window.location.href = "/scenarios/settings")}
        >
          <Flex direction="column" align="center" textAlign="center">
            <Flex
              w="60px"
              h="60px"
              bg="teal.50"
              color="teal.500"
              borderRadius="full"
              justify="center"
              align="center"
              mb={3}
            >
              <Icon as={FaChartLine} boxSize={6} />
            </Flex>
            <Heading as="h3" size="md" mb={2} color="teal.500">
              Configure Settings
            </Heading>
            <Text color={infoColor}>
              Set global parameters for your simulations
            </Text>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Scenario Cards with improved visual hierarchy */}
      <Box mb={8}>
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          pb={2}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Heading as="h2" size="md" color={headingColor} fontWeight="semibold">
            Your Scenarios
          </Heading>
          <Badge
            colorScheme="blue"
            fontSize="sm"
            borderRadius="full"
            px={3}
            py={1}
          >
            {SAMPLE_SCENARIOS.length} scenarios
          </Badge>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {SAMPLE_SCENARIOS.map((scenario) => (
            <ScenarioDetailCard key={scenario.id} scenario={scenario} />
          ))}
        </SimpleGrid>
      </Box>

      {/* Pro Tip with enhanced design */}
      <Box
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <Flex
          bg={noteBgColor}
          p={4}
          align="center"
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Flex
            bg="yellow.100"
            p={2}
            borderRadius="full"
            justify="center"
            align="center"
            mr={3}
          >
            <Icon as={FaRegLightbulb} color="yellow.500" boxSize={5} />
          </Flex>
          <Heading as="h3" size="sm" fontWeight="bold" color={noteColor}>
            Pro Tip: Create multiple scenarios to compare strategies
          </Heading>
        </Flex>
        <Box p={4} bg={cardBgColor}>
          <Text fontSize="sm" color={infoColor} lineHeight="1.7">
            A complete scenario includes your investment types, event series
            (like income/expenses), inflation assumptions, and strategies for
            withdrawals and spending. You can run simulations on each scenario
            to see how different decisions might affect your financial future.
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default MyScenariosPage;
