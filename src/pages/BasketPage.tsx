import { useNavigate } from "react-router-dom";
import { useBasket } from "../context/BasketContext";
import {
    Box, Button, Card, CardContent, Container, Divider, IconButton,
    Stack, Typography, Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function BasketPage() {
    const navigate = useNavigate();
    const { basket, removeFromBasket, updateQuantity, totalPrice, totalItems } = useBasket();

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

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Button variant="text" onClick={() => navigate(`/restaurants/${basket.restaurantId}`)} sx={{ mb: 2 }}>
                ← Back to {basket.restaurantName}
            </Button>

            <Typography variant="h4" fontWeight={700} mb={3}>
                Your Basket
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                From: <strong>{basket.restaurantName}</strong>
            </Typography>

            <Stack spacing={2} mb={3}>
                {basket.items.map((item) => (
                    <Card variant="outlined" key={item.dishId}>
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
                                </Box>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <IconButton size="small" onClick={() => updateQuantity(item.dishId, -1)}>
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>
                                    <Typography sx={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(item.dishId, 1)}>
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
                ))}
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
                onClick={() => navigate("/checkout")}
            >
                Proceed to Checkout
            </Button>
        </Container>
    );
}
