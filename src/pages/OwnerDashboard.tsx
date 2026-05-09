import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SecurityContext from "../auth/SecurityContext";
import { getMyRestaurant } from "../services/restaurantService";
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    CircularProgress,
    Stack,
} from "@mui/material";

export default function OwnerDashboard() {
    const { loggedInUser, logout, isAuthenticated } = useContext(SecurityContext);
    const navigate = useNavigate();

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
                        <Typography variant="body1">
                            <strong>{restaurant.name}</strong> &mdash; {restaurant.typeOfCuisine}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}, {restaurant.country}
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => navigate(`/restaurant/${restaurant.id}/dishes`)}
                        >
                            Manage Dishes
                        </Button>

                        <Button variant="contained" color="secondary" disabled>
                            Orders (coming soon)
                        </Button>

                        <Button variant="contained" color="info" disabled>
                            Opening Hours (coming soon)
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
