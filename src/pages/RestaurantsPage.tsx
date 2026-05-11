import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { getAllRestaurants, type RestaurantResponse } from "../services/restaurantService";

export default function RestaurantsPage() {
    const navigate = useNavigate();
    const [cuisineFilter, setCuisineFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const { data: restaurants = [], isLoading } = useQuery({
        queryKey: ["restaurants"],
        queryFn: getAllRestaurants,
        refetchInterval: 30_000,
    });

    const cuisineTypes = [...new Set(restaurants.map((r) => r.typeOfCuisine).filter(Boolean))].sort();

    const filtered = restaurants.filter((r) => {
        const matchesCuisine = !cuisineFilter || r.typeOfCuisine === cuisineFilter;
        const matchesSearch =
            !searchQuery ||
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.city.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCuisine && matchesSearch;
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
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
            </Stack>

            {filtered.length === 0 ? (
                <Box textAlign="center" py={8}>
                    <Typography color="text.secondary">No restaurants found.</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filtered.map((restaurant) => (
                        <Grid key={restaurant.id} size={{ xs: 12, sm: 6, md: 4 }}>
                            <RestaurantCard restaurant={restaurant} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
}

function RestaurantCard({ restaurant }: { restaurant: RestaurantResponse }) {
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

                {restaurant.typeOfCuisine && (
                    <Chip label={restaurant.typeOfCuisine} size="small" variant="outlined" sx={{ mb: 1 }} />
                )}

                <Typography variant="body2" color="text.secondary">
                    {restaurant.city}, {restaurant.country}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Prep time: {restaurant.defaultPreparationTime} min
                </Typography>

                {restaurant.openingHours && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                        Hours: {restaurant.openingHours}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
