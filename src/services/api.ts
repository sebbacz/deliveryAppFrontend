import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Authenticated instance — carries the owner Bearer token
export const api = axios.create({ baseURL: BASE_URL });

// Public instance — never sends an Authorization header
export const publicApi = axios.create({ baseURL: BASE_URL });

export function setAuthToken(token?: string) {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
}
