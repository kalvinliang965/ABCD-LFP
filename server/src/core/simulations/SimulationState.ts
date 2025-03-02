
import { Scenario } from "./Scenario";

export class SimulationState {
    private _current_year: number;
    private _cash_balance: number;
    // private tax_context: TaxContext;
    private _spouse_alive: boolean;
    private _user_alive: boolean;
    
    constructor(
        scenario: Scenario    
    ){
        this._current_year = scenario.start_year;
        this._cash_balance = scenario.initial_cash;
        this._spouse_alive = true;
        this._user_alive = true;
    }

    public get_spouse_alive() {
        return this._spouse_alive;
    }

    public get_user_alive() {
        return this._user_alive;
    }

    public advance_year(simulation_state: SimulationState): void {
        // TODO
    }

    public calculate_networth(): number {
        
        // TODO
        return 0 
    }

}