import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";

// Import routes
import AppRoutes from "./routes";

// Custom theme with color mode config
const theme = extendTheme({
  fonts: {
    heading: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    body: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#bae7ff",
      500: "#1890ff",
      600: "#096dd9",
      700: "#0050b3",
    },
  },
  styles: {
    global: (props: { colorMode: "light" | "dark" }) => ({
      // Preserve original CSS for login page
      ".main": {
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      },
      ".is-hidden": {
        opacity: 0,
        visibility: "hidden",
        transition: "0.25s",
        position: "absolute",
      },
      ".is-gx": {
        animation: "is-gx 1.25s",
      },
      "@keyframes is-gx": {
        "0%, 10%, 100%": {
          width: "400px",
        },
        "30%, 50%": {
          width: "500px",
        },
      },
      // Body background color based on color mode
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "white",
        color: props.colorMode === "dark" ? "white" : "gray.800",
      },
    }),
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: true,
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Router>
        <AppRoutes />
      </Router>
    </ChakraProvider>
  );
}

export default App;
