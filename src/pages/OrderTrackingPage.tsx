import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "../services/orderService";
import {
    Alert, Box, Button, Card, CardContent, Chip, CircularProgress,
    Container, Divider, Stack, Typography,
} from "@mui/material";

const STATUS_LABELS: Record<string, string> = {
    PENDING_DECISION: "Awaiting restaurant decision",
    ACCEPTED: "Accepted — being prepared",
    REJECTED: "Rejected",
    READY_FOR_PICKUP: "Ready for pickup",
};

const STATUS_COLORS: Record<string, "warning" | "info" | "error" | "success" | "default"> = {
    PENDING_DECISION: "warning",
    ACCEPTED: "info",
    REJECTED: "error",
    READY_FOR_PICKUP: "success",
};

export default function OrderTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => getOrderById(orderId!),
        enabled: !!orderId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            if (status === "REJECTED" || status === "READY_FOR_PICKUP") return false;
            return 10_000;
        },
    });

    if (isLoading) return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress />
        </Box>
    );

    if (isError || !order) return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Alert severity="error">Order not found.</Alert>
            <Button onClick={() => navigate("/restaurants")} sx={{ mt: 2 }}>Browse restaurants</Button>
        </Container>
    );

    const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700} mb={1}>Order status</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                Order ID: {order.id}
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                        <Chip
                            label={STATUS_LABELS[order.status] ?? order.status}
                            color={STATUS_COLORS[order.status] ?? "default"}
                            size="medium"
                        />
                        {(order.status === "PENDING_DECISION" || order.status === "ACCEPTED") && (
                            <CircularProgress size={20} />
                        )}
                    </Stack>

                    {order.status === "REJECTED" && order.rejectionReason && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <strong>Reason:</strong> {order.rejectionReason}
                        </Alert>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        Delivering to: {order.deliveryStreet} {order.deliveryNumber}, {order.deliveryPostalCode} {order.deliveryCity}
                    </Typography>
                </CardContent>
            </Card>

            <Typography variant="h6" fontWeight={600} mb={2}>Your order</Typography>
            <Stack spacing={1} mb={2}>
                {order.items.map((item) => (
                    <Stack key={item.id} direction="row" justifyContent="space-between">
                        <Typography variant="body2">{item.quantity}× {item.dishName}</Typography>
                        <Typography variant="body2" fontWeight={600}>€{(item.price * item.quantity).toFixed(2)}</Typography>
                    </Stack>
                ))}
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={700}>Total</Typography>
                <Typography fontWeight={700} color="primary">€{total.toFixed(2)}</Typography>
            </Stack>

            {order.status === "REJECTED" && (
                <Button variant="contained" sx={{ mt: 3 }} fullWidth onClick={() => navigate("/restaurants")}>
                    Try another restaurant
                </Button>
            )}
        </Container>
    );
}
