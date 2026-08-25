// Owner orders page: lists incoming orders grouped by status and provides accept/reject/ready/pickup/delivered actions.

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box, Button, CircularProgress, Container, Dialog, DialogActions,
    DialogContent, DialogTitle, Paper, Stack, TextField, Typography,
} from "@mui/material";
import {
    acceptOrder, getOrdersForRestaurant, markOrderDelivered, markOrderPickedUp,
    markOrderReady, rejectOrder, type OrderResponse,
} from "../services/orderService";
import { PageLayout } from "../components/common";
import { OrderCard } from "../components/order";

export default function OrdersPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [rejectDialogOrder, setRejectDialogOrder] = useState<OrderResponse | null>(null); // the order being rejected
    const [rejectionReason, setRejectionReason] = useState("");                              // reason typed by the owner

    //  every 15 s so the owner sees new orders promptly without a manual refresh
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["orders", restaurantId],
        queryFn: () => getOrdersForRestaurant(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 15_000,
    });

    // Accept the order and immediately refresh the list
    async function handleAccept(order: OrderResponse) {
        await acceptOrder(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    // Mark the order as ready for pickup by the delivery service
    async function handleMarkReady(order: OrderResponse) {
        await markOrderReady(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    // Confirm that the courier has picked up the order
    async function handleMarkPickedUp(order: OrderResponse) {
        await markOrderPickedUp(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    // Mark the order as delivered — final status
    async function handleMarkDelivered(order: OrderResponse) {
        await markOrderDelivered(order.id);
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    // Submit the rejection with the reason and close the dialog
    async function handleRejectConfirm() {
        if (!rejectDialogOrder || !rejectionReason.trim()) return;
        await rejectOrder(rejectDialogOrder.id, rejectionReason);
        setRejectDialogOrder(null);
        setRejectionReason("");
        queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }

    // Group orders by status so they can be rendered in separate sections
    const pending     = orders.filter((o) => o.status === "PENDING_DECISION"); // awaiting owner decision
    const accepted    = orders.filter((o) => o.status === "ACCEPTED");         // in the kitchen
    const readyPickup = orders.filter((o) => o.status === "READY_FOR_PICKUP"); // waiting for courier
    const pickedUp    = orders.filter((o) => o.status === "PICKED_UP");        // out for delivery
    const decided     = orders.filter((o) => o.status === "REJECTED" || o.status === "DELIVERED"); // completed

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
                <Button onClick={() => navigate("/owner")} sx={{ mb: 2 }}>← Dashboard</Button>
                <Typography variant="h5" sx={{ mb: 3 }}>Orders</Typography>

                {/* Pending section  declinet 5 minutes */}
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

                {/* In-kitchen orders   */}
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

                {/* Ready for pickup */}
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

                {/*  Out for delivery  */}
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

                {/*  Completed   */}
                {decided.length > 0 && (
                    <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Completed / Rejected ({decided.length})</Typography>
                        <Stack spacing={2}>
                            {decided.map((order) => <OrderCard key={order.id} order={order} />)}
                        </Stack>
                    </>
                )}

                {/* Rejection   */}
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
                        {/* Disable submit until a reason is typed */}
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

