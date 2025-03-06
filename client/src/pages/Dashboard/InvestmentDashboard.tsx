import React, { useState } from 'react';
import {
  Heading,
  Flex,
  Divider,
  useDisclosure,
  Avatar,
  Container
} from '@chakra-ui/react';
import { 
  FaBuilding, 
  FaCoins, 
  FaChartLine, 
  FaMoneyBillWave,
  FaBitcoin
} from 'react-icons/fa';
import Layout from '../../components/Layout';
import AddEventSeriesModal from '../../components/AddEventSeriesModal';
import AddStrategyModal from '../../components/AddStrategyModal';
import FilterBar from '../../components/dashboard/FilterBar';
import InvestmentSummary from '../../components/dashboard/InvestmentSummary';
import InvestmentList from '../../components/dashboard/InvestmentList';
import EventSeriesList from '../../components/dashboard/EventSeriesList';
import StrategyList from '../../components/dashboard/StrategyList';
import AddInvestmentModal from '../../components/dashboard/AddInvestmentModal';

// Sample investment data
const investmentData = [
  {
    id: 1,
    name: "Real Estate Trust",
    icon: <FaBuilding />,
    date: "2023-12-20",
    value: "¥50,000",
    returnRate: 6.8,
    status: "In Progress" as const,
    description: "REIT investment focused on commercial properties",
    expenseRatio: 0.75,
    returnType: "normal" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const
  },
  {
    id: 2,
    name: "Gold ETF",
    icon: <FaCoins />,
    date: "2023-11-25",
    value: "¥10,000",
    returnRate: 3.1,
    status: "Pending" as const,
    description: "Exchange-traded fund tracking gold prices",
    expenseRatio: 0.4,
    returnType: "gbm" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const
  },
  {
    id: 3,
    name: "Stock Portfolio",
    icon: <FaChartLine />,
    date: "2023-11-10",
    value: "¥25,000",
    returnRate: 8.5,
    status: "In Progress" as const,
    description: "Diversified stock portfolio with focus on tech sector",
    expenseRatio: 0.3,
    returnType: "gbm" as const,
    dividendType: "normal" as const,
    taxability: "taxable" as const
  },
  {
    id: 4,
    name: "Bond Fund",
    icon: <FaMoneyBillWave />,
    date: "2023-10-15",
    value: "¥15,000",
    returnRate: 4.2,
    status: "Completed" as const,
    description: "Investment grade corporate bonds",
    expenseRatio: 0.2,
    returnType: "fixed" as const,
    dividendType: "fixed" as const,
    taxability: "tax-exempt" as const
  },
  {
    id: 5,
    name: "Cryptocurrency",
    icon: <FaBitcoin />,
    date: "2023-09-05",
    value: "¥5,000",
    returnRate: -12.5,
    status: "Rejected" as const,
    description: "Bitcoin and Ethereum investment",
    expenseRatio: 1.0,
    returnType: "gbm" as const,
    dividendType: "fixed" as const,
    taxability: "taxable" as const
  }
];

// Sample event series data
const eventSeriesData = [
  {
    id: 1,
    name: "Salary Income",
    description: "Monthly salary from primary employment",
    type: "income" as const,
    startYear: 2023,
    duration: 40,
    initialAmount: "¥120,000",
    annualChange: "3%",
    inflationAdjusted: true,
    isSocialSecurity: false
  },
  {
    id: 2,
    name: "Retirement Investment",
    description: "Long-term retirement savings strategy",
    type: "invest" as const,
    startYear: 2023,
    duration: 35,
    assetAllocation: [
      { investment: "Stock Portfolio", percentage: 70 },
      { investment: "Bond Fund", percentage: 30 }
    ],
    maxCash: "¥20,000"
  },
  {
    id: 3,
    name: "Housing Expense",
    description: "Mortgage and housing maintenance costs",
    type: "expense" as const,
    startYear: 2023,
    duration: 30,
    initialAmount: "¥30,000",
    annualChange: "2%",
    inflationAdjusted: true,
    isDiscretionary: false
  }
];

// Sample strategy data
const strategyData = [
  {
    id: 1,
    name: "Primary Spending Plan",
    type: "spending" as const,
    description: "Priority order for discretionary expenses",
    items: ["Travel", "Entertainment", "Dining Out", "Hobbies"]
  },
  {
    id: 2,
    name: "Emergency Fund Strategy",
    type: "withdrawal" as const,
    description: "Order for selling investments in case of emergency",
    items: ["Cash", "Bond Fund", "Gold ETF", "Stock Portfolio", "Real Estate Trust"]
  }
];

