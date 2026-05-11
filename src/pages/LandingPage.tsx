import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, Button, Stack } from "@mui/material";
import Navbar from "../components/Navbar";

type RoleCard = {
    title: string;
    description: string;
    action: string;
    onClick: () => void;
    accent: string;
    disabled?: boolean;
};

function RoleCard({ title, description, action, onClick, accent, disabled }: RoleCard) {
    return (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                p: { xs: 3, md: 4 },
                border: "1.5px solid",
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                transition: "border-color 0.2s, box-shadow 0.2s",
                opacity: disabled ? 0.55 : 1,
                "&:hover": disabled ? {} : { borderColor: accent, boxShadow: `0 0 0 3px ${accent}22` },
            }}
        >
            <Box>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography variant="body2" color="text.secondary">{description}</Typography>
            </Box>
            <Button
                variant="contained"
                size="large"
                onClick={onClick}
                disabled={disabled}
                sx={{ mt: "auto", bgcolor: disabled ? undefined : accent, "&:hover": { bgcolor: disabled ? undefined : accent, filter: "brightness(0.9)" } }}
            >
                {action}
            </Button>
        </Paper>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
                <Container maxWidth="md">
                    <Box sx={{ textAlign: "center", mb: 6 }}>
                        <Typography component="h1" variant="h4" gutterBottom>
                            Keep Dishes Going
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 480, mx: "auto" }}>
                            A marketplace where restaurants present their menu and customers place orders — from kitchen to door.
                        </Typography>
                    </Box>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                        <RoleCard
                            title="Restaurant Owner"
                            description="Manage your menu, track incoming orders, and keep your kitchen running smoothly."
                            action="Continue as Owner"
                            onClick={() => navigate("/login")}
                            accent="#2e7d32"
                        />
                        <RoleCard
                            title="Customer"
                            description="Browse restaurants, build a basket, and track your delivery in real time."
                            action="Continue as Customer"
                            onClick={() => navigate("/restaurants")}
                            accent="#e65100"
                        />
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
