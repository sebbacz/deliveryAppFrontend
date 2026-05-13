import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
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
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { getRestaurantById } from "../services/restaurantService";
import { getPublishedDishes, type DishResponse } from "../services/dishService";
import { useBasket } from "../context/BasketContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { useGuesstimatedDelivery } from "../hooks/useGuesstimatedDelivery";

type DishTypeFilter = "ALL" | "STARTER" | "MAIN" | "DESSERT";
type SortOption = "none" | "price_asc" | "price_desc";

export default function RestaurantDetailPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

    const [typeFilter, setTypeFilter] = useState<DishTypeFilter>("ALL");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>("none");
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        pendingDish: DishResponse | null;
    }>({ open: false, pendingDish: null });

    const { basket, addToBasket, totalItems } = useBasket();
    const { position, loading: geoLoading, requestLocation } = useGeolocation();

    const { data: restaurant, isLoading: restaurantLoading } = useQuery({
        queryKey: ["restaurant", restaurantId],
        queryFn: () => getRestaurantById(restaurantId!),
        enabled: !!restaurantId,
    });

    const { data: dishes = [], isLoading: dishesLoading } = useQuery({
        queryKey: ["publicDishes", restaurantId],
        queryFn: () => getPublishedDishes(restaurantId!),
        enabled: !!restaurantId,
        refetchInterval: 30_000,
    });

    const delivery = useGuesstimatedDelivery(restaurant, position);

    const allTags = [...new Set(dishes.flatMap((d) => d.foodTags ?? []))].sort();

    // Apply filters
    let filteredDishes = dishes.filter((d) => {
        const matchesType = typeFilter === "ALL" || d.type === typeFilter;
        const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.every((tag) => d.foodTags?.includes(tag));
        return matchesType && matchesTags;
    });

    // Apply sort
    if (sortOption === "price_asc") {
        filteredDishes = [...filteredDishes].sort((a, b) => a.price - b.price);
    } else if (sortOption === "price_desc") {
        filteredDishes = [...filteredDishes].sort((a, b) => b.price - a.price);
    }

    const handleAddToBasket = (dish: DishResponse) => {
        if (!dish.inStock) return;
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

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
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
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Typography>Restaurant not found.</Typography>
                <Button onClick={() => navigate("/restaurants")} sx={{ mt: 2 }}>
                    Back to restaurants
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Button variant="text" onClick={() => navigate("/restaurants")}>
                    ← Back
                </Button>
                <Tooltip title="View basket">
                    <IconButton
                        color="primary"
                        onClick={() => navigate("/basket")}
                        sx={{ position: "relative" }}
                    >
                        <ShoppingCartIcon />
                        {totalItems > 0 && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    bgcolor: "error.main",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: 18,
                                    height: 18,
                                    fontSize: 11,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 700,
                                }}
                            >
                                {totalItems}
                            </Box>
                        )}
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Restaurant banner */}
            {restaurant.pictureUrl && (
                <Box
                    component="img"
                    src={restaurant.pictureUrl}
                    alt={restaurant.name}
                    sx={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 2, mb: 3 }}
                />
            )}

            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="flex-start" mb={3}>
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                        <Typography variant="h4" fontWeight={700}>
                            {restaurant.name}
                        </Typography>
                        <Chip
                            label={restaurant.isOpen ? "Open" : "Closed"}
                            color={restaurant.isOpen ? "success" : "default"}
                            size="small"
                        />
                    </Stack>
                    {restaurant.typeOfCuisine && (
                        <Chip label={restaurant.typeOfCuisine} variant="outlined" size="small" sx={{ mb: 1 }} />
                    )}
                    <Typography variant="body2" color="text.secondary">
                        {restaurant.street} {restaurant.number}, {restaurant.postalCode} {restaurant.city}, {restaurant.country}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {restaurant.contactEmail}
                    </Typography>
                </Box>

                <Box sx={{ mt: { xs: 2, md: 0 }, textAlign: { xs: "left", md: "right" } }}>
                    <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ md: "flex-end" }}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                            Prep: <strong>{restaurant.defaultPreparationTime} min</strong>
                        </Typography>
                    </Stack>

                    {delivery && (
                        <Box mt={0.5}>
                            {delivery.totalMinutes !== null ? (
                                <Typography variant="body2" color="primary" fontWeight={600}>
                                    Est. delivery: ~{delivery.totalMinutes} min
                                </Typography>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Est. prep: ~{Math.ceil(restaurant.defaultPreparationTime * delivery.busynessFactor)} min
                                    {delivery.pendingOrderCount > 0 && ` (${delivery.pendingOrderCount} orders ahead)`}
                                </Typography>
                            )}
                        </Box>
                    )}

                    <Button
                        size="small"
                        variant={position ? "text" : "outlined"}
                        startIcon={<LocationOnIcon />}
                        onClick={requestLocation}
                        disabled={geoLoading}
                        color={position ? "success" : "primary"}
                        sx={{ mt: 1 }}
                    >
                        {geoLoading ? "Getting location..." : position ? "Location active" : "Get delivery estimate"}
                    </Button>

                    {restaurant.openingHours && (
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            Hours: {restaurant.openingHours}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            {/* Dish Filters & Sort */}
            <Stack spacing={2} mb={3}>
                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={2} flexWrap="wrap">
                    {/* Type filter */}
                    <ToggleButtonGroup
                        value={typeFilter}
                        exclusive
                        onChange={(_, val) => val && setTypeFilter(val)}
                        size="small"
                        color="primary"
                    >
                        <ToggleButton value="ALL">All</ToggleButton>
                        <ToggleButton value="STARTER">Starters</ToggleButton>
                        <ToggleButton value="MAIN">Mains</ToggleButton>
                        <ToggleButton value="DESSERT">Desserts</ToggleButton>
                    </ToggleButtonGroup>

                    {/* Sort */}
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel>Sort by price</InputLabel>
                        <Select
                            value={sortOption}
                            label="Sort by price"
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                        >
                            <MenuItem value="none">Default</MenuItem>
                            <MenuItem value="price_asc">Price: Low → High</MenuItem>
                            <MenuItem value="price_desc">Price: High → Low</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Tag filters */}
                {allTags.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">Tags:</Typography>
                        {allTags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                onClick={() => toggleTag(tag)}
                                color={selectedTags.includes(tag) ? "primary" : "default"}
                                variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                clickable
                            />
                        ))}
                        {selectedTags.length > 0 && (
                            <Button size="small" variant="text" onClick={() => setSelectedTags([])}>
                                Clear tags
                            </Button>
                        )}
                    </Stack>
                )}
            </Stack>

            {/* Dishes */}
            <Typography variant="h5" fontWeight={600} mb={3}>
                Menu
                <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                    ({filteredDishes.length} dish{filteredDishes.length !== 1 ? "es" : ""})
                </Typography>
            </Typography>

            {dishesLoading ? (
                <CircularProgress size={24} />
            ) : filteredDishes.length === 0 ? (
                <Typography color="text.secondary">No dishes match your filters.</Typography>
            ) : (
                <Grid container spacing={2}>
                    {filteredDishes.map((dish) => (
                        <Grid key={dish.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <DishCard
                                dish={dish}
                                onAddToBasket={() => handleAddToBasket(dish)}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Confirm replace basket dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, pendingDish: null })}>
                <DialogTitle>Replace basket?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Your basket contains items from <strong>{basket.restaurantName}</strong>. Adding this item will
                        clear your current basket. Do you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, pendingDish: null })}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={confirmAddToBasket}>
                        Replace basket
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function DishCard({ dish, onAddToBasket }: { dish: DishResponse; onAddToBasket: () => void }) {
    return (
        <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", opacity: dish.inStock ? 1 : 0.6 }}>
            {dish.pictureUrl ? (
                <CardMedia
                    component="img"
                    height="140"
                    image={dish.pictureUrl}
                    alt={dish.name}
                    sx={{ objectFit: "cover" }}
                />
            ) : (
                <Box sx={{ height: 140, bgcolor: "grey.100", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography variant="body2" color="text.disabled">No image</Typography>
                </Box>
            )}
            <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1, mr: 1 }}>
                        {dish.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary" sx={{ whiteSpace: "nowrap" }}>
                        €{dish.price.toFixed(2)}
                    </Typography>
                </Stack>

                {!dish.inStock && (
                    <Chip label="Out of stock" size="small" color="warning" sx={{ mb: 1, alignSelf: "flex-start" }} />
                )}

                {dish.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, flexGrow: 1 }}>
                        {dish.description}
                    </Typography>
                )}

                {dish.foodTags?.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                        {dish.foodTags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                    </Stack>
                )}

                <Box mt={1.5}>
                    <Tooltip title={dish.inStock ? "Add to basket" : "Out of stock"}>
                        <span>
                            <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                startIcon={<AddShoppingCartIcon />}
                                disabled={!dish.inStock}
                                onClick={onAddToBasket}
                            >
                                Add to basket
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
}
