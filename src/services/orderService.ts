// Order service: createOrder uses publicApi (no auth); management actions (accept/reject/etc.) use authenticated api.
import { api, publicApi } from "./api";

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
    status: "PENDING_DECISION" | "ACCEPTED" | "REJECTED" | "READY_FOR_PICKUP" | "PICKED_UP" | "DELIVERED";
    rejectionReason: string | null;
    createdAt: string;
    items: OrderItem[];
    courierLatitude: number | null;
    courierLongitude: number | null;
}

export interface CreateOrderRequest {
    restaurantId: string;
    customerName: string;
    deliveryStreet: string;
    deliveryNumber: string;
    deliveryPostalCode: string;
    deliveryCity: string;
    deliveryCountry: string;
    contactEmail: string;
    items: { dishId: string; dishName: string; price: number; quantity: number }[];
}

export interface BusynessResponse {
    pendingOrderCount: number;
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

export async function markOrderReady(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/ready`);
}

export async function markOrderPickedUp(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/pickup`);
}

export async function markOrderDelivered(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/delivered`);
}

export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const { data } = await publicApi.post("/unsecured/orders", request);
    return data;
}

export async function getOrderById(orderId: string): Promise<OrderResponse> {
    const { data } = await publicApi.get(`/unsecured/orders/${orderId}`);
    return data;
}

export async function getRestaurantBusyness(restaurantId: string): Promise<BusynessResponse> {
    const { data } = await publicApi.get(`/unsecured/orders/restaurant/${restaurantId}/busyness`);
    return data;
}
