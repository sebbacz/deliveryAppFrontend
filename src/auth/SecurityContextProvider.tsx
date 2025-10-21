// TypeScript
import { type PropsWithChildren, useEffect, useRef, useState } from "react";
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

export default function SecurityContextProvider({ children }: PropsWithChildren) {
    const [loggedInUser, setLoggedInUser] = useState<User | undefined>(undefined);
    const [isInitialised, setIsInitialised] = useState(false);
    const kcRef = useRef<Keycloak | null>(null);

    useEffect(() => {
        if (!kcRef.current) {
            kcRef.current = new Keycloak(keycloakConfig);
        }
        const kcAny = kcRef.current as any;

        // guard to ensure init runs only once per instance
        if (kcAny.__initialized) return;
        kcAny.__initialized = true;

        // attach handlers to this instance
        kcRef.current.onReady = () => setIsInitialised(true);

        kcRef.current.onAuthSuccess = () => {
            setAuthToken(kcRef.current?.token);
            updateUserFromToken();
        };

        kcRef.current.onAuthLogout = () => {
            setAuthToken(undefined);
            setLoggedInUser(undefined);
        };

        kcRef.current.onTokenExpired = () => {
            kcRef.current?.updateToken(-1).then(() => {
                setAuthToken(kcRef.current?.token);
                updateUserFromToken();
            });
        };

        kcRef.current.init({ onLoad: "check-sso" });


        return () => {
            if (!kcRef.current) return;
            kcRef.current.onReady = undefined;
            kcRef.current.onAuthSuccess = undefined;
            kcRef.current.onAuthLogout = undefined;
            kcRef.current.onTokenExpired = undefined;
        };
    }, []);

    function login() {
        kcRef.current?.login();
    }

    function isAuthenticated() {
        const token = kcRef.current?.token;
        if (token) return !isExpired(token);
        return false;
    }

    function updateUserFromToken() {
        const kc = kcRef.current;
        if (!kc || !kc.idTokenParsed || !kc.tokenParsed) return;

        const name = (kc.idTokenParsed as any).given_name || "Unknown";
        const roles = (kc.tokenParsed as any).realm_access?.roles ?? [];

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
