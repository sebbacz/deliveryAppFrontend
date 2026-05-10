
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import SecurityContext from "./SecurityContext";
import keycloak from "./keycloak";
import { isExpired } from "react-jwt";
import type { User } from "../model/user";
import { setAuthToken } from "../services/api";

export default function SecurityContextProvider({ children }: PropsWithChildren) {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [isInitialised, setIsInitialised] = useState(false);
    const initCalled = useRef(false);

    useEffect(() => {
        if (initCalled.current) return;
        initCalled.current = true;

        keycloak.init({
            onLoad: "check-sso",
            checkLoginIframe: false,
            silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
        })
            .then(() => {
                setIsInitialised(true);
                if (keycloak.authenticated) {
                    setAuthToken(keycloak.token);
                    updateUserFromToken();
                }
            })
            .catch(console.error);
    }, []);

    keycloak.onAuthSuccess = () => {
        setAuthToken(keycloak.token);
        updateUserFromToken();
    };

    keycloak.onAuthLogout = () => {
        setAuthToken(undefined);
        setLoggedInUser(null);
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

    function logout() {
        // trigger Keycloak logout and clear local auth state
        keycloak.logout();
        setAuthToken(undefined);
        setLoggedInUser(null);
    }

    function isAuthenticated() {
        return !!keycloak.token && !isExpired(keycloak.token);
    }

    function updateUserFromToken() {
        if (!keycloak.idTokenParsed || !keycloak.tokenParsed) return;

        const name = keycloak.idTokenParsed.given_name || "Unknown";
        const roles = keycloak.tokenParsed.realm_access?.roles ?? [];

        setLoggedInUser({ name, roles } as User);
    }

    return (
        <SecurityContext.Provider
            value={{
                isInitialised,
                isAuthenticated,
                loggedInUser,
                login,
                logout,
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
}
