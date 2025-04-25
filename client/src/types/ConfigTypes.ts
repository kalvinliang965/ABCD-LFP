import { DistributionType } from './Enum';

export type DistributionTypeConfig = {
  type: DistributionType;
  value?: number; // For fixed type
  min?: number; // For uniform type
  max?: number; // For uniform type
  mean?: number; // For normal type
  standardDeviation?: number; // For normal type
};
