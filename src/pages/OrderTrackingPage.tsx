import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Snackbar,
    Stack,
    Step,
    StepLabel,
    Stepper,
    Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import PageLayout from "../components/PageLayout";

const STATUS_LABELS: Record<string, string> = {
    PENDING_DECISION: "Awaiting decision",
    ACCEPTED: "Being prepared",
    REJECTED: "Rejected",
    READY_FOR_PICKUP: "Ready for pickup",
    PICKED_UP: "Out for delivery",
    DELIVERED: "Delivered",
};

const PROGRESS_STEPS = [
    { key: "PENDING_DECISION", label: "Order placed" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "READY_FOR_PICKUP", label: "Ready" },
    { key: "PICKED_UP", label: "On the way" },
    { key: "DELIVERED", label: "Delivered" },
];

function getStepIndex(status: string) {
    const idx = PROGRESS_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
}

const isTerminal = (status: string) => status === "REJECTED" || status === "DELIVERED";

function statusColor(status: string): "warning" | "success" | "error" | "info" | "default" {
    if (status === "PENDING_DECISION") return "warning";
    if (status === "ACCEPTED") return "info";
    if (status === "READY_FOR_PICKUP" || status === "PICKED_UP") return "info";
    if (status === "DELIVERED") return "success";
    if (status === "REJECTED") return "error";
    return "default";
}

function statusIcon(status: string) {
    if (status === "PENDING_DECISION") return <HourglassTopIcon fontSize="small" />;
    if (status === "REJECTED") return <CancelOutlinedIcon fontSize="small" />;
    if (status === "PICKED_UP") return <LocalShippingOutlinedIcon fontSize="small" />;
    return <CheckCircleOutlineIcon fontSize="small" />;
}

export default function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced ?? false;
    const [copySnack, setCopySnack] = useState(false);

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
        refetchInterval: (query) =>
            isTerminal(query.state.data?.status ?? "") ? false : 10_000,
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (isError || !order) {
        return (
            <PageLayout>
                <Container maxWidth="sm" sx={{ py: 4 }}>
                    <Alert severity="error">Order not found.</Alert>
                    <Button onClick={() => navigate("/restaurants")} sx={{ mt: 2 }}>Browse restaurants</Button>
                </Container>
            </PageLayout>
        );
    }

    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const trackingUrl = `${window.location.origin}/order/${order.id}/track`;
    const isRejected = order.status === "REJECTED";
    const isDelivered = order.status === "DELIVERED";

    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackingUrl).then(() => setCopySnack(true));
    };

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 560, mx: "auto" }}>
                {justPlaced && (
                    <Paper
                        variant="outlined"
                        sx={{
                            mb: 4,
                            overflow: "hidden",
                            borderColor: "success.light",
                        }}
                    >
                        {/* Green header strip */}
                        <Box sx={{ bgcolor: "success.main", px: 3, py: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
                            <CheckCircleOutlineIcon sx={{ color: "white", fontSize: 32 }} />
                            <Box>
                                <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                                    Order placed successfully!
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
                                    Thank you — your order is awaiting confirmation from the restaurant.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tracking link */}
                        <Box sx={{ px: 3, py: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                                Your tracking link:
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.78rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {trackingUrl}
                            </Typography>
                            <Button size="small" variant="outlined" color="success" startIcon={<ContentCopyIcon fontSize="small" />} onClick={handleCopyLink} sx={{ flexShrink: 0 }}>
                                Copy
                            </Button>
                        </Box>

                    </Paper>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">Order status</Typography>
                    {!justPlaced && (
                        <Button size="small" startIcon={<LinkIcon fontSize="small" />} onClick={handleCopyLink}>
                            Copy link
                        </Button>
                    )}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Order ID: <code>{order.id}</code>
                </Typography>

                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Chip
                        label={STATUS_LABELS[order.status] ?? order.status}
                        color={statusColor(order.status)}
                        icon={statusIcon(order.status)}
                    />
                    {!isTerminal(order.status) && <CircularProgress size={18} />}
                </Stack>

                {!isRejected && (
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                        <Stepper activeStep={getStepIndex(order.status)} alternativeLabel>
                            {PROGRESS_STEPS.map((step) => (
                                <Step key={step.key}><StepLabel>{step.label}</StepLabel></Step>
                            ))}
                        </Stepper>
                    </Paper>
                )}

                {isRejected && order.rejectionReason && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <strong>Rejection reason:</strong> {order.rejectionReason}
                    </Alert>
                )}

                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Delivering to</Typography>
                    <Typography variant="body2">
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}, {order.deliveryCountry}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{order.contactEmail}</Typography>
                    {order.courierLatitude != null && order.courierLongitude != null && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Courier: <code>{order.courierLatitude.toFixed(5)}, {order.courierLongitude.toFixed(5)}</code>
                        </Typography>
                    )}
                </Paper>

                <Typography variant="h6" sx={{ mb: 1.5 }}>Your order</Typography>
                <Stack spacing={1} mb={1.5}>
                    {order.items.map((item) => (
                        <Stack key={item.id} direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                                {item.quantity}× {item.dishName}
                            </Typography>
                            <Typography variant="body2">€{(item.price * item.quantity).toFixed(2)}</Typography>
                        </Stack>
                    ))}
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                <Stack direction="row" justifyContent="space-between" mb={3}>
                    <Typography variant="subtitle2">Total</Typography>
                    <Typography variant="subtitle2">€{total.toFixed(2)}</Typography>
                </Stack>

                {isRejected && (
                    <Button variant="contained" color="error" fullWidth onClick={() => navigate("/restaurants")}>
                        Try another restaurant
                    </Button>
                )}
                {isDelivered && (
                    <Button variant="outlined" fullWidth onClick={() => navigate("/restaurants")}>
                        Order again
                    </Button>
                )}
            </Box>

            <Snackbar open={copySnack} autoHideDuration={2500} onClose={() => setCopySnack(false)} message="Tracking link copied" />
        </PageLayout>
    );
}
