import React from "react";
import { Route, Navigate, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "../common";
import { Layout } from "../layouts";
import MyScenariosPage from "../pages/scenarios/MyScenariosPage";
import { NewScenarioPage } from "../pages/scenarios/NewScenarioPage";
import { Box, Button, Heading, Text, VStack, HStack, useColorModeValue } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

// Scenarios List Component
const ScenariosList = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Layout title="My Scenarios">
      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg">My Scenarios</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => navigate("/scenarios/new")}
          >
            New Scenario
          </Button>
        </HStack>

        <Box
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <Text color="gray.600">
              You haven't created any scenarios yet. Click the "New Scenario" button to get started.
            </Text>
          </VStack>
        </Box>
      </Box>
    </Layout>
  );
};

const ScenariosImportExport = () => <div>Import/Export Scenarios</div>;

const ScenariosShared = () => <div>Shared Scenarios</div>;

const BasicInfo = () => <div>Basic Info</div>;

const EventSeries = () => <div>Event Series</div>;

const Strategies = () => <div>Strategies</div>;


const ScenarioRoutes = [
  // Scenarios Routes
  <Route
    key="scenarios-list"
    path="/scenarios"
    element={
      <ProtectedRoute>
        <Layout title="My Scenarios">
          <MyScenariosPage />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-new"
    path="/scenarios/new"
    element={
      <ProtectedRoute>
        <Layout title="New Scenario">
          <NewScenarioPage />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-import-export"
    path="/scenarios/import-export"
    element={
      <ProtectedRoute>
        <Layout title="Import/Export Scenarios">
          <ScenariosImportExport />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="scenarios-shared"
    path="/scenarios/shared"
    element={
      <ProtectedRoute>
        <Layout title="Shared Scenarios">
          <ScenariosShared />
        </Layout>
      </ProtectedRoute>
    }
  />,

  // Scenario Builder Routes
  <Route
    key="builder-basic-info"
    path="/builder/basic-info"
    element={
      <ProtectedRoute>
        <Layout title="Basic Info">
          <BasicInfo />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="builder-investments"
    path="/builder/investments"
    element={<Navigate to="/dashboard/investment" replace />}
  />,
  <Route
    key="builder-events"
    path="/builder/events"
    element={
      <ProtectedRoute>
        <Layout title="Event Series">
          <EventSeries />
        </Layout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="builder-strategies"
    path="/builder/strategies"
    element={
      <ProtectedRoute>
        <Layout title="Strategies">
          <Strategies />
        </Layout>
      </ProtectedRoute>
    }
  />,
];

export default ScenarioRoutes;
