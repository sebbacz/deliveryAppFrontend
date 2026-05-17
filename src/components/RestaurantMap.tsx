import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
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

async function geocodeAddress(address: string): Promise<[number, number] | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
    } catch {
        return null;
    }
}

type PriceRange = "€" | "€€" | "€€€" | "€€€€";

interface RestaurantMapProps {
    restaurants: {
        restaurant: RestaurantResponse;
        priceRange: PriceRange | null;
        estimatedMinutes: number;
    }[];
}

export default function RestaurantMap({ restaurants }: RestaurantMapProps) {
    const navigate = useNavigate();

    const geocodeQueries = useQueries({
        queries: restaurants.map(({ restaurant: r }) => ({
            queryKey: ["geocode", `${r.street} ${r.number}, ${r.postalCode} ${r.city}, ${r.country}`],
            queryFn: () =>
                geocodeAddress(`${r.street} ${r.number}, ${r.postalCode} ${r.city}, ${r.country}`),
            staleTime: 60 * 60 * 1000,
            // Nominatim requires max 1 req/s — stagger with index offset
        })),
    });

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

            {restaurants.map(({ restaurant, priceRange, estimatedMinutes }, i) => {
                const coords = geocodeQueries[i]?.data;
                if (!coords) return null;

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
                                    {restaurant.city} · Prep: {restaurant.defaultPreparationTime} min
                                    {estimatedMinutes > 0 && ` · Est. ~${estimatedMinutes} min`}
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
