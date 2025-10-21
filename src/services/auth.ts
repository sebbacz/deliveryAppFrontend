let token: string | null = null;

export function addAccessTokenToAuthHeader(accessToken?: string | undefined) {
    token = accessToken || null;
}

export function removeAccessTokenFromAuthHeader() {
    token = null;
}

export function getAuthHeaders() {
    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}
