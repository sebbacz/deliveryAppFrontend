//  Keycloak ID token (name) and access token (roles).
export interface User {
    name: string;    // given_name
    roles: string[]; // realm_access.roles
}
