// Configures two axios instances: `api` (authenticated, refreshes token before each request) and `publicApi` (no auth).
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;


export const api = axios.create({ baseURL: BASE_URL });


export const publicApi = axios.create({ baseURL: BASE_URL });


let _token: string | undefined;
let _refreshToken: (() => Promise<void>) | undefined;

api.interceptors.request.use(async (config) => {
    if (_refreshToken) await _refreshToken();
    if (_token) config.headers.Authorization = `Bearer ${_token}`;
    return config;
});

export function setAuthToken(token?: string) {
    _token = token;
}

export function setTokenRefresher(fn: () => Promise<void>) {
    _refreshToken = fn;
}
