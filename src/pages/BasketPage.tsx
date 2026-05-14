import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBasket } from "../context/BasketContext";
import { getPublishedDishes } from "../services/dishService";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    IconButton,
    Stack,
    Typography,
    Avatar,
    Chip,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function BasketPage() {
    const navigate = useNavigate();
    const { basket, removeFromBasket, updateQuantity, totalPrice, totalItems } = useBasket();

    // US 21: Poll live dishes to detect out-of-stock / unpublished items
    const { data: liveDishes = [], isLoading: dishesLoading } = useQuery({
        queryKey: ["publicDishes", basket.restaurantId],
        queryFn: () => getPublishedDishes(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000,
    });

    if (basket.items.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
                <ShoppingCartIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h5" gutterBottom>Your basket is empty</Typography>
                <Button variant="contained" onClick={() => navigate("/restaurants")}>
                    Browse restaurants
                </Button>
            </Container>
        );
    }

    // US 21: find basket items that are gone or out of stock
    const invalidItems = basket.items.filter((item) => {
        const liveDish = liveDishes.find((d) => d.id === item.dishId);
        return !liveDish || !liveDish.inStock;
    });

    const hasInvalidItems = invalidItems.length > 0;
    const canCheckout = !hasInvalidItems && !dishesLoading;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Button variant="text" onClick={() => navigate(`/restaurants/${basket.restaurantId}`)} sx={{ mb: 2 }}>
                ← Back to {basket.restaurantName}
            </Button>

            <Typography variant="h4" fontWeight={700} mb={1}>
                Your Basket
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                From: <strong>{basket.restaurantName}</strong>
            </Typography>

            {/* US 21: Warning banner */}
            {hasInvalidItems && (
                <Alert
                    severity="error"
                    icon={<WarningAmberIcon />}
                    sx={{ mb: 3 }}
                >
                    <strong>Some items are no longer available.</strong> Remove them to proceed to checkout.
                </Alert>
            )}

            <Stack spacing={2} mb={3}>
                {basket.items.map((item) => {
                    const liveDish = liveDishes.find((d) => d.id === item.dishId);
                    const isOutOfStock = liveDish && !liveDish.inStock;
                    const isGone = !dishesLoading && !liveDish;
                    const isInvalid = isOutOfStock || isGone;

                    return (
                        <Card
                            variant="outlined"
                            key={item.dishId}
                            sx={{ borderColor: isInvalid ? "error.main" : undefined, opacity: isInvalid ? 0.85 : 1 }}
                        >
                            <CardContent>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    {item.pictureUrl && (
                                        <Avatar src={item.pictureUrl} variant="rounded" sx={{ width: 56, height: 56 }} />
                                    )}
                                    <Box flexGrow={1}>
                                        <Typography fontWeight={600}>{item.dishName}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            €{item.price.toFixed(2)} each
                                        </Typography>
                                        {/* US 21: status chips */}
                                        {isGone && (
                                            <Chip label="No longer available" color="error" size="small" sx={{ mt: 0.5 }} />
                                        )}
                                        {isOutOfStock && (
                                            <Chip label="Out of stock" color="warning" size="small" sx={{ mt: 0.5 }} />
                                        )}
                                    </Box>
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <IconButton
                                            size="small"
                                            onClick={() => updateQuantity(item.dishId, -1)}
                                            disabled={isInvalid}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography sx={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</Typography>
                                        <IconButton
                                            size="small"
                                            onClick={() => updateQuantity(item.dishId, 1)}
                                            disabled={isInvalid}
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => removeFromBasket(item.dishId)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                    <Typography fontWeight={600} sx={{ minWidth: 70, textAlign: "right" }}>
                                        €{(item.price * item.quantity).toFixed(2)}
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h6">Total ({totalItems} items)</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">
                    €{totalPrice.toFixed(2)}
                </Typography>
            </Stack>

            <Button
                variant="contained"
                size="large"
                fullWidth
                disabled={!canCheckout}
                onClick={() => navigate("/checkout")}
                startIcon={dishesLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
                {dishesLoading ? "Checking availability…" : hasInvalidItems ? "Remove unavailable items to continue" : "Proceed to Checkout"}
            </Button>
        </Container>
    );
}
