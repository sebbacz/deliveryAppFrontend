// Uses publicApi because the PaymentIntent is created before order submission (no owner auth needed at this step).
import { publicApi } from "./api";

export async function createPaymentIntent(amountInCents: number): Promise<{ clientSecret: string }> {
    const { data } = await publicApi.post("/unsecured/payments/create-intent", { amount: amountInCents });
    return data;
}
