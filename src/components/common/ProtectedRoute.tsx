//owner-only routes
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import SecurityContext from "../../auth/SecurityContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isInitialised, isAuthenticated } = useContext(SecurityContext);

    // kc check-sso to finish before deciding
    if (!isInitialised) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Redirect unauthenticated users to login instead of showing the protected page
    if (!isAuthenticated?.()) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
