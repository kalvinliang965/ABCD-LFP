import { parse } from "yaml";
import { z } from "zod";
import { TaxFilingStatus } from "../core/Enums";
import { StateType } from "../core/Enums";

const TaxBracketSchema = z.object({
  min:z.number().nonnegative(),
  max:z.number().nullable().refine(v => v == null || v > 0, {
    message: "Max must be null or positive number"
  }),
  rate: z.number().min(0).max(1),
  taxpayer_type: z.enum([TaxFilingStatus.INDIVIDUAL, TaxFilingStatus.COUPLE]),
});

const StateSchema = z.enum([StateType.CT, StateType.NJ, StateType.NY]);

const StateTaxYAMLSchema = z.object({
  resident_state: StateSchema,
  tax_brackets: z.array(TaxBracketSchema).superRefine((brackets, ctx) => {
    // Group brackets by taxpayer type
    const by_taxpayer_type = {
      [TaxFilingStatus.INDIVIDUAL]: brackets.filter(
        b => b.taxpayer_type === TaxFilingStatus.INDIVIDUAL
      ),
      [TaxFilingStatus.COUPLE]:brackets.filter(
        b => b.taxpayer_type === TaxFilingStatus.COUPLE
      ),
    };
    
    for (const taxpayer_type of [TaxFilingStatus.INDIVIDUAL, 
      TaxFilingStatus.COUPLE]) {
        if (by_taxpayer_type[taxpayer_type].length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must provide tax brackets for ${taxpayer_type}`,
            path: ["tax_brackets"]
          });
        }
    }


    for (const taxpayer_type of [TaxFilingStatus.INDIVIDUAL, 
      TaxFilingStatus.COUPLE]) {
        const type_brackets = by_taxpayer_type[taxpayer_type].sort((a,b) => a.min - b.min);

        // check first brackets start with 0
        if (type_brackets.length > 0 && type_brackets[0].min !== 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${taxpayer_type} brackets must start at 0`,
            path: ["tax_brackets"]
          });
        }

        for (let i = 1; i < type_brackets.length; ++i) {
          const prev_bracket = type_brackets[i - 1];
          const current_bracket = type_brackets[i];

          const expected_min = prev_bracket.max === null ? null: prev_bracket.max + 1;

          if (expected_min !== null && current_bracket.min !== expected_min) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${taxpayer_type} brackets must be continous. Expected min ${expected_min} but got ${current_bracket.min} after bracket ending at ${prev_bracket.max}`,
              path: ["tax_brackets", i, "min"]
            });
          }
        }

        // check only last bracket has max=null

        const nullMaxBrackets = type_brackets.filter(b => b.max === null);
        if (nullMaxBrackets.length > 1 || 
            (nullMaxBrackets.length === 1 && nullMaxBrackets[0] !== type_brackets[type_brackets.length - 1])) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${taxpayer_type} can only have null max in the last bracket`,
            path: ["tax_brackets"]
          });
        }
    }
  })
})

export type StateTaxYAML = {
  min: number;
  max: number;
  rate: number;
  taxpayer_type: TaxFilingStatus.INDIVIDUAL | TaxFilingStatus.COUPLE,
  resident_state: StateType,
}

export const state_tax_yaml_string = `
resident_state: "NY"
tax_brackets:
  - min: 0
    max: 8500
    rate: 0.04
    taxpayer_type: "individual"
      
  - min: 8501
    max: 11700
    rate: 0.045
    taxpayer_type: "individual"
      
  - min: 11701
    max: 13900
    rate: 0.0525
    taxpayer_type: "individual"
  
  - min: 13901
    max: 80650
    rate: 0.0585
    taxpayer_type: "individual"
  
  - min: 80651
    max: 215400
    rate: 0.0625
    taxpayer_type: "individual"
  
  - min: 215401
    max: 1077550
    rate: 0.0685
    taxpayer_type: "individual"
  
  - min: 1077551
    max: 5000000
    rate: 0.0965
    taxpayer_type: "individual"
  
  - min: 5000001
    max: 25000000
    rate: 0.103
    taxpayer_type: "individual"
  
  - min: 25000001
    max: null  # No upper limit
    rate: 0.109
    taxpayer_type: "individual"

  - min: 0
    max: 17150
    rate: 0.04
    taxpayer_type: "couple"
  
  - min: 17151
    max: 23600
    rate: 0.045
    taxpayer_type: "couple"
  
  - min: 23601
    max: 27900
    rate: 0.0525
    taxpayer_type: "couple"
  
  - min: 27901
    max: 161550
    rate: 0.0585
    taxpayer_type: "couple"
  
  - min: 161551
    max: 323200
    rate: 0.0625
    taxpayer_type: "couple"
  
  - min: 323201
    max: 2155350
    rate: 0.0685
    taxpayer_type: "couple"
  
  - min: 2155351
    max: 5000000
    rate: 0.0965
    taxpayer_type: "couple"
  
  - min: 5000001
    max: 25000000
    rate: 0.103
    taxpayer_type: "couple"
  
  - min: 25000001
    max: null
    rate: 0.109
    taxpayer_type: "couple"
`
export function create_state_tax_raw_yaml(yaml_string: string): Array<StateTaxYAML> {
  try {
    const raw_data = parse(yaml_string);
    const validated = StateTaxYAMLSchema.parse(raw_data);
    
    return validated.tax_brackets.map(bracket => ({
      ...bracket,
      max: bracket.max ?? Infinity,
      resident_state: validated.resident_state,
    }))
  } catch(error) {
    throw new Error(`Failed to parse state tax from yaml file ${error instanceof Error? error.message: error}`);
  }
}