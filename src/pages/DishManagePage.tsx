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
    Grid,
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
import PageLayout from "../components/PageLayout";

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
    }

    async function handleScheduleConfirm() {
        if (!restaurantId || !scheduledAt) return;
        await scheduleDishChanges(restaurantId, scheduledAt);
        setScheduleDialogOpen(false);
        setScheduledAt("");
    }

    const liveCount = dishes.filter((d) => d.state === "LIVE").length;
    const draftCount = dishes.filter((d) => d.state === "DRAFT").length;

    return (
        <PageLayout>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Button variant="text" onClick={() => navigate("/owner")} sx={{ mb: 1, pl: 0 }}>
                        ← Dashboard
                    </Button>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography variant="h5">Dishes</Typography>
                            <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">{liveCount} live</Typography>
                                {draftCount > 0 && (
                                    <Typography variant="body2" color="warning.main">{draftCount} draft{draftCount > 1 ? "s" : ""} pending</Typography>
                                )}
                            </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            {draftCount > 0 && (
                                <>
                                    <Button variant="outlined" color="warning" size="small" onClick={handleApplyChanges}>
                                        Publish all drafts
                                    </Button>
                                    <Button variant="outlined" color="info" size="small" onClick={() => setScheduleDialogOpen(true)}>
                                        Schedule
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="contained"
                                onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)}
                            >
                                + New dish
                            </Button>
                        </Stack>
                    </Box>
                </Box>

                {/* Dish list */}
                {dishes.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "1.5px dashed", borderColor: "divider" }}>
                        <Typography color="text.secondary" gutterBottom>No dishes yet</Typography>
                        <Button variant="contained" onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)} sx={{ mt: 1 }}>
                            Create your first dish
                        </Button>
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
            </Container>

            {/* Schedule dialog */}
            <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Schedule pending changes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        All {draftCount} draft(s) will go live at the chosen time.
                    </Typography>
                    <TextField
                        label="Go live at"
                        type="datetime-local"
                        fullWidth
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                        inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleScheduleConfirm} disabled={!scheduledAt}>
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </PageLayout>
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
        <Paper
            elevation={0}
            sx={{
                border: "1.5px solid",
                borderColor: isLive ? "divider" : "warning.light",
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <Grid container>
                {dish.pictureUrl && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                        <Box
                            component="img"
                            src={dish.pictureUrl}
                            alt={dish.name}
                            sx={{ width: { xs: "100%", sm: 100 }, height: { xs: 160, sm: "100%" }, objectFit: "cover", display: "block" }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </Grid>
                )}
                <Grid size="grow">
                    <Box sx={{ p: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle1" noWrap>{dish.name}</Typography>
                                    <Chip
                                        label={dish.state}
                                        size="small"
                                        color={isLive ? "success" : "default"}
                                        variant={isLive ? "filled" : "outlined"}
                                    />
                                    {isLive && (
                                        <Chip
                                            label={dish.inStock ? "In stock" : "Out of stock"}
                                            size="small"
                                            color={dish.inStock ? "primary" : "error"}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {dish.type.charAt(0) + dish.type.slice(1).toLowerCase()} &bull; <strong>€{dish.price.toFixed(2)}</strong>
                                </Typography>
                                {dish.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                                        {dish.description}
                                    </Typography>
                                )}
                                {dish.foodTags?.length > 0 && (
                                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                                        {dish.foodTags.map((tag) => (
                                            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            {/* Actions */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                {isLive ? (
                                    <>
                                        <Button size="small" variant="outlined" onClick={() => onToggleStock(dish)}>
                                            {dish.inStock ? "Out of stock" : "Back in stock"}
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
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
