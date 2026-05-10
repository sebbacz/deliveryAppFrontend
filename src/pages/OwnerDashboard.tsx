import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SecurityContext from "../auth/SecurityContext";
import { getMyRestaurant, openRestaurant, closeRestaurant } from "../services/restaurantService";
import {
    Box,
    Typography,
    Button,
    Chip,
    Container,
    Paper,
    CircularProgress,
    Stack,
} from "@mui/material";

export default function OwnerDashboard() {
    const { loggedInUser, logout, isAuthenticated } = useContext(SecurityContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [togglingStatus, setTogglingStatus] = useState(false);

    const { data: restaurant, isLoading, isError } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        enabled: isAuthenticated?.() ?? false,
        retry: false,
    });

    useEffect(() => {
        if (!isLoading && restaurant === null) {
            navigate("/create-restaurant");
        }
    }, [restaurant, isLoading, navigate]);

    useEffect(() => {
        if (isError) {
            alert("Authorization failed");
            logout();
        }
    }, [isError, logout]);

    async function handleToggleOpen() {
        if (!restaurant) return;
        setTogglingStatus(true);
        try {
            if (restaurant.isOpen) {
                await closeRestaurant();
            } else {
                await openRestaurant();
            }
            queryClient.invalidateQueries({ queryKey: ["myRestaurant"] });
        } finally {
            setTogglingStatus(false);
        }
    }

    if (isLoading || restaurant === undefined) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={4} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Restaurant Management
                </Typography>

                {loggedInUser && (
                    <Typography variant="h6" gutterBottom>
                        Welcome, {loggedInUser.name}!
                    </Typography>
                )}

                {restaurant && (
                    <Stack spacing={2} sx={{ mt: 3 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body1">
                                <strong>{restaurant.name}</strong> &mdash; {restaurant.typeOfCuisine}
                            </Typography>
                            <Chip
                                label={restaurant.isOpen ? "Open" : "Closed"}
                                color={restaurant.isOpen ? "success" : "error"}
                                size="small"
                            />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}, {restaurant.country}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => navigate(`/restaurant/${restaurant.id}/dishes`)}
                        >
                            Manage Dishes
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => navigate(`/restaurant/${restaurant.id}/orders`)}
                        >
                            Manage Orders
                        </Button>

                        <Button
                            variant="contained"
                            color={restaurant.isOpen ? "warning" : "success"}
                            onClick={handleToggleOpen}
                            disabled={togglingStatus}
                        >
                            {restaurant.isOpen ? "Close Restaurant" : "Open Restaurant"}
                        </Button>

                        <Button variant="outlined" color="error" onClick={logout}>
                            Sign Out
                        </Button>
                    </Stack>
                )}
            </Paper>
        </Container>
    );
}
