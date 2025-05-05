import { create_state_tax_raw_yaml } from './StateYamlParser';
import { TaxFilingStatus, StateType } from '../types/Enum';

describe('State Tax YAML Parser', () => {
  const validYAML = `
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
      - min: 0
        max: 17150
        rate: 0.04
        taxpayer_type: "couple"
      - min: 17151
        max: null
        rate: 0.045
        taxpayer_type: "couple"
  `;

  test('should parse valid YAML correctly', () => {
    const result = create_state_tax_raw_yaml(validYAML);
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      min: 0,
      max: 8500,
      rate: 0.04,
      taxpayer_type: TaxFilingStatus.INDIVIDUAL,
      resident_state: StateType.NY
    });
    expect(result[3].max).toBe(Infinity); // null max converted to Infinity
  });

  test('should require both individual and couple brackets', () => {
    const missingIndividualYAML = `
      resident_state: "NY"
      tax_brackets:
        - min: 0
          max: 10000
          rate: 0.05
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(missingIndividualYAML))
      .toThrow(/Must provide tax brackets for individual/);
  });

  test('should validate continuous ranges', () => {
    const discontinuousYAML = `
      resident_state: "NJ"
      tax_brackets:
        - min: 0
          max: 5000
          rate: 0.01
          taxpayer_type: "individual"
        - min: 6000
          max: 10000
          rate: 0.02
          taxpayer_type: "individual"
        - min: 0
          max: null
          rate: 0.01
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(discontinuousYAML))
      .toThrow();
  });

  test('should require starting at 0', () => {
    const badStartYAML = `
      resident_state: "CT"
      tax_brackets:
        - min: 1000
          max: 5000
          rate: 0.01
          taxpayer_type: "individual"
        - min: 0
          max: null
          rate: 0.01
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(badStartYAML))
      .toThrow(/must start at 0/);
  });

  test('should only allow null max in last bracket', () => {
    const multipleNullMaxYAML = `
      resident_state: "NY"
      tax_brackets:
        - min: 0
          max: null 
          rate: 0.01
          taxpayer_type: "individual"
        - min: 10000
          max: 20000
          rate: 0.02
          taxpayer_type: "individual"
        - min: 0
          max: null
          rate: 0.01
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(multipleNullMaxYAML))
      .toThrow(/can only have null max in the last bracket/);
  });

  test('should validate state enum', () => {
    const invalidStateYAML = `
      resident_state: "CA" 
      tax_brackets:
        - min: 0
          max: 10000
          rate: 0.01
          taxpayer_type: "individual"
        - min: 0
          max: null
          rate: 0.01
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(invalidStateYAML))
      .toThrow();
  });

  test('should validate rate range', () => {
    const invalidRateYAML = `
      resident_state: "NY"
      tax_brackets:
        - min: 0
          max: 10000
          rate: 1.1
          taxpayer_type: "individual"
        - min: 0
          max: null
          rate: 0.01
          taxpayer_type: "couple"
    `;
    expect(() => create_state_tax_raw_yaml(invalidRateYAML))
      .toThrow(/Number must be less than or equal to 1/);
  });

  test('should handle empty YAML', () => {
    expect(() => create_state_tax_raw_yaml(''))
      .toThrow(/Failed to parse state tax from yaml file/);
  });
});