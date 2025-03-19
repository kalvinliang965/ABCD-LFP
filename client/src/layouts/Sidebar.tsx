import React, { useState } from "react";
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaChartLine,
  FaPlay,
  FaSearch,
  FaCubes,
  FaMoneyBillWave,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaFileUpload,
  FaServer,
} from "react-icons/fa";

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  to: string;
  isActive?: boolean;
  sidebarOpen: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  children,
  to,
  isActive,
  sidebarOpen,
}) => {
  const activeBg = useColorModeValue("blue.500", "blue.200");
  const inactiveBg = "transparent";
  const activeColor = "white";
  const inactiveColor = useColorModeValue("white", "gray.200");

  return (
    <Link to={to} style={{ textDecoration: "none", width: "100%" }}>
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

interface NavGroupProps {
  title: string;
  children: React.ReactNode;
  sidebarOpen: boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({
  title,
  children,
  sidebarOpen,
}) => {
  return (
    <Box width="100%">
      {sidebarOpen && (
        <Text
          px="3"
          fontSize="xs"
          fontWeight="bold"
          textTransform="uppercase"
          color="gray.400"
          letterSpacing="wider"
          mb="1"
        >
          {title}
        </Text>
      )}
      <VStack spacing={1} align="stretch">
        {children}
      </VStack>
      <Divider my="2" borderColor="gray.600" />
    </Box>
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
      bg={useColorModeValue("#1e293b", "gray.800")}
      color="white"
      h="100vh"
      w={sidebarOpen ? "250px" : "70px"}
      position="fixed"
      top="0"
      left="0"
      zIndex="1000"
      transition="all 0.3s ease"
      overflowY="auto"
      flexShrink={0}
      boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
      css={{
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "3px",
        },
      }}
    >
      <Flex
        h="70px"
        alignItems="center"
        px="20px"
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue("#2c3e50", "gray.700")}
        className="sidebar-header"
        justifyContent={sidebarOpen ? "flex-start" : "center"}
      >
        {sidebarOpen ? (
          <Text fontSize="xl" fontWeight="bold">
            LFP
          </Text>
        ) : (
          <Text fontSize="xl" fontWeight="bold">
            L
          </Text>
        )}
      </Flex>

      <VStack spacing={1} align="stretch" p="20px 0" className="sidebar-menu">
        <NavGroup title="Main" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaHome}
            to="/dashboard"
            isActive={location.pathname === "/dashboard"}
            sidebarOpen={sidebarOpen}
          >
            Dashboard
          </NavItem>
        </NavGroup>

        <NavGroup title="Scenarios" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaClipboardList}
            to="/scenarios"
            isActive={location.pathname === "/scenarios"}
            sidebarOpen={sidebarOpen}
          >
            My Scenarios
          </NavItem>
          <NavItem
            icon={FaFileUpload}
            to="/scenarios/import-export"
            isActive={location.pathname === "/scenarios/import-export"}
            sidebarOpen={sidebarOpen}
          >
            Import/Export
          </NavItem>
          <NavItem
            icon={FaServer}
            to="/scenarios/shared"
            isActive={location.pathname === "/scenarios/shared"}
            sidebarOpen={sidebarOpen}
          >
            Shared Scenarios
          </NavItem>
        </NavGroup>

        <NavGroup title="Scenario Builder" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaUser}
            to="/builder/basic-info"
            isActive={location.pathname.startsWith("/builder/basic-info")}
            sidebarOpen={sidebarOpen}
          >
            Basic Info
          </NavItem>
          <NavItem
            icon={FaMoneyBillWave}
            to="/builder/investments"
            isActive={location.pathname.startsWith("/builder/investments")}
            sidebarOpen={sidebarOpen}
          >
            Investments
          </NavItem>
          <NavItem
            icon={FaClipboardList}
            to="/builder/events"
            isActive={location.pathname.startsWith("/builder/events")}
            sidebarOpen={sidebarOpen}
          >
            Event Series
          </NavItem>
          <NavItem
            icon={FaCubes}
            to="/builder/strategies"
            isActive={location.pathname.startsWith("/builder/strategies")}
            sidebarOpen={sidebarOpen}
          >
            Strategies
          </NavItem>
        </NavGroup>

        <NavGroup title="Simulation" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaPlay}
            to="/simulation/run"
            isActive={location.pathname === "/simulation/run"}
            sidebarOpen={sidebarOpen}
          >
            Run Simulation
          </NavItem>
          <NavItem
            icon={FaChartLine}
            to="/simulation/results"
            isActive={location.pathname === "/simulation/results"}
            sidebarOpen={sidebarOpen}
          >
            Results & Charts
          </NavItem>
        </NavGroup>

        <NavGroup title="Exploration" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaSearch}
            to="/exploration/one-dimension"
            isActive={location.pathname === "/exploration/one-dimension"}
            sidebarOpen={sidebarOpen}
          >
            One-Dimensional
          </NavItem>
          <NavItem
            icon={FaCubes}
            to="/exploration/two-dimension"
            isActive={location.pathname === "/exploration/two-dimension"}
            sidebarOpen={sidebarOpen}
          >
            Two-Dimensional
          </NavItem>
        </NavGroup>

        <NavGroup title="Account" sidebarOpen={sidebarOpen}>
          <NavItem
            icon={FaCog}
            to="/settings"
            isActive={location.pathname === "/settings"}
            sidebarOpen={sidebarOpen}
          >
            Settings
          </NavItem>
          <NavItem
            icon={FaSignOutAlt}
            to="/logout"
            isActive={location.pathname === "/logout"}
            sidebarOpen={sidebarOpen}
          >
            Logout
          </NavItem>
        </NavGroup>
      </VStack>
    </Box>
  );
};

export default Sidebar;
