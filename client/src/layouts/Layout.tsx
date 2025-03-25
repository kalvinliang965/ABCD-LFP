import React from "react";
import { Box, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Header from "./Header";

// this component is used to wrap the page content
// which is like the shell for the whole page
// so the page would always have a sidebar and a header
// AI prompt : now combine the sidebar and the header into a layout component, and make sure we will not have the double header and the double sidebar problem, and make sure header will always be on the top and the sidebar will always be on the left.
interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  // Sidebar width values for proper margin
  const sidebarWidth = useBreakpointValue({
    base: "0", // On mobile, the sidebar is hidden or in a different position
    md: "70px", // Default closed sidebar width
  });

  // Header height for content positioning
  const headerHeight = "60px";

  // Optional: prepare for future background
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Box
      display="flex"
      minHeight="100vh"
      width="100%"
      overflow="hidden"
      position="relative"
      bg={bgColor}
      // Future background image can be added here
      // backgroundImage="url('/path/to/background.jpg')"
      // backgroundSize="cover"
      // backgroundPosition="center"
      // backgroundRepeat="no-repeat"
    >
      <Sidebar />

      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        marginLeft={sidebarWidth} // Add margin to account for fixed sidebar
        position="relative"
      >
        <Header title={title} />

        {/* Content wrapper - provides proper padding for fixed header */}
        <Box
          width="100%"
          paddingTop={headerHeight}
          height="100vh" // Full height so children can scroll properly
          display="flex"
          flexDirection="column"
          position="relative"
        >
          <Box
            as="main"
            flex="1"
            paddingBottom="6"
            paddingX="10px"
            overflowY="auto"
            width="100%"
            position="relative"
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
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
