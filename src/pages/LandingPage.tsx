import React, { useContext } from "react";
import { Box, Button, Typography, Container, Stack } from "@mui/material";
import SecurityContext from "../auth/SecurityContext";

const LandingPage: React.FC = () => {
    const { login, isAuthenticated } = useContext(SecurityContext);

    const handleOwner = () => {
        if (isAuthenticated()) {
            window.location.href = "/owner";
        } else {
            login();
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Container maxWidth="sm">
                <Stack spacing={4} alignItems="center" textAlign="center">
                    <Typography variant="h3" fontWeight="bold">
                        Keep Dishes Going 🍽️
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Manage your restaurant or order your favorite meals.
                    </Typography>

                    <Stack spacing={2} width="100%">
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleOwner}
                            sx={{ backgroundColor: "#1976d2", py: 1.5 }}
                        >
                            Continue as Owner
                        </Button>
                        <Button variant="outlined" size="large" sx={{ py: 1.5 }}>
                            Continue as Customer
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
};

export default LandingPage;
