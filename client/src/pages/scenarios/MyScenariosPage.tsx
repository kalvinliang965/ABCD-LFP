import React from "react";
import {
  Box,
  Container,
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
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCog, FaInfoCircle } from "react-icons/fa";
import {
  ScenarioActionCard,
  ScenarioDetailCard,
} from "../../components/scenarios";
import { SAMPLE_SCENARIOS } from "../../types/scenario";
import { Link as RouterLink } from "react-router-dom";

const MyScenariosPage: React.FC = () => {
  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, blue.50)",
    "linear(to-br, gray.800, blue.900)"
  );
  const headingColor = useColorModeValue("gray.700", "white");
  const noteColor = useColorModeValue("blue.700", "blue.200");
  const noteBgColor = useColorModeValue("blue.50", "blue.900");
  const infoColor = useColorModeValue("gray.600", "gray.400");

  return (
    <Box
      py={6}
      px={4}
      minH="calc(100vh - 60px)" // Adjust for header height
      ml={{ base: 0, md: "60px" }} // Adjust for sidebar width
      bgGradient={bgGradient}
      overflowY="auto" // Ensure scrolling works as expected
    >
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <Box>
              <Heading as="h1" size="xl" color={headingColor}>
                Financial Scenarios
              </Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                Plan and simulate your financial future
              </Text>
            </Box>

            <HStack spacing={4}>
              <Tooltip label="Configure global simulation parameters">
                <Button
                  as={RouterLink}
                  to="/scenarios/settings"
                  size="sm"
                  leftIcon={<FaCog />}
                  colorScheme="blue"
                  variant="outline"
                >
                  Global Settings
                </Button>
              </Tooltip>
              <Button
                as={RouterLink}
                to="/scenarios/new"
                size="sm"
                colorScheme="blue"
              >
                New Scenario
              </Button>
            </HStack>
          </Flex>

          {/* Description */}
          <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
            <Flex align="start">
              <Icon as={FaInfoCircle} color={infoColor} mt={1} mr={2} />
              <Text fontSize="sm" color={infoColor}>
                A scenario is a collection of information defining your
                financial plan. It includes your financial goals, investment
                strategies, income/expense events, and market assumptions needed
                to run simulations. Each scenario can be for an individual or a
                couple, with different life expectancies and financial
                objectives.
              </Text>
            </Flex>
          </Box>

          {/* Action Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <ScenarioActionCard
              title="Create New Scenario"
              description="Start planning your financial future"
              buttonText="New Scenario"
              linkTo="/scenarios/new"
              colorScheme="blue"
            />
            <ScenarioActionCard
              title="Run Simulation"
              description="Test your financial strategies"
              buttonText="Start Simulation"
              linkTo="/simulation/run"
              colorScheme="purple"
            />
            <ScenarioActionCard
              title="Configure Settings"
              description="Set global simulation parameters"
              buttonText="Settings"
              linkTo="/scenarios/settings"
              colorScheme="teal"
            />
          </SimpleGrid>

          {/* Scenario Cards */}
          <Box>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading as="h2" size="md" color={headingColor}>
                Your Scenarios
              </Heading>
              <Text fontSize="xs" color="gray.500">
                Showing {SAMPLE_SCENARIOS.length} scenarios
              </Text>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={6}>
              {SAMPLE_SCENARIOS.map((scenario) => (
                <ScenarioDetailCard key={scenario.id} scenario={scenario} />
              ))}
            </SimpleGrid>
          </Box>

          {/* Pro Tip / Note */}
          <Alert status="info" borderRadius="md" bg={noteBgColor}>
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="bold" color={noteColor}>
                Pro Tip: Create multiple scenarios to compare different
                strategies
              </Text>
              <Text fontSize="xs" color={noteColor}>
                A complete scenario includes your investment types, event series
                (like income/expenses), inflation assumptions, and strategies
                for withdrawals and spending. You can run simulations on each
                scenario to see how different decisions might affect your
                financial future.
              </Text>
            </VStack>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default MyScenariosPage;
