import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OwnerDashboard from "./pages/OwnerDashboard";
import SecurityContextProvider from "./auth/SecurityContextProvider";
import SecurityContext from "./auth/SecurityContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useContext(SecurityContext);
    return isAuthenticated() ? <>{children}</> : <Navigate to="/" replace />;
};

const App: React.FC = () => {
    return (
        <SecurityContextProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute>
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </SecurityContextProvider>
    );
};

export default App;
