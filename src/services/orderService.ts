// Order service: createOrder and getOrderById use publicApi
import { api, publicApi } from "./api";

// Represents a single dish line within an order
export interface OrderItem {
    id: string;
    dishId: string;
    dishName: string;
    price: number;    // price at the time of order
    quantity: number;
}

// Full order response including delivery details, status, and courier location
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
    rejectionReason: string | null; // only set when status is REJECTED
    createdAt: string;              // timestamp, used to calculate the 5-minute auto-decline countdown
    items: OrderItem[];
    courierLatitude: number | null;  // live courier position — set by the external delivery service
    courierLongitude: number | null;
}

// Shape of the request body when placing a new order
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

//   used to calculate the guesstimated delivery time
export interface BusynessResponse {
    pendingOrderCount: number; // number of orders not yet ready for pickup
}

// Owner: fetch all orders for their restaurant
export async function getOrdersForRestaurant(restaurantId: string): Promise<OrderResponse[]> {
    const { data } = await api.get(`/api/orders/restaurant/${restaurantId}`);
    return data;
}

// Owner: accept a pending order
export async function acceptOrder(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/accept`);
}

// Owner: reject a pending order and provide a reason shown to the customer
export async function rejectOrder(orderId: string, reason: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/reject`, { reason });
}

// Owner: mark an accepted order as ready for pickup by the delivery service
export async function markOrderReady(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/ready`);
}

// Owner: mark an order as picked up by the courier (typically triggered from the delivery side)
export async function markOrderPickedUp(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/pickup`);
}

// Owner: mark an order as delivered
export async function markOrderDelivered(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/delivered`);
}

// Public: place a new order — no login required for customers
export async function createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const { data } = await publicApi.post("/unsecured/orders", request);
    return data;
}

// Public: fetch a single order by id for the tracking page — no login required
export async function getOrderById(orderId: string): Promise<OrderResponse> {
    const { data } = await publicApi.get(`/unsecured/orders/${orderId}`);
    return data;
}

// Public: returns the number of pending orders for a restaurant,
export async function getRestaurantBusyness(restaurantId: string): Promise<BusynessResponse> {
    const { data } = await publicApi.get(`/unsecured/orders/restaurant/${restaurantId}/busyness`);
    return data;
}
