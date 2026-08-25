
//  dishes every 15 s so the customer sees immediately
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBasket } from "../context/BasketContext";
import { getPublishedDishes } from "../services/dishService";
import { getRestaurantById } from "../services/restaurantService";
import {
    Alert, Avatar, Box, Button, Chip, CircularProgress, Divider,
    IconButton, Paper, Stack, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageLayout } from "../components/common";

export default function BasketPage() {
    const navigate = useNavigate();
    const { basket, removeFromBasket, updateQuantity, totalPrice, totalItems } = useBasket();

    //  live dish list to detect stock changes
    const { data: liveDishes = [], isLoading: dishesLoading } = useQuery({
        queryKey: ["publicDishes", basket.restaurantId],
        queryFn: () => getPublishedDishes(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000, //   availability every 15 s
    });

    //  restaurant to detect if it closes while the customer is on this page
    const { data: restaurant } = useQuery({
        queryKey: ["restaurant", basket.restaurantId],
        queryFn: () => getRestaurantById(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000,
    });

    const restaurantClosed = restaurant && !restaurant.isOpen; // true when the restaurant has been closed

    // Empty basket state
    if (basket.items.length === 0) {
        return (
            <PageLayout>
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" textAlign="center" gap={2}>
                    <Typography variant="h6">Your basket is empty</Typography>
                    <Typography variant="body2" color="text.secondary">Browse restaurants to add some dishes.</Typography>
                    <Button variant="contained" onClick={() => navigate("/restaurants")}>Browse restaurants</Button>
                </Box>
            </PageLayout>
        );
    }

    // Items that are no longer available
    const invalidItems = basket.items.filter((item) => {
        const liveDish = liveDishes.find((d) => d.id === item.dishId);
        return !liveDish || !liveDish.inStock; // gone from menu OR out of stock
    });

    const hasInvalidItems = invalidItems.length > 0;
    // Checkout is only allowed when all items are available and the restaurant is open
    const canCheckout = !hasInvalidItems && !dishesLoading && !restaurantClosed;

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 560, mx: "auto" }}>
                {/* Back link goes to the restaurant the items are from */}
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/restaurants/${basket.restaurantId}`)} sx={{ mb: 2 }}>
                    Back to {basket.restaurantName}
                </Button>

                <Typography variant="h5" gutterBottom>Basket</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    From <strong>{basket.restaurantName}</strong>
                </Typography>

                {/* Warn if the restaurant has closed  */}
                {restaurantClosed && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <strong>{restaurant?.name} is currently closed.</strong> You cannot place an order right now.
                    </Alert>
                )}
                {/* Warn if any basket items are no longer available */}
                {hasInvalidItems && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <strong>Some items are no longer available.</strong> Remove them to proceed.
                    </Alert>
                )}

                {/*  asket  */}
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {basket.items.map((item) => {
                        const liveDish = liveDishes.find((d) => d.id === item.dishId);
                        const isOutOfStock = liveDish && !liveDish.inStock; // dish exists but stock ran out
                        const isGone = !dishesLoading && !liveDish;          // dish was removed from the menu
                        const isInvalid = isOutOfStock || isGone;

                        return (
                            <Paper
                                key={item.dishId}
                                variant="outlined"
                                sx={{ p: 2, display: "flex", alignItems: "center", gap: 2, bgcolor: isInvalid ? "error.lighter" : undefined }}
                            >
                                {/* Dish photo  */}
                                {item.pictureUrl && (
                                    <Avatar src={item.pictureUrl} variant="rounded" sx={{ width: 52, height: 52, borderRadius: 1, flexShrink: 0 }} />
                                )}

                                <Box flexGrow={1} minWidth={0}>
                                    <Typography variant="subtitle2" noWrap>{item.dishName}</Typography>
                                    <Typography variant="body2" color="text.secondary">€{item.price.toFixed(2)} each</Typography>
                                    {/* Show a status when unavailable */}
                                    {isGone && <Chip label="No longer available" size="small" color="error" sx={{ mt: 0.5 }} />}
                                    {isOutOfStock && <Chip label="Out of stock" size="small" color="warning" sx={{ mt: 0.5 }} />}
                                </Box>

                                {/* Quantity controls   */}
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <IconButton size="small" onClick={() => updateQuantity(item.dishId, -1)} disabled={isInvalid}>
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>
                                    <Typography sx={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(item.dishId, 1)} disabled={isInvalid}>
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                    {/* Delete button  */}
                                    <IconButton size="small" onClick={() => removeFromBasket(item.dishId)} color="error">
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Stack>

                                {/* Line total  */}
                                <Typography variant="subtitle2" sx={{ minWidth: 60, textAlign: "right" }}>
                                    €{(item.price * item.quantity).toFixed(2)}
                                </Typography>
                            </Paper>
                        );
                    })}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Order total */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6">Total ({totalItems} items)</Typography>
                    <Typography variant="h6">€{totalPrice.toFixed(2)}</Typography>
                </Stack>

                {/* Checkout button   */}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={!canCheckout}
                    onClick={() => navigate("/checkout")}
                    startIcon={dishesLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                    {dishesLoading
                        ? "Checking availability…"
                        : restaurantClosed
                        ? "Restaurant is closed"
                        : hasInvalidItems
                        ? "Remove unavailable items to continue"
                        : "Proceed to checkout"}
                </Button>
            </Box>
        </PageLayout>
    );
}
