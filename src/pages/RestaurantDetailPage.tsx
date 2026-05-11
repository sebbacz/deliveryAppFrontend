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
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";
import { getRestaurantById } from "../services/restaurantService";
import { getPublishedDishes, type DishResponse } from "../services/dishService";

export default function RestaurantDetailPage() {
    const { restaurantId } = useParams<{ restaurantId: string }>();
    const navigate = useNavigate();

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

    const starters = dishes.filter((d) => d.type === "STARTER");
    const mains = dishes.filter((d) => d.type === "MAIN");
    const desserts = dishes.filter((d) => d.type === "DESSERT");

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Button variant="text" onClick={() => navigate("/restaurants")} sx={{ mb: 2 }}>
                ← Back
            </Button>

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
                    <Typography variant="body2" color="text.secondary">
                        Avg. prep time: <strong>{restaurant.defaultPreparationTime} min</strong>
                    </Typography>
                    {restaurant.openingHours && (
                        <Typography variant="body2" color="text.secondary">
                            Hours: {restaurant.openingHours}
                        </Typography>
                    )}
                </Box>
            </Stack>

            <Divider sx={{ mb: 4 }} />

            {/* Dishes */}
            <Typography variant="h5" fontWeight={600} mb={3}>
                Menu
                <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                    ({dishes.length} dish{dishes.length !== 1 ? "es" : ""})
                </Typography>
            </Typography>

            {dishesLoading ? (
                <CircularProgress size={24} />
            ) : dishes.length === 0 ? (
                <Typography color="text.secondary">No dishes available at the moment.</Typography>
            ) : (
                <>
                    {starters.length > 0 && <DishSection title="Starters" dishes={starters} />}
                    {mains.length > 0 && <DishSection title="Main Courses" dishes={mains} />}
                    {desserts.length > 0 && <DishSection title="Desserts" dishes={desserts} />}
                </>
            )}
        </Container>
    );
}

function DishSection({ title, dishes }: { title: string; dishes: DishResponse[] }) {
    return (
        <Box mb={4}>
            <Typography variant="h6" fontWeight={600} mb={2}>
                {title}
            </Typography>
            <Grid container spacing={2}>
                {dishes.map((dish) => (
                    <Grid key={dish.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <DishCard dish={dish} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

function DishCard({ dish }: { dish: DishResponse }) {
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
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight={600}>
                        {dish.name}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                        €{dish.price.toFixed(2)}
                    </Typography>
                </Stack>

                {!dish.inStock && (
                    <Chip label="Out of stock" size="small" color="warning" sx={{ mb: 1 }} />
                )}

                {dish.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
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
            </CardContent>
        </Card>
    );
}
