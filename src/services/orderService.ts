import { api } from "./api";

export interface OrderItem {
    id: string;
    dishId: string;
    dishName: string;
    price: number;
    quantity: number;
}

export interface OrderResponse {
    id: string;
    restaurantId: string;
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
    status: "PENDING_DECISION" | "ACCEPTED" | "REJECTED";
    rejectionReason: string | null;
    createdAt: string;
    items: OrderItem[];
}

export async function getOrdersForRestaurant(restaurantId: string): Promise<OrderResponse[]> {
    const { data } = await api.get(`/api/orders/restaurant/${restaurantId}`);
    return data;
}

export async function acceptOrder(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/accept`);
}

export async function rejectOrder(orderId: string, reason: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/reject`, { reason });
}
