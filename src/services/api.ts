// api (authenticated, refreshes token before each request) and publicv api no auth
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Authenticated instance — used for all owner/protected endpoints
export const api = axios.create({ baseURL: BASE_URL });

// Unauthenticated instance — used for public customer endpoints
export const publicApi = axios.create({ baseURL: BASE_URL });

// Stored in module scope so   can read the latest token without React re-renders
let _token: string | undefined;
let _refreshToken: (() => Promise<void>) | undefined;

// Before every authenticated request: refresh the token if needed, then attach it as a Bearer header
api.interceptors.request.use(async (config) => {
    if (_refreshToken) await _refreshToken(); // renews the token if it's close to expiry
    if (_token) config.headers.Authorization = `Bearer ${_token}`;
    return config;
});

// Called by SecurityContextProvider when a new token is received from Keycloak
export function setAuthToken(token?: string) {
    _token = token;
}

// Called once during Keycloak init to register the refresh callback used by the interceptor
export function setTokenRefresher(fn: () => Promise<void>) {
    _refreshToken = fn;
}
