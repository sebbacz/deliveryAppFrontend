// App entry point: wraps the component tree with MUI theme, React Query client, and Keycloak SecurityContextProvider.
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import App from "./App";
import "./index.css";
import SecurityContextProvider from "./auth/SecurityContextProvider";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <SecurityContextProvider>
                    <App />
                </SecurityContextProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>
);
