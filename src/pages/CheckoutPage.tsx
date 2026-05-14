import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useBasket } from "../context/BasketContext";
import { createOrder } from "../services/orderService";
import { getPublishedDishes } from "../services/dishService";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";

// ─── Delivery form ────────────────────────────────────────────────────────────

interface DeliveryFormData {
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
}

// ─── Payment helpers ──────────────────────────────────────────────────────────

function formatCardNumber(value: string) {
    return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
}

function validateCard(cardNumber: string, expiry: string, cvc: string): string | null {
    if (cardNumber.replace(/\s/g, "").length < 16) return "Card number must be 16 digits.";
    const [mm, yy] = expiry.split("/");
    const month = parseInt(mm, 10);
    const year = parseInt("20" + yy, 10);
    if (!mm || !yy || month < 1 || month > 12 || year < new Date().getFullYear()) return "Invalid expiry date.";
    if (cvc.length < 3) return "CVC must be 3 digits.";
    return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

const STEPS = ["Delivery details", "Payment"];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { basket, totalPrice, clearBasket } = useBasket();

    const [activeStep, setActiveStep] = useState(0);
    const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(null);

    // Payment state
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();

    // US 21: also validate on checkout page — poll dishes
    const { data: liveDishes = [] } = useQuery({
        queryKey: ["publicDishes", basket.restaurantId],
        queryFn: () => getPublishedDishes(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000,
    });

    if (basket.items.length === 0) {
        navigate("/basket");
        return null;
    }

    // US 21: detect items that went bad since the page opened
    const invalidItems = basket.items.filter((item) => {
        const live = liveDishes.find((d) => d.id === item.dishId);
        return !live || !live.inStock;
    });

    // ── Step 1: delivery form submit ──────────────────────────────────────────
    const onDeliverySubmit = (data: DeliveryFormData) => {
        if (invalidItems.length > 0) return; // guard
        setDeliveryData(data);
        setActiveStep(1);
    };

    // ── Step 2: payment + order creation ─────────────────────────────────────
    const onPay = async () => {
        setPaymentError(null);
        setSubmitError(null);

        const err = validateCard(cardNumber, expiry, cvc);
        if (err) { setPaymentError(err); return; }
        if (!deliveryData) return;

        setProcessing(true);
        try {
            // Simulate payment processing (US 23 — mock payment provider)
            await new Promise((res) => setTimeout(res, 1500));

            const order = await createOrder({
                restaurantId: basket.restaurantId!,
                customerName: deliveryData.customerName,
                deliveryStreet: deliveryData.deliveryStreet,
                deliveryNumber: deliveryData.deliveryNumber,
                deliveryPostalCode: deliveryData.deliveryPostalCode,
                deliveryCity: deliveryData.deliveryCity,
                deliveryCountry: deliveryData.deliveryCountry,
                contactEmail: deliveryData.contactEmail,
                items: basket.items.map((i) => ({
                    dishId: i.dishId,
                    dishName: i.dishName,
                    price: i.price,
                    quantity: i.quantity,
                })),
            });
            clearBasket();
            // US 24: navigate with justPlaced flag so tracking page shows confirmation
            navigate(`/order/${order.id}/track`, { state: { justPlaced: true } });
        } catch (e: any) {
            setSubmitError(e.response?.data?.message ?? "Failed to place order. Please try again.");
            setProcessing(false);
        }
    };

    // ── Order summary sidebar ─────────────────────────────────────────────────
    const OrderSummary = () => (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>Order summary</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    From: <strong>{basket.restaurantName}</strong>
                </Typography>
                <Stack spacing={1} mb={2}>
                    {basket.items.map((item) => (
                        <Stack key={item.dishId} direction="row" justifyContent="space-between">
                            <Typography variant="body2">{item.quantity}× {item.dishName}</Typography>
                            <Typography variant="body2" fontWeight={600}>
                                €{(item.price * item.quantity).toFixed(2)}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={700}>Total</Typography>
                    <Typography fontWeight={700} color="primary">€{totalPrice.toFixed(2)}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button variant="text" onClick={() => activeStep === 0 ? navigate("/basket") : setActiveStep(0)} sx={{ mb: 2 }}>
                ← {activeStep === 0 ? "Back to basket" : "Back to delivery"}
            </Button>

            <Typography variant="h4" fontWeight={700} mb={3}>Checkout</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {STEPS.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* US 21: warn if items became invalid */}
            {invalidItems.length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }} action={
                    <Button color="inherit" size="small" onClick={() => navigate("/basket")}>
                        Fix basket
                    </Button>
                }>
                    Some items in your basket are no longer available. Please fix your basket before continuing.
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* ── Step 1: Delivery ── */}
                {activeStep === 0 && (
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Typography variant="h6" fontWeight={600} mb={2}>Delivery details</Typography>
                        <Box component="form" onSubmit={handleSubmit(onDeliverySubmit)}>
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
                                        label="No."
                                        sx={{ width: 110 }}
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
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={invalidItems.length > 0}
                                >
                                    Continue to payment
                                </Button>
                            </Stack>
                        </Box>
                    </Grid>
                )}

                {/* ── Step 2: Payment (US 23) ── */}
                {activeStep === 1 && (
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <LockIcon fontSize="small" color="success" />
                            <Typography variant="h6" fontWeight={600}>Secure payment</Typography>
                        </Stack>

                        <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "grey.50" }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <CreditCardIcon color="action" />
                                <Typography variant="body2" color="text.secondary">
                                    Test card: 4242 4242 4242 4242 · 12/28 · 123
                                </Typography>
                            </Stack>
                            <Stack spacing={2}>
                                <TextField
                                    label="Card number"
                                    fullWidth
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    inputProps={{ maxLength: 19, inputMode: "numeric" }}
                                    placeholder="1234 5678 9012 3456"
                                />
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        label="Expiry (MM/YY)"
                                        sx={{ width: 160 }}
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        inputProps={{ maxLength: 5, inputMode: "numeric" }}
                                        placeholder="MM/YY"
                                    />
                                    <TextField
                                        label="CVC"
                                        sx={{ width: 110 }}
                                        value={cvc}
                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                        inputProps={{ maxLength: 3, inputMode: "numeric" }}
                                        placeholder="123"
                                    />
                                </Stack>
                            </Stack>
                        </Card>

                        {paymentError && <Alert severity="error" sx={{ mb: 2 }}>{paymentError}</Alert>}
                        {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={processing || invalidItems.length > 0}
                            onClick={onPay}
                            startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
                            color="success"
                        >
                            {processing ? "Processing payment…" : `Pay €${totalPrice.toFixed(2)}`}
                        </Button>

                        <Typography variant="caption" color="text.disabled" display="block" textAlign="center" mt={1}>
                            Your payment is encrypted and secure. This is a simulated payment.
                        </Typography>
                    </Grid>
                )}

                {/* Summary sidebar always visible */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <OrderSummary />
                </Grid>
            </Grid>
        </Container>
    );
}
