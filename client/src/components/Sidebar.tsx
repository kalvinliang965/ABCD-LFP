import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  Icon, 
  Text, 
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartLine,
  FaWallet,
  FaHistory,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
  sidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to, isActive, sidebarOpen }) => {
  const activeBg = useColorModeValue('blue.500', 'blue.200');
  const inactiveBg = 'transparent';
  const activeColor = 'white';
  const inactiveColor = useColorModeValue('white', 'gray.200');

  return (
    <Link to={to} style={{ textDecoration: 'none', width: '100%' }}>
      <Flex
        align="center"
        p="3"
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : inactiveBg}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: activeBg,
          color: activeColor,
        }}
        transition="all 0.3s"
        justifyContent={sidebarOpen ? "flex-start" : "center"}
      >
        {icon && (
          <Icon
            fontSize="16"
            as={icon}
            className="menu-icon"
            mr={sidebarOpen ? "3" : "0"}
          />
        )}
        {sidebarOpen && <Text className="menu-text">{children}</Text>}
      </Flex>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <Box
      as="nav"
      className={`sidebar ${sidebarOpen ? "open" : "closed"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
      bg={useColorModeValue('#1e293b', 'gray.800')}
      color="white"
      h="100vh"
      w={sidebarOpen ? "250px" : "70px"}
      position="fixed"
      left="0"
      top="0"
      zIndex="10"
      transition="all 0.3s ease"
    >
      <Flex 
        h="70px" 
        alignItems="center" 
        px="20px"
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue('#2c3e50', 'gray.700')}
        className="sidebar-header"
        justifyContent={sidebarOpen ? "flex-start" : "center"}
      >
        {sidebarOpen ? <Text fontSize="xl" fontWeight="bold">ByeWind</Text> : <Text fontSize="xl" fontWeight="bold">B</Text>}
      </Flex>
      
      <VStack spacing={1} align="stretch" p="20px 0" className="sidebar-menu">
        <NavItem 
          icon={FaChartLine} 
          to="/dashboard"
          isActive={location.pathname === '/dashboard'}
          sidebarOpen={sidebarOpen}
        >
          Overview
        </NavItem>
        <NavItem 
          icon={FaWallet} 
          to="/dashboard/investment"
          isActive={location.pathname === '/dashboard/investment'}
          sidebarOpen={sidebarOpen}
        >
          Investments
        </NavItem>
        <NavItem 
          icon={FaHistory} 
          to="/transactions"
          isActive={location.pathname === '/transactions'}
          sidebarOpen={sidebarOpen}
        >
          Transactions
        </NavItem>
        <NavItem 
          icon={FaCog} 
          to="/settings"
          isActive={location.pathname === '/settings'}
          sidebarOpen={sidebarOpen}
        >
          Settings
        </NavItem>
        <NavItem 
          icon={FaSignOutAlt} 
          to="/logout"
          isActive={location.pathname === '/logout'}
          sidebarOpen={sidebarOpen}
        >
          Logout
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;
