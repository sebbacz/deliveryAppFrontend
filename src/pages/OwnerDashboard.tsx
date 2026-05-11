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
    Grid,
    Divider,
} from "@mui/material";
import PageLayout from "../components/PageLayout";

type ActionCardProps = {
    title: string;
    description: string;
    buttonLabel: string;
    onClick: () => void;
    disabled?: boolean;
    color?: "primary" | "secondary" | "warning" | "success" | "error";
};

function ActionCard({ title, description, buttonLabel, onClick, disabled, color = "primary" }: ActionCardProps) {
    return (
        <Paper
            elevation={0}
            sx={{ p: 3, border: "1.5px solid", borderColor: "divider", height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}
        >
            <Typography variant="subtitle1">{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>{description}</Typography>
            <Button variant="contained" color={color} onClick={onClick} disabled={disabled} fullWidth>
                {buttonLabel}
            </Button>
        </Paper>
    );
}

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
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Dashboard
                    </Typography>
                    {loggedInUser && (
                        <Typography color="text.secondary">Welcome back, {loggedInUser.name}</Typography>
                    )}
                </Box>

                {restaurant && (
                    <>
                        {/* Restaurant info card */}
                        <Paper elevation={0} sx={{ p: 3, mb: 4, border: "1.5px solid", borderColor: "divider" }}>
                            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
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
                                        {restaurant.typeOfCuisine} &bull; {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Prep time: {restaurant.defaultPreparationTime} min &bull; {restaurant.openingHours}
                                    </Typography>
                                </Box>
                                <Button
                                    variant={restaurant.isOpen ? "outlined" : "contained"}
                                    color={restaurant.isOpen ? "error" : "success"}
                                    onClick={handleToggleOpen}
                                    disabled={togglingStatus}
                                    sx={{ whiteSpace: "nowrap" }}
                                >
                                    {restaurant.isOpen ? "Close restaurant" : "Open restaurant"}
                                </Button>
                            </Box>
                        </Paper>

                        <Divider sx={{ mb: 4 }} />

                        {/* Action grid */}
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ActionCard
                                    title="Dishes"
                                    description="Create drafts, publish your menu, and manage stock availability."
                                    buttonLabel="Manage dishes"
                                    onClick={() => navigate(`/restaurant/${restaurant.id}/dishes`)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <ActionCard
                                    title="Orders"
                                    description="Accept or reject incoming orders and mark them ready for pickup."
                                    buttonLabel="Manage orders"
                                    onClick={() => navigate(`/restaurant/${restaurant.id}/orders`)}
                                    disabled
                                    color="secondary"
                                />
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
        </PageLayout>
    );
}
