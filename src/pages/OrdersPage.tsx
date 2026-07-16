import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import HomeIcon from "@mui/icons-material/Home";
import {
    acceptOrder,
    getOrdersForRestaurant,
    markOrderDelivered,
    markOrderPickedUp,
    markOrderReady,
    rejectOrder,
    type OrderResponse,
} from "../services/orderService";
import PageLayout from "../components/PageLayout";

export default function OrdersPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rejectDialogOrder, setRejectDialogOrder] = useState<OrderResponse | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["orders", restaurantId],
        queryFn: () => getOrdersForRestaurant(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 15_000,
    });

    async function handleAccept(order: OrderResponse) {
        await acceptOrder(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleMarkReady(order: OrderResponse) {
        await markOrderReady(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleMarkPickedUp(order: OrderResponse) {
        await markOrderPickedUp(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleMarkDelivered(order: OrderResponse) {
        await markOrderDelivered(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleRejectConfirm() {
        if (!rejectDialogOrder || !rejectionReason.trim()) return;
        await rejectOrder(rejectDialogOrder.id, rejectionReason);
        setRejectDialogOrder(null);
        setRejectionReason("");
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    const pending       = orders.filter((o) => o.status === "PENDING_DECISION");
    const accepted      = orders.filter((o) => o.status === "ACCEPTED");
    const readyPickup   = orders.filter((o) => o.status === "READY_FOR_PICKUP");
    const pickedUp      = orders.filter((o) => o.status === "PICKED_UP");
    const decided       = orders.filter((o) => o.status === "REJECTED" || o.status === "DELIVERED");

    if (isLoading) {
        return (
            <PageLayout>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="md">
                <Button onClick={() => navigate("/owner")} sx={{ mb: 2 }}>
                    ← Dashboard
                </Button>
                <Typography variant="h5" sx={{ mb: 3 }}>Orders</Typography>

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Pending Decision ({pending.length})
                </Typography>
                {pending.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 3, textAlign: "center", mb: 3 }}>
                        <Typography color="text.secondary">No pending orders.</Typography>
                    </Paper>
                ) : (
                    <Stack spacing={2} sx={{ mb: 3 }}>
                        {pending.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAccept={handleAccept}
                                onReject={(o) => { setRejectDialogOrder(o); setRejectionReason(""); }}
                            />
                        ))}
                    </Stack>
                )}

                {accepted.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>In Kitchen ({accepted.length})</Typography>
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            {accepted.map((order) => (
                                <OrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
                            ))}
                        </Stack>
                    </>
                )}

                {readyPickup.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Ready for Pickup ({readyPickup.length})</Typography>
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            {readyPickup.map((order) => (
                                <OrderCard key={order.id} order={order} onMarkPickedUp={handleMarkPickedUp} />
                            ))}
                        </Stack>
                    </>
                )}

                {pickedUp.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Out for Delivery ({pickedUp.length})</Typography>
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            {pickedUp.map((order) => (
                                <OrderCard key={order.id} order={order} onMarkDelivered={handleMarkDelivered} />
                            ))}
                        </Stack>
                    </>
                )}

                {decided.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed / Rejected ({decided.length})</Typography>
                        <Stack spacing={2}>
                            {decided.map((order) => <OrderCard key={order.id} order={order} />)}
                        </Stack>
                    </>
                )}

                <Dialog open={!!rejectDialogOrder} onClose={() => setRejectDialogOrder(null)} fullWidth maxWidth="sm">
                    <DialogTitle>Reject order</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Order from <strong>{rejectDialogOrder?.customerName}</strong>. Provide a reason so the customer knows what to do.
                        </Typography>
                        <TextField
                            label="Rejection reason"
                            multiline
                            rows={3}
                            fullWidth
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Ingredient unavailable, restaurant too busy..."
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setRejectDialogOrder(null)}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleRejectConfirm}
                            disabled={!rejectionReason.trim()}
                        >
                            Reject order
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </PageLayout>
    );
}

function useOrderCountdown(createdAt: string): string {
    const WINDOW_MS = 5 * 60 * 1000;
    const [remaining, setRemaining] = useState(() => {
        const elapsed = Date.now() - new Date(createdAt).getTime();
        return Math.max(0, WINDOW_MS - elapsed);
    });

    useEffect(() => {
        if (remaining <= 0) return;
        const id = setInterval(() => {
            const elapsed = Date.now() - new Date(createdAt).getTime();
            setRemaining(Math.max(0, WINDOW_MS - elapsed));
        }, 1000);
        return () => clearInterval(id);
    }, [createdAt, remaining]);

    if (remaining <= 0) return "Auto-declining...";
    const secs = Math.ceil(remaining / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")} left`;
}

function statusColor(status: string): "warning" | "success" | "error" | "info" | "default" {
    if (status === "PENDING_DECISION") return "warning";
    if (status === "ACCEPTED") return "success";
    if (status === "REJECTED") return "error";
    if (status === "READY_FOR_PICKUP") return "info";
    if (status === "PICKED_UP") return "info";
    if (status === "DELIVERED") return "success";
    return "default";
}

function OrderCard({
    order,
    onAccept,
    onReject,
    onMarkReady,
    onMarkPickedUp,
    onMarkDelivered,
}: {
    order: OrderResponse;
    onAccept?: (o: OrderResponse) => void;
    onReject?: (o: OrderResponse) => void;
    onMarkReady?: (o: OrderResponse) => void;
    onMarkPickedUp?: (o: OrderResponse) => void;
    onMarkDelivered?: (o: OrderResponse) => void;
}) {
    const isPending  = order.status === "PENDING_DECISION";
    const isAccepted = order.status === "ACCEPTED";
    const isReady    = order.status === "READY_FOR_PICKUP";
    const isPickedUp = order.status === "PICKED_UP";
    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const countdown = useOrderCountdown(order.createdAt);

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                        <Typography variant="subtitle2">{order.customerName}</Typography>
                        <Chip label={order.status.replace("_", " ")} size="small" color={statusColor(order.status)} />
                        {isPending && (
                            <Chip label={countdown} size="small" color="warning" variant="outlined" />
                        )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {order.contactEmail}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {order.items.map((item) => (
                        <Typography key={item.id} variant="body2" sx={{ mb: 0.25 }}>
                            {item.quantity}× {item.dishName} — €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    ))}
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        Total: €{total.toFixed(2)}
                    </Typography>

                    {order.rejectionReason && (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                            Reason: {order.rejectionReason}
                        </Typography>
                    )}
                </Box>

                <Stack spacing={1}>
                    {isPending && onAccept && onReject && (
                        <>
                            <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckIcon />}
                                onClick={() => onAccept(order)}
                            >
                                Accept
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CloseIcon />}
                                onClick={() => onReject(order)}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {isAccepted && onMarkReady && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<DoneAllIcon />}
                            onClick={() => onMarkReady(order)}
                        >
                            Mark ready
                        </Button>
                    )}
                    {isReady && onMarkPickedUp && (
                        <Button
                            size="small"
                            variant="contained"
                            color="secondary"
                            startIcon={<DirectionsBikeIcon />}
                            onClick={() => onMarkPickedUp(order)}
                        >
                            Picked up
                        </Button>
                    )}
                    {isPickedUp && onMarkDelivered && (
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<HomeIcon />}
                            onClick={() => onMarkDelivered(order)}
                        >
                            Delivered
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
