// Card shown in the restaurant listing grid displays image, name, status, cuisine, price range, and delivery estimate.
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { RestaurantResponse } from "../../services/restaurantService";

export type PriceRange = "€" | "€€" | "€€€" | "€€€€";

interface RestaurantCardProps {
    restaurant: RestaurantResponse;
    priceRange: PriceRange | null;
    estimatedMinutes: number;
    distanceKm: number | null;
    onClick: () => void;
}

export default function RestaurantCard({ restaurant, priceRange, estimatedMinutes, distanceKm, onClick }: RestaurantCardProps) {
    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{ cursor: "pointer", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 2 } }}
        >
            {/* Restaurant  image */}
            {restaurant.pictureUrls?.[0] ? (
                <Box
                    component="img"
                    src={restaurant.pictureUrls[0]}
                    alt={restaurant.name}
                    sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
            ) : (
                <Box sx={{ height: 160, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.disabled">No image</Typography>
                </Box>
            )}

            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                {/*  row with open/closed status chip */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" noWrap>{restaurant.name}</Typography>
                    <Chip
                        label={restaurant.isOpen ? "Open" : "Closed"}
                        size="small"
                        color={restaurant.isOpen ? "success" : "default"}
                    />
                </Box>

                {/* Cuisine type and price range chips */}
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {restaurant.typeOfCuisine && (
                        <Chip label={restaurant.typeOfCuisine} size="small" variant="outlined" />
                    )}
                    {priceRange && (
                        <Chip label={priceRange} size="small" />
                    )}
                </Stack>

                {/* delivery estimate pushed to the bottom of the card */}
                <Box sx={{ mt: "auto" }}>
                    <Typography variant="body2" color="text.secondary">{restaurant.city}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                            {distanceKm !== null
                                ? `~${estimatedMinutes} min · ${distanceKm.toFixed(1)} km` // full estimate with distance
                                : `Prep: ${restaurant.defaultPreparationTime} min`}          // prep-only fallback
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
}
