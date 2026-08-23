import { useQuery } from "@tanstack/react-query";
import { getPriceRangeHistory, type PriceRangePoint } from "../services/restaurantService";
import { Box, CircularProgress, Typography, Alert } from "@mui/material";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Maps enum strings to integers plot them on a numeric Y-axis with custom tick labels.
const PRICE_RANGE_ORDER = ["CHEAP", "REGULAR", "EXPENSIVE", "PREMIUM"];
const PRICE_RANGE_LABELS: Record<string, string> = {
    CHEAP: "€",
    REGULAR: "€€",
    EXPENSIVE: "€€€",
    PREMIUM: "€€€€",
};

function toNumeric(priceRange: string): number {
    return PRICE_RANGE_ORDER.indexOf(priceRange) + 1;
}

function formatYAxis(value: number): string {
    return PRICE_RANGE_LABELS[PRICE_RANGE_ORDER[value - 1]] ?? "";
}

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const item: PriceRangePoint = payload[0].payload;
    return (
        <Box sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", p: 1.5, borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={700}>{label}</Typography>
            <Typography variant="body2">
                Category: <strong>{PRICE_RANGE_LABELS[item.priceRange] ?? item.priceRange}</strong>
            </Typography>
            <Typography variant="body2">
                Avg. price: <strong>€{item.averagePrice.toFixed(2)}</strong>
            </Typography>
        </Box>
    );
}

interface Props {
    restaurantId: string;
}

export default function PriceRangeHistoryChart({ restaurantId }: Props) {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["priceRangeHistory", restaurantId],
        queryFn: () => getPriceRangeHistory(restaurantId),
    });

    if (isLoading) return <CircularProgress size={24} />;
    if (isError) return <Alert severity="error">Could not load price history.</Alert>;
    if (!data || data.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                No price range history available yet.
            </Typography>
        );
    }

    const chartData = data.map((p) => ({ ...p, numericRange: toNumeric(p.priceRange) }));

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 0.75 }}>
                Price range evolution
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
                Shows how this restaurant's price category has evolved as market criteria changed.
            </Typography>
            <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8e5df" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: "#6b6560" }}
                        axisLine={{ stroke: "#d0ccc5" }}
                        tickLine={{ stroke: "#d0ccc5" }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        domain={[1, 4]}
                        ticks={[1, 2, 3, 4]}
                        tickFormatter={formatYAxis}
                        tick={{ fontSize: 13, fill: "#6b6560" }}
                        axisLine={{ stroke: "#d0ccc5" }}
                        tickLine={{ stroke: "#d0ccc5" }}
                        width={36}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="stepAfter"
                        dataKey="numericRange"
                        stroke="#1565c0"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#1565c0", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#1976d2", strokeWidth: 0 }}
                        name="Price range"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}
