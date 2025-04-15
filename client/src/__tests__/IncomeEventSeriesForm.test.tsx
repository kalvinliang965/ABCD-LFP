// src/__tests__/IncomeEventSeriesForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { IncomeEventSeriesForm } from '../components/event_series/IncomeEventSeriesForm';

describe('IncomeEventSeriesForm', () => {
  const mockAdd = jest.fn();

  beforeEach(() => {
    mockAdd.mockClear();
  });

  it('renders all required inputs', () => {
    render(<IncomeEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    //check all visible fields by placeholder text or label text
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();

    expect(screen.getByText('Start Year Type')).toBeInTheDocument();
    expect(screen.getByText('Duration Type')).toBeInTheDocument();
    expect(screen.getByText('Annual Change Type')).toBeInTheDocument();

    const inputsWithZeroPlaceholder = screen.getAllByPlaceholderText('0');
    expect(inputsWithZeroPlaceholder.length).toBeGreaterThan(0);

    expect(screen.getByText(/Inflation Adjusted/i)).toBeInTheDocument();
    expect(screen.getByText(/Social Security Income/i)).toBeInTheDocument();
    expect(screen.getByText('User Percentage')).toBeInTheDocument();
    expect(screen.getByText('Spouse Percentage')).toBeInTheDocument();
  });

  it('fills the entire form and submits correct data', () => {
    render(<IncomeEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    fireEvent.change(screen.getByPlaceholderText('Enter name'), {
      target: { value: 'Freelancing' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter description'), {
      target: { value: 'Side hustle' },
    });

    //get all inputs with placeholder "0" and use them in order
    const inputsWithZeroPlaceholder = screen.getAllByPlaceholderText('0');

    //initial Amount
    fireEvent.change(inputsWithZeroPlaceholder[0], {
      target: { value: '10000' },
    });

    //annual Change
    fireEvent.change(inputsWithZeroPlaceholder[1], {
      target: { value: '500' },
    });

    fireEvent.click(screen.getByText(/Inflation Adjusted/i));
    fireEvent.click(screen.getByText(/Social Security Income/i));

    //find the percentage inputs by their parent FormLabel text
    const userPercentageInput = screen
      .getByText('User Percentage')
      .closest('div')
      ?.querySelector('input');
    const spousePercentageInput = screen
      .getByText('Spouse Percentage')
      .closest('div')
      ?.querySelector('input');

    if (userPercentageInput) {
      fireEvent.change(userPercentageInput, {
        target: { value: '60' },
      });
    }

    if (spousePercentageInput) {
      fireEvent.change(spousePercentageInput, {
        target: { value: '40' },
      });
    }

    fireEvent.click(screen.getByText('Save'));

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'income',
        name: 'Freelancing',
        description: 'Side hustle',
        initialAmount: 10000,
        annualChange: { type: 'fixed', value: 500 },
        inflationAdjusted: true,
        isSocialSecurity: true,
        userPercentage: 60,
        spousePercentage: 40,
      })
    );
  });

  it('does not submit if required fields are empty', () => {
    render(<IncomeEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    //don't fill in any required fields
    fireEvent.click(screen.getByText('Save'));

    //should not trigger submission
    expect(mockAdd).not.toHaveBeenCalled();
  });
});
