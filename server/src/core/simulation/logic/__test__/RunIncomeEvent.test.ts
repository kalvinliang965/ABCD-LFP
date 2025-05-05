import { run_income_event } from '../RunIncomeEvent';
import { cash_investment_one } from '../../../domain/raw/investment_raw';
import { create_investment } from '../../../domain/investment/Investment';
import { create_event_manager, create_event_manager_clone } from '../../../domain/EventManager';
import create_income_event, { IncomeEvent } from '../../../domain/event/IncomeEvent';
import { salary_income_event_one, ss_income_event_one } from '../../../domain/raw/event_raw/event_raw';
import { create_user_tax_data } from '../../../domain/UserTaxData';
import { create_value_source } from '../../../../utils/ValueGenerator';
import { val } from 'cheerio/lib/api/attributes';

describe('Run Income Event', () => {

  // Test basic income processing
  it('should process general case with no social security', async () => {
    const salary = create_income_event(salary_income_event_one, create_value_source("blah"));
    const cash = create_investment(cash_investment_one);

    const mock_state: any = {
      get_current_year: () => 2025,
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
        res.update_initial_amount = jest.fn();
        return res;
      })(),
      account_manager: {
        cash: cash,
      },
      user_tax_data: create_user_tax_data(),
      get_annual_inflation_rate: jest.fn(),
    };
    (mock_state.event_manager.update_initial_amount as jest.Mock).mockReturnValue(3000);

    const original_cur_year_income = mock_state.user_tax_data.get_cur_year_income();
    const original_cash_value = cash.get_value();
    await run_income_event(mock_state);

    // should be adjusted by inflation
    expect(cash.get_value()).toBe(original_cash_value + 3000);

    expect(mock_state.user_tax_data.get_cur_year_ss()).toBe(0);
    expect(mock_state.user_tax_data.get_cur_year_income()).toBe(original_cur_year_income + 3000);
  });

  it('should process general case with no social security', async () => {
    const value_source = create_value_source("blah");
    const salary = create_income_event(salary_income_event_one, value_source);
    const ss = create_income_event(ss_income_event_one, value_source);
    const cash = create_investment(cash_investment_one);

    const mock_state: any = {
      get_current_year: () => 2025,
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
          [ss.name, ss]
        ]);
        let res = create_event_manager_clone(income_event, new Map(), new Map(), new Map());
        res.update_initial_amount = jest.fn();
        return res;
      })(),
      account_manager: {
        cash: cash,
      },
      user_tax_data: create_user_tax_data(),
      get_annual_inflation_rate: jest.fn(),
    };


    (mock_state.event_manager.update_initial_amount as jest.Mock).mockReturnValue(3000);
    const original_cur_year_income = mock_state.user_tax_data.get_cur_year_income();
    const original_cash_value = cash.get_value();
    await run_income_event(mock_state);
    expect(cash.get_value()).toBe(original_cash_value + 3000 + 3000);
    expect(mock_state.user_tax_data.get_cur_year_ss()).toBe(3000);
    expect(mock_state.user_tax_data.get_cur_year_income()).toBe(original_cur_year_income + 3000 + 3000);
  });
}); 