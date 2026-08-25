// Dish management page: lists all dishes  10 dish cap
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box, Button, CircularProgress, Container, Dialog, DialogActions,
    DialogContent, DialogTitle, Paper, Stack, TextField, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
    applyPendingDishChanges, getOwnerDishes, markDishBackInStock, markDishOutOfStock,
    publishDish, scheduleDishChanges, unpublishDish, type DishResponse,
} from "../services/dishService";
import { PageLayout } from "../components/common";
import { DishManageCard } from "../components/dish";

export default function DishManagePage() {
    const { restaurantId } = useParams<{ restaurantId: string }>(); // read from the URL
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false); // controls the schedule datetime dialog
    const [scheduledAt, setScheduledAt] = useState("");                  // chosen datetime for scheduled publish

    // Fetch all dishes for this restaurant
    const { data: dishes = [], isLoading } = useQuery({
        queryKey: ["ownerDishes", restaurantId],
        queryFn: () => getOwnerDishes(restaurantId!),
        enabled: !!restaurantId,
    });

    // Helper to refresh the dish list
    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ["ownerDishes", restaurantId] });
    }

    // Makes a draft dish visible to customers
    async function handlePublish(dish: DishResponse) {
        await publishDish(dish.id);
        invalidate();
    }

    // Hides a live dish from customers
    async function handleUnpublish(dish: DishResponse) {
        await unpublishDish(dish.id);
        invalidate();
    }

    // Toggles the in-stock flag
    async function handleStock(dish: DishResponse) {
        if (dish.inStock) await markDishOutOfStock(dish.id);
        else await markDishBackInStock(dish.id);
        invalidate();
    }

    // Publishes all pending changes right now
    async function handleApplyChanges() {
        if (!restaurantId) return;
        await applyPendingDishChanges(restaurantId);
        invalidate();
    }

    // Schedules all pending changes to go live at the datetime chosen in the dialog
    async function handleScheduleConfirm() {
        if (!restaurantId || !scheduledAt) return;
        await scheduleDishChanges(restaurantId, scheduledAt);
        setScheduleDialogOpen(false);
        setScheduledAt("");
        invalidate();
    }

    // Count live dishes
    const liveCount = dishes.filter((d) => d.state === "LIVE" || d.state === "LIVE_WITH_PENDING").length;
    // Count dishes that have unsaved pending changes (DRAFT or LIVE_WITH_PENDING)
    const pendingCount = dishes.filter((d) => d.state === "DRAFT" || d.state === "LIVE_WITH_PENDING").length;

    if (isLoading) {
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
                <Button onClick={() => navigate("/owner")} sx={{ mb: 2 }}>← Dashboard</Button>

                {/* title + action buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h5">Dishes</Typography>
                        {/* Live/pending summary gives the owner a   */}
                        <Typography variant="body2" color="text.secondary">
                            {liveCount} live · {pendingCount} pending change{pendingCount !== 1 ? "s" : ""}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {/*  controls only when there are pending changes */}
                        {pendingCount > 0 && (
                            <>
                                <Button variant="outlined" size="small" onClick={handleApplyChanges}>
                                    Publish all pending
                                </Button>
                                <Button variant="outlined" size="small" onClick={() => setScheduleDialogOpen(true)}>
                                    Schedule
                                </Button>
                            </>
                        )}
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)}
                        >
                            New dish
                        </Button>
                    </Stack>
                </Box>

                {/* Empty state */}
                {dishes.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>No dishes yet.</Typography>
                        <Button variant="contained" onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)}>
                            Create first dish
                        </Button>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {dishes.map((dish) => (
                            <DishManageCard
                                key={dish.id}
                                dish={dish}
                                restaurantId={restaurantId!}
                                onPublish={handlePublish}
                                onUnpublish={handleUnpublish}
                                onToggleStock={handleStock}
                            />
                        ))}
                    </Stack>
                )}
            </Container>

            {/* Schedule dialog — lets the owner pick a datetime for all pending changes to go live */}
            <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Schedule pending changes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        All {pendingCount} pending change{pendingCount > 1 ? "s" : ""} will go live at the chosen time.
                    </Typography>
                    <TextField
                        label="Go live at"
                        type="datetime-local"
                        fullWidth
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        inputProps={{ min: new Date().toISOString().slice(0, 16) }} // prevent scheduling in the past
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleScheduleConfirm} disabled={!scheduledAt}>
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
    );
}

