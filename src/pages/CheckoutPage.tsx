// Checkout page:
//   every 15 s during checkout so unavailable items block the payment button immediately.
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form"; // delivery detail validation
import { useQuery } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useBasket } from "../context/BasketContext";
import { createOrder } from "../services/orderService";
import { getPublishedDishes } from "../services/dishService";
import { createPaymentIntent } from "../services/paymentService";
import {
    Alert, Box, Button, CircularProgress, Divider, Grid, Paper,
    Stack, Step, StepLabel, Stepper, TextField, Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { PageLayout } from "../components/common";
import { StripePaymentStep } from "../components/payment";

// Stripe   once outside the component so it's not recreated on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

// Delivery form field types
interface DeliveryFormData {
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
}

const STEPS = ["Delivery details", "Payment"]; // stepper labels

//  checkout page component
export default function CheckoutPage() {
    const navigate = useNavigate();
    const { basket, totalPrice, clearBasket } = useBasket();

    const [activeStep, setActiveStep] = useState(0);                          // 0 = delivery, 1 = payment
    const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(null); // saved between steps
    const [clientSecret, setClientSecret] = useState<string | null>(null);    // Stripe PaymentIntent secret
    const [intentError, setIntentError] = useState<string | null>(null);      // error creating PaymentIntent
    const [submitError, setSubmitError] = useState<string | null>(null);      // error creating the order
    const paymentComplete = useRef(false); // prevents the "empty basket → redirect" effect from firing after payment

    const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();

    //  dishes to catch stock changes that happen while the customer fills in their details
    const { data: liveDishes = [] } = useQuery({
        queryKey: ["publicDishes", basket.restaurantId],
        queryFn: () => getPublishedDishes(basket.restaurantId!),
        enabled: !!basket.restaurantId,
        refetchInterval: 15_000,
    });

    // If the basket is emptied
    useEffect(() => {
        if (basket.items.length === 0 && !paymentComplete.current) navigate("/basket");
    }, [basket.items.length, navigate]);

    // Create a Stripe PaymentIntent when the customer reaches the payment step
    useEffect(() => {
        if (activeStep === 1 && !clientSecret) {
            const amountInCents = Math.round(totalPrice * 100); // Stripe expects integer cents
            createPaymentIntent(amountInCents)
                .then(({ clientSecret: cs }) => setClientSecret(cs))
                .catch(() =>
                    setIntentError("Could not initialise the payment form. Please check your connection and try again.")
                );
        }
    }, [activeStep, clientSecret, totalPrice]);

    //  navigating away from an empty basket
    if (basket.items.length === 0) return null;

    // Items no longer available
    const invalidItems = basket.items.filter((item) => {
        const live = liveDishes.find((d) => d.id === item.dishId);
        return !live || !live.inStock;
    });

    //  ave delivery data and advance to payment
    const onDeliverySubmit = (data: DeliveryFormData) => {
        if (invalidItems.length > 0) return; // extra guard — button is also disabled
        setDeliveryData(data);
        setActiveStep(1);
    };

    // Called after Stripe payment is confirmed
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
                    price: i.price,        // frozen at basket-add time
                    quantity: i.quantity,
                })),
            });
            paymentComplete.current = true; // prevent the empty-basket
            clearBasket();                  // empty the basket now the order is placed
            navigate(`/order/${order.id}/track`, { state: { justPlaced: true } }); // go to tracking page
        } catch (e: unknown) {
            const err = e as { response?: { status?: number; data?: { message?: string } } };
            const msg = err.response?.data?.message ?? "";
            if (err.response?.status === 409 && msg.toLowerCase().includes("closed")) {
                //  closed message means the restaurant closed between basket and checkout
                setSubmitError("This restaurant is currently closed. Please try again when they reopen.");
            } else {
                setSubmitError(msg || "Failed to place order. Please try again.");
            }
        }
    };

    // Order summary sidebar
    const OrderSummary = () => (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" gutterBottom>Order summary</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                From <strong>{basket.restaurantName}</strong>
            </Typography>
            <Stack spacing={1} mb={2}>
                {basket.items.map((item) => (
                    <Stack key={item.dishId} direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                            {item.quantity}× {item.dishName}
                        </Typography>
                        <Typography variant="body2">€{(item.price * item.quantity).toFixed(2)}</Typography>
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
                {/*  oes to basket on step 1, back to delivery on step 2 */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => activeStep === 0 ? navigate("/basket") : setActiveStep(0)}
                    sx={{ mb: 3 }}
                >
                    {activeStep === 0 ? "Back to basket" : "Back to delivery"}
                </Button>

                <Typography variant="h5" sx={{ mb: 1 }}>Checkout</Typography>

                {/*  Delivery details → Payment */}
                <Stepper activeStep={activeStep} sx={{ maxWidth: 400, mb: 3 }}>
                    {STEPS.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {/* Global warning if basket items became unavailable during checkout */}
                {invalidItems.length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }}
                        action={<Button color="inherit" size="small" onClick={() => navigate("/basket")}>Fix basket</Button>}
                    >
                        Some items in your basket are no longer available.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/*  delivery details form ── */}
                    {activeStep === 0 && (
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Delivery details</Typography>
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
                                            disabled={invalidItems.length > 0} // can't proceed if basket is invalid
                                            sx={{ mt: 1 }}
                                        >
                                            Continue to payment
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>
                    )}

                    {/*   Stripe payment ── */}
                    {activeStep === 1 && (
                        <Grid size={{ xs: 12, md: 7 }}>
                            {/* Error creating the PaymentIntent   */}
                            {intentError && <Alert severity="error" sx={{ mb: 2 }}>{intentError}</Alert>}

                            {/*   PaymentIntent is being created */}
                            {!clientSecret && !intentError && (
                                <Box display="flex" justifyContent="center" py={6}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {/* R Stripe Elements   */}
                            {clientSecret && (
                                <Elements stripe={stripePromise} options={{ clientSecret, locale: "en" }}>
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

                    {/* Order summary sidebar   */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <OrderSummary />
                    </Grid>
                </Grid>
            </Box>
        </PageLayout>
    );
}
