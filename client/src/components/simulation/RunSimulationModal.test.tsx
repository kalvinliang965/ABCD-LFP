// AI-generated code
// Create test file for RunSimulationModal component

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { scenario_service } from '../../services/scenarioService';

import { RunSimulationModal } from './index';

// Mock the scenario service
jest.mock('../../services/scenarioService', () => ({
  scenario_service: {
    get_all_scenarios: jest.fn(),
  },
}));

// Mock the ScenarioDetailCard component
jest.mock('../scenarios/ScenarioDetailCard', () => {
  const MockScenarioDetailCard = ({ scenario }: { scenario: any }) => (
    <div data-testid="scenario-card">{scenario.name}</div>
  );
  return MockScenarioDetailCard;
});

describe('RunSimulationModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock response
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [],
    });
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <ChakraProvider>
        <BrowserRouter>
          <RunSimulationModal isOpen={isOpen} onClose={mockOnClose} />
        </BrowserRouter>
      </ChakraProvider>
    );
  };

  test('does not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('Configure Simulation')).not.toBeInTheDocument();
  });

  test('renders loading state initially', async () => {
    renderComponent();
    expect(screen.getByText('Loading scenarios...')).toBeInTheDocument();
  });

  test('shows no scenarios message when no active scenarios are available', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        // Only draft scenarios
        {
          _id: '1',
          name: 'Draft Scenario',
          isDraft: true,
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('No Scenarios Available')).toBeInTheDocument();
    });

    expect(
      screen.getByText("You don't have any active scenarios yet. Please create a scenario first.")
    ).toBeInTheDocument();
  });

  test('displays scenarios when available', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Test Scenario 1',
          isDraft: false,
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 1000000,
          residenceState: 'NY',
          lifeExpectancy: [{ type: 'fixed', value: 90 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
        {
          _id: '2',
          name: 'Test Scenario 2',
          isDraft: false,
          maritalStatus: 'couple',
          birthYears: [1985, 1987],
          financialGoal: 2000000,
          residenceState: 'CA',
          lifeExpectancy: [{ type: 'fixed', value: 95 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
        {
          _id: '3',
          name: 'Draft Scenario',
          isDraft: true, // This one should be filtered out
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 500000,
          residenceState: 'FL',
          lifeExpectancy: [{ type: 'fixed', value: 85 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Select Scenario')).toBeInTheDocument();
    });

    // Check that only non-draft scenarios are displayed
    expect(screen.getByText('Test Scenario 1')).toBeInTheDocument();
    expect(screen.getByText('Test Scenario 2')).toBeInTheDocument();
    expect(screen.queryByText('Draft Scenario')).not.toBeInTheDocument();

    expect(
      screen.getByText(
        'Click on a scenario card to select it for simulation. Click again to unselect.'
      )
    ).toBeInTheDocument();
  });

  test('toggles scenario selection when clicked', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Test Scenario',
          isDraft: false,
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 1000000,
          residenceState: 'NY',
          lifeExpectancy: [{ type: 'fixed', value: 90 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Scenario')).toBeInTheDocument();
    });

    // No "Selected" badge initially
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();

    // Click to select
    fireEvent.click(screen.getByText('Test Scenario'));

    // "Selected" badge should appear
    expect(screen.getByText('Selected')).toBeInTheDocument();

    // Click again to unselect
    fireEvent.click(screen.getByText('Test Scenario'));

    // "Selected" badge should disappear
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });

  test('validates simulation count input', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Test Scenario',
          isDraft: false,
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 1000000,
          residenceState: 'NY',
          lifeExpectancy: [{ type: 'fixed', value: 90 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Number of Simulations')).toBeInTheDocument();
    });

    // Get the input field
    const input = screen.getByRole('spinbutton');

    // Test with invalid input
    fireEvent.change(input, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText('Simulation count must be a positive integer')).toBeInTheDocument();
    });

    // Test with valid input
    fireEvent.change(input, { target: { value: '100' } });

    await waitFor(() => {
      expect(
        screen.getByText(
          'How many times should we run the simulation? Higher numbers give more accurate results but take longer.'
        )
      ).toBeInTheDocument();
    });
  });

  test('disables run button when no scenario is selected', async () => {
    (scenario_service.get_all_scenarios as jest.Mock).mockResolvedValue({
      data: [
        {
          _id: '1',
          name: 'Test Scenario',
          isDraft: false,
          maritalStatus: 'individual',
          birthYears: [1990],
          financialGoal: 1000000,
          residenceState: 'NY',
          lifeExpectancy: [{ type: 'fixed', value: 90 }],
          investments: new Set(),
          eventSeries: new Set(),
        },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Run Simulation')).toBeInTheDocument();
    });

    // Button should be disabled initially
    expect(screen.getByText('Run Simulation')).toBeDisabled();

    // Select a scenario
    fireEvent.click(screen.getByText('Test Scenario'));

    // Button should be enabled
    expect(screen.getByText('Run Simulation')).not.toBeDisabled();

    // Deselect the scenario
    fireEvent.click(screen.getByText('Test Scenario'));

    // Button should be disabled again
    expect(screen.getByText('Run Simulation')).toBeDisabled();
  });
});
