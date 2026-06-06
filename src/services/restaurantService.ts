import { api, publicApi } from "./api";

export type RestaurantResponse = {
    id: string;
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrl: string;
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
    isOpen: boolean;
    latitude: number | null;
    longitude: number | null;
};

export type CreateRestaurantRequest = {
    name: string;
    street: string;
    number: string;
    postalCode: string;
    city: string;
    country: string;
    contactEmail: string;
    pictureUrl: string;
    defaultPreparationTime: number;
    typeOfCuisine: string;
    openingHours: string;
};

export async function createRestaurant(data: CreateRestaurantRequest): Promise<RestaurantResponse> {
    const { data: response } = await api.post("/api/restaurants", data);
    return response;
}

export async function getMyRestaurant(): Promise<RestaurantResponse | null> {
    try {
        const { data } = await api.get("/api/restaurants/my");
        return data;
    } catch (error: any) {
        if (error.response?.status === 404) return null;
        throw error;
    }
}

export async function openRestaurant(): Promise<void> {
    await api.put("/api/restaurants/my/open");
}

export async function closeRestaurant(): Promise<void> {
    await api.put("/api/restaurants/my/close");
}

export async function getAllRestaurants(): Promise<RestaurantResponse[]> {
    const { data } = await publicApi.get("/unsecured/restaurants");
    return data;
}

export async function getRestaurantById(id: string): Promise<RestaurantResponse> {
    const { data } = await publicApi.get(`/unsecured/restaurants/${id}`);
    return data;
}

export interface PriceRangePoint {
    month: string;
    priceRange: "CHEAP" | "REGULAR" | "EXPENSIVE" | "PREMIUM";
    averagePrice: number;
}

export async function getPriceRangeHistory(restaurantId: string): Promise<PriceRangePoint[]> {
    const { data } = await publicApi.get(`/unsecured/restaurants/${restaurantId}/price-range-history`);
    return data;
}
