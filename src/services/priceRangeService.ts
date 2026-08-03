import { api, publicApi } from "./api";

export type CriteriaEventResponse = {
    id: string;
    effectiveAt: string;
    cheapMax: number;
    regularMax: number;
    expensiveMax: number;
};

export type AddCriteriaEventRequest = {
    effectiveAt: string;
    cheapMax: number;
    regularMax: number;
    expensiveMax: number;
};

export async function getCriteriaEvents(): Promise<CriteriaEventResponse[]> {
    const { data } = await api.get("/api/price-range/criteria");
    return data;
}

export async function addCriteriaEvent(request: AddCriteriaEventRequest): Promise<void> {
    await api.post("/api/price-range/criteria", request);
}

export async function getActiveCriteria(): Promise<CriteriaEventResponse | null> {
    const { data } = await publicApi.get("/unsecured/price-range/criteria/current");
    return data ?? null;
}
