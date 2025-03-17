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
  Text,
  Box,
  Heading,
  Container,
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

  // Constants for sidebar dimensions
  const SIDEBAR_WIDTH = "70px";
  const HEADER_HEIGHT = "70px";

  // Use responsive values for padding and max width
  const contentMaxWidth = useBreakpointValue({
    base: "100%",
    lg: "1200px",
    xl: "1500px",
    "2xl": "1800px", // For very large screens (like 4K)
  });

  const paddingX = useBreakpointValue({
    base: "4",
    md: "6",
    lg: "8",
  });

  return (
    <Flex
      as="header"
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height={HEADER_HEIGHT}
      paddingLeft={SIDEBAR_WIDTH}
      align="center"
      justify="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      zIndex="9"
      boxShadow="sm"
    >
      <Container
        maxWidth={contentMaxWidth}
        px={paddingX}
        height="100%"
        centerContent={false}
      >
        <Flex width="100%" height="100%" align="center" justify="space-between">
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
      </Container>
    </Flex>
  );
};

export default Header;
