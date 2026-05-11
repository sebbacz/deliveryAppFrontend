import { useState } from "react";
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
import {
    acceptOrder,
    getOrdersForRestaurant,
    markOrderReady,
    rejectOrder,
    type OrderResponse,
} from "../services/orderService";

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
        refetchInterval: 15_000, // poll every 15s for new orders
    });

    async function handleAccept(order: OrderResponse) {
        await acceptOrder(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleMarkReady(order: OrderResponse) {
        await markOrderReady(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    async function handleRejectConfirm() {
        if (!rejectDialogOrder || !rejectionReason.trim()) return;
        await rejectOrder(rejectDialogOrder.id, rejectionReason);
        setRejectDialogOrder(null);
        setRejectionReason("");
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    const pending = orders.filter((o) => o.status === "PENDING_DECISION");
    const accepted = orders.filter((o) => o.status === "ACCEPTED");
    const decided = orders.filter((o) => o.status === "REJECTED" || o.status === "READY_FOR_PICKUP");

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Orders</Typography>
                <Button variant="text" onClick={() => navigate("/owner")}>
                    Back
                </Button>
            </Stack>

            <Typography variant="h6" gutterBottom>
                Pending Decision ({pending.length})
            </Typography>

            {pending.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center", mb: 4 }}>
                    <Typography color="text.secondary">No pending orders.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2} mb={4}>
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
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        In Kitchen ({accepted.length})
                    </Typography>
                    <Stack spacing={2} mb={4}>
                        {accepted.map((order) => (
                            <OrderCard key={order.id} order={order} onMarkReady={handleMarkReady} />
                        ))}
                    </Stack>
                </>
            )}

            {decided.length > 0 && (
                <>
                    <Typography variant="h6" gutterBottom>
                        Completed / Rejected ({decided.length})
                    </Typography>
                    <Stack spacing={2}>
                        {decided.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))}
                    </Stack>
                </>
            )}

            {/* Reject dialog */}
            <Dialog open={!!rejectDialogOrder} onClose={() => setRejectDialogOrder(null)} fullWidth maxWidth="sm">
                <DialogTitle>Reject Order</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Order from <strong>{rejectDialogOrder?.customerName}</strong>. Provide a reason so the customer can adjust their basket.
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
                        Reject
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function statusColor(status: string): "warning" | "success" | "error" | "info" | "default" {
    if (status === "PENDING_DECISION") return "warning";
    if (status === "ACCEPTED") return "success";
    if (status === "REJECTED") return "error";
    if (status === "READY_FOR_PICKUP") return "info";
    return "default";
}

function OrderCard({
    order,
    onAccept,
    onReject,
    onMarkReady,
}: {
    order: OrderResponse;
    onAccept?: (o: OrderResponse) => void;
    onReject?: (o: OrderResponse) => void;
    onMarkReady?: (o: OrderResponse) => void;
}) {
    const isPending = order.status === "PENDING_DECISION";
    const isAccepted = order.status === "ACCEPTED";
    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {order.customerName}
                        </Typography>
                        <Chip label={order.status.replace("_", " ")} size="small" color={statusColor(order.status)} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {order.contactEmail}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    {order.items.map((item) => (
                        <Typography key={item.id} variant="body2">
                            {item.quantity}× {item.dishName} — €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    ))}
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                        Total: €{total.toFixed(2)}
                    </Typography>
                    {order.rejectionReason && (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                            Reason: {order.rejectionReason}
                        </Typography>
                    )}
                </Box>

                {isPending && onAccept && onReject && (
                    <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" color="success" onClick={() => onAccept(order)}>
                            Accept
                        </Button>
                        <Button size="small" variant="outlined" color="error" onClick={() => onReject(order)}>
                            Reject
                        </Button>
                    </Stack>
                )}
                {isAccepted && onMarkReady && (
                    <Button size="small" variant="contained" color="info" onClick={() => onMarkReady(order)}>
                        Mark Ready
                    </Button>
                )}
            </Stack>
        </Paper>
    );
}
