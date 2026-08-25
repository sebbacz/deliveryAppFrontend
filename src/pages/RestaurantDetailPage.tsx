// Public restaurant detail page
// Dishes can be filtered by type (starter/main/dessert) and food tags, and sorted by price.
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Alert,
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
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getRestaurantById } from "../services/restaurantService";
import { getPublishedDishes, type DishResponse } from "../services/dishService";
import { useBasket } from "../context/BasketContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useGuesstimatedDelivery } from "../hooks/useGuesstimatedDelivery";
import { PageLayout } from "../components/common";
import { PriceRangeHistoryChart } from "../components/charts";
import { DishCard } from "../components/dish";

type DishTypeFilter = "ALL" | "STARTER" | "MAIN" | "DESSERT"; // maps to the backend dish type enum
type SortOption = "none" | "price_asc" | "price_desc";

export default function RestaurantDetailPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

    // Filter and sort state — all local, no server round-trip needed
    const [typeFilter, setTypeFilter] = useState<DishTypeFilter>("ALL");
    const [selectedTags, setSelectedTags] = useState<string[]>([]); //  dish must have ALL selected tags
    const [sortOption, setSortOption] = useState<SortOption>("none");

    //   customer tries to add a dish from a different restaurant than what's in the basket
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; pendingDish: DishResponse | null }>({
        open: false,
        pendingDish: null,
    });

    const { basket, addToBasket } = useBasket();
    const { position, loading: geoLoading, requestLocation } = useGeolocation(); // on-demand GPS

    // Fetch restaurant details  every 30 s to catch open/closed status changes
    const { data: restaurant, isLoading: restaurantLoading } = useQuery({
        queryKey: ["restaurant", restaurantId],
        queryFn: () => getRestaurantById(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 30_000,
    });

    // Fetch published (live) dishes —
    const { data: dishes = [], isLoading: dishesLoading } = useQuery({
        queryKey: ["publicDishes", restaurantId],
        queryFn: () => getPublishedDishes(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 30_000,
    });

    // Guesstimated delivery time
    const delivery = useGuesstimatedDelivery(restaurant, position);

    // Collect all unique food tags from the loaded dishes to populate the tag filter row
    const allTags = [...new Set(dishes.flatMap((d) => d.foodTags ?? []))].sort();

    // Apply type filter first,
    let filteredDishes = dishes.filter((d) => {
        const matchesType = typeFilter === "ALL" || d.type === typeFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => d.foodTags?.includes(tag));
        return matchesType && matchesTags;
    });

    // Apply price sort after filtering;
    if (sortOption === "price_asc") filteredDishes = [...filteredDishes].sort((a, b) => a.price - b.price);
    else if (sortOption === "price_desc") filteredDishes = [...filteredDishes].sort((a, b) => b.price - a.price);

    // Called when the customer clicks
    const handleAddToBasket = (dish: DishResponse) => {
        if (!dish.inStock || !restaurant?.isOpen) return; // guard: button should be disabled, but double-check
        if (basket.restaurantId && basket.restaurantId !== restaurantId) {
            // Basket has items from a different restaurant — ask before clearing
            setConfirmDialog({ open: true, pendingDish: dish });
            return;
        }
        addToBasket(restaurantId!, restaurant?.name ?? "", {
            dishId: dish.id,
            dishName: dish.name,
            price: dish.price,
            pictureUrl: dish.pictureUrl,
        });
    };

    // Called when the customer confirms they want to replace the current basket
    const confirmAddToBasket = () => {
        const dish = confirmDialog.pendingDish!;
        addToBasket(restaurantId!, restaurant?.name ?? "", {
            dishId: dish.id,
            dishName: dish.name,
            price: dish.price,
            pictureUrl: dish.pictureUrl,
        });
        setConfirmDialog({ open: false, pendingDish: null });
    };

    // Full-screen   while the restaurant data is loading
    if (restaurantLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // Not found state
    if (!restaurant) {
        return (
            <PageLayout>
                <Container maxWidth="md" sx={{ py: 4 }}>
                    <Typography>Restaurant not found.</Typography>
                    <Button onClick={() => navigate("/restaurants")} sx={{ mt: 2 }}>Back to restaurants</Button>
                </Container>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Container maxWidth="lg">
                {/* Back link to the restaurant listing */}
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/restaurants")} sx={{ mb: 2 }}>
                    All restaurants
                </Button>

                {/* Restaurant photo gallery   */}
                {restaurant.pictureUrls?.length > 0 && (
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        {/* First image   */}
                        <Box
                            component="img"
                            src={restaurant.pictureUrls[0]}
                            alt={restaurant.name}
                            sx={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 1, display: "block" }}
                        />
                        {/* Additional images as a horizontally  */}
                        {restaurant.pictureUrls.length > 1 && (
                            <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
                                {restaurant.pictureUrls.slice(1).map((url, i) => (
                                    <Box
                                        key={i}
                                        component="img"
                                        src={url}
                                        alt={`${restaurant.name} ${i + 2}`}
                                        sx={{ height: 80, width: 120, objectFit: "cover", borderRadius: 1, flexShrink: 0 }}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                )}

                {/* Restaurant info + delivery estimate card  */}
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3} mb={3}>
                    <Box>
                        {/* Name, open/closed chip, cuisine type */}
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <Typography variant="h5">{restaurant.name}</Typography>
                            <Chip
                                label={restaurant.isOpen ? "Open" : "Closed"}
                                color={restaurant.isOpen ? "success" : "default"}
                                size="small"
                            />
                            {restaurant.typeOfCuisine && (
                                <Chip label={restaurant.typeOfCuisine} variant="outlined" size="small" />
                            )}
                        </Stack>
                        {/* Full address + contact email */}
                        <Typography variant="body2" color="text.secondary">
                            {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}, {restaurant.country}
                        </Typography>
                        {restaurant.contactEmail && (
                            <Typography variant="body2" color="text.secondary">{restaurant.contactEmail}</Typography>
                        )}
                    </Box>

                    {/* Delivery estimate sidebar card */}
                    <Paper variant="outlined" sx={{ p: 2, minWidth: 200 }}>
                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="body2">Prep: {restaurant.defaultPreparationTime} min</Typography>
                            </Stack>
                            {/* Full estimate shown only when the customer has shared their location */}
                            {delivery?.totalMinutes != null && (
                                <Typography variant="body2" color="primary">
                                    Est. delivery: ~{delivery.totalMinutes} min
                                </Typography>
                            )}
                            {/* Opening hours string from the owner   */}
                            {restaurant.openingHours && (
                                <Typography variant="body2" color="text.secondary">
                                    Hours: {restaurant.openingHours}
                                </Typography>
                            )}
                            {/* On-demand location button — green when active */}
                            <Button
                                size="small"
                                startIcon={<LocationOnIcon />}
                                onClick={requestLocation}
                                disabled={geoLoading}
                                color={position ? "success" : "inherit"}
                            >
                                {geoLoading ? "Getting location..." : position ? "Location active" : "Get delivery estimate"}
                            </Button>
                        </Stack>
                    </Paper>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                {/* Dish filters */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={2} flexWrap="wrap">
                        {/* Exclusive type filter: ALL / STARTER / MAIN / DESSERT */}
                        <ToggleButtonGroup
                            value={typeFilter}
                            exclusive
                            onChange={(_, val) => val && setTypeFilter(val)} // val is null on is clicked again
                            size="small"
                        >
                            <ToggleButton value="ALL">All</ToggleButton>
                            <ToggleButton value="STARTER">Starters</ToggleButton>
                            <ToggleButton value="MAIN">Mains</ToggleButton>
                            <ToggleButton value="DESSERT">Desserts</ToggleButton>
                        </ToggleButtonGroup>

                        {/* Price sort dropdown */}
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Sort by price</InputLabel>
                            <Select value={sortOption} label="Sort by price" onChange={(e) => setSortOption(e.target.value as SortOption)}>
                                <MenuItem value="none">Default</MenuItem>
                                <MenuItem value="price_asc">Price: Low → High</MenuItem>
                                <MenuItem value="price_desc">Price: High → Low</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {/* Food tag multi-select chips — only shown when there are tags to filter on */}
                    {allTags.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
                            <Typography variant="body2" color="text.secondary">Tags:</Typography>
                            {allTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    // Toggle: add tag if not selected, remove it if already selected
                                    onClick={() => setSelectedTags((prev) =>
                                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                                    )}
                                    color={selectedTags.includes(tag) ? "primary" : "default"}
                                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                    clickable
                                />
                            ))}
                            {/* Clear all selected tags at once */}
                            {selectedTags.length > 0 && (
                                <Button size="small" onClick={() => setSelectedTags([])}>Clear</Button>
                            )}
                        </Stack>
                    )}
                </Stack>

                {/* Dish count in heading   */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Menu ({filteredDishes.length} dish{filteredDishes.length !== 1 ? "es" : ""})
                </Typography>

                {/* Warn when the restaurant is closed   */}
                {!restaurant.isOpen && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This restaurant is currently closed. Ordering is unavailable.
                    </Alert>
                )}

                {/*  Dish grid  */}
                {dishesLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : filteredDishes.length === 0 ? (
                    // Empty state when filters exclude everything
                    <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary">No dishes match your filters.</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={2}>
                        {filteredDishes.map((dish) => (
                            <Grid key={dish.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <DishCard
                                    dish={dish}
                                    restaurantClosed={!restaurant.isOpen}
                                    onAddToBasket={() => handleAddToBasket(dish)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Price range evolution chart   */}
                <Divider sx={{ my: 4 }} />
                <PriceRangeHistoryChart restaurantId={restaurantId!} />

                {/* Replace-basket confirmation dialog ── */}
                {/* Shown when the customer tries to add a dish from a different restaurant than what's in the basket */}
                <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, pendingDish: null })} maxWidth="xs" fullWidth>
                    <DialogTitle>Replace basket?</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary">
                            Your basket contains items from <strong>{basket.restaurantName}</strong>. Adding this item will clear your current basket.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialog({ open: false, pendingDish: null })}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={confirmAddToBasket}>Replace basket</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </PageLayout>
    );
}

