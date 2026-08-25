// Order tracking page:

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";
import {
    Alert, Box, Button, Chip, CircularProgress, Container, Divider,
    Paper, Snackbar, Stack, Step, StepLabel, Stepper, Typography,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // courier location map
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet marker icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import { PageLayout } from "../components/common";

//  labels for each backend status value
const STATUS_LABELS: Record<string, string> = {
    PENDING_DECISION: "Awaiting decision",
    ACCEPTED: "Being prepared",
    REJECTED: "Rejected",
    READY_FOR_PICKUP: "Ready for pickup",
    PICKED_UP: "Out for delivery",
    DELIVERED: "Delivered",
};

// Steps shown in the progress stepper
const PROGRESS_STEPS = [
    { key: "PENDING_DECISION", label: "Order placed" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "READY_FOR_PICKUP", label: "Ready" },
    { key: "PICKED_UP", label: "On the way" },
    { key: "DELIVERED", label: "Delivered" },
];

// Returns the active step index for the MUI
function getStepIndex(status: string) {
    const idx = PROGRESS_STEPS.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
}

// g stops once either is reache
const isTerminal = (status: string) => status === "REJECTED" || status === "DELIVERED";

// Maps status to a MUI  color
function statusColor(status: string): "warning" | "success" | "error" | "info" | "default" {
    if (status === "PENDING_DECISION") return "warning";
    if (status === "ACCEPTED") return "info";
    if (status === "READY_FOR_PICKUP" || status === "PICKED_UP") return "info";
    if (status === "DELIVERED") return "success";
    if (status === "REJECTED") return "error";
    return "default";
}

// Maps status to an icon
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

    //   from CheckoutPage to show the success
    const justPlaced = (location.state as { justPlaced?: boolean } | null)?.justPlaced ?? false;
    const [copySnack, setCopySnack] = useState(false); // controls the "link copied" snackbar

    //  stop polling automatically once the order is delivered or rejected
    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
        refetchInterval: (query) =>
            isTerminal(query.state.data?.status ?? "") ? false : 10_000,
    });

    // Loading state
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Error state
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

    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0); // total from frozen item prices
    const trackingUrl = `${window.location.origin}/order/${order.id}/track`;     // shareable link for this order
    const isRejected = order.status === "REJECTED";
    const isDelivered = order.status === "DELIVERED";

    // Copy the tracking link to the clipboard
    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackingUrl).then(() => setCopySnack(true));
    };

    return (
        <PageLayout>
            <Box sx={{ maxWidth: 560, mx: "auto" }}>

                {/*  wwssuccess banner*/}
                {justPlaced && (
                    <Paper variant="outlined" sx={{ mb: 4, overflow: "hidden", borderColor: "success.light" }}>
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
                        {/* Tracking link row   */}
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

                {/* ── Page header ── */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5">Order status</Typography>
                    {/* Copy link button also available after the initial just-placed view */}
                    {!justPlaced && (
                        <Button size="small" startIcon={<LinkIcon fontSize="small" />} onClick={handleCopyLink}>
                            Copy link
                        </Button>
                    )}
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Order ID: <code>{order.id}</code>
                </Typography>

                {/* Status chip + spinner (spinner hidden once order reaches a terminal state) */}
                <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <Chip
                        label={STATUS_LABELS[order.status] ?? order.status}
                        color={statusColor(order.status)}
                        icon={statusIcon(order.status)}
                    />
                    {!isTerminal(order.status) && <CircularProgress size={18} />} {/* live indicator */}
                </Stack>

                {/* Progress stepper — hidden for rejected orders since they have no forward steps */}
                {!isRejected && (
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
                        <Stepper activeStep={getStepIndex(order.status)} alternativeLabel>
                            {PROGRESS_STEPS.map((step) => (
                                <Step key={step.key}><StepLabel>{step.label}</StepLabel></Step>
                            ))}
                        </Stepper>
                    </Paper>
                )}

                {/* Rejection reason — shown when the restaurant rejected the order */}
                {isRejected && order.rejectionReason && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <strong>Rejection reason:</strong> {order.rejectionReason}
                    </Alert>
                )}

                {/* Delivery address and live courier map */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Delivering to</Typography>
                    <Typography variant="body2">
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}, {order.deliveryCountry}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{order.contactEmail}</Typography>

                    {/* Courier map — only rendered when the delivery service has sent location data */}
                    {order.courierLatitude != null && order.courierLongitude != null && (
                        <Box sx={{ mt: 1.5, borderRadius: 1, overflow: "hidden", height: 220 }}>
                            <MapContainer
                                center={[order.courierLatitude, order.courierLongitude]}
                                zoom={14} // street-level zoom for the courier position
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[order.courierLatitude, order.courierLongitude]}>
                                    <Popup>Courier location</Popup>
                                </Marker>
                            </MapContainer>
                        </Box>
                    )}
                </Paper>

                {/* ── Order items summary ── */}
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

                {/* CTA buttons for terminal states */}
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

            {/* "Tracking link copied" toast */}
            <Snackbar open={copySnack} autoHideDuration={2500} onClose={() => setCopySnack(false)} message="Tracking link copied" />
        </PageLayout>
    );
}
