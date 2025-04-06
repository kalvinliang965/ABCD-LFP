//AI generated test for checking the correct set up
import { render, screen } from '@testing-library/react';
import React from 'react';

test('renders hello world', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText(/hello world/i)).toBeInTheDocument();
});
