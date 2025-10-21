import { createContext } from "react";
import type { User } from "../model/user";

interface SecurityContextType {
    isInitialised: boolean;
    isAuthenticated: () => boolean;
    loggedInUser?: User;
    login: () => void;
}

const SecurityContext = createContext<SecurityContextType>({
    isInitialised: false,
    isAuthenticated: () => false,
    login: () => {},
});

export default SecurityContext;
