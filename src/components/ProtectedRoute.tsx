import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import SecurityContext from "../auth/SecurityContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isInitialised, isAuthenticated } = useContext(SecurityContext);

    if (!isInitialised) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated?.()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
