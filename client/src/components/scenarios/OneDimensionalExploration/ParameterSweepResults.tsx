import React from 'react';
import {
  Box,
  Text,
} from '@chakra-ui/react';
import ParameterSweepCharts from './ParameterSweepCharts';

interface ParameterSweepResultsProps {
  results: any;
}

const ParameterSweepResults: React.FC<ParameterSweepResultsProps> = ({ results }) => {
  if (!results || !Array.isArray(results.data) || results.data.length === 0) {
    return (
      <Box p={5} borderWidth="1px" borderRadius="lg">
        <Text>No results available.</Text>
      </Box>
    );
  }

  return (
    <Box p={5} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
      <ParameterSweepCharts results={results} />
    </Box>
  );
};

export default ParameterSweepResults; 