import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
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
import { getAllRestaurants, type RestaurantResponse } from "../services/restaurantService";
import { getPublishedDishes } from "../services/dishService";
import { getRestaurantBusyness } from "../services/orderService";
import { useGeolocation } from "../hooks/useGeolocation";

const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"] as const;
type PriceRange = (typeof PRICE_RANGES)[number];

function getPriceRange(avg: number): PriceRange {
    if (avg < 10) return "€";
    if (avg <= 30) return "€€";
    if (avg <= 60) return "€€€";
    return "€€€€";
}

export default function RestaurantsPage() {
    const navigate = useNavigate();
    const [cuisineFilter, setCuisineFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]);
    const [maxDelivery, setMaxDelivery] = useState<number | "">("");

    const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

    const { data: restaurants = [], isLoading } = useQuery({
        queryKey: ["restaurants"],
        queryFn: getAllRestaurants,
        refetchInterval: 30_000,
    });

    // Fetch dishes for all restaurants in parallel (for price range computation)
    const dishQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["publicDishes", r.id],
            queryFn: () => getPublishedDishes(r.id),
            staleTime: 60_000,
        })),
    });

    // Fetch busyness for all restaurants in parallel
    const busynessQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["busyness", r.id],
            queryFn: () => getRestaurantBusyness(r.id),
            refetchInterval: 30_000,
            staleTime: 0,
        })),
    });

    const cuisineTypes = [...new Set(restaurants.map((r) => r.typeOfCuisine).filter(Boolean))].sort();

    // Compute per-restaurant derived data
    const restaurantData = restaurants.map((r, i) => {
        const dishes = dishQueries[i]?.data ?? [];
        const avgPrice = dishes.length > 0
            ? dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length
            : 0;
        const priceRange: PriceRange | null = dishes.length > 0 ? getPriceRange(avgPrice) : null;

        const pendingOrders = busynessQueries[i]?.data?.pendingOrderCount ?? 0;
        const busynessFactor = Math.max(1, 1 + pendingOrders * 0.2);
        const estimatedMinutes = Math.ceil(r.defaultPreparationTime * busynessFactor);

        return { restaurant: r, priceRange, estimatedMinutes, pendingOrders };
    });

    const filtered = restaurantData.filter(({ restaurant, priceRange, estimatedMinutes }) => {
        const matchesCuisine = !cuisineFilter || restaurant.typeOfCuisine === cuisineFilter;
        const matchesSearch =
            !searchQuery ||
            restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            restaurant.city.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice =
            selectedPriceRanges.length === 0 ||
            (priceRange !== null && selectedPriceRanges.includes(priceRange));
        const matchesDelivery =
            maxDelivery === "" || estimatedMinutes <= maxDelivery;

        return matchesCuisine && matchesSearch && matchesPrice && matchesDelivery;
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const handlePriceRangeToggle = (_: React.MouseEvent<HTMLElement>, newVal: PriceRange[]) => {
        setSelectedPriceRanges(newVal);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Restaurants
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} available
                    </Typography>
                </Box>
                <Button variant="text" onClick={() => navigate("/")}>
                    Back
                </Button>
            </Stack>

            {/* Filters */}
            <Stack spacing={2} mb={4}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} flexWrap="wrap">
                    <TextField
                        label="Search by name or city"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 220 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Cuisine</InputLabel>
                        <Select
                            value={cuisineFilter}
                            label="Cuisine"
                            onChange={(e) => setCuisineFilter(e.target.value)}
                        >
                            <MenuItem value="">All cuisines</MenuItem>
                            {cuisineTypes.map((c) => (
                                <MenuItem key={c} value={c}>
                                    {c}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Max delivery time</InputLabel>
                        <Select
                            value={maxDelivery}
                            label="Max delivery time"
                            onChange={(e) => setMaxDelivery(e.target.value as number | "")}
                        >
                            <MenuItem value="">Any time</MenuItem>
                            <MenuItem value={20}>Under 20 min</MenuItem>
                            <MenuItem value={30}>Under 30 min</MenuItem>
                            <MenuItem value={45}>Under 45 min</MenuItem>
                            <MenuItem value={60}>Under 60 min</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                        Price range:
                    </Typography>
                    <ToggleButtonGroup
                        value={selectedPriceRanges}
                        onChange={handlePriceRangeToggle}
                        size="small"
                        color="primary"
                    >
                        {PRICE_RANGES.map((pr) => (
                            <ToggleButton key={pr} value={pr}>
                                {pr}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Tooltip title={position ? "Location active" : geoError ? geoError : "Enable to get delivery estimates"}>
                        <Button
                            variant={position ? "contained" : "outlined"}
                            size="small"
                            startIcon={<LocationOnIcon />}
                            onClick={requestLocation}
                            disabled={geoLoading}
                            color={position ? "success" : "primary"}
                        >
                            {geoLoading ? "Getting location..." : position ? "Location active" : "Use my location"}
                        </Button>
                    </Tooltip>
                </Stack>
            </Stack>

            {filtered.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography color="text.secondary">No restaurants found.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filtered.map(({ restaurant, priceRange, estimatedMinutes }) => (
                        <Grid key={restaurant.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <RestaurantCard
                                restaurant={restaurant}
                                priceRange={priceRange}
                                estimatedMinutes={estimatedMinutes}
                                locationEnabled={!!position}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

interface RestaurantCardProps {
    restaurant: RestaurantResponse;
    priceRange: PriceRange | null;
    estimatedMinutes: number;
    locationEnabled: boolean;
}

function RestaurantCard({ restaurant, priceRange, estimatedMinutes, locationEnabled }: RestaurantCardProps) {
    const navigate = useNavigate();

    return (
        <Card
            variant="outlined"
            onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 4, cursor: "pointer" },
            }}
        >
            {restaurant.pictureUrl ? (
                <CardMedia
                    component="img"
                    height="160"
                    image={restaurant.pictureUrl}
                    alt={restaurant.name}
                    sx={{ objectFit: "cover" }}
                />
            ) : (
                <Box
                    sx={{
                        height: 160,
                        bgcolor: "grey.100",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography color="text.disabled" variant="body2">
                        No image
                    </Typography>
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                    <Typography variant="h6" fontWeight={600} noWrap sx={{ maxWidth: "70%" }}>
                        {restaurant.name}
                    </Typography>
                    <Chip
                        label={restaurant.isOpen ? "Open" : "Closed"}
                        color={restaurant.isOpen ? "success" : "default"}
                        size="small"
                    />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
                    {restaurant.typeOfCuisine && (
                        <Chip label={restaurant.typeOfCuisine} size="small" variant="outlined" />
                    )}
                    {priceRange && (
                        <Chip label={priceRange} size="small" color="primary" variant="outlined" />
                    )}
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    {restaurant.city}, {restaurant.country}
                </Typography>

                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                        Prep: {restaurant.defaultPreparationTime} min
                        {locationEnabled && (
                            <> · Est. delivery: ~{estimatedMinutes} min</>
                        )}
                    </Typography>
                </Stack>

                {restaurant.openingHours && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                        Hours: {restaurant.openingHours}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
