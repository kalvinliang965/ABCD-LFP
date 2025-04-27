// AI-generated code
// Create StateTaxBracket type definition based on the server-side mongoose schema

import { TaxFilingStatus, StateType } from './Enum';

/**
 * StateTaxBracket interface representing state income tax brackets
 */
export interface StateTaxBracket {
  min: number;
  max: number;
  rate: number;
  taxpayer_type: TaxFilingStatus.INDIVIDUAL | TaxFilingStatus.COUPLE;
  resident_state: StateType.CT | StateType.NJ | StateType.NY;
}

export default StateTaxBracket;
