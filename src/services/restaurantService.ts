// Restaurant service: read operations use publicApi
import { api, publicApi } from "./api";

// Full restaurant response returned by the backend
export type RestaurantResponse = {
    id: string;
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrls: string[];
    defaultPreparationTime: number; // minutes, used in guesstimated delivery time
    typeOfCuisine: string;
    openingHours: string;           //  weekly schedule string
    isOpen: boolean;                // current open/closed status
    latitude: number | null;        // geocoded coordinates stored by the backend
    longitude: number | null;
};

// Shape of the request body for creating a restaurant
export type CreateRestaurantRequest = {
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrls: string[];
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
};

// Owner: create a new restaurant (
export async function createRestaurant(data: CreateRestaurantRequest): Promise<RestaurantResponse> {
    const { data: response } = await api.post("/api/restaurants", data);
    return response;
}

// Owner: fetch the logged-in owner's restaurant
export async function getMyRestaurant(): Promise<RestaurantResponse | null> {
    const { status, data } = await api.get("/api/restaurants/my", { validateStatus: (s) => s < 500 });
    if (status === 204) return null;
    return data;
}

// Owner: permanently delete their restaurant
export async function deleteMyRestaurant(): Promise<void> {
    await api.delete("/api/restaurants/my");
}

// Owner: manually mark the restaurant as open (overrides the schedule)
export async function openRestaurant(): Promise<void> {
    await api.put("/api/restaurants/my/open");
}

// Owner: manually mark the restaurant as closed (overrides the schedule)
export async function closeRestaurant(): Promise<void> {
    await api.put("/api/restaurants/my/close");
}

// Public: fetch all restaurants for the customer listing page
export async function getAllRestaurants(): Promise<RestaurantResponse[]> {
    const { data } = await publicApi.get("/unsecured/restaurants");
    return data;
}

// Public: fetch a single restaurant by id for the detail page
export async function getRestaurantById(id: string): Promise<RestaurantResponse> {
    const { data } = await publicApi.get(`/unsecured/restaurants/${id}`);
    return data;
}

// One data point in the price range history — used by the evolution chart
export interface PriceRangePoint {
    month: string;
    priceRange: "CHEAP" | "REGULAR" | "EXPENSIVE" | "PREMIUM";
    averagePrice: number;
}

// Public: fetch historical price range data for a restaurant to power the evolution chart
export async function getPriceRangeHistory(restaurantId: string): Promise<PriceRangePoint[]> {
    const { data } = await publicApi.get(`/unsecured/restaurants/${restaurantId}/price-range-history`);
    return data;
}
