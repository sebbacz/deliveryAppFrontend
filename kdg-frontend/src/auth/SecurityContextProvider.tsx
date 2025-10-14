import { type PropsWithChildren, useEffect, useState } from "react";
import SecurityContext from "./SecurityContext";
import { isExpired } from "react-jwt";
import Keycloak from "keycloak-js";
import type { User } from "../model/user";
import { setAuthToken } from "../services/api";

const keycloakConfig = {
    url: import.meta.env.VITE_KC_URL,
    realm: import.meta.env.VITE_KC_REALM,
    clientId: import.meta.env.VITE_KC_CLIENT_ID,
};

const keycloak: Keycloak = new Keycloak(keycloakConfig);

export default function SecurityContextProvider({ children }: PropsWithChildren) {
    const [loggedInUser, setLoggedInUser] = useState<User | undefined>(undefined);
    const [isInitialised, setIsInitialised] = useState(false);

    useEffect(() => {
        keycloak.init({ onLoad: "check-sso" });
    }, []);

    keycloak.onReady = () => setIsInitialised(true);

    keycloak.onAuthSuccess = () => {
        setAuthToken(keycloak.token);
        updateUserFromToken();
    };

    keycloak.onAuthLogout = () => {
        setAuthToken(undefined);
        setLoggedInUser(undefined);
    };

    keycloak.onTokenExpired = () => {
        keycloak.updateToken(-1).then(() => {
            setAuthToken(keycloak.token);
            updateUserFromToken();
        });
    };

    function login() {
        keycloak.login();
    }

    function isAuthenticated() {
        if (keycloak.token) return !isExpired(keycloak.token);
        else return false;
    }

    function updateUserFromToken() {
        if (!keycloak.idTokenParsed || !keycloak.tokenParsed) return;

        const name = keycloak.idTokenParsed.given_name || "Unknown";
        const roles = keycloak.tokenParsed.realm_access?.roles ?? [];

        setLoggedInUser({ name, roles });
    }

    return (
        <SecurityContext.Provider
            value={{
                isInitialised,
                isAuthenticated,
                loggedInUser,
                login,
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
}
