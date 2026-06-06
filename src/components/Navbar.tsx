import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Badge,
    IconButton,
} from "@mui/material";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import SecurityContext from "../auth/SecurityContext";
import { useBasket } from "../context/BasketContext";
import { getMyRestaurant } from "../services/restaurantService";

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

    const { data: myRestaurant } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        enabled: isOwnerArea && !!loggedInUser,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <AppBar position="fixed" color="primary">
            <Toolbar sx={{ gap: 0.5 }}>
                <Typography
                    onClick={() => navigate("/")}
                    sx={{
                        cursor: "pointer",
                        mr: 2,
                        fontFamily: '"Cormorant Garamond", serif',
                        fontWeight: 600,
                        fontSize: "1.35rem",
                        letterSpacing: "0.01em",
                        fontStyle: "italic",
                        color: "primary.contrastText",
                    }}
                >
                    Keep Dishes Going
                </Typography>

                {isOwnerArea && loggedInUser && (
                    <>
                        <Button color="inherit" onClick={() => navigate("/owner")} sx={{ opacity: 0.9 }}>
                            Dashboard
                        </Button>
                        {myRestaurant && (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate(`/restaurant/${myRestaurant.id}/dishes`)}
                                    sx={{ opacity: 0.9 }}
                                >
                                    Dishes
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate(`/restaurant/${myRestaurant.id}/orders`)}
                                    sx={{ opacity: 0.9 }}
                                >
                                    Orders
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate("/price-range/criteria")}
                                    sx={{ opacity: 0.9 }}
                                >
                                    Price Ranges
                                </Button>
                            </>
                        )}
                    </>
                )}

                {isCustomerArea && (
                    <Button color="inherit" onClick={() => navigate("/restaurants")} sx={{ opacity: 0.9 }}>
                        Restaurants
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} />

                {isCustomerArea && (
                    <IconButton color="inherit" onClick={() => navigate("/basket")}>
                        <Badge badgeContent={totalItems} color="error">
                            <ShoppingCartOutlinedIcon />
                        </Badge>
                    </IconButton>
                )}

                {isOwnerArea && loggedInUser && (
                    <>
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            {loggedInUser.name}
                        </Typography>
                        <Button color="inherit" onClick={logout} sx={{ opacity: 0.9 }}>
                            Sign out
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
