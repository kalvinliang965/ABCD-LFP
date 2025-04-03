import { IncomeType, StateType, TaxFilingStatus } from "../../core/Enums";
import { parse_state_tax_yaml } from "../StateYamlParser";

describe("parse state tax", () => {

    const validYAML = `
    resident_state: "NY"
    tax_brackets:
      - min: 0
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

    it("should parse valid yaml info", () => {
        const result = parse_state_tax_yaml(validYAML);
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
            expect(() => parse_state_tax_yaml(yaml)).toThrowError();
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