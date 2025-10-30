import {api} from "./api";

export interface OwnerProfile {
    ownerId: string;
    hasRestaurant: boolean;
    restaurantId?: string;
}

export async function getOwnerProfile(): Promise<OwnerProfile> {
    const { data } = await api.get("/api/owners/me");
    return data;
}
