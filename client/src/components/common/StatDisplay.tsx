import React from "react";
import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
} from "@chakra-ui/react";

//this is a component that displays a statistic for example in the investment dashboard
//it displays a label, a value, a help text and a description

export interface StatDisplayProps {
  label: string;
  value: string | number;
  helpText?: string;
  description?: string;
  bg?: string;
}

const StatDisplay: React.FC<StatDisplayProps> = ({
  label,
  value,
  helpText,
  description,
  bg,
}) => {
  const statBgColor = useColorModeValue("blue.50", "blue.900");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const labelColor = useColorModeValue("gray.500", "gray.400");

  return (
    <Box>
      <Stat p={3} bg={bg || statBgColor} borderRadius="md">
        <StatLabel color={labelColor}>{label}</StatLabel>
        <StatNumber fontSize="xl">{value}</StatNumber>
        {helpText && <StatHelpText>{helpText}</StatHelpText>}
      </Stat>
      {description && (
        <Text fontSize="sm" mt={2} color={textColor}>
          {description}
        </Text>
      )}
    </Box>
  );
};

export default StatDisplay;
