//  current user and login/logout actions
import { createContext } from "react";
import type { User } from "../model/user";


export type SecurityContextType = {
    isInitialised?: boolean;       // true once Keycloak has finished its check-sso call
    isAuthenticated?: () => boolean; // checks that a non-expired token exists
    loggedInUser: User | null;     // null when not logged in
    login: () => void;             // redirects to Keycloak login page
    logout: () => void;            // clears token and Keycloak session
};

// Safe defaults
const defaultValue: SecurityContextType = {
    isInitialised: false,
    isAuthenticated: () => false,
    loggedInUser: null,
    login: () => {},
    logout: () => {},
};

const SecurityContext = createContext<SecurityContextType>(defaultValue);

export default SecurityContext;
