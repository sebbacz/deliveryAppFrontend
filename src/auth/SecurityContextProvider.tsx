import { type PropsWithChildren, useEffect, useState } from "react";
import SecurityContext from "./SecurityContext";
import keycloak from "./keycloak";
import { isExpired } from "react-jwt";
import type { User } from "../model/user";
import { setAuthToken } from "../services/api";

export default function SecurityContextProvider({ children }: PropsWithChildren) {
    const [loggedInUser, setLoggedInUser] = useState<User | undefined>(undefined);
    const [isInitialised, setIsInitialised] = useState(false);

    useEffect(() => {
        if (!keycloak.authenticated) {
            keycloak.init({
                onLoad: "check-sso",
                checkLoginIframe: false,
            })
                .then(() => {
                    setIsInitialised(true);
                    if (keycloak.authenticated) {
                        setAuthToken(keycloak.token);
                        updateUserFromToken();
                    }
                })
                .catch(console.error);
        }
    }, []);

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
        return !!keycloak.token && !isExpired(keycloak.token);
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
