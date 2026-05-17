import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Authenticated instance — carries the owner Bearer token
export const api = axios.create({ baseURL: BASE_URL });

// Public instance — never sends an Authorization header
export const publicApi = axios.create({ baseURL: BASE_URL });

// Store the token in a closure so only `api`'s interceptor reads it.
// Mutating `api.defaults.headers.common` would affect `publicApi` too because
// axios.create() instances share the same `headers.common` object by reference.
let _token: string | undefined;

api.interceptors.request.use((config) => {
    if (_token) config.headers.Authorization = `Bearer ${_token}`;
    return config;
});

export function setAuthToken(token?: string) {
    _token = token;
}
