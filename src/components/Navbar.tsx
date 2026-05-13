import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Avatar,
    Badge,
    Chip,
    IconButton,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SecurityContext from "../auth/SecurityContext";
import { useBasket } from "../context/BasketContext";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loggedInUser, logout } = useContext(SecurityContext);
    const { totalItems } = useBasket();

    const isOwnerArea = location.pathname.startsWith("/owner") ||
        location.pathname.startsWith("/restaurant") ||
        location.pathname.startsWith("/create-restaurant");

    return (
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <Toolbar sx={{ gap: 1 }}>
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, cursor: "pointer", fontWeight: 700, letterSpacing: -0.5 }}
                    onClick={() => navigate("/")}
                >
                    KDG
                </Typography>

                {isOwnerArea && loggedInUser && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Chip
                            avatar={<Avatar sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white !important", fontSize: 12 }}>
                                {loggedInUser.name.charAt(0).toUpperCase()}
                            </Avatar>}
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

                {!isOwnerArea && (
                    <>
                        <IconButton
                            color="inherit"
                            onClick={() => navigate("/basket")}
                            sx={{ mr: 0.5 }}
                            aria-label="basket"
                        >
                            <Badge badgeContent={totalItems} color="error" max={99}>
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>
                        <Button color="inherit" onClick={() => navigate("/login")} sx={{ fontWeight: 600 }}>
                            Owner login
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
