// App entry point: MUI theme, React Query client, and Keycloak auth provider.
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { responsiveFontSizes } from "@mui/material/styles";
import { theme } from "./theme";
import App from "./App";
import "./index.css";
import SecurityContextProvider from "./auth/SecurityContextProvider";

// Single React Query client shared across the whole app
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        {/* ThemeProvider applies the custom MUI theme (  */}
        <ThemeProvider theme={responsiveFontSizes(theme)}>
            {/* CssBaseline resets browser default styles for consistency */}
            <CssBaseline />
            {/* QueryClientProvider makes the React Query cache available everywhere */}
            <QueryClientProvider client={queryClient}>
                {/* SecurityContextProvider initialises Keycloak and exposes auth state */}
                <SecurityContextProvider>
                    <App />
                </SecurityContextProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>
);
