import React from "react";
import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  // Use responsive values based on screen size
  const contentMaxWidth = useBreakpointValue({
    base: "100%",
    lg: "1200px",
    xl: "1500px",
    "2xl": "1800px", // For very large screens (like 4K)
  });

  // Constants for sidebar and header dimensions
  const SIDEBAR_WIDTH = "70px";
  const HEADER_HEIGHT = "70px";

  return (
    <Box position="relative" minHeight="100vh" width="100%" overflow="hidden">
      <Sidebar />
      <Header title={title} />

      <Box
        as="main"
        position="relative"
        paddingLeft={SIDEBAR_WIDTH}
        marginTop={HEADER_HEIGHT}
        paddingTop="6"
        paddingBottom="10"
        minHeight={`calc(100vh - ${HEADER_HEIGHT})`}
        height="auto"
        width="100%"
        overflowY="auto"
        display="flex"
        justifyContent="center"
        sx={{
          "&::-webkit-scrollbar": {
            width: "10px",
            borderRadius: "5px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "5px",
          },
        }}
        className="main-content"
      >
        <Container
          maxWidth={contentMaxWidth}
          px={{ base: "4", md: "6", lg: "8" }}
          py={{ base: "4", lg: "6" }}
          height="auto"
          centerContent={false}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