const InvestmentDashboard: React.FC = () => {
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // State for modals
  const { 
    isOpen: isInvestmentModalOpen, 
    onOpen: onInvestmentModalOpen, 
    onClose: onInvestmentModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isEventModalOpen, 
    onOpen: onEventModalOpen, 
    onClose: onEventModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isStrategyModalOpen, 
    onOpen: onStrategyModalOpen, 
    onClose: onStrategyModalClose 
  } = useDisclosure();
  
  const [strategyType, setStrategyType] = useState<'spending' | 'withdrawal'>('spending');
  
  // State for data
  const [investments, setInvestments] = useState(investmentData);
  const [eventSeries, setEventSeries] = useState(eventSeriesData);
  const [strategies, setStrategies] = useState(strategyData);
  
  // State for new investment form
  const [newInvestment, setNewInvestment] = useState({
    name: '',
    description: '',
    value: '',
    returnRate: 0,
    status: 'In Progress',
    returnType: 'fixed',
    expenseRatio: 0.5,
    dividendType: 'fixed',
    taxability: 'taxable'
  });
  
  // Handler functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewInvestment({ ...newInvestment, [id]: value });
  };
  
  const handleNumberInputChange = (id: string, value: string) => {
    setNewInvestment({ ...newInvestment, [id]: parseFloat(value) });
  };
  
  const handleCreateInvestment = () => {
    const newItem = {
      id: Date.now(),
      name: newInvestment.name,
      icon: <FaBuilding />,
      date: new Date().toISOString().split('T')[0],
      value: newInvestment.value,
      returnRate: newInvestment.returnRate,
      status: newInvestment.status as 'In Progress' | 'Completed' | 'Pending' | 'Rejected',
      description: newInvestment.description,
      expenseRatio: newInvestment.expenseRatio,
      returnType: newInvestment.returnType as 'fixed' | 'normal' | 'gbm',
      dividendType: newInvestment.dividendType as 'fixed' | 'normal' | 'gbm',
      taxability: newInvestment.taxability as 'tax-exempt' | 'taxable'
    };
    
    setInvestments([...investments, newItem as any]);
    onInvestmentModalClose();
    
    // Reset form
    setNewInvestment({
      name: '',
      description: '',
      value: '',
      returnRate: 0,
      status: 'In Progress',
      returnType: 'fixed',
      expenseRatio: 0.5,
      dividendType: 'fixed',
      taxability: 'taxable'
    });
  };
  
  const handleAddEventSeries = (eventSeries: any) => {
    setEventSeries(prev => [...prev, { ...eventSeries, id: Date.now() }]);
  };
  
  const handleAddStrategy = (strategy: any) => {
    setStrategies(prev => [...prev, strategy]);
  };
  
  const openStrategyModal = (type: 'spending' | 'withdrawal') => {
    setStrategyType(type);
    onStrategyModalOpen();
  };
  
  // Filter and sort investments
  const filteredInvestments = investments
    .filter(investment => {
      const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (investment.description && investment.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = status === 'all' || 
                           investment.status.toLowerCase().replace(' ', '-') === status.toLowerCase();
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = parseFloat(a.value.replace(/[^\d.-]/g, '')) - parseFloat(b.value.replace(/[^\d.-]/g, ''));
          break;
        case 'return':
          comparison = a.returnRate - b.returnRate;
          break;
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Calculate summary values
  const totalValue = investments.reduce((sum, investment) => sum + parseFloat(investment.value.replace(/[^\d.-]/g, '')), 0);
  const totalInvestmentReturn = investments.reduce((sum, investment) => sum + investment.returnRate, 0) / investments.length;

  return (
    <Layout>
      <Container 
        maxW="100%"
        pt="30px"
        pb="50px"
        px="20px"
        height="auto"
      >
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Investment Dashboard</Heading>
          <Flex alignItems="center">
            <Avatar size="sm" name="User Avatar" src="/user-avatar.png" mr={2} />
          </Flex>
        </Flex>
        
        <FilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          status={status}
          setStatus={setStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
        
        <InvestmentSummary
          totalInvestments={investments.length}
          totalInvestmentReturn={totalInvestmentReturn}
          totalValue={`¥${totalValue.toLocaleString()}`}
          totalExpenses="¥1,050"
        />
        
        <InvestmentList
          investments={filteredInvestments as any}
          onOpenInvestmentModal={onInvestmentModalOpen}
        />
        
        <Divider my={8} />
        
        <EventSeriesList
          eventSeries={eventSeries}
          onOpenEventModal={onEventModalOpen}
        />
        
        <Divider my={8} />
        
        <StrategyList
          strategies={strategies}
          onOpenStrategyModal={openStrategyModal}
        />
        
        {/* Modals */}
        <AddInvestmentModal
          isOpen={isInvestmentModalOpen}
          onClose={onInvestmentModalClose}
          newInvestment={newInvestment}
          handleInputChange={handleInputChange}
          handleNumberInputChange={handleNumberInputChange}
          handleCreateInvestment={handleCreateInvestment}
        />
        
        <AddEventSeriesModal
          isOpen={isEventModalOpen}
          onClose={onEventModalClose}
          onAdd={handleAddEventSeries}
          existingEventSeries={eventSeries}
          investments={investments}
        />
        
        <AddStrategyModal
          isOpen={isStrategyModalOpen}
          onClose={onStrategyModalClose}
          onAdd={handleAddStrategy}
          type={strategyType}
          investments={investments}
          expenses={eventSeries.filter(event => event.type === 'expense')}
        />
      </Container>
    </Layout>
  );
};

export default InvestmentDashboard;
