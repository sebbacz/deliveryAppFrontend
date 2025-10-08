import {
    Box,
    Container,
    Typography,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    Stack,
} from "@mui/material";
import type { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

type Restaurant = {
    id: string;
    name: string;
    cuisineType: string;
    city: string;
    country: string;
    pictureUrl?: string;
    defaultPrepTime: number;
    openingHours: string;
};

export default function CustomerHomePage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);





    useEffect(() => {
        axiosClient
            .get<Restaurant[]>("/restaurant/public")
            .then((res: AxiosResponse<Restaurant[]>) => setRestaurants(res.data))
            .catch((err: unknown) => console.error("Failed to load restaurants:", err));
    }, []);

    return (
        <Box sx={{ backgroundColor: "#fafafa", minHeight: "100vh" }}>
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h3" fontWeight="bold" textAlign="center" mb={6}>
                    Explore Restaurants 🍕
                </Typography>

                {restaurants.length === 0 ? (
                    <Typography textAlign="center" color="text.secondary">
                        No restaurants available yet. Check back soon!
                    </Typography>
                ) : (
                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        justifyContent="center"
                        gap={4}
                    >
                        {restaurants.map((r) => (
                            <RestaurantCard key={r.id} restaurant={r} />
                        ))}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}

/* --- Restaurant Card component --- */
function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    const {
        name,
        cuisineType,
        city,
        country,
        pictureUrl,
        defaultPrepTime,
        openingHours,
    } = restaurant;

    return (
        <Card
            sx={{
                width: 320,
                borderRadius: 3,
                boxShadow: 3,
                ":hover": { boxShadow: 6 },
                transition: "0.2s",
            }}
        >
            <CardMedia
                component="img"
                height="180"
                image={
                    pictureUrl ||
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=60"
                }
                alt={name}
            />
            <CardContent>
                <Typography variant="h6" fontWeight="bold">
                    {name}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                    {cuisineType} • {city}, {country}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                    ⏱️ Prep time: {defaultPrepTime} min
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    🕒 {openingHours}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ textTransform: "none" }}
                >
                    View Menu
                </Button>
            </CardActions>
        </Card>
    );
}
