// Login page
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Divider, CircularProgress, Paper, Container } from "@mui/material";
import SecurityContext from "../auth/SecurityContext";

export default function LoginRegisterPage() {
    const { isInitialised, loggedInUser, login } = useContext(SecurityContext); // read Keycloak auth state
    const navigate = useNavigate();

    // If Keycloak has finished initialising and the user is already logged in
    useEffect(() => {
        if (isInitialised && loggedInUser) {
            navigate("/owner"); // owner is already authenticated — go straight to dashboard
        }
    }, [isInitialised, loggedInUser, navigate]);

    // Builds the Keycloak registration URL directly
    const handleRegister = () => {
        const kcUrl = import.meta.env.VITE_KC_URL;
        const realm = import.meta.env.VITE_KC_REALM;
        const clientId = import.meta.env.VITE_KC_CLIENT_ID;
        const redirectUri = window.location.origin;       // redirect back to the app root after registration
        window.location.href =
            `${kcUrl}/realms/${realm}/protocol/openid-connect/registrations?` +
            `client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    };

    //Keycloak is still doing its check-sso silent check
    if (!isInitialised) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        // Centred card
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{ bgcolor: "background.default", p: 2 }}
        >
            <Container maxWidth="xs"> {/*   keeps the form compact */}
                <Paper variant="outlined" sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Owner Sign In
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Sign in with your account to access your restaurant dashboard.
                    </Typography>

                    {/* redirects the browser to the Keycloak login page */}
                    <Button variant="contained" size="large" fullWidth onClick={login} sx={{ mb: 2 }}>
                        Sign in
                    </Button>

                    <Divider sx={{ my: 2 }}>or</Divider>

                    {/*registration endpoint instead of the login form */}
                    <Button variant="outlined" size="large" fullWidth onClick={handleRegister} sx={{ mb: 2 }}>
                        Create an account
                    </Button>

                    {/*  landing page without logging in */}
                    <Button fullWidth onClick={() => navigate("/")} sx={{ color: "text.secondary" }}>
                        ← Back to home
                    </Button>
                </Paper>
            </Container>
        </Box>
    );
}
