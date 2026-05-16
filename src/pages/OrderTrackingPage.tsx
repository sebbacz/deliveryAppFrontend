import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Snackbar,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
    PENDING_DECISION: "Awaiting decision",
    ACCEPTED: "Being prepared",
    REJECTED: "Rejected",
    READY_FOR_PICKUP: "Ready for pickup",
    PICKED_UP: "Out for delivery",
    DELIVERED: "Delivered",
};

const STATUS_COLORS: Record<string, "warning" | "info" | "error" | "success" | "default" | "primary"> = {
    PENDING_DECISION: "warning",
    ACCEPTED: "info",
    REJECTED: "error",
    READY_FOR_PICKUP: "primary",
    PICKED_UP: "primary",
    DELIVERED: "success",
};

// The happy-path steps shown in the progress stepper
const PROGRESS_STEPS = [
    { key: "PENDING_DECISION", label: "Order placed" },
    { key: "ACCEPTED",         label: "Accepted" },
    { key: "READY_FOR_PICKUP", label: "Ready" },
    { key: "PICKED_UP",        label: "Picked up" },
    { key: "DELIVERED",        label: "Delivered" },
];

function getStepIndex(status: string) {
    const idx = PROGRESS_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
}

const isTerminal = (status: string) =>
    status === "REJECTED" || status === "DELIVERED";

// ─── Component ────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // US 24: detect if we just came from checkout
    const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced ?? false;
    const [copySnack, setCopySnack] = useState(false);

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
        // US 25: keep polling until order reaches a terminal state
        refetchInterval: (query) =>
            isTerminal(query.state.data?.status ?? "") ? false : 10_000,
    });

    // ── Loading / error ────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !order) {
        return (
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Alert severity="error">Order not found.</Alert>
                <Button onClick={() => navigate("/restaurants")} sx={{ mt: 2 }}>
                    Browse restaurants
                </Button>
            </Container>
        );
    }

    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const trackingUrl = `${window.location.origin}/order/${order.id}/track`;
    const isRejected = order.status === "REJECTED";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackingUrl).then(() => setCopySnack(true));
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>

            {/* ── US 24: Confirmation banner (shown right after placing order) ── */}
            {justPlaced && (
                <Alert
                    severity="success"
                    icon={<CheckCircleIcon />}
                    sx={{ mb: 3, alignItems: "flex-start" }}
                >
                    <Typography fontWeight={700} mb={0.5}>Order placed successfully!</Typography>
                    <Typography variant="body2" mb={1}>
                        Save the link below to return and track your order at any time.
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "monospace",
                                bgcolor: "success.50",
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                wordBreak: "break-all",
                                flexGrow: 1,
                            }}
                        >
                            {trackingUrl}
                        </Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            startIcon={<ContentCopyIcon fontSize="small" />}
                            onClick={handleCopyLink}
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            Copy link
                        </Button>
                    </Stack>
                </Alert>
            )}

            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="h4" fontWeight={700}>Order status</Typography>
                {!justPlaced && (
                    <Button
                        size="small"
                        startIcon={<LinkIcon fontSize="small" />}
                        onClick={handleCopyLink}
                    >
                        Copy link
                    </Button>
                )}
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Order ID: <code>{order.id}</code>
            </Typography>

            {/* ── Status chip + spinner ── */}
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                <Chip
                    label={STATUS_LABELS[order.status] ?? order.status}
                    color={STATUS_COLORS[order.status] ?? "default"}
                    size="medium"
                    sx={{ fontWeight: 600 }}
                />
                {!isTerminal(order.status) && <CircularProgress size={20} />}
            </Stack>

            {/* ── US 25: Progress stepper (happy path) ── */}
            {!isRejected && (
                <Stepper
                    activeStep={getStepIndex(order.status)}
                    alternativeLabel
                    sx={{ mb: 3 }}
                >
                    {PROGRESS_STEPS.map((step) => (
                        <Step key={step.key}>
                            <StepLabel>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            )}

            {/* ── Rejection reason ── */}
            {isRejected && order.rejectionReason && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    <strong>Rejection reason:</strong> {order.rejectionReason}
                </Alert>
            )}

            {/* ── Delivery info ── */}
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Delivering to
                    </Typography>
                    <Typography>
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}, {order.deliveryCountry}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{order.contactEmail}</Typography>
                    {order.courierLatitude != null && order.courierLongitude != null && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Courier location: {order.courierLatitude.toFixed(5)}, {order.courierLongitude.toFixed(5)}
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ── Items ── */}
            <Typography variant="h6" fontWeight={600} mb={2}>Your order</Typography>
            <Stack spacing={1} mb={2}>
                {order.items.map((item) => (
                    <Stack key={item.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{item.quantity}× {item.dishName}</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </Stack>
                ))}
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">€{total.toFixed(2)}</Typography>
            </Stack>

            {/* ── Actions ── */}
            {isRejected && (
                <Button variant="contained" fullWidth onClick={() => navigate("/restaurants")}>
                    Try another restaurant
                </Button>
            )}

            {/* ── Copy link snackbar ── */}
            <Snackbar
                open={copySnack}
                autoHideDuration={2500}
                onClose={() => setCopySnack(false)}
                message="Tracking link copied to clipboard"
            />
        </Container>
    );
}
