import React from "react";
import { Box, Container, useBreakpointValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

// this component is used to wrap the page content
// which is like the shell for the whole page
// so the page would always have a sidebar and a header
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

  const paddingX = useBreakpointValue({
    base: "4",
    md: "6",
    lg: "8",
  });

  return (
    <Box display="flex" minHeight="100vh" width="100%" overflow="hidden">
      <Sidebar />

      <Box flex="1" display="flex" flexDirection="column">
        <Header
          title={title}
          contentMaxWidth={contentMaxWidth}
          paddingX={paddingX}
        />

        <Box
          as="main"
          flex="1"
          paddingTop="6"
          paddingBottom="10"
          overflowY="auto"
          width="100%"
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
            px={paddingX}
            py={{ base: "4", lg: "6" }}
            height="auto"
            centerContent={false}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
