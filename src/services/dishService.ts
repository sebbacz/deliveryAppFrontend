// Dish service:
import { api, publicApi } from "./api";

// Represents the uncommitted version of a dish's fields
export interface PendingDraft {
    name: string;
    type: string;
    foodTags: string[];
    description: string;
    price: number;
    pictureUrl: string;
}

// Full dish response returned by the backend including live state and any pending draft
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
    state: "DRAFT" | "LIVE" | "LIVE_WITH_PENDING"; // LIVE_WITH_PENDING
    scheduledAt?: string;      // set when changes are scheduled to go live at a future time
    pendingDraft?: PendingDraft; // present when state is DRAFT or LIVE_WITH_PENDING
}

//  equest body for creating or updating a dish draft
export interface DishDraftRequest {
    restaurantId: string;
    name: string;
    type: string;
    foodTags: string[];
    description: string;
    price: number;
    pictureUrl: string;
}

// Creates a new dish as a draft
export async function createDishDraft(data: DishDraftRequest): Promise<DishResponse> {
    const { data: response } = await api.post("/api/dishes/draft", data);
    return response;
}

// Saves edits to an existing dish as a draft without affecting the live version
export async function updateDishDraft(id: string, data: DishDraftRequest): Promise<DishResponse> {
    const { data: response } = await api.put(`/api/dishes/${id}/draft`, data);
    return response;
}

// Makes a draft dish visible to customers
export async function publishDish(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/publish`);
}

// Hides a live dish from customers (dish still exists as a draft)
export async function unpublishDish(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/unpublish`);
}

// Marks a dish as out of stock — still visible but cannot be added to basket
export async function markDishOutOfStock(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/out-of-stock`);
}

// Restores availability of an out-of-stock dish
export async function markDishBackInStock(id: string): Promise<void> {
    await api.post(`/api/dishes/${id}/back-in-stock`);
}

// Publishes all pending dish changes for a restaurant at once
export async function applyPendingDishChanges(restaurantId: string): Promise<void> {
    await api.post(`/api/dishes/apply-changes/${restaurantId}`);
}

// Schedules all pending dish changes to go live at a specific date/time
export async function scheduleDishChanges(restaurantId: string, scheduledAt: string): Promise<void> {
    await api.post("/api/dishes/schedule", { restaurantId, scheduledAt });
}

// Public endpoint — returns only published, in-stock dishes visible to customers
export async function getPublishedDishes(restaurantId: string): Promise<DishResponse[]> {
    const { data } = await publicApi.get(`/unsecured/restaurants/${restaurantId}/dishes`);
    return data;
}

// Owner endpoint — returns all dishes including drafts and out-of-stock items
export async function getOwnerDishes(restaurantId: string): Promise<DishResponse[]> {
    const { data } = await api.get(`/api/dishes/restaurant/${restaurantId}`);
    return data;
}
