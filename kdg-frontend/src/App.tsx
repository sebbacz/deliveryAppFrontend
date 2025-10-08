import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import LandingPage from "./pages/LandingPage";
import OwnerLoginPage from "./pages/OwnerLoginPage";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import CustomerHomePage from "./pages/CustomerHomePage";

const theme = createTheme({
    palette: {
        primary: { main: "#1976d2" },
        secondary: { main: "#ff9800" },
    },
});

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/owner/login" element={<OwnerLoginPage />} />
                    <Route path="/owner/restaurant" element={<CreateRestaurantPage />} />
                    <Route path="/customer" element={<CustomerHomePage />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}
