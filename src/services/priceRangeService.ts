// Price range service:
import { api, publicApi } from "./api";

// A single criteria  — defines the price
export type CriteriaEventResponse = {
    id: string;
    effectiveAt: string;   //  timestamp:
    cheapMax: number;      // avg price ≤ cheapMax → €
    regularMax: number;    // avg price ≤ regularMax → €€
    expensiveMax: number;  // avg price ≤ expensiveMax → €€€, else → €€€€
};

// Shape of the request body for adding a new criteria event
export type AddCriteriaEventRequest = {
    effectiveAt: string;
    cheapMax: number;
    regularMax: number;
    expensiveMax: number;
};

// Owner: fetch all historical criteria events
export async function getCriteriaEvents(): Promise<CriteriaEventResponse[]> {
    const { data } = await api.get("/api/price-range/criteria");
    return data;
}

// Owner: add a new criteria event
export async function addCriteriaEvent(request: AddCriteriaEventRequest): Promise<void> {
    await api.post("/api/price-range/criteria", request);
}

// Public: returns the currently active criteria
export async function getActiveCriteria(): Promise<CriteriaEventResponse | null> {
    const { data } = await publicApi.get("/unsecured/price-range/criteria/current");
    return data ?? null;
}
