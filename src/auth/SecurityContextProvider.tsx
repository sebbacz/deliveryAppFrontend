
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import SecurityContext from "./SecurityContext";
import keycloak from "./keycloak";
import { isExpired } from "react-jwt";
import type { User } from "../model/user";
import { setAuthToken, setTokenRefresher } from "../services/api";

export default function SecurityContextProvider({ children }: PropsWithChildren) {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [isInitialised, setIsInitialised] = useState(false);
    const initCalled = useRef(false); // prevents double-init in React StrictMode

    useEffect(() => {
        if (initCalled.current) return;
        initCalled.current = true;

        keycloak.init({
            onLoad: "check-sso",   // restores an existing session without redirecting
            silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
            checkLoginIframe: false, // disabled to avoid cross-origin
        })
            .then(() => {
                setIsInitialised(true);
                if (keycloak.authenticated) {
                    setAuthToken(keycloak.token); // inject token into axios on startup
                    updateUserFromToken();
                }
                // Register a refresher so the axios interceptor can renew the token before each request
                setTokenRefresher(async () => {
                    if (keycloak.authenticated) {
                        await keycloak.updateToken(30); // refresh if token expires within 30 s
                        setAuthToken(keycloak.token);
                    }
                });
            })
            .catch(console.error);
    }, []);

    // Called by Keycloak after a successful login redirect
    keycloak.onAuthSuccess = () => {
        setAuthToken(keycloak.token);
        updateUserFromToken();
    };

    // Called when the user logs out in another tab
    keycloak.onAuthLogout = () => {
        setAuthToken(undefined);
        setLoggedInUser(null);
    };

    // Called when the access token expires
    keycloak.onTokenExpired = () => {
        keycloak.updateToken(-1).then(() => {
            setAuthToken(keycloak.token);
            updateUserFromToken();
        });
    };

    function login() {
        keycloak.login(); // redirects the browser to the Keycloak login page
    }

    function logout() {
        keycloak.logout();        // ends the Keycloak session
        setAuthToken(undefined);  // removes the token from axios
        setLoggedInUser(null);
    }

    // Returns true only if there is a token
    function isAuthenticated() {
        return !!keycloak.token && !isExpired(keycloak.token);
    }

    // Reads name from the ID token and roles from the access token
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
