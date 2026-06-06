import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SecurityContext from "../auth/SecurityContext";
import { getMyRestaurant, openRestaurant, closeRestaurant } from "../services/restaurantService";
import {
    Box,
    Typography,
    Button,
    Container,
    CircularProgress,
    Grid,
    Paper,
    Chip,
    Divider,
} from "@mui/material";
import PageLayout from "../components/PageLayout";

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
        if (!isLoading && restaurant === null) navigate("/create-restaurant");
    }, [restaurant, isLoading, navigate]);

    useEffect(() => {
        if (isError) { logout(); }
    }, [isError, logout]);

    async function handleToggleOpen() {
        if (!restaurant) return;
        setTogglingStatus(true);
        try {
            if (restaurant.isOpen) await closeRestaurant();
            else await openRestaurant();
            queryClient.invalidateQueries({ queryKey: ["myRestaurant"] });
        } finally {
            setTogglingStatus(false);
        }
    }

    if (isLoading || restaurant === undefined) {
        return (
            <PageLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="md">
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                {loggedInUser && (
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Welcome back, {loggedInUser.name.split(" ")[0]}
                    </Typography>
                )}

                {restaurant && (
                    <>
                        {/* Restaurant info */}
                        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <Typography variant="h6">{restaurant.name}</Typography>
                                        <Chip
                                            label={restaurant.isOpen ? "Open" : "Closed"}
                                            color={restaurant.isOpen ? "success" : "error"}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        {restaurant.typeOfCuisine} · {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Prep time: {restaurant.defaultPreparationTime} min · {restaurant.openingHours}
                                    </Typography>
                                </Box>
                                <Button
                                    variant={restaurant.isOpen ? "outlined" : "contained"}
                                    color={restaurant.isOpen ? "error" : "success"}
                                    onClick={handleToggleOpen}
                                    disabled={togglingStatus}
                                >
                                    {restaurant.isOpen ? "Close restaurant" : "Open restaurant"}
                                </Button>
                            </Box>
                        </Paper>

                        <Divider sx={{ mb: 4 }} />

                        {/* Quick actions */}
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>Dishes</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Manage your menu, publish drafts, and control stock.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate(`/restaurant/${restaurant.id}/dishes`)}
                                    >
                                        Manage dishes
                                    </Button>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>Orders</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Accept or reject orders and mark them ready for pickup.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => navigate(`/restaurant/${restaurant.id}/orders`)}
                                    >
                                        Manage orders
                                    </Button>
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <Paper variant="outlined" sx={{ p: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>Price Ranges</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Adjust price thresholds for €, €€, €€€, and €€€€ ranges.
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={() => navigate("/price-range/criteria")}
                                    >
                                        Manage criteria
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
        </PageLayout>
    );
}
