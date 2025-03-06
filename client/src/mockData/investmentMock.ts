// src/mockData/investmentMock.ts
export const mockInvestments = [
  {
    _id: "1",
    name: "Tech Growth Portfolio",
    description: "High volatility, potential high returns.",
    expectedAnnualReturn: {
      mode: "fixed",
      value: 0.08,
    },
    expenseRatio: 0.01,
    dividendYield: {
      mode: "fixed",
      value: 0.02,
    },
    isTaxExempt: false,
    lastUpdated: "2025-03-06",
  },
  {
    _id: "2",
    name: "Municipal Bond A",
    description: "Stable, low risk, tax-exempt municipal bonds.",
    expectedAnnualReturn: {
      mode: "fixed",
      value: 0.04,
    },
    expenseRatio: 0.005,
    dividendYield: {
      mode: "fixed",
      value: 0.03,
    },
    isTaxExempt: true,
    lastUpdated: "2025-03-05",
  },
];
