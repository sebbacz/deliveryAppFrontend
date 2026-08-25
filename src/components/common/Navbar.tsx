//  shows owner links when in the owner area, customer links when in the customer area.
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
import SecurityContext from "../../auth/SecurityContext";
import { useBasket } from "../../context/BasketContext";
import { getMyRestaurant } from "../../services/restaurantService";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedInUser, logout } = useContext(SecurityContext);
    const { totalItems } = useBasket(); // drives the cart badge count

    // Determine which section of the app the user is currently in
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

    // Only fetch the owner's restaurant when in the owner area
    const { data: myRestaurant } = useQuery({
        queryKey: ["myRestaurant"],
        queryFn: getMyRestaurant,
        enabled: isOwnerArea && !!loggedInUser,
        staleTime: 5 * 60 * 1000, // restaurant details rarely change mid-session
    });

    return (
        <AppBar position="fixed" color="primary"> {/* fixed so it stays on top while scrolling */}
            <Toolbar sx={{ gap: 0.5 }}>
                {/*clicking always returns to the landing page */}
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

                {/* Owner navigation links — only visible when logged in and in the owner area */}
                {isOwnerArea && loggedInUser && (
                    <>
                        <Button color="inherit" onClick={() => navigate("/owner")} sx={{ opacity: 0.9 }}>
                            Dashboard
                        </Button>
                        {myRestaurant && ( // dish/order links require a restaurant to exist
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

                {/* Customer navigation link */}
                {isCustomerArea && (
                    <Button color="inherit" onClick={() => navigate("/restaurants")} sx={{ opacity: 0.9 }}>
                        Restaurants
                    </Button>
                )}

                <Box sx={{ flexGrow: 1 }} /> {/* pushes right-side items to the far right */}

                {/* Basket icon with item count badge — only shown on customer pages */}
                {isCustomerArea && (
                    <IconButton color="inherit" onClick={() => navigate("/basket")}>
                        <Badge badgeContent={totalItems} color="error">
                            <ShoppingCartOutlinedIcon />
                        </Badge>
                    </IconButton>
                )}

                {/* Owner name and sign-out button */}
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
