// Simple manual test for ProcessIncome

import process_income from '../core/simulation/ProcessIncome';
import { ChangeType } from '../core/Enums';


// Build exactly the required `state` object
const testState = {
  get_current_year: () => 2025,
  inflation_factor: 0.02,
  user: { is_alive: () => true },
  spouse: { is_alive: () => false },
  events_by_type: {
    income: new Map([
      [
        "salary",
        {
          name: "Salary",
          start: 2020,
          duration: 10,
          initial_amount: 50000,
          change_type: 1,   // Let's assume 1 = ChangeType.PERCENTAGE
          user_fraction: 1.0,
          social_security: false,
          inflation_adjusted: true,
          expected_annual_change: 0.03,
        },
      ],
      [
        "pension",
        {
          name: "Pension",
          start: 2023,
          duration: 20,
          initial_amount: 20000,
          change_type: 0,   // Let's assume 0 = ChangeType.FIXED
          user_fraction: 0.5,
          social_security: true,
          inflation_adjusted: false,
          expected_annual_change: 1000,
        },
      ],
    ]),
  },
  incr_ordinary_income: function (amt: number) {
    this.ordinaryIncome = (this.ordinaryIncome || 0) + amt;
  },
  incr_social_security_income: function (amt: number) {
    this.socialSecurityIncome = (this.socialSecurityIncome || 0) + amt;
  },
  ordinaryIncome: 0,
  socialSecurityIncome: 0,
};

// ✅ Run process_income exactly as your function expects
const totalIncome = process_income(testState);

console.log("✅ Total Income:", totalIncome.toFixed(2));
console.log("💰 Ordinary Income:", testState.ordinaryIncome?.toFixed(2));
console.log("💰 Social Security Income:", testState.socialSecurityIncome?.toFixed(2));
