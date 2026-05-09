import { api } from "./api";

export interface DishResponse {
    id: string;
    restaurantId: string;
    name: string;
    type: string;
    foodTags: string[];
    description: string;
    price: number;
    pictureUrl: string;
    inStock: boolean;
    state: "DRAFT" | "LIVE";
}

export interface DishDraftRequest {
    id?: string;
    restaurantId: string;
    name: string;
    type: string;
    foodTags: string[];
    description: string;
    price: number;
    pictureUrl: string;
}

export async function saveDishDraft(data: DishDraftRequest): Promise<DishResponse> {
    const { data: response } = await api.post("/api/dishes/draft", data);
    return response;
}

export async function publishDish(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/publish`);
}

export async function unpublishDish(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/unpublish`);
}

export async function markDishOutOfStock(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/out-of-stock`);
}

export async function markDishBackInStock(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/back-in-stock`);
}

export async function applyPendingDishChanges(restaurantId: string): Promise<void> {
    await api.post(`/api/dishes/apply-changes/${restaurantId}`);
}
