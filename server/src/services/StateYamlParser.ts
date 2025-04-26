import { parse } from "yaml";
import { z } from "zod";
import { TaxFilingStatus } from "../core/Enums";
import { StateType } from "../core/Enums";

const TaxBracketSchema = z.object({
  min:z.number().nonnegative(),
  max:z.number().nullable().refine(v => v == null || v > 0),
  rate: z.number().min(0).max(1),
  taxpayer_type: z.enum([TaxFilingStatus.SINGLE, TaxFilingStatus.MARRIED]),
});

const StateSchema = z.enum([StateType.CT, StateType.NJ, StateType.NY]);

export type StateTaxYAML = {
  min: number;
  max: number;
  rate: number;
  taxpayer_type: TaxFilingStatus.SINGLE | TaxFilingStatus.MARRIED;
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
    const resident_state = StateSchema.parse(raw_data.resident_state);
    const validated_bracket = TaxBracketSchema.array().parse(raw_data.tax_brackets);
    return validated_bracket.map(bracket => ({
      ...bracket,
      max: bracket.max ?? Infinity,
      resident_state: resident_state,
    }))
  } catch(error) {
    throw new Error(`Failed to parse state tax from yaml file ${error instanceof Error? error.message: error}`);
  }
}