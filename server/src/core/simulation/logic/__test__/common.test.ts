import { AccountManager, create_account_manager } from "../../../domain/AccountManager";
import { cash_investment_one, create_investment_raw, s_and_p_500_investment_after_tax_one, s_and_p_500_investment_non_retirement_one, s_and_p_500_investment_pre_tax_one } from "../../../domain/raw/investment_raw";
import { transfer_investment_value } from "../common";

describe("Common untility function for logics", () => {

    // this is a function that is being use during
    // roth conversion, process rmd
    describe("transfer investment", () => {

        // roth is pre-tax to after-tax
        test("mock roth target account exist", () => {
            const account_manager = create_account_manager(new Set([
                cash_investment_one,
                s_and_p_500_investment_after_tax_one, // value: 2,000
                s_and_p_500_investment_pre_tax_one, // value: 10,000
                s_and_p_500_investment_non_retirement_one, // value: 100,000
            ]));
            const mock_simulation_object = {
                expense_withdrawal_strategy: []
            }

            const transfer_amt = 200;

            const from_label = "S&P 500 pre-tax";
            const to_label = "S&P 500 after-tax";
            const from_investment = account_manager.pre_tax.get(from_label)!;
            const to_investment = account_manager.after_tax.get(to_label)!;


            const from_prev_value = from_investment.get_value();
            const from_prev_cost_basis = from_investment.get_cost_basis();

            const to_prev_value = to_investment.get_value();
            const to_prev_cost_basis = to_investment.get_cost_basis();

            // amount to transfering
            // if the amount transfer is too large, we will transfer the investment
            const fraction = Math.min(transfer_amt / from_prev_value, 1)

            // expect value
            const from_new_value = from_prev_value  - Math.min(from_prev_value, transfer_amt)
            const to_new_value = to_prev_value + Math.min(from_prev_value, transfer_amt);

            // expected cost basis
            const from_new_cost_basis = from_prev_cost_basis - fraction * from_prev_cost_basis;
            const to_new_cost_basis = to_prev_cost_basis + fraction * from_prev_cost_basis;

            const transfterred = transfer_investment_value(
                [from_label], // this is the only thing we are transfering
                transfer_amt,
                account_manager.pre_tax_group,
                account_manager.after_tax_group,
                mock_simulation_object.expense_withdrawal_strategy
            );

            // we have enough to transfer
            expect(transfterred).toBe(transfer_amt);
            expect(from_investment.get_cost_basis()).toBe(from_new_cost_basis);
            expect(from_investment.get_value()).toBe(from_new_value);

            expect(to_investment.get_cost_basis()).toBe(to_new_cost_basis);
            expect(to_investment.get_value()).toBe(to_new_value);
        });
        
        // roth is pre-tax to after-tax
        test("mock roth target account not exist", () => {
            const account_manager = create_account_manager(new Set([
                cash_investment_one,
                s_and_p_500_investment_pre_tax_one, // value: 10,000
            ]));
            const mock_simulation_object = {
                expense_withdrawal_strategy: []
            }
            const transfer_amt = 200;

            const from_label = "S&P 500 pre-tax";
            const to_label = "S&P 500 after-tax";

            const from_investment = account_manager.pre_tax.get(from_label)!;

            const from_prev_value = from_investment.get_value();
            const from_prev_cost_basis = from_investment.get_cost_basis();


            // amount to transfering
            // if the amount transfer is too large, we will transfer the investment
            const fraction = Math.min(transfer_amt / from_prev_value, 1)

            // expect value
            const from_new_value = from_prev_value  - Math.min(from_prev_value, transfer_amt)
            const to_new_value = Math.min(from_prev_value, transfer_amt);

            // expected cost basis
            const from_new_cost_basis = from_prev_cost_basis - fraction * from_prev_cost_basis;
            const to_new_cost_basis = fraction * from_prev_cost_basis;

            const transfterred = transfer_investment_value(
                [from_label], // this is the only thing we are transfering
                transfer_amt,
                account_manager.pre_tax_group,
                account_manager.after_tax_group,
                mock_simulation_object.expense_withdrawal_strategy
            );

            const to_investment = account_manager.all().get(to_label);
            expect(to_investment).not.toBeNull();

            // we have enough to transfer
            expect(transfterred).toBe(transfer_amt);
            expect(from_investment.get_cost_basis()).toBe(from_new_cost_basis);
            expect(from_investment.get_value()).toBe(from_new_value);

            expect(to_investment!.get_cost_basis()).toBe(to_new_cost_basis);
            expect(to_investment!.get_value()).toBe(to_new_value);

            expect(mock_simulation_object.expense_withdrawal_strategy).toEqual(
                expect.arrayContaining([
                    to_label
                ])
            )
        });

        // rmd is pre tax to non-retirement
        test("mock rmd target account exist", () => {
            const account_manager = create_account_manager(new Set([
                cash_investment_one,
                s_and_p_500_investment_after_tax_one, // value: 2,000
                s_and_p_500_investment_pre_tax_one, // value: 10,000
                s_and_p_500_investment_non_retirement_one, // value: 100,000
            ]));
            const mock_simulation_object = {
                expense_withdrawal_strategy: []
            }

            const transfer_amt = 200;

            const from_label = "S&P 500 pre-tax";
            const to_label = "S&P 500 non-retirement";
            const from_investment = account_manager.pre_tax.get(from_label)!;
            const to_investment = account_manager.non_retirement.get(to_label)!;


            const from_prev_value = from_investment.get_value();
            const from_prev_cost_basis = from_investment.get_cost_basis();

            const to_prev_value = to_investment.get_value();
            const to_prev_cost_basis = to_investment.get_cost_basis();

            // amount to transfering
            // if the amount transfer is too large, we will transfer the investment
            const fraction = Math.min(transfer_amt / from_prev_value, 1)

            // expect value
            const from_new_value = from_prev_value  - Math.min(from_prev_value, transfer_amt)
            const to_new_value = to_prev_value + Math.min(from_prev_value, transfer_amt);

            // expected cost basis
            const from_new_cost_basis = from_prev_cost_basis - fraction * from_prev_cost_basis;
            const to_new_cost_basis = to_prev_cost_basis + fraction * from_prev_cost_basis;

            const transfterred = transfer_investment_value(
                [from_label], // this is the only thing we are transfering
                transfer_amt,
                account_manager.pre_tax_group,
                account_manager.non_retirement_group,
                mock_simulation_object.expense_withdrawal_strategy
            );

            // we have enough to transfer
            expect(transfterred).toBe(transfer_amt);
            expect(from_investment.get_cost_basis()).toBe(from_new_cost_basis);
            expect(from_investment.get_value()).toBe(from_new_value);

            expect(to_investment.get_cost_basis()).toBe(to_new_cost_basis);
            expect(to_investment.get_value()).toBe(to_new_value);
        });

        // rmd is pre tax to non-retirement
        test("mock rmd target account not exist", () => {
            const account_manager = create_account_manager(new Set([
                cash_investment_one,
                s_and_p_500_investment_after_tax_one, // value: 2,000
                s_and_p_500_investment_pre_tax_one, // value: 10,000
            ]));
            const mock_simulation_object = {
                expense_withdrawal_strategy: []
            }

            const transfer_amt = 200;

            const from_label = "S&P 500 pre-tax";
            const to_label = "S&P 500 non-retirement";
            const from_investment = account_manager.pre_tax.get(from_label)!;


            const from_prev_value = from_investment.get_value();
            const from_prev_cost_basis = from_investment.get_cost_basis();


            // amount to transfering
            // if the amount transfer is too large, we will transfer the investment
            const fraction = Math.min(transfer_amt / from_prev_value, 1)

            // expect value
            const from_new_value = from_prev_value  - Math.min(from_prev_value, transfer_amt)
            const to_new_value = Math.min(from_prev_value, transfer_amt);

            // expected cost basis
            const from_new_cost_basis = from_prev_cost_basis - fraction * from_prev_cost_basis;
            const to_new_cost_basis = fraction * from_prev_cost_basis;

            const transfterred = transfer_investment_value(
                [from_label], // this is the only thing we are transfering
                transfer_amt,
                account_manager.pre_tax_group,
                account_manager.non_retirement_group,
                mock_simulation_object.expense_withdrawal_strategy
            );

            const to_investment = account_manager.all().get(to_label);
            expect(to_investment).not.toBeNull();

            // we have enough to transfer
            expect(transfterred).toBe(transfer_amt);
            expect(from_investment.get_cost_basis()).toBe(from_new_cost_basis);
            expect(from_investment.get_value()).toBe(from_new_value);

            expect(to_investment!.get_cost_basis()).toBe(to_new_cost_basis);
            expect(to_investment!.get_value()).toBe(to_new_value);
        })
    })
});