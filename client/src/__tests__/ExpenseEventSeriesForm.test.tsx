// src/__tests__/ExpenseEventSeriesForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { ExpenseEventSeriesForm } from '../components/event_series/ExpenseEventSeriesForm';

describe('ExpenseEventSeriesForm', () => {
  const mockAdd = jest.fn();

  beforeEach(() => {
    mockAdd.mockClear();
  });

  it('renders all expected inputs and controls', () => {
    render(<ExpenseEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
    expect(screen.getByText('Annual Change Type')).toBeInTheDocument();
    expect(screen.getByText('Inflation Adjusted')).toBeInTheDocument();
    expect(screen.getByText('Discretionary')).toBeInTheDocument();
    expect(screen.getByText('User Percentage')).toBeInTheDocument();
    expect(screen.getByText('Spouse Percentage')).toBeInTheDocument();
  });

  it('submits correctly with uniform distribution selected', () => {
    render(<ExpenseEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    fireEvent.change(screen.getByPlaceholderText('Enter name'), {
      target: { value: 'Rent' },
    });

    fireEvent.change(screen.getByPlaceholderText('Enter description'), {
      target: { value: 'Monthly apartment rent' },
    });

    fireEvent.change(screen.getAllByPlaceholderText('0')[0], {
      target: { value: '12000' }, // Initial amount
    });

    //find the Annual Change Type select element by finding the label and then getting the select element
    const annualChangeTypeLabel = screen.getByText('Annual Change Type');
    const annualChangeTypeSelect = annualChangeTypeLabel.closest('div')?.querySelector('select');

    if (annualChangeTypeSelect) {
      fireEvent.change(annualChangeTypeSelect, {
        target: { value: 'uniform' },
      });
    }

    //find the uniform distribution fields by their label text
    const minChangeLabel = screen.getByText('Minimum Change ($)');
    const maxChangeLabel = screen.getByText('Maximum Change ($)');

    //get the input elements
    const minChangeInput = minChangeLabel.closest('div')?.querySelector('input');
    const maxChangeInput = maxChangeLabel.closest('div')?.querySelector('input');

    if (minChangeInput) {
      fireEvent.change(minChangeInput, {
        target: { value: '100' },
      });
    }

    if (maxChangeInput) {
      fireEvent.change(maxChangeInput, {
        target: { value: '300' },
      });
    }

    fireEvent.click(screen.getByText('Save'));

    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Rent',
        description: 'Monthly apartment rent',
        initialAmount: 12000,
        annualChange: { type: 'uniform', min: 100, max: 300 },
        type: 'expense',
      })
    );
  });

  it('shows normal distribution fields when selected', () => {
    render(<ExpenseEventSeriesForm onEventAdded={mockAdd} existingEvents={[]} />);

    const annualChangeTypeLabel = screen.getByText('Annual Change Type');
    const annualChangeTypeSelect = annualChangeTypeLabel.closest('div')?.querySelector('select');

    if (annualChangeTypeSelect) {
      fireEvent.change(annualChangeTypeSelect, {
        target: { value: 'normal' },
      });
    }

    //check conditional fields by their label text
    expect(screen.getByText('Mean Change ($)')).toBeInTheDocument();
    expect(screen.getByText('Standard Deviation ($)')).toBeInTheDocument();
  });
});
