import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
    applyPendingDishChanges,
    getOwnerDishes,
    markDishBackInStock,
    markDishOutOfStock,
    publishDish,
    scheduleDishChanges,
    unpublishDish,
    type DishResponse,
} from "../services/dishService";
import PageLayout from "../components/PageLayout";

export default function DishManagePage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const [scheduledAt, setScheduledAt] = useState("");

    const { data: dishes = [], isLoading } = useQuery({
        queryKey: ["ownerDishes", restaurantId],
        queryFn: () => getOwnerDishes(restaurantId!),
        enabled: !!restaurantId,
    });

    function invalidate() {
        queryClient.invalidateQueries({ queryKey: ["ownerDishes", restaurantId] });
    }

    async function handlePublish(dish: DishResponse) {
        await publishDish(dish.id);
        invalidate();
    }

    async function handleUnpublish(dish: DishResponse) {
        await unpublishDish(dish.id);
        invalidate();
    }

    async function handleStock(dish: DishResponse) {
        if (dish.inStock) await markDishOutOfStock(dish.id);
        else await markDishBackInStock(dish.id);
        invalidate();
    }

    async function handleApplyChanges() {
        if (!restaurantId) return;
        await applyPendingDishChanges(restaurantId);
        invalidate();
    }

    async function handleScheduleConfirm() {
        if (!restaurantId || !scheduledAt) return;
        await scheduleDishChanges(restaurantId, scheduledAt);
        setScheduleDialogOpen(false);
        setScheduledAt("");
        invalidate();
    }

    const liveCount = dishes.filter((d) => d.state === "LIVE").length;
    const draftCount = dishes.filter((d) => d.state === "DRAFT").length;

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
                <Button onClick={() => navigate("/owner")} sx={{ mb: 2 }}>
                    ← Dashboard
                </Button>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3 }}>
                    <Box>
                        <Typography variant="h5">Dishes</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {liveCount} live · {draftCount} draft{draftCount !== 1 ? "s" : ""} pending
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                        {draftCount > 0 && (
                            <>
                                <Button variant="outlined" size="small" onClick={handleApplyChanges}>
                                    Publish all drafts
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

                {dishes.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            No dishes yet.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/restaurant/${restaurantId}/dishes/new`)}
                        >
                            Create first dish
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

            <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Schedule pending changes</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        All {draftCount} draft{draftCount > 1 ? "s" : ""} will go live at the chosen time.
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
        <Paper variant="outlined">
            <Grid container>
                {dish.pictureUrl && (
                    <Grid size={{ xs: 12, sm: "auto" }}>
                        <Box
                            component="img"
                            src={dish.pictureUrl}
                            alt={dish.name}
                            sx={{
                                width: { xs: "100%", sm: 96 },
                                height: { xs: 120, sm: "100%" },
                                objectFit: "cover",
                                display: "block",
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    </Grid>
                )}
                <Grid size="grow">
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                    <Typography variant="subtitle1">{dish.name}</Typography>
                                    <Chip
                                        label={dish.state}
                                        size="small"
                                        color={isLive ? "success" : "warning"}
                                        variant="outlined"
                                    />
                                    {isLive && (
                                        <Chip
                                            label={dish.inStock ? "In stock" : "Out of stock"}
                                            size="small"
                                            color={dish.inStock ? "info" : "error"}
                                            variant="outlined"
                                        />
                                    )}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    {dish.type.charAt(0) + dish.type.slice(1).toLowerCase()} · €{dish.price.toFixed(2)}
                                </Typography>
                                {dish.description && (
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mt: 0.5 }}>
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
