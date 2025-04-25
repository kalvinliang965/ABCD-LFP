import {
  Flex,
  IconButton,
  useColorMode,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Heading,
  useBreakpointValue,
} from '@chakra-ui/react';
import React from 'react';
import { FaSun, FaMoon, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

/**
 * AI prompt : I need a header component to show the title and the user menu, and in this component, I need to use the chakra ui to switch the color mode, and I need to use the avatar to show the user icon, and I need to use the menu to show the user menu
 */
interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Lifetime Financial Planner' }) => {
  // Get color mode and toggle function from Chakra UI
  const { colorMode, toggleColorMode } = useColorMode();
  // Get colors based on current color mode
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  // Get navigate function for routing
  const navigate = useNavigate();
  // Get auth context for logout
  const { logout } = useAuth();

  // Responsive values for the header's left margin to align with content
  const marginLeft = useBreakpointValue({
    base: '0',
    md: '70px', // Should match the sidebar width
  });

  // Handle logout
  const handleLogout = () => {
    // Call logout function from auth context
    if (logout) {
      logout();
    }

    // Clear any stored tokens
    localStorage.removeItem('token');

    // Navigate to login page
    navigate('/login');
  };

  return (
    <Flex
      as="header"
      width={{ base: '100%', md: 'calc(100% - 70px)' }}
      height="70px"
      align="center"
      justify="space-between"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      position="fixed"
      top="0"
      right="0"
      zIndex="900"
      boxShadow="sm"
      marginLeft={marginLeft}
      px={4}
    >
      {/* Page title */}
      <Heading as="h1" size="md" fontWeight="semibold">
        {title}
      </Heading>

      <Flex align="center">
        {/* Color mode toggle button */}
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          variant="ghost"
          color="current"
          fontSize="lg"
          onClick={toggleColorMode}
          icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
          mr={4}
        />

        {/* User menu */}
        <Menu>
          <MenuButton as={Avatar} size="sm" icon={<FaUser />} />
          <MenuList>
            {/* Link to user profile page */}
            <MenuItem as={Link} to="/profile">
              Profile
            </MenuItem>
            {/* Logout option */}
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Header;
