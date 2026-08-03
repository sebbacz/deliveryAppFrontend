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
    Tooltip,
    Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getRestaurantById } from "../services/restaurantService";
import { getPublishedDishes, type DishResponse } from "../services/dishService";
import PriceRangeHistoryChart from "../components/PriceRangeHistoryChart";
import { useBasket } from "../context/BasketContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useGuesstimatedDelivery } from "../hooks/useGuesstimatedDelivery";
import PageLayout from "../components/PageLayout";

type DishTypeFilter = "ALL" | "STARTER" | "MAIN" | "DESSERT";
type SortOption = "none" | "price_asc" | "price_desc";

export default function RestaurantDetailPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

    const [typeFilter, setTypeFilter] = useState<DishTypeFilter>("ALL");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>("none");
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; pendingDish: DishResponse | null }>({
        open: false,
        pendingDish: null,
    });

    const { basket, addToBasket } = useBasket();
    const { position, loading: geoLoading, requestLocation } = useGeolocation();

    const { data: restaurant, isLoading: restaurantLoading } = useQuery({
        queryKey: ["restaurant", restaurantId],
        queryFn: () => getRestaurantById(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 30_000,
    });

    const { data: dishes = [], isLoading: dishesLoading } = useQuery({
        queryKey: ["publicDishes", restaurantId],
        queryFn: () => getPublishedDishes(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 30_000,
    });

    const delivery = useGuesstimatedDelivery(restaurant, position);

    const allTags = [...new Set(dishes.flatMap((d) => d.foodTags ?? []))].sort();

    let filteredDishes = dishes.filter((d) => {
        const matchesType = typeFilter === "ALL" || d.type === typeFilter;
        const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => d.foodTags?.includes(tag));
        return matchesType && matchesTags;
    });

    if (sortOption === "price_asc") filteredDishes = [...filteredDishes].sort((a, b) => a.price - b.price);
    else if (sortOption === "price_desc") filteredDishes = [...filteredDishes].sort((a, b) => b.price - a.price);

    const handleAddToBasket = (dish: DishResponse) => {
        if (!dish.inStock || !restaurant?.isOpen) return;
        if (basket.restaurantId && basket.restaurantId !== restaurantId) {
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

    if (restaurantLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

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
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/restaurants")} sx={{ mb: 2 }}>
                    All restaurants
                </Button>

                {restaurant.pictureUrls?.length > 0 && (
                    <Stack spacing={1} sx={{ mb: 3 }}>
                        <Box
                            component="img"
                            src={restaurant.pictureUrls[0]}
                            alt={restaurant.name}
                            sx={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 1, display: "block" }}
                        />
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

                {/* Restaurant info */}
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3} mb={3}>
                    <Box>
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
                        <Typography variant="body2" color="text.secondary">
                            {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}, {restaurant.country}
                        </Typography>
                        {restaurant.contactEmail && (
                            <Typography variant="body2" color="text.secondary">{restaurant.contactEmail}</Typography>
                        )}
                    </Box>

                    <Paper variant="outlined" sx={{ p: 2, minWidth: 200 }}>
                        <Stack spacing={0.5}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <AccessTimeIcon fontSize="small" color="action" />
                                <Typography variant="body2">Prep: {restaurant.defaultPreparationTime} min</Typography>
                            </Stack>
                            {delivery?.totalMinutes != null && (
                                <Typography variant="body2" color="primary">
                                    Est. delivery: ~{delivery.totalMinutes} min
                                </Typography>
                            )}
                            {restaurant.openingHours && (
                                <Typography variant="body2" color="text.secondary">
                                    Hours: {restaurant.openingHours}
                                </Typography>
                            )}
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
                        <ToggleButtonGroup
                            value={typeFilter}
                            exclusive
                            onChange={(_, val) => val && setTypeFilter(val)}
                            size="small"
                        >
                            <ToggleButton value="ALL">All</ToggleButton>
                            <ToggleButton value="STARTER">Starters</ToggleButton>
                            <ToggleButton value="MAIN">Mains</ToggleButton>
                            <ToggleButton value="DESSERT">Desserts</ToggleButton>
                        </ToggleButtonGroup>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel>Sort by price</InputLabel>
                            <Select value={sortOption} label="Sort by price" onChange={(e) => setSortOption(e.target.value as SortOption)}>
                                <MenuItem value="none">Default</MenuItem>
                                <MenuItem value="price_asc">Price: Low → High</MenuItem>
                                <MenuItem value="price_desc">Price: High → Low</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {allTags.length > 0 && (
                        <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
                            <Typography variant="body2" color="text.secondary">Tags:</Typography>
                            {allTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    onClick={() => setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                                    color={selectedTags.includes(tag) ? "primary" : "default"}
                                    variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                    clickable
                                />
                            ))}
                            {selectedTags.length > 0 && (
                                <Button size="small" onClick={() => setSelectedTags([])}>Clear</Button>
                            )}
                        </Stack>
                    )}
                </Stack>

                <Typography variant="h6" sx={{ mb: 2 }}>
                    Menu ({filteredDishes.length} dish{filteredDishes.length !== 1 ? "es" : ""})
                </Typography>

                {!restaurant.isOpen && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        This restaurant is currently closed. Ordering is unavailable.
                    </Alert>
                )}

                {dishesLoading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : filteredDishes.length === 0 ? (
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

                <Divider sx={{ my: 4 }} />
                <PriceRangeHistoryChart restaurantId={restaurantId!} />

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

function DishCard({ dish, restaurantClosed, onAddToBasket }: {
    dish: DishResponse;
    restaurantClosed: boolean;
    onAddToBasket: () => void;
}) {
    const isDisabled = !dish.inStock || restaurantClosed;

    return (
        <Paper variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", opacity: dish.inStock ? 1 : 0.6 }}>
            {dish.pictureUrl ? (
                <Box
                    component="img"
                    src={dish.pictureUrl}
                    alt={dish.name}
                    sx={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                />
            ) : (
                <Box sx={{ height: 140, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.disabled">No image</Typography>
                </Box>
            )}

            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle2" sx={{ flexGrow: 1, mr: 1 }}>{dish.name}</Typography>
                    <Typography variant="subtitle2" color="primary">€{dish.price.toFixed(2)}</Typography>
                </Stack>

                {!dish.inStock && <Chip label="Out of stock" size="small" color="warning" />}

                {dish.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                        {dish.description}
                    </Typography>
                )}

                {dish.foodTags?.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                        {dish.foodTags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                    </Stack>
                )}

                <Tooltip title={restaurantClosed ? "Restaurant is closed" : !dish.inStock ? "Out of stock" : ""}>
                    <span>
                        <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            startIcon={<AddShoppingCartIcon />}
                            disabled={isDisabled}
                            onClick={onAddToBasket}
                        >
                            Add to basket
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Paper>
    );
}
