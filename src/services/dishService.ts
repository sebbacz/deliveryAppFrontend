import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function saveDishDraft(data: any) {
    const response = await axios.post(`${BACKEND_URL}/api/dishes/draft`, data);
    return response.data;
}



export async function markDishOutOfStock(dishId: string) {
    await axios.post(`${BACKEND_URL}/api/dishes/${dishId}/out-of-stock`);
}
export async function markDishBackInStock(dishId: string) {
    await axios.post(`${BACKEND_URL}/api/dishes/${dishId}/back-in-stock`)

export async function applyPendingDishChanges(restaurantId: string) {
    await axios.post(`${BACKEND_URL}/api/dishes/apply-changes/${restaurantId}`);
}


export async function publishDish(id: string) {
    await axios.post(`${BACKEND_URL}/api/dishes/${id}/publish`);
}

export async function unpublishDish(id: string) {
    await axios.post(`${BACKEND_URL}/api/dishes/${id}/unpublish`);
}
