// Owner dashboard
import { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SecurityContext from "../auth/SecurityContext";
import { getMyRestaurant, openRestaurant, closeRestaurant, deleteMyRestaurant } from "../services/restaurantService";
import {
    Box, Typography, Button, Container, CircularProgress,
    Grid, Paper, Chip, Divider,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { PageLayout } from "../components/common";

export default function OwnerDashboardPage() {
    const { loggedInUser, logout, isAuthenticated } = useContext(SecurityContext);
    const navigate = useNavigate();
    const queryClient = useQueryClient(); //  invalidate cached restaurant data
    const [togglingStatus, setTogglingStatus] = useState(false);   // disables the open/close button while the request
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // controls the confirmation dialog visibility
    const [deleting, setDeleting] = useState(false);               // disables the delete button while the request

    //  the logged-in owner's restauran
    const { data: restaurant, isLoading, isError } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        enabled: isAuthenticated?.() ?? false,
        retry: false, // error  expected when no restaurant exists
    });

    //  the owner has no restaurant yet — redirect to create one
    useEffect(() => {
        if (!isLoading && restaurant === null) navigate("/create-restaurant");
    }, [restaurant, isLoading, navigate]);

    //  log the user out to avoid a stuck state
    useEffect(() => {
        if (isError) { logout(); }
    }, [isError, logout]);

    // Permanently deletes the restaurant and redirects to the create page
    async function handleDelete() {
        setDeleting(true);
        try {
            await deleteMyRestaurant();
            queryClient.removeQueries({ queryKey: ["myRestaurant"] }); // clear stale data from cache
            navigate("/create-restaurant");
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
        }
    }

    // Toggles the restaurant between open and closed based on current state
    async function handleToggleOpen() {
        if (!restaurant) return;
        setTogglingStatus(true);
        try {
            if (restaurant.isOpen) await closeRestaurant();
            else await openRestaurant();
            queryClient.invalidateQueries({ queryKey: ["myRestaurant"] }); // refresh the open/closed
        } finally {
            setTogglingStatus(false);
        }
    }

    //   restaurant query is in progress or the result is undefined
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
                <Typography variant="h4" gutterBottom>Dashboard</Typography>
                {/* welecome mess */}
                {loggedInUser && (
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Welcome back, {loggedInUser.name.split(" ")[0]}
                    </Typography>
                )}

                {restaurant && (
                    <>
                        {/*  summary with open/close   */}
                        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                                <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                        <Typography variant="h6">{restaurant.name}</Typography>
                                        {/* Green chip = open, red chip = closed */}
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
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {/* Button label  */}
                                    <Button
                                        variant={restaurant.isOpen ? "outlined" : "contained"}
                                        color={restaurant.isOpen ? "error" : "success"}
                                        onClick={handleToggleOpen}
                                        disabled={togglingStatus}
                                    >
                                        {restaurant.isOpen ? "Close restaurant" : "Open restaurant"}
                                    </Button>
                                    {/* Delete   */}
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        Delete restaurant
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Confirmation  */}
                        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                            <DialogTitle>Delete restaurant?</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    This will permanently delete <strong>{restaurant.name}</strong> and cannot be undone.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
                                    Cancel
                                </Button>
                                <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
                                    {deleting ? <CircularProgress size={20} color="inherit" /> : "Delete"}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Divider sx={{ mb: 4 }} />

                        {/* Navigation cards   */}
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
