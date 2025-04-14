import { DistributionType } from "../types/Enum";
import { DistributionTypeConfig } from "../types/ConfigTypes";

/**
 * Creates a new distribution configuration based on the target type,
 * preserving values from the current configuration when possible.
 *
 * @param targetType - The distribution type to switch to
 * @param currentConfig - The current distribution configuration
 * @returns A new distribution configuration object
 */
export const create_distribution_config = (
  targetType: string | DistributionType,
  currentConfig: Partial<DistributionTypeConfig> = {}
): DistributionTypeConfig => {
  // Convert string to enum if needed
  const newType = targetType as DistributionType;

  switch (newType) {
    case DistributionType.FIXED:
      return {
        type: DistributionType.FIXED,
        value:
          currentConfig.type === DistributionType.FIXED &&
          currentConfig.value !== undefined
            ? currentConfig.value
            : currentConfig.type === DistributionType.NORMAL &&
              currentConfig.mean !== undefined
            ? currentConfig.mean
            : 0,
      };

    case DistributionType.UNIFORM:
      return {
        type: DistributionType.UNIFORM,
        min:
          currentConfig.type === DistributionType.UNIFORM &&
          currentConfig.min !== undefined
            ? currentConfig.min
            : 0,
        max:
          currentConfig.type === DistributionType.UNIFORM &&
          currentConfig.max !== undefined
            ? currentConfig.max
            : 1,
      };

    case DistributionType.NORMAL:
      return {
        type: DistributionType.NORMAL,
        mean:
          currentConfig.type === DistributionType.NORMAL &&
          currentConfig.mean !== undefined
            ? currentConfig.mean
            : currentConfig.type === DistributionType.FIXED &&
              currentConfig.value !== undefined
            ? currentConfig.value
            : 0,
        standardDeviation:
          currentConfig.type === DistributionType.NORMAL &&
          currentConfig.standardDeviation !== undefined
            ? currentConfig.standardDeviation
            : 1,
      };

    default:
      // Default to FIXED if type is not recognized
      return {
        type: DistributionType.FIXED,
        value: 0,
      };
  }
};

/**
 * Gets a formatted display string for a distribution configuration.
 *
 * @param config - The distribution configuration to format
 * @returns A formatted string representation of the distribution
 */
export const get_distribution_display = (
  config: DistributionTypeConfig
): string => {
  switch (config.type) {
    case DistributionType.FIXED:
      return `${config.value}%`;
    case DistributionType.UNIFORM:
      return `${config.min}% to ${config.max}%`;
    case DistributionType.NORMAL:
      return `μ: ${config.mean}%, σ: ${config.standardDeviation}%`;
    default:
      return "Not set";
  }
};
