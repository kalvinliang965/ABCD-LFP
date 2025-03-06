import React from 'react';
import { Box } from '@chakra-ui/react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box 
      position="relative"
      minHeight="100vh" 
      overflow="hidden"
      width="100vw"
    >
      <Sidebar />
      
      <Box
        as="main"
        position="relative"
        marginLeft="70px" 
        paddingTop="20px"
        minHeight="100vh"
        height="100vh"
        width="calc(100vw - 70px)"
        overflowX="hidden"
        overflowY="auto"
        right="0"
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
  );
};

export default Layout; 