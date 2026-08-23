// Shared auth context;  current user or login/logout actions.
import  { createContext } from "react";
import type { User } from "../model/user";

export type SecurityContextType = {
    isInitialised?: boolean;
    isAuthenticated?: () => boolean;
    loggedInUser: User | null;
    login: () => void;
    logout: () => void;
};

const defaultValue: SecurityContextType = {
    isInitialised: false,
    isAuthenticated: () => false,
    loggedInUser: null,
    login: () => {},
    logout: () => {},
};

const SecurityContext = createContext<SecurityContextType>(defaultValue);

export default SecurityContext;
