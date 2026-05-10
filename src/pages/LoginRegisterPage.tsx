
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, Paper } from "@mui/material";
import SecurityContext from "../auth/SecurityContext";

export default function LoginRegisterPage() {
    const { isInitialised, loggedInUser, login } = useContext(SecurityContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isInitialised && loggedInUser) {
            navigate("/owner");
        }
    }, [isInitialised, loggedInUser, navigate]);

    const handleLogin = () => {
        login();
    };

    const handleRegister = () => {
        const kcUrl = import.meta.env.VITE_KC_URL;
        const realm = import.meta.env.VITE_KC_REALM;
        const clientId = import.meta.env.VITE_KC_CLIENT_ID;
        const redirectUri = window.location.origin;

        window.location.href =
            `${kcUrl}/realms/${realm}/protocol/openid-connect/registrations?` +
            `client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    };

    const loggedIn = !!loggedInUser;

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            sx={{ background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}
        >
            <Paper elevation={4} sx={{ p: 6, width: 400, textAlign: "center" }}>
                <Typography variant="h4" gutterBottom>
                    Welcome to Keep Dishes Going 🍽️
                </Typography>

                <Typography variant="body1" mb={4}>
                    Please log in or create an account to manage your restaurant.
                </Typography>

                {!loggedIn ? (
                    <>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mb: 2 }}
                            onClick={handleLogin}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            onClick={handleRegister}
                        >
                            Register
                        </Button>
                    </>
                ) : (
                    <Typography variant="h6" color="green">
                        You are already logged in!
                    </Typography>
                )}
            </Paper>
        </Box>
    );
}
