//  owner/customer role split so users self-select
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Toolbar, Typography, Stack, Paper } from "@mui/material";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Navbar from "../components/Navbar";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Navbar />
            <Toolbar />

            {/* Hero */}
            <Box
                sx={{
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    py: { xs: 8, md: 12 },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Decorative organic rings */}
                <Box sx={{
                    position: "absolute", top: "-60px", right: "-80px",
                    width: 340, height: 340, borderRadius: "50%",
                    border: "1px solid rgba(253,250,242,0.10)", pointerEvents: "none",
                }} />
                <Box sx={{
                    position: "absolute", top: "-20px", right: "-40px",
                    width: 220, height: 220, borderRadius: "50%",
                    border: "1px solid rgba(253,250,242,0.08)", pointerEvents: "none",
                }} />
                <Box sx={{
                    position: "absolute", bottom: "-80px", left: "-50px",
                    width: 280, height: 280, borderRadius: "50%",
                    border: "1px solid rgba(253,250,242,0.07)", pointerEvents: "none",
                }} />

                <Container maxWidth="md" sx={{ textAlign: "center", position: "relative" }}>
                    <Typography
                        variant="overline"
                        sx={{
                            display: "block",
                            mb: 2,
                            opacity: 0.65,
                            letterSpacing: "0.18em",
                            fontSize: "0.7rem",
                        }}
                    >
                        your place to order
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{ mb: 2, fontSize: { xs: "2.4rem", md: "3.2rem" }, fontStyle: "italic" }}
                    >
                        Keep Dishes Going
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ opacity: 0.8, maxWidth: 480, mx: "auto", lineHeight: 1.7 }}
                    >
                        browse menus, order fresh, and track every dish.
                    </Typography>
                </Container>
            </Box>

            {/* Role cards */}
            <Container maxWidth="md" sx={{ py: 7 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <Paper
                        elevation={2}
                        sx={{
                            flex: 1, p: { xs: 3.5, md: 4.5 },
                            border: "1px solid", borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                width: 48, height: 48, borderRadius: "50%",
                                bgcolor: "primary.main", display: "flex",
                                alignItems: "center", justifyContent: "center", mb: 2.5,
                            }}
                        >
                            <StorefrontIcon sx={{ color: "primary.contrastText", fontSize: 22 }} />
                        </Box>
                        <Typography variant="h5" gutterBottom>
                            Restaurant Owner
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
                            Manage your menu, handle incoming orders, and keep your kitchen running smoothly.
                        </Typography>
                        <Button variant="contained" onClick={() => navigate("/login")} fullWidth size="large">
                            Continue as Owner
                        </Button>
                    </Paper>

                    <Paper
                        elevation={2}
                        sx={{
                            flex: 1, p: { xs: 3.5, md: 4.5 },
                            border: "1px solid", borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                width: 48, height: 48, borderRadius: "50%",
                                bgcolor: "secondary.main", display: "flex",
                                alignItems: "center", justifyContent: "center", mb: 2.5,
                            }}
                        >
                            <RestaurantMenuIcon sx={{ color: "secondary.contrastText", fontSize: 22 }} />
                        </Box>
                        <Typography variant="h5" gutterBottom>
                            Customer
                        </Typography>
                        <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
                            Discover local restaurants, build your basket, and track your order in real time.
                        </Typography>
                        <Button variant="outlined" color="secondary" onClick={() => navigate("/restaurants")} fullWidth size="large">
                            Browse Restaurants
                        </Button>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
}
