import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useBasket } from "../context/BasketContext";
import { createOrder } from "../services/orderService";
import {
    Box, Button, Container, Divider, Grid, Stack, TextField,
    Typography, Alert, CircularProgress, Card, CardContent,
} from "@mui/material";
import { useState } from "react";

interface CheckoutFormData {
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { basket, totalPrice, clearBasket } = useBasket();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>();

    if (basket.items.length === 0) {
        navigate("/basket");
        return null;
    }

    const onSubmit = async (formData: CheckoutFormData) => {
        setSubmitting(true);
        setError(null);
        try {
            const order = await createOrder({
                restaurantId: basket.restaurantId!,
                customerName: formData.customerName,
                deliveryStreet: formData.deliveryStreet,
                deliveryNumber: formData.deliveryNumber,
                deliveryPostalCode: formData.deliveryPostalCode,
                deliveryCity: formData.deliveryCity,
                deliveryCountry: formData.deliveryCountry,
                contactEmail: formData.contactEmail,
                items: basket.items.map((i) => ({
                    dishId: i.dishId,
                    dishName: i.dishName,
                    price: i.price,
                    quantity: i.quantity,
                })),
            });
            clearBasket();
            navigate(`/order/${order.id}/track`);
        } catch (e: any) {
            setError(e.response?.data?.message ?? "Failed to place order. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button variant="text" onClick={() => navigate("/basket")} sx={{ mb: 2 }}>
                ← Back to basket
            </Button>
            <Typography variant="h4" fontWeight={700} mb={3}>Checkout</Typography>

            <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Typography variant="h6" fontWeight={600} mb={2}>Delivery details</Typography>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={2}>
                            <TextField
                                label="Full name"
                                fullWidth
                                {...register("customerName", { required: "Name is required" })}
                                error={!!errors.customerName}
                                helperText={errors.customerName?.message}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Street"
                                    fullWidth
                                    {...register("deliveryStreet", { required: "Street is required" })}
                                    error={!!errors.deliveryStreet}
                                    helperText={errors.deliveryStreet?.message}
                                />
                                <TextField
                                    label="Number"
                                    sx={{ width: 120 }}
                                    {...register("deliveryNumber", { required: "Required" })}
                                    error={!!errors.deliveryNumber}
                                    helperText={errors.deliveryNumber?.message}
                                />
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    label="Postal code"
                                    sx={{ width: 160 }}
                                    {...register("deliveryPostalCode", { required: "Required" })}
                                    error={!!errors.deliveryPostalCode}
                                    helperText={errors.deliveryPostalCode?.message}
                                />
                                <TextField
                                    label="City"
                                    fullWidth
                                    {...register("deliveryCity", { required: "City is required" })}
                                    error={!!errors.deliveryCity}
                                    helperText={errors.deliveryCity?.message}
                                />
                            </Stack>
                            <TextField
                                label="Country"
                                fullWidth
                                {...register("deliveryCountry", { required: "Country is required" })}
                                error={!!errors.deliveryCountry}
                                helperText={errors.deliveryCountry?.message}
                            />
                            <TextField
                                label="Contact email"
                                type="email"
                                fullWidth
                                {...register("contactEmail", {
                                    required: "Email is required",
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                                })}
                                error={!!errors.contactEmail}
                                helperText={errors.contactEmail?.message}
                            />

                            {error && <Alert severity="error">{error}</Alert>}

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : undefined}
                            >
                                {submitting ? "Placing order..." : "Place order"}
                            </Button>
                        </Stack>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} mb={2}>Order summary</Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                From: <strong>{basket.restaurantName}</strong>
                            </Typography>
                            <Stack spacing={1} mb={2}>
                                {basket.items.map((item) => (
                                    <Stack key={item.dishId} direction="row" justifyContent="space-between">
                                        <Typography variant="body2">
                                            {item.quantity}× {item.dishName}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            €{(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                            <Divider sx={{ mb: 1.5 }} />
                            <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={700}>Total</Typography>
                                <Typography fontWeight={700} color="primary">
                                    €{totalPrice.toFixed(2)}
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
