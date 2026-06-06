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
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageLayout from "../components/PageLayout";

interface DeliveryFormData {
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
}

function formatCardNumber(value: string) {
    return value
        .replace(/\D/g, "")
        .slice(0, 16)
        .replace(/(.{4})/g, "$1 ")
        .trim();
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
    if (!mm || !yy || month < 1 || month > 12 || year < new Date().getFullYear())
        return "Invalid expiry date.";
    if (cvc.length < 3) return "CVC must be 3 digits.";
    return null;
}

const STEPS = ["Delivery details", "Payment"];

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { basket, totalPrice, clearBasket } = useBasket();

    const [activeStep, setActiveStep] = useState(0);
    const [deliveryData, setDeliveryData] = useState<DeliveryFormData | null>(null);

    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();

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

    const invalidItems = basket.items.filter((item) => {
        const live = liveDishes.find((d) => d.id === item.dishId);
        return !live || !live.inStock;
    });

    const onDeliverySubmit = (data: DeliveryFormData) => {
        if (invalidItems.length > 0) return;
        setDeliveryData(data);
        setActiveStep(1);
    };

    const onPay = async () => {
        setPaymentError(null);
        setSubmitError(null);

        const err = validateCard(cardNumber, expiry, cvc);
        if (err) { setPaymentError(err); return; }
        if (!deliveryData) return;

        setProcessing(true);
        try {
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
            navigate(`/order/${order.id}/track`, { state: { justPlaced: true } });
        } catch (e: any) {
            const msg = e.response?.data?.message ?? "";
            if (e.response?.status === 409 && msg.toLowerCase().includes("closed")) {
                setSubmitError("This restaurant is currently closed. Please try again when they reopen.");
            } else {
                setSubmitError(msg || "Failed to place order. Please try again.");
            }
            setProcessing(false);
        }
    };

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
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => activeStep === 0 ? navigate("/basket") : setActiveStep(0)}
                    sx={{ mb: 3 }}
                >
                    {activeStep === 0 ? "Back to basket" : "Back to delivery"}
                </Button>

                <Typography variant="h5" sx={{ mb: 1 }}>Checkout</Typography>

                <Stepper activeStep={activeStep} sx={{ maxWidth: 400, mb: 3 }}>
                    {STEPS.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                {invalidItems.length > 0 && (
                    <Alert severity="error" sx={{ mb: 3 }}
                        action={<Button color="inherit" size="small" onClick={() => navigate("/basket")}>Fix basket</Button>}
                    >
                        Some items in your basket are no longer available.
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {activeStep === 0 && (
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Delivery details</Typography>
                                <Box component="form" onSubmit={handleSubmit(onDeliverySubmit)}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Full name" fullWidth
                                            {...register("customerName", { required: "Name is required" })}
                                            error={!!errors.customerName} helperText={errors.customerName?.message}
                                        />
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Street" fullWidth
                                                {...register("deliveryStreet", { required: "Street is required" })}
                                                error={!!errors.deliveryStreet} helperText={errors.deliveryStreet?.message}
                                            />
                                            <TextField
                                                label="No." sx={{ width: 100 }}
                                                {...register("deliveryNumber", { required: "Required" })}
                                                error={!!errors.deliveryNumber} helperText={errors.deliveryNumber?.message}
                                            />
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <TextField
                                                label="Postal code" sx={{ width: 150 }}
                                                {...register("deliveryPostalCode", { required: "Required" })}
                                                error={!!errors.deliveryPostalCode} helperText={errors.deliveryPostalCode?.message}
                                            />
                                            <TextField
                                                label="City" fullWidth
                                                {...register("deliveryCity", { required: "City is required" })}
                                                error={!!errors.deliveryCity} helperText={errors.deliveryCity?.message}
                                            />
                                        </Stack>
                                        <TextField
                                            label="Country" fullWidth
                                            {...register("deliveryCountry", { required: "Country is required" })}
                                            error={!!errors.deliveryCountry} helperText={errors.deliveryCountry?.message}
                                        />
                                        <TextField
                                            label="Contact email" type="email" fullWidth
                                            {...register("contactEmail", {
                                                required: "Email is required",
                                                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                                            })}
                                            error={!!errors.contactEmail} helperText={errors.contactEmail?.message}
                                        />
                                        <Button
                                            type="submit" variant="contained" size="large" fullWidth
                                            disabled={invalidItems.length > 0} sx={{ mt: 1 }}
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
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                    <LockOutlinedIcon fontSize="small" color="action" />
                                    <Typography variant="h6">Secure payment</Typography>
                                </Stack>

                                <Alert severity="info" icon={<CreditCardOutlinedIcon fontSize="small" />} sx={{ mb: 2 }}>
                                    Test card: <code>4242 4242 4242 4242 · 12/28 · 123</code>
                                </Alert>

                                <Stack spacing={2}>
                                    <TextField
                                        label="Card number" fullWidth value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                        inputProps={{ maxLength: 19, inputMode: "numeric" }}
                                        placeholder="1234 5678 9012 3456"
                                    />
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            label="Expiry (MM/YY)" sx={{ width: 160 }} value={expiry}
                                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                            inputProps={{ maxLength: 5, inputMode: "numeric" }}
                                            placeholder="MM/YY"
                                        />
                                        <TextField
                                            label="CVC" sx={{ width: 110 }} value={cvc}
                                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                                            inputProps={{ maxLength: 3, inputMode: "numeric" }}
                                            placeholder="123"
                                        />
                                    </Stack>
                                </Stack>

                                {paymentError && <Alert severity="error" sx={{ mt: 2 }}>{paymentError}</Alert>}
                                {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}

                                <Button
                                    variant="contained" color="success" size="large" fullWidth
                                    disabled={processing || invalidItems.length > 0}
                                    onClick={onPay} sx={{ mt: 3 }}
                                    startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon fontSize="small" />}
                                >
                                    {processing ? "Processing payment…" : `Pay €${totalPrice.toFixed(2)}`}
                                </Button>

                                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1}>
                                    Simulated payment — your data is not stored.
                                </Typography>
                            </Paper>
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
