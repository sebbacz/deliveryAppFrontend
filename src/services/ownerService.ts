import { api } from "./api";

export interface Owner {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export async function getOwner(): Promise<Owner> {
    const { data } = await api.get("/api/auth/me");
    return data;
}
