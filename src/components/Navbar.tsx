import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Badge,
    Chip,
    Divider,
    IconButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SecurityContext from "../auth/SecurityContext";
import { useBasket } from "../context/BasketContext";
import { getMyRestaurant } from "../services/restaurantService";

const NAV_BTN = {
    color: "inherit" as const,
    size: "small" as const,
    sx: {
        fontWeight: 500,
        opacity: 0.85,
        "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" },
        "&.active": { opacity: 1, fontWeight: 700 },
    },
};

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedInUser, logout } = useContext(SecurityContext);
    const { totalItems } = useBasket();

    const isOwnerArea =
        location.pathname.startsWith("/owner") ||
        location.pathname.startsWith("/restaurant") ||
        location.pathname.startsWith("/create-restaurant") ||
        location.pathname.startsWith("/price-range");

    const isCustomerArea =
        location.pathname.startsWith("/restaurants") ||
        location.pathname.startsWith("/basket") ||
        location.pathname.startsWith("/checkout") ||
        location.pathname.startsWith("/order");

    // Fetch restaurant ID for owner nav links
    const { data: myRestaurant } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        enabled: isOwnerArea && !!loggedInUser,
        staleTime: 5 * 60 * 1000,
    });

    const active = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + "/")
            ? "active"
            : "";

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <Toolbar sx={{ gap: 1 }}>
                {/* Logo */}
                <Typography
                    variant="h6"
                    sx={{ cursor: "pointer", fontWeight: 700, letterSpacing: -0.5, mr: 2 }}
                    onClick={() => navigate("/")}
                >
                    KDG
                </Typography>

                {/* Owner nav links */}
                {isOwnerArea && loggedInUser && (
                    <>
                        <Button
                            {...NAV_BTN}
                            className={active("/owner")}
                            onClick={() => navigate("/owner")}
                        >
                            Dashboard
                        </Button>
                        {myRestaurant && (
                            <>
                                <Button
                                    {...NAV_BTN}
                                    className={active(`/restaurant/${myRestaurant.id}/dishes`)}
                                    onClick={() => navigate(`/restaurant/${myRestaurant.id}/dishes`)}
                                >
                                    Dishes
                                </Button>
                                <Button
                                    {...NAV_BTN}
                                    className={active(`/restaurant/${myRestaurant.id}/orders`)}
                                    onClick={() => navigate(`/restaurant/${myRestaurant.id}/orders`)}
                                >
                                    Orders
                                </Button>
                                <Button
                                    {...NAV_BTN}
                                    className={active("/price-range/criteria")}
                                    onClick={() => navigate("/price-range/criteria")}
                                >
                                    Price Ranges
                                </Button>
                            </>
                        )}
                    </>
                )}

                {/* Customer nav links */}
                {isCustomerArea && (
                    <>
                        <Button
                            {...NAV_BTN}
                            className={active("/restaurants")}
                            onClick={() => navigate("/restaurants")}
                        >
                            Restaurants
                        </Button>
                    </>
                )}

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Customer right side */}
                {isCustomerArea && (
                    <IconButton
                        color="inherit"
                        onClick={() => navigate("/basket")}
                        aria-label="basket"
                    >
                        <Badge badgeContent={totalItems} color="error" max={99}>
                            <ShoppingCartIcon />
                        </Badge>
                    </IconButton>
                )}

                {/* Owner right side */}
                {isOwnerArea && loggedInUser && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.2)", mx: 0.5 }} />
                        <Chip
                            avatar={
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white !important", fontSize: 12 }}>
                                    {loggedInUser.name.charAt(0).toUpperCase()}
                                </Avatar>
                            }
                            label={loggedInUser.name}
                            size="small"
                            sx={{ color: "white", borderColor: "rgba(255,255,255,0.4)", border: "1px solid" }}
                        />
                        <Button
                            color="inherit"
                            size="small"
                            variant="outlined"
                            onClick={logout}
                            sx={{ borderColor: "rgba(255,255,255,0.4)", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" } }}
                        >
                            Sign out
                        </Button>
                    </Box>
                )}

                {/* Landing page — no extra nav items, the page cards handle routing */}
            </Toolbar>
        </AppBar>
    );
}
