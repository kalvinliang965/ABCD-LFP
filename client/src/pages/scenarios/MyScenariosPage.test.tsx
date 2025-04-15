// AI-generated code
// Create test file for MyScenariosPage with simulation modal functionality

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { scenario_service } from '../../services/scenarioService';

import MyScenariosPage from './MyScenariosPage';

// Mock the scenario service
jest.mock('../../services/scenarioService', () => ({
  scenario_service: {
    get_draft_scenarios: jest.fn(),
    get_all_scenarios: jest.fn(),
    delete_scenario: jest.fn(),
  },
}));

// Mock the RunSimulationModal component
jest.mock('../../components/simulation/RunSimulationModal', () => {
  const MockRunSimulationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="mock-simulation-modal">
        <button onClick={onClose}>Close</button>
        <div>Configure Simulation</div>
      </div>
    ) : null;

  return MockRunSimulationModal;
});

const renderComponent = () => {
  return render(
    <ChakraProvider>
      <BrowserRouter>
        <MyScenariosPage />
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('MyScenariosPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock responses
    (scenario_service.get_draft_scenarios as jest.Mock).mockResolvedValue({
      data: [],
    });

    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [],
    });
  });

  test('renders the page header and quick actions', async () => {
    renderComponent();

    // Check for header and quick action buttons
    expect(screen.getByText('Financial Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Create New Scenario')).toBeInTheDocument();
    expect(screen.getByText('Run Simulation')).toBeInTheDocument();
  });

  test('opens simulation modal when Run Simulation card is clicked', async () => {
    renderComponent();

    // Click on the Run Simulation card
    const runSimulationCard = screen.getByText('Run Simulation');
    fireEvent.click(runSimulationCard);

    // Check that the modal opened (using our mock component)
    await waitFor(() => {
      expect(screen.getByTestId('mock-simulation-modal')).toBeInTheDocument();
    });
    expect(screen.getByText('Configure Simulation')).toBeInTheDocument();
  });

  test('closes simulation modal when Close button is clicked', async () => {
    renderComponent();

    // Open the modal
    const runSimulationCard = screen.getByText('Run Simulation');
    fireEvent.click(runSimulationCard);

    // Verify modal is open
    await waitFor(() => {
      expect(screen.getByTestId('mock-simulation-modal')).toBeInTheDocument();
    });

    // Close the modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('mock-simulation-modal')).not.toBeInTheDocument();
    });
  });

  test('displays draft scenarios when available', async () => {
    (scenario_service.get_draft_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Draft Scenario',
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    renderComponent();

    // Check that draft scenario section is displayed
    await waitFor(() => {
      expect(screen.getByText('Your Draft Scenarios')).toBeInTheDocument();
    });

    expect(screen.getByText('Draft Scenario')).toBeInTheDocument();
    expect(screen.getByText('Continue Editing')).toBeInTheDocument();
  });

  test('displays actual scenarios when available', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Test Scenario',
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 1000000,
          residenceState: 'NY',
          lifeExpectancy: [{ type: 'fixed', value: 90 }],
          investments: new Set(),
          eventSeries: new Set(),
          inflationAssumption: { value: 0.03 },
          spendingStrategy: ['conservative'],
        },
      ],
    });

    renderComponent();

    // Check that scenarios section has the right count
    await waitFor(() => {
      expect(screen.getByText('1 scenarios')).toBeInTheDocument();
    });
  });
});
