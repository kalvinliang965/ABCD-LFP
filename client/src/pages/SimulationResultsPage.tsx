import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Button,  
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  CheckboxGroup,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import ProbabilityOfSuccessChart from '../components/charts/ProbabilityOfSuccessChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import ShadedLineChart from '../components/charts/ShadedLineChart';
import { useParams, useNavigate } from 'react-router-dom';

// Define chart types
const CHART_TYPES = [
  { id: 'probabilityOfSuccess', name: 'Probability of Success Over Time' },
  { id: 'probabilityRanges', name: 'Probability Ranges for a Selected Quantity Over Time' },
  { id: 'medianOrAverageValues', name: 'Median or Average Values of a Selected Quantity Over Time' }
];

// Define the data structure for investments, income, and expenses
interface DataItem {
  name: string;
  category: 'investment' | 'income' | 'expense';
  taxStatus?: 'non-retirement' | 'pre-tax' | 'after-tax';
  values: number[];
}

// Need to ask kalvin which parameters are needed for each chart type
const SimulationResults: React.FC = () => {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationData, setSimulationData] = useState<any>(null);
  const navigate = useNavigate();
  
  // New state variables for chart selection
  const [showChartSelection, setShowChartSelection] = useState(true);
  const [selectedCharts, setSelectedCharts] = useState<string[]>(['probabilityOfSuccess']);
  const [dollarValueType, setDollarValueType] = useState<'today' | 'future'>('today');
  
  // New state variables for the stacked bar chart
  const [aggregationType, setAggregationType] = useState<'median' | 'average'>('median');
  const [aggregationThreshold, setAggregationThreshold] = useState<number>(10000);
  
  // Helper function to convert investment map to chart data
  function convertMapToDataItems(
    dataMap: Map<number, Map<string, number>>, 
    category: 'investment' | 'income' | 'expense',
    taxStatusMap?: Map<string, 'non-retirement' | 'pre-tax' | 'after-tax'>
  ): DataItem[] {
    const years = Array.from(dataMap.keys()).sort();
    const itemNames = new Set<string>();
  
    // Step 1: Gather all item names
    years.forEach(year => {
      const yearMap = dataMap.get(year)!;
      for (const key of yearMap.keys()) {
        itemNames.add(key);
      }
    });
  
    // Step 2: Build per-item data
    return Array.from(itemNames).map(name => {
      // Determine tax status for investments
      let taxStatus: 'non-retirement' | 'pre-tax' | 'after-tax' | undefined;
      
      if (category === 'investment' && taxStatusMap) {
        taxStatus = taxStatusMap.get(name) || 'non-retirement';
      }
      
      return {
        name,
        category,
        taxStatus,
        values: years.map(year => dataMap.get(year)?.get(name) || 0)
      };
    });
  }
  
  // TODO: Replace with actual API call when ready
  // Right now use mock data
  useEffect(() => {
    const fetchSimulationResults = async () => {
      setLoading(true);
      try {
        // Mock API call - replace with actual API call when ready
        setTimeout(() => {
          // Define years array once to be used across all data
          const years = Array.from({ length: 30 }, (_, i) => 2023 + i);
          const userCurrentAge = 60; // Default starting age
          
          // ===== CONSOLIDATED MOCK DATA GENERATION =====
          
          // 1. Generate probability of success data
          const probabilityArrayData = {
            years: years,
            probabilities: years.map((year, i) => {
              const baseProb = 100 - (i * 2.5);
              const randomAdjustment = Math.random() * 5 - 2.5;
              return Math.max(0, Math.min(100, baseProb + randomAdjustment));
            })
          };
          
          // 2. Generate investment, income, and expense data
          const mockInvestmentMap = new Map<number, Map<string, number>>();
          const mockIncomeMap = new Map<number, Map<string, number>>();
          const mockExpenseMap = new Map<number, Map<string, number>>();
          
          // Tax status mapping for investments
          const investmentTaxStatusMap = new Map<string, 'non-retirement' | 'pre-tax' | 'after-tax'>([
            ['S&P 500 non-retirement', 'non-retirement'],
            ['Bonds non-retirement', 'non-retirement'],
            ['Cash non-retirement', 'non-retirement'],
            ['S&P 500 pre-tax', 'pre-tax'],
            ['Bonds pre-tax', 'pre-tax'],
            ['Cash pre-tax', 'pre-tax'],
            ['S&P 500 after-tax', 'after-tax'],
            ['Bonds after-tax', 'after-tax'],
            ['Cash after-tax', 'after-tax']
          ]);
          
          // Initialize maps
          years.forEach(year => {
            mockInvestmentMap.set(year, new Map<string, number>());
            mockIncomeMap.set(year, new Map<string, number>());
            mockExpenseMap.set(year, new Map<string, number>());
          });
          
          // Fill maps with data
          years.forEach((year, i) => {
            const yearIndex = i;
            const growthFactor = 1 + (yearIndex * 0.05); // 5% growth per year
            const retirementYear = 2023 + 15; // Retirement after 15 years
            const inflationFactor = 1 + (yearIndex * 0.025); // 2.5% inflation per year
            
            // Investment data
            const investmentMap = mockInvestmentMap.get(year)!;
            
            // Non-retirement accounts
            investmentMap.set('S&P 500 non-retirement', 50000 * growthFactor + Math.random() * 5000);
            investmentMap.set('Bonds non-retirement', 30000 * growthFactor + Math.random() * 3000);
            investmentMap.set('Cash non-retirement', 20000 * growthFactor + Math.random() * 1000);
            
            // Pre-tax retirement accounts
            investmentMap.set('S&P 500 pre-tax', 100000 * growthFactor + Math.random() * 10000);
            investmentMap.set('Bonds pre-tax', 50000 * growthFactor + Math.random() * 5000);
            investmentMap.set('Cash pre-tax', 10000 * growthFactor + Math.random() * 1000);
            
            // After-tax retirement accounts
            investmentMap.set('S&P 500 after-tax', 70000 * growthFactor + Math.random() * 7000);
            investmentMap.set('Bonds after-tax', 40000 * growthFactor + Math.random() * 4000);
            investmentMap.set('Cash after-tax', 5000 * growthFactor + Math.random() * 500);
            
            // Income data
            const incomeMap = mockIncomeMap.get(year)!;
            
            // Salary (stops at retirement)
            if (year < retirementYear) {
              const salaryGrowth = 1 + (yearIndex * 0.03); // 3% salary growth per year
              incomeMap.set('Salary', 120000 * salaryGrowth + Math.random() * 5000);
            } else {
              incomeMap.set('Salary', 0);
            }
            
            // Social Security (starts at retirement)
            if (year >= retirementYear) {
              const ssGrowth = 1 + ((yearIndex - 15) * 0.02); // 2% SS growth after retirement
              incomeMap.set('Social Security', 30000 * ssGrowth + Math.random() * 1000);
            } else {
              incomeMap.set('Social Security', 0);
            }
            
            // Investment Income
            const investmentIncomeGrowth = 1 + (yearIndex * 0.07);
            incomeMap.set('Investment Income', 5000 * investmentIncomeGrowth + Math.random() * 1000);
            
            // Pension (starts at retirement)
            if (year >= retirementYear) {
              incomeMap.set('Pension', 40000 + Math.random() * 2000);
            } else {
              incomeMap.set('Pension', 0);
            }
            
            // Expense data
            const expenseMap = mockExpenseMap.get(year)!;
            
            // Housing
            expenseMap.set('Housing', 36000 * inflationFactor + Math.random() * 2000);
            
            // Healthcare (increases more in later years)
            const healthcareGrowth = 1 + (yearIndex * 0.04);
            expenseMap.set('Healthcare', 12000 * healthcareGrowth + Math.random() * 1000);
            
            // Food
            expenseMap.set('Food', 10000 * inflationFactor + Math.random() * 800);
            
            // Transportation
            expenseMap.set('Transportation', 8000 * inflationFactor + Math.random() * 600);
            
            // Entertainment (discretionary)
            expenseMap.set('Entertainment', 6000 * inflationFactor + Math.random() * 500);
            
            // Travel (discretionary)
            expenseMap.set('Travel', 8000 * inflationFactor + Math.random() * 1000);
            
            // Taxes
            const taxRate = year < retirementYear ? 0.25 : 0.15;
            const totalIncome = Array.from(incomeMap.values()).reduce((sum, val) => sum + val, 0);
            expenseMap.set('Taxes', totalIncome * taxRate + Math.random() * 2000);
          });
          
          // 3. Generate probability range data for the shaded line chart
          // Helper function to generate mock percentile data
          function generateMockPercentileData(
            baseValue: number,
            growthRate: number,
            volatility: number,
            hasGoal: boolean = false,
            pattern: 'growth' | 'decline' | 'peak' | 'valley' = 'growth'
          ) {
            const median: number[] = [];
            const range10_90: [number[], number[]] = [[], []];
            const range20_80: [number[], number[]] = [[], []];
            const range30_70: [number[], number[]] = [[], []];
            const range40_60: [number[], number[]] = [[], []];
            
            for (let i = 0; i < years.length; i++) {
              let yearValue: number;
              
              // Apply different patterns to create more realistic scenarios
              switch (pattern) {
                case 'growth':
                  yearValue = baseValue * Math.pow(1 + growthRate, i);
                  break;
                case 'decline':
                  yearValue = baseValue * (1 - i * 0.02);
                  yearValue = Math.max(yearValue, baseValue * 0.3);
                  break;
                case 'peak':
                  if (i < years.length / 3) {
                    yearValue = baseValue * Math.pow(1 + growthRate, i);
                  } else {
                    yearValue = baseValue * Math.pow(1 + growthRate, years.length / 3) * 
                                Math.pow(1 - growthRate/2, i - years.length / 3);
                  }
                  break;
                case 'valley':
                  if (i < years.length / 4) {
                    yearValue = baseValue * Math.pow(1 - growthRate, i);
                  } else {
                    yearValue = baseValue * Math.pow(1 - growthRate, years.length / 4) * 
                                Math.pow(1 + growthRate, i - years.length / 4);
                  }
                  break;
                default:
                  yearValue = baseValue * Math.pow(1 + growthRate, i);
              }
              
              // Volatility increases with time - square root relationship
              const yearVolatility = volatility * Math.sqrt(i + 1);
              
              median.push(yearValue);
              
              // Calculate ranges based on volatility
              range10_90[0].push(Math.max(0, yearValue * (1 - 1.65 * yearVolatility)));
              range10_90[1].push(yearValue * (1 + 1.65 * yearVolatility));
              
              range20_80[0].push(Math.max(0, yearValue * (1 - 1.28 * yearVolatility)));
              range20_80[1].push(yearValue * (1 + 1.28 * yearVolatility));
              
              range30_70[0].push(Math.max(0, yearValue * (1 - 0.84 * yearVolatility)));
              range30_70[1].push(yearValue * (1 + 0.84 * yearVolatility));
              
              range40_60[0].push(Math.max(0, yearValue * (1 - 0.52 * yearVolatility)));
              range40_60[1].push(yearValue * (1 + 0.52 * yearVolatility));
            }
            
            return {
              years,
              median,
              ranges: {
                range10_90: [range10_90[0], range10_90[1]],
                range20_80: [range20_80[0], range20_80[1]],
                range30_70: [range30_70[0], range30_70[1]],
                range40_60: [range40_60[0], range40_60[1]]
              },
              goal: hasGoal ? baseValue * 1.5 : undefined
            };
          }
          
          // Generate probability range data for each metric
          const mockProbabilityRanges = {
            totalInvestments: generateMockPercentileData(1000000, 0.06, 0.15, true, 'peak'),
            totalIncome: generateMockPercentileData(120000, 0.03, 0.08, false, 'decline'),
            totalExpenses: generateMockPercentileData(80000, 0.025, 0.05, false, 'growth'),
            earlyWithdrawalTax: generateMockPercentileData(5000, 0.02, 0.2, false, 'valley'),
            discretionaryExpensesPct: generateMockPercentileData(50, 0.01, 0.1, false, 'growth')
          };
          
          // 4. Set all simulation data at once
          setSimulationData({
            probabilityOfSuccess: probabilityArrayData,
            medianOrAverageValues: {
              years: years,
              data: {
                investments: convertMapToDataItems(mockInvestmentMap, 'investment', investmentTaxStatusMap),
                income: convertMapToDataItems(mockIncomeMap, 'income'),
                expenses: convertMapToDataItems(mockExpenseMap, 'expense')
              }
            },
            probabilityRanges: mockProbabilityRanges
          });
          
          setLoading(false);
        }, 1500); // Simulate loading delay
      } catch (err) {
        console.error('Error fetching simulation results:', err);
        setError('Failed to load simulation results. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchSimulationResults();
  }, [scenarioId]);
  
  // Handle showing charts
  const handleShowCharts = () => {
    setShowChartSelection(false);
  };
  
  // Render the chart selection UI
  const renderChartSelectionUI = () => {
    return (
      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        p={6} 
        shadow="md" 
        bg={useColorModeValue('white', 'gray.700')}
      >
        <Heading as="h2" size="lg" mb={4}>Select Charts to Display</Heading>
        <Text mb={15} fontSize="lg">
          Choose which charts you'd like to see for your simulation results.
          You can select multiple charts to get a comprehensive view of your financial plan.
        </Text>
        
        <VStack align="start" spacing={6} mb={8}>
          <Box width="100%">
            <Text fontWeight="bold" fontSize="lg" mb={2}>Chart Types</Text>
            <CheckboxGroup 
              colorScheme="blue" 
              value={selectedCharts}
              onChange={(values) => setSelectedCharts(values as string[])}
            >
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {CHART_TYPES.map(chart => (
                  <Checkbox key={chart.id} value={chart.id}>
                    {chart.name}
                  </Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </Box>
          
          <Divider />
          
          <Box width="100%">
            <Text fontWeight="bold" fontSize="lg" mb={2}>Dollar Value Display</Text>
            <Text fontSize="lg" color="gray.500" mb={3}>
              Choose how dollar values should be displayed in the charts.
            </Text>
            <RadioGroup 
              onChange={(val) => setDollarValueType(val as 'today' | 'future')} 
              value={dollarValueType}
              colorScheme="blue"
            >
              <Stack direction="row" spacing={5}>
                <Radio value="today">Today's Dollars</Radio>
                <Radio value="future">Future Dollars</Radio>
              </Stack>
            </RadioGroup>
          </Box>
        </VStack>
        
        <Flex justify="flex-end">
          <Button 
            colorScheme="blue" 
            onClick={handleShowCharts}
            isDisabled={selectedCharts.length === 0}
          >
            Generate Charts
          </Button>
        </Flex>
      </Box>
    );
  };
  
  // Render the selected charts
  const renderCharts = () => {
    return (
      <>
        {selectedCharts.includes('probabilityOfSuccess') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>Probability of Success Analysis</Heading>
            <Text mb={4} fontSize="lg">
              This analysis shows the likelihood of meeting your financial goals over time based on 
              the simulation results. A higher probability indicates a greater chance of success.
              {dollarValueType === 'future' && " Values are shown in future dollars."}
              {dollarValueType === 'today' && " Values are shown in today's dollars."}
            </Text>
            
            <ProbabilityOfSuccessChart 
              data={simulationData?.probabilityOfSuccess} 
              dollarValueType={dollarValueType}
              loading={loading}
            />
          </Box>
        )}
        
        {selectedCharts.includes('medianOrAverageValues') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>Financial Values Over Time</Heading>
            <Text mb={4} fontSize="lg">
              This chart shows the {aggregationType} values of investments, income, and expenses over time.
              Use the tabs to switch between different financial categories.
            </Text>
            
            <StackedBarChart 
              years={simulationData?.medianOrAverageValues?.years}
              data={simulationData?.medianOrAverageValues?.data}
              loading={loading}
              dollarValueType={dollarValueType}
              aggregationType={aggregationType}
              onAggregationTypeChange={setAggregationType}
              aggregationThreshold={aggregationThreshold}
              onAggregationThresholdChange={setAggregationThreshold}
            />
          </Box>
        )}
        
        {selectedCharts.includes('probabilityRanges') && (
          <Box mb={8}>
            <Heading as="h2" size="lg" mb={4}>Probability Ranges Over Time</Heading>
            <Text mb={4} fontSize="lg">
              This chart shows the probability ranges for various financial metrics over time.
              The shaded regions represent different probability ranges from the simulation results.
            </Text>
            
            <ShadedLineChart 
              data={simulationData?.probabilityRanges}
              loading={loading}
              dollarValueType={dollarValueType}
            />
          </Box>
        )}
        
        <Flex justify="space-between" mt={8}>
          <Button 
            variant="outline" 
            onClick={() => setShowChartSelection(true)}
          >
            Change Chart Selection
          </Button>
          
          <Button 
            colorScheme="blue" 
            onClick={() => navigate(`/dashboard`)}
          >
            Back to Dashboard
          </Button>
        </Flex>
      </>
    );
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6}>Simulation Results {scenarioId ? `for ${scenarioId}` : ''}</Heading>
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Flex justify="center" align="center" height="400px">
          <Spinner size="xl" />
          <Text ml={4}>Loading simulation results...</Text>
        </Flex>
      ) : (
        <>
          {showChartSelection ? renderChartSelectionUI() : renderCharts()}
        </>
      )}
    </Container>
  );
};

export default SimulationResults;