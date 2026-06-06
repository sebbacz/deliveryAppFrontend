import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Stack, Typography } from "@mui/material";
import type { RestaurantResponse } from "../services/restaurantService";

// Fix Leaflet's default marker icons with Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type PriceRange = "€" | "€€" | "€€€" | "€€€€";

interface RestaurantMapProps {
    restaurants: {
        restaurant: RestaurantResponse;
        priceRange: PriceRange | null;
        estimatedMinutes: number;
        distanceKm: number | null;
    }[];
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
    const navigate = useNavigate();

    // Default center: Brussels, Belgium
    const center: [number, number] = [50.85045, 4.34878];

    return (
        <MapContainer
            center={center}
            zoom={8}
            style={{ height: "500px", width: "100%", borderRadius: 12 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {restaurants.map(({ restaurant, priceRange, estimatedMinutes, distanceKm }) => {
                if (restaurant.latitude == null || restaurant.longitude == null) return null;
                const coords: [number, number] = [restaurant.latitude, restaurant.longitude];

                return (
                    <Marker key={restaurant.id} position={coords}>
                        <Popup minWidth={200}>
                            <Stack spacing={0.5} sx={{ py: 0.5 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {restaurant.name}
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                    {restaurant.typeOfCuisine && (
                                        <Chip label={restaurant.typeOfCuisine} size="small" variant="outlined" />
                                    )}
                                    {priceRange && (
                                        <Chip label={priceRange} size="small" color="primary" variant="outlined" />
                                    )}
                                    <Chip
                                        label={restaurant.isOpen ? "Open" : "Closed"}
                                        size="small"
                                        color={restaurant.isOpen ? "success" : "default"}
                                    />
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                    {restaurant.city}
                                    {distanceKm !== null && ` · ${distanceKm.toFixed(1)} km`}
                                    {` · Est. ~${estimatedMinutes} min`}
                                </Typography>
                                <Button
                                    size="small"
                                    variant="contained"
                                    sx={{ mt: 0.5 }}
                                    onClick={() => navigate(`/restaurants/${restaurant.id}`)}
                                >
                                    View restaurant
                                </Button>
                            </Stack>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
