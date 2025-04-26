import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { create_scenario_raw_yaml, scenario_yaml_string } from "../ScenarioYamlParser";
import { create_state_tax_raw_yaml } from "../StateYamlParser";

describe("parse state tax", () => {

    const validYAML = `
    resident_state: "NY"
    tax_brackets:
      - min: 0
        max: 50000
        rate: 0.1
        taxpayer_type: "individual"
        income_type: "TAXABLE_INCOME"
      - min: 50001
        max: null
        rate: 0.2
        taxpayer_type: "couple"
        income_type: "TAXABLE_INCOME"
    `;

    it("should parse valid yaml info", () => {
        const result = create_state_tax_raw_yaml(validYAML);
        console.log(result); 
        expect(result).toEqual([
            {
                min: 0,
                max: 50000,
                rate: 0.1,
                taxpayer_type: TaxFilingStatus.SINGLE,
                resident_state: StateType.NY,
            }, {
                min: 50001,
                max: Infinity,
                rate: 0.2,
                taxpayer_type: TaxFilingStatus.MARRIED,
                resident_state: StateType.NY,
            }
        ]);
    });


    describe("Should reject invalid data", () => {
        const test_error_case = (yaml: string) => {
            expect(() => create_state_tax_raw_yaml(yaml)).toThrowError();
        };

        it("should reject file with missing taxbrackets as entries point", () => {
            
            const invalid_yaml = `
            invalid_key:
            - min: 0
                max: 50000
                rate: 0.1
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
                resident_state: "NJ"
            - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
                resident_state: "NJ"
            `;

            test_error_case(
                invalid_yaml,
            );

        });


        // it("should reject empty tax_brackets ", () => {
        //     const invalid_yaml = `
        //     resident_state: "CT"
        //     tax_brackets: []
        //     `;
        //     test_error_case(
        //         invalid_yaml,
        //     );
        // });


        it("should reject invalid data type for min", () => {
            const invalid_yaml = `
            resident_state: "NY"
            tax_brackets:
              - min: "Invalid number"
                max: 50000
                rate: 0.1
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
            `;

            test_error_case(
                invalid_yaml,
            );
        });

        it("should reject small min", () => {
            const invalid_yaml = `
            resident_state: "NJ"
            tax_brackets:
              - min: -1
                max: 50000
                rate: 0.1
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
            `;

            test_error_case(
                invalid_yaml,
            );
        });

        it("should reject small max", () => {
            const invalid_yaml = `
            resident_state: "NJ"
            tax_brackets:
              - min: 0
                max: -1 
                rate: 0.1
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
            `;

            test_error_case(
                invalid_yaml,
            );
        });

        it("should reject large for rate", () => {

            const invalid_yaml = `
            resident_state: "NY"
            tax_brackets:
              - min: 0
                max: -1 
                rate: 1.2
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
            `;

            test_error_case(
                invalid_yaml,
            );
        });


        it("should reject capital gains", () => {

            const invalid_yaml = `
            resident_state: "NY"
            tax_brackets:
              - min: 0
                max: 600 
                rate: 1.2
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "CAPITAL_GAINS"
            `;

            test_error_case(
                invalid_yaml,
            );
        });
        it("should reject invalid state", () => {

            const invalid_yaml = `
            resident_state: "WA"
            tax_brackets:
              - min: 0
                max: 600 
                rate: 1.2
                taxpayer_type: "SINGLE"
                income_type: "TAXABLE_INCOME"
              - min: 50001
                max: null
                rate: 0.2
                taxpayer_type: "MARRIED"
                income_type: "TAXABLE_INCOME"
            `;

            test_error_case(
                invalid_yaml,
            );
        });
    })
});


describe("parse scenario yaml", () => {
  it("should yaml_string contain scenario data correctly", () => {
    const scenarioRaw = create_scenario_raw_yaml(scenario_yaml_string);
    expect(scenarioRaw).toBeDefined();
    expect(scenarioRaw.name).toBe("Retirement Planning Scenario");
    expect(scenarioRaw.maritalStatus).toBe("couple");
    expect(scenarioRaw.birthYears).toEqual([1985, 1987]);
    
    expect(scenarioRaw.lifeExpectancy.length).toBe(2);
    expect(scenarioRaw.lifeExpectancy[0].type).toBe("fixed");
    expect(scenarioRaw.lifeExpectancy[0].value).toBe(80);
    expect(scenarioRaw.lifeExpectancy[1].type).toBe("normal");
    expect(scenarioRaw.lifeExpectancy[1].mean).toBe(82);
    expect(scenarioRaw.lifeExpectancy[1].stdev).toBe(3);

    expect(scenarioRaw.investments.size).toBe(5);

    expect(scenarioRaw.eventSeries.size).toBe(6);

    const inflation = scenarioRaw.inflationAssumption;
    expect(inflation.type).toBe("fixed");
    expect(inflation.value).toBe(0.03);

    expect(scenarioRaw.afterTaxContributionLimit).toBe(7000);
    expect(scenarioRaw.spendingStrategy).toEqual([
      "vacation",
      "streaming services",
    ]);
    expect(scenarioRaw.expenseWithdrawalStrategy).toEqual([
      "S&P 500 non-retirement",
      "tax-exempt bonds",
      "S&P 500 after-tax",
    ]);
    expect(scenarioRaw.RMDStrategy).toEqual(["S&P 500 pre-tax"]);
    expect(scenarioRaw.RothConversionOpt).toBe(true);
    expect(scenarioRaw.RothConversionStart).toBe(2050);
    expect(scenarioRaw.RothConversionEnd).toBe(2060);
    expect(scenarioRaw.RothConversionStrategy).toEqual(["S&P 500 pre-tax"]);
    expect(scenarioRaw.financialGoal).toBe(10000);
    expect(scenarioRaw.residenceState).toBe("NY");
  });
});