import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper, Divider, CircularProgress } from "@mui/material";
import SecurityContext from "../auth/SecurityContext";

export default function LoginRegisterPage() {
    const { isInitialised, loggedInUser, login } = useContext(SecurityContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isInitialised && loggedInUser) {
            navigate("/owner");
        }
    }, [isInitialised, loggedInUser, navigate]);

    const handleRegister = () => {
        const kcUrl = import.meta.env.VITE_KC_URL;
        const realm = import.meta.env.VITE_KC_REALM;
        const clientId = import.meta.env.VITE_KC_CLIENT_ID;
        const redirectUri = window.location.origin;
        window.location.href =
            `${kcUrl}/realms/${realm}/protocol/openid-connect/registrations?` +
            `client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    };

    if (!isInitialised) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{ bgcolor: "background.default", p: 2 }}
        >
            <Paper elevation={0} sx={{ p: { xs: 4, sm: 6 }, width: "100%", maxWidth: 420, border: "1.5px solid", borderColor: "divider" }}>
                <Typography variant="h5" gutterBottom>
                    Owner sign in
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Sign in with your Keycloak account to access your restaurant dashboard.
                </Typography>

                <Button variant="contained" size="large" fullWidth onClick={login} sx={{ mb: 2 }}>
                    Sign in
                </Button>

                <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">or</Typography>
                </Divider>

                <Button variant="outlined" size="large" fullWidth onClick={handleRegister}>
                    Create an account
                </Button>

                <Button
                    variant="text"
                    size="small"
                    fullWidth
                    onClick={() => navigate("/")}
                    sx={{ mt: 3, color: "text.secondary" }}
                >
                    Back to home
                </Button>
            </Paper>
        </Box>
    );
}
