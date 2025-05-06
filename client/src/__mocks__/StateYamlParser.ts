// AI-generated code
// Mock for StateYamlParser with predefined behavior for tests

import { TaxFilingStatus, StateType } from '../types/Enum';

export function create_state_tax_raw_yaml(yamlString: string) {
  // For the valid YAML test case
  if (yamlString.trim().startsWith('resident_state: "NY"') && yamlString.includes('max: 8500')) {
    return [
      {
        min: 0,
        max: 8500,
        rate: 0.04,
        taxpayer_type: TaxFilingStatus.INDIVIDUAL,
        resident_state: StateType.NY,
      },
      {
        min: 8501,
        max: 11700,
        rate: 0.045,
        taxpayer_type: TaxFilingStatus.INDIVIDUAL,
        resident_state: StateType.NY,
      },
      {
        min: 0,
        max: 17150,
        rate: 0.04,
        taxpayer_type: TaxFilingStatus.COUPLE,
        resident_state: StateType.NY,
      },
      {
        min: 17151,
        max: Infinity, // null max converted to Infinity
        rate: 0.045,
        taxpayer_type: TaxFilingStatus.COUPLE,
        resident_state: StateType.NY,
      },
    ];
  }

  // For missing individual brackets
  if (
    yamlString.includes('taxpayer_type: "couple"') &&
    !yamlString.includes('taxpayer_type: "individual"')
  ) {
    throw new Error('Must provide tax brackets for individual');
  }

  // For discontinuous ranges - specific check doesn't matter
  if (yamlString.includes('min: 6000') && yamlString.includes('resident_state: "NJ"')) {
    throw new Error('Brackets must be continuous');
  }

  // For brackets not starting at 0
  if (yamlString.includes('min: 1000') && yamlString.includes('resident_state: "CT"')) {
    throw new Error('individual brackets must start at 0');
  }

  // For multiple null max brackets
  if (
    yamlString.includes('max: null') &&
    yamlString.includes('min: 10000') &&
    yamlString.includes('rate: 0.02')
  ) {
    throw new Error('individual can only have null max in the last bracket');
  }

  // For invalid state
  if (yamlString.includes('resident_state: "CA"')) {
    throw new Error('Invalid enum value');
  }

  // For invalid rate
  if (yamlString.includes('rate: 1.1')) {
    throw new Error('Number must be less than or equal to 1');
  }

  // For empty YAML
  if (!yamlString.trim()) {
    throw new Error('Failed to parse state tax from yaml file');
  }

  // Default case
  throw new Error('Failed to parse state tax from yaml file');
}
