import api from "./api";

export async function getOwnerProfile() {
    const { data } = await api.get("/auth/me");
    return data;
}
