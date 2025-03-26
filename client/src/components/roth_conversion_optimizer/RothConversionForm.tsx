import React from "react";
export type RothConversionOptimizer = {
    roth_conversion_start: number,
    roth_conversion_end: number,
    roth_conversion_strategy: Array<String>
};

interface RothConversionOptimizerFormProps {
  onBack: () => void;
  onContinue: () => void;
}
export const RothConversionOptimizerForm: React.FC<RothConversionOptimizerFormProps> = ({
  onBack,
  onContinue,
}) => {
    return (
        <div>TODO!</div>
    )
};

export default RothConversionOptimizerForm;
