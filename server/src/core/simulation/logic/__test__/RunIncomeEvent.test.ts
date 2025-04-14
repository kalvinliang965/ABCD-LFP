import run_income_event from '../RunIncomeEvent'; 
import { cash_investment_one } from '../../../domain/raw/investment_raw';
import { create_investment } from '../../../domain/investment/Investment';
import { create_event_manager_clone } from '../../../domain/EventManager';
import create_income_event, { IncomeEvent } from '../../../domain/event/IncomeEvent';
import { salary_income_one } from '../../../domain/raw/event_raw/event_raw';
import { create_user_tax_data } from '../../UserTaxData';

describe('ProcessIncome', () => {

  // Test basic income processing
  it('should process general case of income', async () => {
    const salary = create_income_event(salary_income_one);
    const cash = create_investment(cash_investment_one);

    const mock_state: any = {
      get_current_year: () => 2023,
      user: {
        is_alive: () => true
      },
      spouse: {
        is_alive: () => true
      },

      // we are only testing income...
      event_manager: (() => {
        const income_event = new Map<string, IncomeEvent>([
          [salary.name, salary],
        ]);
        let res = create_event_manager_clone(income_event, new Map(), new Map(), new Map());
        res.get_active_income_event = () => [...income_event.values()];
        return res;
      })(),
      account_manager: {
        cash: cash,
      },
      user_tax_data: create_user_tax_data(),
    };


    const original_cur_year_income = mock_state.user_tax_data.get_cur_year_income();
    const original_cash_value = cash.get_value();
    const original_salary_value = salary.initial_amount;
    const result = await run_income_event(mock_state);

    // should be adjusted by inflation
    expect(salary.initial_amount).not.toBe(original_salary_value);
    
    expect(cash.get_value()).toBe(original_cash_value + salary.initial_amount);

    expect(mock_state.user_tax_data.get_cur_year_income()).toBe(original_cur_year_income + salary.initial_amount);
  });

}); 