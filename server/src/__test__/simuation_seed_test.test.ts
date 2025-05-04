import mongoose from "mongoose";
import { database_config } from "../config/database";
import { scenario_one } from "../core/domain/raw/scenario_raw";
import Scenario from "../db/models/Scenario";
import { create_simulation_environment } from "../core/simulation/ LoadSimulationEnvironment";
import { generate_seed } from "../utils/ValueGenerator";
import { create_simulation_engine } from "../core/simulation/SimulationEngine";
import { compare_simulation_yearly_result, SimulationYearlyResult } from "../core/simulation/SimulationYearlyResult";
import User from "../db/models/User";


function compare_result(r1: SimulationYearlyResult[], r2: SimulationYearlyResult[]): boolean {
    const N = r1.length;
    const M = r2.length;

    if (N != M) {
        return false;
    }
    for (let i = 0 ; i < N; ++i) {
        const yearly_result1 = r1[i];
        const yearly_result2 = r2[i];
        if (!compare_simulation_yearly_result(yearly_result1, yearly_result2)) {
            return false;
        }
    }
    return true;
}

let mongodb;
let scenario_id: string;
describe("Seed test", () => {
    beforeAll(async () => {        
        await mongoose.connect(database_config.MONGO_TEST_URL);
        mongodb = mongoose.connection;

        const user_data = {
            name: "haifeng",
            email: "haifeng@gmail.com",
            password: "dont",
            googleId: null,
            profilePicture: "blah",
            scenarios: {
                name: "test",
                description: "test",
            },
        }

        const new_user = new User(user_data);
        await new_user.save();

        const user = await User.findOne({name: "haifeng"});

        // const scenario_data = {
        //     ...scenario_one,
        //     userId: user._id,
        //     isDraft: false,
        // };
        const scenario_data = {
            ...scenario_one,
            investments: Array.from(scenario_one.investments),
            eventSeries: Array.from(scenario_one.eventSeries),
            investmentTypes: Array.from(scenario_one.investmentTypes),
            userId: user._id,
            isDraft: false,
        };
        //save the new draft to the DB
        const new_scenario = new Scenario(scenario_data);
        scenario_id = String(new_scenario._id);

        await new_scenario.save();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    test("same seed should output same result", async () => {
        const seed1 = generate_seed();
        const seed2 = seed1;
        const N = 10;

        const env1 = await create_simulation_environment(scenario_id, seed1);
        const engine1 = await create_simulation_engine(env1); 
        const result1: SimulationYearlyResult[] = await engine1.run(N);

        const env2 = await create_simulation_environment(scenario_id, seed2);
        const engine2 = await create_simulation_engine(env2); 
        const result2: SimulationYearlyResult[] = await engine2.run(N);
        
        expect(compare_result(result1, result2)).toBe(true);
    });

    test("different seed should have different result", async() => {
        let seed1: string = "";
        let seed2: string = "";
        while (seed1 === seed2) {
            seed1 = generate_seed();
            seed2 = generate_seed();
        }
        const N = 10;
        const env1 = await create_simulation_environment(scenario_id, seed1);
        const engine1 = await create_simulation_engine(env1); 
        const result1: SimulationYearlyResult[] = await engine1.run(N);

        
        const env2 = await create_simulation_environment(scenario_id, seed2);
        const engine2 = await create_simulation_engine(env2); 
        const result2: SimulationYearlyResult[] = await engine2.run(N);
        

        expect(compare_result(result1, result2)).toBe(false);
    })
});