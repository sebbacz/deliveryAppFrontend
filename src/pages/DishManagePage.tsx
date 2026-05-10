import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {
    applyPendingDishChanges,
    markDishBackInStock,
    markDishOutOfStock,
    publishDish,
    scheduleDishChanges,
    unpublishDish,
    type DishResponse,
} from "../services/dishService";
import { getDishes, updateDishState, updateDishStock } from "../services/dishStore";

export default function DishManagePage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const [dishes, setDishes] = useState<DishResponse[]>(() =>
        restaurantId ? getDishes(restaurantId) : []
    );
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");

    function reload() {
        if (restaurantId) setDishes(getDishes(restaurantId));
    }

    async function handlePublish(dish: DishResponse) {
        if (!restaurantId) return;
        await publishDish(dish.id);
        updateDishState(restaurantId, dish.id, "LIVE");
        reload();
    }

    async function handleUnpublish(dish: DishResponse) {
        if (!restaurantId) return;
        await unpublishDish(dish.id);
        updateDishState(restaurantId, dish.id, "DRAFT");
        reload();
    }

    async function handleStock(dish: DishResponse) {
        if (!restaurantId) return;
        if (dish.inStock) {
            await markDishOutOfStock(dish.id);
            updateDishStock(restaurantId, dish.id, false);
        } else {
            await markDishBackInStock(dish.id);
            updateDishStock(restaurantId, dish.id, true);
        }
        reload();
    }

    async function handleApplyChanges() {
        if (!restaurantId) return;
        await applyPendingDishChanges(restaurantId);
        alert("All pending changes applied.");
    }

    async function handleScheduleConfirm() {
        if (!restaurantId || !scheduledAt) return;
        await scheduleDishChanges(restaurantId, scheduledAt);
        setScheduleDialogOpen(false);
        setScheduledAt("");
        alert("Changes scheduled successfully.");
    }

    const pendingCount = dishes.filter((d) => d.state === "DRAFT").length;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Dish Management</Typography>
                <Stack direction="row" spacing={1}>
                    {pendingCount > 0 && (
                        <>
                            <Button variant="outlined" color="warning" onClick={handleApplyChanges}>
                                Apply Changes ({pendingCount} pending)
                            </Button>
                            <Button variant="outlined" color="info" onClick={() => setScheduleDialogOpen(true)}>
                                Schedule Changes
                            </Button>
                        </>
                    )}
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)}
                    >
                        + New Dish
                    </Button>
                    <Button variant="text" onClick={() => navigate("/owner")}>
                        Back
                    </Button>
                </Stack>
            </Stack>

            {dishes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography color="text.secondary">
                        No dishes yet. Click "+ New Dish" to create your first draft.
                    </Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {dishes.map((dish) => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            onPublish={handlePublish}
                            onUnpublish={handleUnpublish}
                            onToggleStock={handleStock}
                        />
                    ))}
                </Stack>
            )}

            {/* US7: Schedule changes dialog */}
            <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)}>
                <DialogTitle>Schedule Pending Changes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        All {pendingCount} pending draft(s) will go live at the chosen time.
                    </Typography>
                    <TextField
                        label="Go live at"
                        type="datetime-local"
                        fullWidth
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleScheduleConfirm} disabled={!scheduledAt}>
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function DishCard({
    dish,
    onPublish,
    onUnpublish,
    onToggleStock,
}: {
    dish: DishResponse;
    onPublish: (d: DishResponse) => Promise<void>;
    onUnpublish: (d: DishResponse) => Promise<void>;
    onToggleStock: (d: DishResponse) => Promise<void>;
}) {
    const isLive = dish.state === "LIVE";

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                            {dish.name}
                        </Typography>
                        <Chip
                            label={dish.state}
                            size="small"
                            color={isLive ? "success" : "default"}
                        />
                        {isLive && (
                            <Chip
                                label={dish.inStock ? "In Stock" : "Out of Stock"}
                                size="small"
                                color={dish.inStock ? "primary" : "error"}
                                variant="outlined"
                            />
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {dish.type} &mdash; €{dish.price.toFixed(2)}
                    </Typography>
                    {dish.description && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {dish.description}
                        </Typography>
                    )}
                    {dish.foodTags?.length > 0 && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                            {dish.foodTags.map((tag) => (
                                <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                        </Stack>
                    )}
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                    {isLive ? (
                        <>
                            <Button size="small" variant="outlined" onClick={() => onToggleStock(dish)}>
                                {dish.inStock ? "Out of Stock" : "Back in Stock"}
                            </Button>
                            <Divider orientation="vertical" flexItem />
                            <Button size="small" color="warning" onClick={() => onUnpublish(dish)}>
                                Unpublish
                            </Button>
                        </>
                    ) : (
                        <Button size="small" variant="contained" color="success" onClick={() => onPublish(dish)}>
                            Publish
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
