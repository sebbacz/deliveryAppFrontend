// Stripe Elements payment and order creation;
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { useBasket } from "../context/BasketContext";
import { createOrder } from "../services/orderService";
import { getPublishedDishes } from "../services/dishService";
import { createPaymentIntent } from "../services/paymentService";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Grid,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import PageLayout from "../components/PageLayout";

// Stripe singleton
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

interface DeliveryFormData {
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
}

const STEPS = ["Delivery details", "Payment"];

// Inner component using Stripe hooks
interface StripePaymentStepProps {
    totalPrice: number;
    invalidItems: unknown[];
    onPaymentSuccess: () => Promise<void>;
    submitError: string | null;
}

function StripePaymentStep({
    totalPrice,
    invalidItems,
    onPaymentSuccess,
    submitError,
}: StripePaymentStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [demoProcessing, setDemoProcessing] = useState(false);

    const handlePay = async () => {
        if (!stripe || !elements) return;
        setPaymentError(null);
        setProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (error) {
            setPaymentError(error.message ?? "Payment failed. Please try again.");
            setProcessing(false);
        } else {
            await onPaymentSuccess();
        }
    };

    const handleDemoPay = async () => {
        setDemoProcessing(true);
        await onPaymentSuccess();
    };

    const busy = processing || demoProcessing;

    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            <Alert
                severity="info"
                sx={{ mb: 3 }}
                action={
                    <Button
                        color="inherit"
                        size="small"
                        startIcon={demoProcessing ? <CircularProgress size={14} color="inherit" /> : <FlashOnIcon fontSize="small" />}
                        disabled={busy || invalidItems.length > 0}
                        onClick={handleDemoPay}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        {demoProcessing ? "Placing order…" : "Demo pay"}
                    </Button>
                }
            >
                <strong>Demo mode:</strong> click <em>Demo pay</em> to skip Stripe, or use test card{" "}
                <code>4242 4242 4242 4242</code> · <code>12/28</code> · <code>123</code> below.
            </Alert>

            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <LockOutlinedIcon fontSize="small" color="action" />
                <Typography variant="h6">Pay with card (Stripe)</Typography>
            </Stack>

            <PaymentElement />

            {paymentError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {paymentError}
                </Alert>
            )}
            {submitError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {submitError}
                </Alert>
            )}

            <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                disabled={busy || invalidItems.length > 0 || !stripe || !elements}
                onClick={handlePay}
                sx={{ mt: 3 }}
                startIcon={
                    processing ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <LockOutlinedIcon fontSize="small" />
                    )
                }
            >
                {processing ? "Processing…" : `Pay €${totalPrice.toFixed(2)}`}
            </Button>
        </Paper>
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { basket, totalPrice, clearBasket } = useBasket();

    const [activeStep, setActiveStep] = useState(0);
    const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [intentError, setIntentError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const paymentComplete = useRef(false);

    const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();

    const { data: liveDishes = [] } = useQuery({
        queryKey: ["publicDishes", basket.restaurantId],
        queryFn: () => getPublishedDishes(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000,
    });

    useEffect(() => {
        if (basket.items.length === 0 && !paymentComplete.current) navigate("/basket");
    }, [basket.items.length, navigate]);

    // Create PaymentIntent when entering payment step
    useEffect(() => {
        if (activeStep === 1 && !clientSecret) {
            const amountInCents = Math.round(totalPrice * 100);
            createPaymentIntent(amountInCents)
                .then(({ clientSecret: cs }) => setClientSecret(cs))
                .catch(() =>
                    setIntentError(
                        "Could not initialise the payment form. Please check your connection and try again."
                    )
                );
        }
    }, [activeStep, clientSecret, totalPrice]);

    if (basket.items.length === 0) return null;

    const invalidItems = basket.items.filter((item) => {
        const live = liveDishes.find((d) => d.id === item.dishId);
        return !live || !live.inStock;
    });

    const onDeliverySubmit = (data: DeliveryFormData) => {
        if (invalidItems.length > 0) return;
        setDeliveryData(data);
        setActiveStep(1);
    };

    const handleOrderSubmit = async () => {
        if (!deliveryData) return;
        try {
            setSubmitError(null);
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
            paymentComplete.current = true;
            clearBasket();
            navigate(`/order/${order.id}/track`, { state: { justPlaced: true } });
        } catch (e: unknown) {
            const err = e as { response?: { status?: number; data?: { message?: string } } };
            const msg = err.response?.data?.message ?? "";
            if (err.response?.status === 409 && msg.toLowerCase().includes("closed")) {
                setSubmitError(
                    "This restaurant is currently closed. Please try again when they reopen."
                );
            } else {
                setSubmitError(msg || "Failed to place order. Please try again.");
            }
        }
    };

    const OrderSummary = () => (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" gutterBottom>
                Order summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                From <strong>{basket.restaurantName}</strong>
            </Typography>
            <Stack spacing={1} mb={2}>
                {basket.items.map((item) => (
                    <Stack key={item.dishId} direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            {item.quantity}× {item.dishName}
                        </Typography>
                        <Typography variant="body2">
                            €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="subtitle2">€{totalPrice.toFixed(2)}</Typography>
            </Stack>
        </Paper>
    );

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 860, mx: "auto" }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() =>
                        activeStep === 0 ? navigate("/basket") : setActiveStep(0)
                    }
                    sx={{ mb: 3 }}
                >
                    {activeStep === 0 ? "Back to basket" : "Back to delivery"}
                </Button>

                <Typography variant="h5" sx={{ mb: 1 }}>
                    Checkout
                </Typography>

                <Stepper activeStep={activeStep} sx={{ maxWidth: 400, mb: 3 }}>
                    {STEPS.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {invalidItems.length > 0 && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => navigate("/basket")}
                            >
                                Fix basket
                            </Button>
                        }
                    >
                        Some items in your basket are no longer available.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {activeStep === 0 && (
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    Delivery details
                                </Typography>
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
                                                sx={{ width: 100 }}
                                                {...register("deliveryNumber", { required: "Required" })}
                                                error={!!errors.deliveryNumber}
                                                helperText={errors.deliveryNumber?.message}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Postal code"
                                                sx={{ width: 150 }}
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
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Invalid email",
                                                },
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
                                            sx={{ mt: 1 }}
                                        >
                                            Continue to payment
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>
                    )}

                    {activeStep === 1 && (
                        <Grid size={{ xs: 12, md: 7 }}>
                            {intentError && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {intentError}
                                </Alert>
                            )}

                            {!clientSecret && !intentError && (
                                <Box display="flex" justifyContent="center" py={6}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {clientSecret && (
                                <Elements
                                    stripe={stripePromise}
                                    options={{ clientSecret, locale: "en" }}
                                >
                                    <StripePaymentStep
                                        totalPrice={totalPrice}
                                        invalidItems={invalidItems}
                                        onPaymentSuccess={handleOrderSubmit}
                                        submitError={submitError}
                                    />
                                </Elements>
                            )}
                        </Grid>
                    )}

                    <Grid size={{ xs: 12, md: 5 }}>
                        <OrderSummary />
                    </Grid>
                </Grid>
            </Box>
        </PageLayout>
    );
}
