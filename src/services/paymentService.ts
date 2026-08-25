// Payment service: uses publicApi because the PaymentIntent is created before order submission (no owner auth needed).
import { publicApi } from "./api";

// Creates a Stripe  and returns the clientSecret needed to initialise the Stripe Elements form
export async function createPaymentIntent(amountInCents: number): Promise<{ clientSecret: string }> {
    const { data } = await publicApi.post("/unsecured/payments/create-intent", { amount: amountInCents });
    return data;
}
