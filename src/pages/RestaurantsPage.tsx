// Restaurant listing page: shows all restaurants in a card list or on a  map.
// Computes price range and guesstimated delivery
import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
    Box, Button, CircularProgress, Container, FormControl, Grid, InputLabel,
    MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup,
    Tooltip, Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import { getAllRestaurants } from "../services/restaurantService";
import { getPublishedDishes } from "../services/dishService";
import { getRestaurantBusyness } from "../services/orderService";
import { getActiveCriteria, type CriteriaEventResponse } from "../services/priceRangeService";
import { useGeolocation } from "../hooks/useGeolocation";
import { haversineKm } from "../utils/haversine";
import { PageLayout } from "../components/common";
import { RestaurantCard, type PriceRange } from "../components/restaurant";

//   map component — Leaflet is heavy and only needed when the user switches to map view
const RestaurantMap = lazy(() => import("../components/maps/RestaurantMap"));

const PRICE_RANGES = ["€", "€€", "€€€", "€€€€"] as const;

//   used when the backend hasn't returned active criteria yet
const DEFAULT_CRITERIA = { cheapMax: 10, regularMax: 30, expensiveMax: 60 };

//   average dish price into a price range symbol based on current criteria
function getPriceRange(avg: number, criteria: { cheapMax: number; regularMax: number; expensiveMax: number }): PriceRange {
    if (avg <= criteria.cheapMax) return "€";
    if (avg <= criteria.regularMax) return "€€";
    if (avg <= criteria.expensiveMax) return "€€€";
    return "€€€€";
}

export default function RestaurantsPage() {
    const navigate = useNavigate();

    // Filter state
    const [cuisineFilter, setCuisineFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>([]); // empty = all ranges shown
    const [maxDelivery, setMaxDelivery] = useState<number | "">("");  // max guesstimated delivery minutes
    const [maxDistance, setMaxDistance] = useState<number | "">("");  // max km (only shown when location is active)
    const [viewMode, setViewMode] = useState<"list" | "map">("list"); // toggle between card list and map

    const { position, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();

    //  restaurants  every 30 s so the open/closed status stays current
    const { data: restaurants = [], isLoading } = useQuery({
        queryKey: ["restaurants"],
        queryFn: getAllRestaurants,
        refetchInterval: 30_000,
    });

    //  currently active price range criteria so classification matches the backend
    const { data: activeCriteria } = useQuery<CriteriaEventResponse | null>({
        queryKey: ["activeCriteria"],
        queryFn: getActiveCriteria,
        staleTime: 5 * 60 * 1000, //   5-minute cache
    });

    // Fall back to hardcoded defaults if criteria haven't loaded yet
    const criteria = activeCriteria ?? DEFAULT_CRITERIA;

    // Fetch published dishes for every restaurant in parallel — used to compute average price
    const dishQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["publicDishes", r.id],
            queryFn: () => getPublishedDishes(r.id),
            staleTime: 60_000, // dish prices don't change every second
        })),
    });

    //  for every restaurant — used in the guesstimated delivery formula
    const busynessQueries = useQueries({
        queries: restaurants.map((r) => ({
            queryKey: ["busyness", r.id],
            queryFn: () => getRestaurantBusyness(r.id),
            refetchInterval: 30_000, //  poll
            staleTime: 0,
        })),
    });

    // Unique sorted cuisine types for the filter dropdown
    const cuisineTypes = [...new Set(restaurants.map((r) => r.typeOfCuisine).filter(Boolean))].sort();

    // Combine restaurant data with computed price range, delivery estimate, and distance
    const restaurantData = restaurants.map((r, i) => {
        const dishes = dishQueries[i]?.data ?? [];
        const avgPrice = dishes.length > 0 ? dishes.reduce((sum, d) => sum + d.price, 0) / dishes.length : 0;
        const priceRange: PriceRange | null = dishes.length > 0 ? getPriceRange(avgPrice, criteria) : null;
        const pendingOrders = busynessQueries[i]?.data?.pendingOrderCount ?? 0;
        const busynessFactor = Math.max(1, pendingOrders); //  1 so estimate is never zeroed

        let distanceKm: number | null = null;
        let estimatedMinutes: number;
        if (position && r.latitude != null && r.longitude != null) {
            // Full estimate
            distanceKm = haversineKm(position.latitude, position.longitude, r.latitude, r.longitude);
            const deliveryMinutes = Math.ceil((distanceKm / 30) * 60); // 30 km/h
            estimatedMinutes = Math.ceil((deliveryMinutes + r.defaultPreparationTime) * busynessFactor);
        } else {
            // No location: show prep-time-only
            estimatedMinutes = Math.ceil(r.defaultPreparationTime * busynessFactor);
        }

        return { restaurant: r, priceRange, estimatedMinutes, pendingOrders, distanceKm };
    });

    // Apply all active filters to the computed restaurant data
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

    //  initial load
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
                {/*  Header row  */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                    <Box>
                        <Typography variant="h5">Restaurants</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""} available
                        </Typography>
                    </Box>
                    {/* Toggle between card list and Leaflet map */}
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(_, val) => val && setViewMode(val)} size="small">
                        <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="map"><MapIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/*   Filter bar */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack spacing={2}>
                        {/* Text search  */}
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
                            {/* Distance filter only makes sense when geolocation is active */}
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

                        {/* Price range   */}
                        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" gap={1}>
                            <Typography variant="body2" color="text.secondary">Price range:</Typography>
                            {/* Multi-select price  */}
                            <ToggleButtonGroup value={selectedPriceRanges} onChange={(_, v) => setSelectedPriceRanges(v)} size="small">
                                {PRICE_RANGES.map((pr) => (
                                    <ToggleButton key={pr} value={pr} sx={{ minWidth: 44 }}>{pr}</ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            {/* Location button   */}
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

                {/*  Results  */}
                {filtered.length === 0 ? (
                    // No results — show empty state with a clear-all button
                    <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
                        <Typography color="text.secondary" sx={{ mb: 1 }}>No restaurants match your filters.</Typography>
                        <Button onClick={() => { setSearchQuery(""); setCuisineFilter(""); setSelectedPriceRanges([]); setMaxDelivery(""); setMaxDistance(""); }}>
                            Clear filters
                        </Button>
                    </Paper>
                ) : viewMode === "map" ? (
                    // Map view
                    <Suspense fallback={<Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>}>
                        <RestaurantMap restaurants={filtered} />
                    </Suspense>
                ) : (
                    // Card grid view
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

