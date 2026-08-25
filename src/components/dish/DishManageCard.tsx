//  shows draft/live state, pending edits, and publish/stock/edit action buttons.
import { useNavigate } from "react-router-dom";
import { Box, Button, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import type { DishResponse } from "../../services/dishService";

interface DishManageCardProps {
    dish: DishResponse;
    restaurantId: string;
    onPublish: (d: DishResponse) => Promise<void>;
    onUnpublish: (d: DishResponse) => Promise<void>;
    onToggleStock: (d: DishResponse) => Promise<void>;
}

export default function DishManageCard({ dish, restaurantId, onPublish, onUnpublish, onToggleStock }: DishManageCardProps) {
    const navigate = useNavigate();
    const isLive = dish.state === "LIVE" || dish.state === "LIVE_WITH_PENDING";          // has a live version customers can see
    const hasPendingDraft = dish.state === "DRAFT" || dish.state === "LIVE_WITH_PENDING"; // has unsaved edits

    //   green = live, yellow = live with pending edit, grey = draft only
    const stateColor = dish.state === "LIVE" ? "success" : dish.state === "LIVE_WITH_PENDING" ? "warning" : "default";
    const stateLabel = dish.state === "LIVE_WITH_PENDING" ? "LIVE + PENDING EDIT" : dish.state;

    return (
        <Paper variant="outlined">
            <Grid container>
                {/* Dish thumbnail  */}
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
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} // hide broken images
                        />
                    </Grid>
                )}
                <Grid size="grow">
                    <Box sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }} flexWrap="wrap">
                                    <Typography variant="subtitle1">{dish.name}</Typography>
                                    {/*  s whether the dish is live, draft, or live-with-pending */}
                                    <Chip label={stateLabel} size="small" color={stateColor} variant="outlined" />
                                    {/*  nly makes sense for live dishes */}
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

                                {/*  pending draft details and scheduled time when relevant */}
                                {dish.state === "LIVE_WITH_PENDING" && dish.pendingDraft && (
                                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                            Pending edit:
                                        </Typography>
                                        <Typography variant="body2">
                                            {dish.pendingDraft.name} · €{dish.pendingDraft.price.toFixed(2)}
                                        </Typography>
                                        {dish.scheduledAt && (
                                            <Typography variant="caption" color="text.secondary">
                                                Scheduled: {new Date(dish.scheduledAt).toLocaleString()}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {/*  edit draft, stock toggle, publish/unpublish */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                {hasPendingDraft && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={() => navigate(`/restaurant/${restaurantId}/dishes/${dish.id}/edit`)}
                                    >
                                        Edit draft
                                    </Button>
                                )}
                                {isLive ? (
                                    <>
                                        {/*  is always immediate — cannot be scheduled */}
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
