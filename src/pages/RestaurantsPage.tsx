import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import { getAllRestaurants, type RestaurantResponse } from "../services/restaurantService";
import { getPublishedDishes } from "../services/dishService";
import { getRestaurantBusyness } from "../services/orderService";
import { useGeolocation } from "../hooks/useGeolocation";
import PageLayout from "../components/PageLayout";

const RestaurantMap = lazy(() => import("../components/RestaurantMap"));

const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"] as const;
type PriceRange = (typeof PRICE_RANGES)[number];

function getPriceRange(avg: number): PriceRange {
    if (avg < 10) return "€";
    if (avg <= 30) return "€€";
    if (avg <= 60) return "€€€";
    return "€€€€";
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function RestaurantsPage() {
    const navigate = useNavigate();
    const [cuisineFilter, setCuisineFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
    const [maxDelivery, setMaxDelivery] = useState<number | "">("");
    const [maxDistance, setMaxDistance] = useState<number | "">("");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");

    const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

    const { data: restaurants = [], isLoading } = useQuery({
        queryKey: ["restaurants"],
        queryFn: getAllRestaurants,
        refetchInterval: 30_000,
    });

    const dishQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["publicDishes", r.id],
            queryFn: () => getPublishedDishes(r.id),
            staleTime: 60_000,
        })),
    });

    const busynessQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["busyness", r.id],
            queryFn: () => getRestaurantBusyness(r.id),
            refetchInterval: 30_000,
            staleTime: 0,
        })),
    });

    const cuisineTypes = [...new Set(restaurants.map((r) => r.typeOfCuisine).filter(Boolean))].sort();

    const restaurantData = restaurants.map((r, i) => {
        const dishes = dishQueries[i]?.data ?? [];
        const avgPrice = dishes.length > 0 ? dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length : 0;
        const priceRange: PriceRange | null = dishes.length > 0 ? getPriceRange(avgPrice) : null;
        const pendingOrders = busynessQueries[i]?.data?.pendingOrderCount ?? 0;
        const busynessFactor = Math.max(1, 1 + pendingOrders * 0.2);

        let distanceKm: number | null = null;
        let estimatedMinutes: number;
        if (position && r.latitude != null && r.longitude != null) {
            distanceKm = haversineKm(position.latitude, position.longitude, r.latitude, r.longitude);
            const deliveryMinutes = Math.ceil((distanceKm / 30) * 60);
            estimatedMinutes = Math.ceil((deliveryMinutes + r.defaultPreparationTime) * busynessFactor);
        } else {
            estimatedMinutes = Math.ceil(r.defaultPreparationTime * busynessFactor);
        }

        return { restaurant: r, priceRange, estimatedMinutes, pendingOrders, distanceKm };
    });

    const filtered = restaurantData.filter(({ restaurant, priceRange, estimatedMinutes, distanceKm }) => {
        const matchesCuisine = !cuisineFilter || restaurant.typeOfCuisine === cuisineFilter;
        const matchesSearch =
            !searchQuery ||
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.city.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice =
            selectedPriceRanges.length === 0 || (priceRange !== null && selectedPriceRanges.includes(priceRange));
        const matchesDelivery = maxDelivery === "" || estimatedMinutes <= maxDelivery;
        const matchesDistance = maxDistance === "" || distanceKm === null || distanceKm <= maxDistance;
        return matchesCuisine && matchesSearch && matchesPrice && matchesDelivery && matchesDistance;
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="lg">
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h5">Restaurants</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} available
                        </Typography>
                    </Box>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, val) => val && setViewMode(val)}
                        size="small"
                    >
                        <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="map"><MapIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Filters */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                            <TextField
                                label="Search by name or city"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ minWidth: 200, flex: 1 }}
                            />
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Cuisine</InputLabel>
                                <Select value={cuisineFilter} label="Cuisine" onChange={(e) => setCuisineFilter(e.target.value)}>
                                    <MenuItem value="">All cuisines</MenuItem>
                                    {cuisineTypes.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel>Max delivery time</InputLabel>
                                <Select value={maxDelivery} label="Max delivery time" onChange={(e) => setMaxDelivery(e.target.value as number | "")}>
                                    <MenuItem value="">Any time</MenuItem>
                                    <MenuItem value={20}>Under 20 min</MenuItem>
                                    <MenuItem value={30}>Under 30 min</MenuItem>
                                    <MenuItem value={45}>Under 45 min</MenuItem>
                                    <MenuItem value={60}>Under 60 min</MenuItem>
                                </Select>
                            </FormControl>
                            {position && (
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel>Max distance</InputLabel>
                                    <Select value={maxDistance} label="Max distance" onChange={(e) => setMaxDistance(e.target.value as number | "")}>
                                        <MenuItem value="">Any distance</MenuItem>
                                        <MenuItem value={2}>Within 2 km</MenuItem>
                                        <MenuItem value={5}>Within 5 km</MenuItem>
                                        <MenuItem value={10}>Within 10 km</MenuItem>
                                        <MenuItem value={25}>Within 25 km</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
                            <Typography variant="body2" color="text.secondary">Price range:</Typography>
                            <ToggleButtonGroup value={selectedPriceRanges} onChange={(_, v) => setSelectedPriceRanges(v)} size="small">
                                {PRICE_RANGES.map((pr) => (
                                    <ToggleButton key={pr} value={pr} sx={{ minWidth: 44 }}>{pr}</ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Tooltip title={position ? "Location active" : geoError ?? "Enable to get real delivery estimates"}>
                                <Button
                                    variant={position ? "contained" : "outlined"}
                                    color={position ? "success" : "inherit"}
                                    size="small"
                                    startIcon={<LocationOnIcon />}
                                    onClick={requestLocation}
                                    disabled={geoLoading}
                                >
                                    {geoLoading ? "Getting location..." : position ? "Location active" : "Use my location"}
                                </Button>
                            </Tooltip>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Results */}
                {filtered.length === 0 ? (
                    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>No restaurants match your filters.</Typography>
                        <Button onClick={() => { setSearchQuery(""); setCuisineFilter(""); setSelectedPriceRanges([]); setMaxDelivery(""); setMaxDistance(""); }}>
                            Clear filters
                        </Button>
                    </Paper>
                ) : viewMode === "map" ? (
                    <Suspense fallback={<Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}>
                        <RestaurantMap restaurants={filtered} />
                    </Suspense>
                ) : (
                    <Grid container spacing={2}>
                        {filtered.map(({ restaurant, priceRange, estimatedMinutes, distanceKm }) => (
                            <Grid key={restaurant.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <RestaurantCard
                                    restaurant={restaurant}
                                    priceRange={priceRange}
                                    estimatedMinutes={estimatedMinutes}
                                    distanceKm={distanceKm}
                                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </PageLayout>
    );
}

function RestaurantCard({
    restaurant,
    priceRange,
    estimatedMinutes,
    distanceKm,
    onClick,
}: {
    restaurant: RestaurantResponse;
    priceRange: PriceRange | null;
    estimatedMinutes: number;
    distanceKm: number | null;
    onClick: () => void;
}) {
    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{ cursor: "pointer", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 2 } }}
        >
            {restaurant.pictureUrl ? (
                <Box
                    component="img"
                    src={restaurant.pictureUrl}
                    alt={restaurant.name}
                    sx={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
            ) : (
                <Box sx={{ height: 160, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.disabled">No image</Typography>
                </Box>
            )}

            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" noWrap>{restaurant.name}</Typography>
                    <Chip
                        label={restaurant.isOpen ? "Open" : "Closed"}
                        size="small"
                        color={restaurant.isOpen ? "success" : "default"}
                    />
                </Box>

                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                    {restaurant.typeOfCuisine && (
                        <Chip label={restaurant.typeOfCuisine} size="small" variant="outlined" />
                    )}
                    {priceRange && (
                        <Chip label={priceRange} size="small" />
                    )}
                </Stack>

                <Box sx={{ mt: "auto" }}>
                    <Typography variant="body2" color="text.secondary">{restaurant.city}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                            {distanceKm !== null
                                ? `~${estimatedMinutes} min · ${distanceKm.toFixed(1)} km`
                                : `Prep: ${restaurant.defaultPreparationTime} min`}
                        </Typography>
                    </Stack>
                </Box>
            </Box>
        </Paper>
    );
}
