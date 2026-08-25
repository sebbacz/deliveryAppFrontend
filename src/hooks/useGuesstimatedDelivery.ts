import { useQuery } from "@tanstack/react-query";
import { getRestaurantBusyness } from "../services/orderService";
import type { RestaurantResponse } from "../services/restaurantService";
import { haversineKm } from "../utils/haversine";

interface GeoPosition {
    latitude: number;
    longitude: number;
}

async function geocodeAddress(address: string): Promise<GeoPosition | null> {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();
        if (data.length > 0) {
            return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        }
        return null;
    } catch {
        return null;
    }
}

// Estimates delivery time using haversine distance, 30 km/h travel speed, prep time
export function useGuesstimatedDelivery(restaurant: RestaurantResponse | undefined, customerPos: GeoPosition | null) {
    const restaurantAddress = restaurant
        ? `${restaurant.street} ${restaurant.number}, ${restaurant.postalCode} ${restaurant.city}, ${restaurant.country}`
        : "";

    // Use backend stored coordinates when available
    const hasStoredCoords = !!(restaurant?.latitude && restaurant?.longitude);

    const { data: geocodedCoords } = useQuery({
        queryKey: ["geocode", restaurantAddress],
        queryFn: () => geocodeAddress(restaurantAddress),
        enabled: !!restaurant && !!customerPos && !hasStoredCoords,
        staleTime: 60 * 60 * 1000, // addresses don't change often
    });

    const restaurantCoords = hasStoredCoords && restaurant
        ? { latitude: restaurant.latitude!, longitude: restaurant.longitude! }
        : geocodedCoords;

    const { data: busyness } = useQuery({
        queryKey: ["busyness", restaurant?.id],
        queryFn: () => getRestaurantBusyness(restaurant!.id),
        enabled: !!restaurant,
        refetchInterval: 30_000, // poll so the estimate stays responsive to order volume changes
    });

    if (!restaurant) return null;

    const pendingOrderCount = busyness?.pendingOrderCount ?? 0;
    const busynessFactor = Math.max(1, pendingOrderCount); // never below 1 so the estimate is never zero
    const prepTime = restaurant.defaultPreparationTime;

    let deliveryMinutes: number | null = null;
    if (customerPos && restaurantCoords) {
        const distKm = haversineKm(
            customerPos.latitude,
            customerPos.longitude,
            restaurantCoords.latitude,
            restaurantCoords.longitude
        );
        deliveryMinutes = Math.ceil((distKm / 30) * 60); // 30 km/h
    }

    const totalMinutes = deliveryMinutes !== null
        ? Math.ceil((deliveryMinutes + prepTime) * busynessFactor)
        : null;

    return {
        deliveryMinutes,
        prepTime,
        busynessFactor,
        totalMinutes,
        pendingOrderCount,
    };
}
