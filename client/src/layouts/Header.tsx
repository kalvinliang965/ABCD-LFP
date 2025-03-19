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
  Container,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaSun, FaMoon, FaUser } from "react-icons/fa";

interface HeaderProps {
  title?: string;
  contentMaxWidth?: string;
  paddingX?: string;
}

const Header: React.FC<HeaderProps> = ({
  title = "Lifetime Financial Planner",
  contentMaxWidth,
  paddingX,
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Use responsive values for padding and max width if not provided as props
  const defaultContentMaxWidth = useBreakpointValue({
    base: "100%",
    lg: "1200px",
    xl: "1500px",
    "2xl": "1800px", // For very large screens (like 4K)
  });

  const defaultPaddingX = useBreakpointValue({
    base: "4",
    md: "6",
    lg: "8",
  });

  // Use props if provided, otherwise use default values
  const maxWidth = contentMaxWidth || defaultContentMaxWidth;
  const pX = paddingX || defaultPaddingX;

  return (
    <Flex
      as="header"
      width="100%"
      height="70px"
      align="center"
      justify="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      zIndex="9"
      boxShadow="sm"
    >
      <Container
        maxWidth={maxWidth}
        px={pX}
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
