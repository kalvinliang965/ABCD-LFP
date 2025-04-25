import { Box, Heading, Text } from '@chakra-ui/react';
import ReactECharts from 'echarts-for-react';
import React from 'react';

// Define the props interface
interface ProbabilityOfSuccessChartProps {
  data?: {
    years: number[];
    probabilities: number[];
  };
  title?: string;
  loading?: boolean;
  dollarValueType?: 'today' | 'future';
}

const ProbabilityOfSuccessChart: React.FC<ProbabilityOfSuccessChartProps> = ({
  data,
  title = 'Probability of Success Over Time',
  loading = false,
  dollarValueType = 'today',
}) => {
  // Generate mock data if no data is provided
  //for chart 1, the parameters are:
  //years:
  //probabilities:
  const mockData = {
    years: [],
    probabilities: [],
  };

  // Use provided data or fallback to mock data

  const chartData = data || mockData;

  // Configure chart options
  const options = {
    title: {
      text: title,

      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const year = params[0].axisValue;
        const probability = params[0].data.toFixed(1);
        return `Year: ${year}<br/>Probability of Success: ${probability}%<br/>Values in: ${dollarValueType === 'today' ? "Today's Dollars" : 'Future Dollars'}`;
      },
    },
    xAxis: {
      type: 'category',
      data: chartData.years,
      name: 'Year',
      nameLocation: 'middle',
      nameGap: 30,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      name: 'Probability (%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'Probability of Success',
        type: 'line',
        data: chartData.probabilities,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#5470c6',
        },
        itemStyle: {
          color: '#5470c6',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(84, 112, 198, 0.5)',
              },
              {
                offset: 1,
                color: 'rgba(84, 112, 198, 0.1)',
              },
            ],
          },
        },
      },
    ],
    grid: {
      left: '5%',
      right: '5%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" bg="white" mb={6}>
      <ReactECharts option={options} style={{ height: '400px' }} showLoading={loading} />
      <Text fontSize="lg" mt={2} color="gray.600" textAlign="center">
        {dollarValueType === 'future' && ' Values are shown in future dollars.'}
        {dollarValueType === 'today' && " Values are shown in today's dollars."}
      </Text>

      <Text fontSize="sm" mt={2} color="gray.600" textAlign="center">
        This chart shows the probability of meeting your financial goals over time based on
        simulation results. A higher percentage indicates a greater likelihood of success.
      </Text>
    </Box>
  );
};

export default ProbabilityOfSuccessChart;
