// Stripe payment
import { useState } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FlashOnIcon from "@mui/icons-material/FlashOn";

interface StripePaymentStepProps {
    totalPrice: number;
    invalidItems: unknown[];       // if non-empty, the pay button is disabled
    onPaymentSuccess: () => Promise<void>; // called after payment is confirmed
    submitError: string | null;    // backend  ord er errors shown below the form
}

export default function StripePaymentStep({ totalPrice, invalidItems, onPaymentSuccess, submitError }: StripePaymentStepProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [demoProcessing, setDemoProcessing] = useState(false); // demo pay in progress

    // Confirm payment with Stripe;
    const handlePay = async () => {
        if (!stripe || !elements) return;
        setPaymentError(null);
        setProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            redirect: "if_required", // only redirect for card payments complete
        });

        if (error) {
            setPaymentError(error.message ?? "Payment failed. Please try again.");
            setProcessing(false);
        } else {
            await onPaymentSuccess(); // payment succeeded
        }
    };

    // Demo pay skip stripe
    const handleDemoPay = async () => {
        setDemoProcessing(true);
        await onPaymentSuccess();
    };

    const busy = processing || demoProcessing; // either payment path is in progress

    return (
        <Paper variant="outlined" sx={{ p: 3 }}>
            {/* Demo mode  */}
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

            {/* Stripe prebuuild card input /}
            <PaymentElement />

            {/* Stripe error  */}
            {paymentError && <Alert severity="error" sx={{ mt: 2 }}>{paymentError}</Alert>}
            {/* bacckend error  */}
            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}

            <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                disabled={busy || invalidItems.length > 0 || !stripe || !elements}
                onClick={handlePay}
                sx={{ mt: 3 }}
                startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon fontSize="small" />}
            >
                {processing ? "Processing…" : `Pay €${totalPrice.toFixed(2)}`}
            </Button>
        </Paper>
    );
}
