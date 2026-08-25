//   single order with the relevant action button
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import HomeIcon from "@mui/icons-material/Home";
import type { OrderResponse } from "../../services/orderService";
import { useOrderCountdown } from "../../hooks/useOrderCountdown";

// Maps order status to a MUI chip colour
function statusColor(status: string): "warning" | "success" | "error" | "info" | "default" {
    if (status === "PENDING_DECISION") return "warning";
    if (status === "ACCEPTED") return "success";
    if (status === "REJECTED") return "error";
    if (status === "READY_FOR_PICKUP") return "info";
    if (status === "PICKED_UP") return "info";
    if (status === "DELIVERED") return "success";
    return "default";
}

interface OrderCardProps {
    order: OrderResponse;
    onAccept?: (o: OrderResponse) => void;
    onReject?: (o: OrderResponse) => void;
    onMarkReady?: (o: OrderResponse) => void;
    onMarkPickedUp?: (o: OrderResponse) => void;
    onMarkDelivered?: (o: OrderResponse) => void;
}

export default function OrderCard({ order, onAccept, onReject, onMarkReady, onMarkPickedUp, onMarkDelivered }: OrderCardProps) {
    const isPending  = order.status === "PENDING_DECISION";
    const isAccepted = order.status === "ACCEPTED";
    const isReady    = order.status === "READY_FOR_PICKUP";
    const isPickedUp = order.status === "PICKED_UP";
    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0); // calculate total from frozen prices
    const countdown = useOrderCountdown(order.createdAt); // live countdown for pending orders

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                        <Typography variant="subtitle2">{order.customerName}</Typography>
                        <Chip label={order.status.replace("_", " ")} size="small" color={statusColor(order.status)} />
                        {/* Countdown chip   */}
                        {isPending && (
                            <Chip label={countdown} size="small" color="warning" variant="outlined" />
                        )}
                    </Stack>

                    {/* Delivery address and contact email */}
                    <Typography variant="body2" color="text.secondary">
                        {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {order.contactEmail}
                    </Typography>

                    <Divider sx={{ my: 1 }} />

                    {/* Order items: quantity × name — price */}
                    {order.items.map((item) => (
                        <Typography key={item.id} variant="body2" sx={{ mb: 0.25 }}>
                            {item.quantity}× {item.dishName} — €{(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    ))}
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 600 }}>
                        Total: €{total.toFixed(2)}
                    </Typography>

                    {/* Show rejection reason if the order was rejected */}
                    {order.rejectionReason && (
                        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                            Reason: {order.rejectionReason}
                        </Typography>
                    )}
                </Box>

                {/* Action buttons   */}
                <Stack spacing={1}>
                    {isPending && onAccept && onReject && (
                        <>
                            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} onClick={() => onAccept(order)}>
                                Accept
                            </Button>
                            <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => onReject(order)}>
                                Reject
                            </Button>
                        </>
                    )}
                    {isAccepted && onMarkReady && (
                        <Button size="small" variant="contained" startIcon={<DoneAllIcon />} onClick={() => onMarkReady(order)}>
                            Mark ready
                        </Button>
                    )}
                    {isReady && onMarkPickedUp && (
                        <Button size="small" variant="contained" color="secondary" startIcon={<DirectionsBikeIcon />} onClick={() => onMarkPickedUp(order)}>
                            Picked up
                        </Button>
                    )}
                    {isPickedUp && onMarkDelivered && (
                        <Button size="small" variant="contained" color="success" startIcon={<HomeIcon />} onClick={() => onMarkDelivered(order)}>
                            Delivered
                        </Button>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
