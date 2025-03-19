import React from "react";
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
} from "@chakra-ui/react";
import { FaSun, FaMoon, FaUser } from "react-icons/fa";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Lifetime Financial Planner",
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Responsive values for the header's left margin to align with content
  const marginLeft = useBreakpointValue({
    base: "0",
    md: "70px", // Should match the sidebar width
  });

  return (
    <Flex
      as="header"
      width={{ base: "100%", md: "calc(100% - 70px)" }}
      height="60px"
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
      <Heading as="h1" size="md" fontWeight="semibold">
        {title}
      </Heading>

      <Flex align="center">
        <IconButton
          aria-label={`Switch to ${
            colorMode === "light" ? "dark" : "light"
          } mode`}
          variant="ghost"
          color="current"
          fontSize="lg"
          onClick={toggleColorMode}
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          mr={4}
        />

        <Menu>
          <MenuButton>
            <Avatar size="sm" icon={<FaUser />} />
          </MenuButton>
          <MenuList>
            <MenuItem>Profile</MenuItem>
            <MenuItem>Account Settings</MenuItem>
            <MenuItem color="red.500">Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default Header;
