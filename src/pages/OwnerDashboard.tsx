// src/pages/OwnerDashboard.tsx
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SecurityContext from "../auth/SecurityContext";
import { getOwnerProfile } from "../services/ownerService";
import type { OwnerProfile } from "../services/ownerService";
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    CircularProgress,
    Stack
} from "@mui/material";

export default function OwnerDashboard() {

    const { loggedInUser, logout } = useContext(SecurityContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<OwnerProfile | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        getOwnerProfile()
            .then((data) => {
                setProfile(data);
                if (!data.hasRestaurant) {
                    navigate("/create-restaurant");
                }
            })
            .catch(() => {
                alert("Authorization failed");
                logout();
            })
            .finally(() => setLoading(false));
    }, [navigate, logout]);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={4} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Restaurant Management 🍽️
                </Typography>

                {loggedInUser && (
                    <Typography variant="h6" gutterBottom>
                        Welcome, {loggedInUser.name}!
                    </Typography>
                )}

                {profile?.hasRestaurant && (
                    <Stack spacing={2} sx={{ mt: 3 }}>
                        <Typography variant="body1">
                            Restaurant ID: {profile.restaurantId}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() =>
                                navigate(`/restaurant/${profile.restaurantId}/dishes`)
                            }
                        >
                            Manage Dishes
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            disabled
                        >
                            Orders (coming soon)
                        </Button>

                        <Button
                            variant="contained"
                            color="info"
                            disabled
                        >
                            Update Opening Hours (coming soon)
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={logout}
                        >
                            Sign Out
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}
