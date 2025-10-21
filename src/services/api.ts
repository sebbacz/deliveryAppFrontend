import axios from "axios";

const BACKEND_URL: string = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: BACKEND_URL,
});

export function setAuthToken(token?: string) {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
}

export default api;
