
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Stack,
    Chip,
} from "@mui/material";

type User = {
    name?: string;
    role?: string;
};

export default function LandingPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);


    const readUser = () => {
        try {
            const raw = localStorage.getItem("currentUser");
            if (!raw) {
                setUser(null);
                return;
            }
            const parsed = JSON.parse(raw);

            const normalized: User = {
                name: parsed?.name ?? parsed?.username ?? parsed?.preferred_username ?? parsed?.email,
                role: parsed?.role ?? parsed?.roles ?? (Array.isArray(parsed?.roles) ? parsed.roles[0] : undefined),
            };
            setUser(normalized);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        readUser();

        const onStorage = (e: StorageEvent) => {
            if (e.key === "currentUser") readUser();
        };

        const onFocus = () => readUser();

        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onFocus);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onFocus);
        };
    }, []);

    const handleOwner = () => {
        navigate("/login");
    };

    return (
        <Box
            component="main"
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 3,
                background: "linear-gradient(135deg, #EEF2FF 0%, #E6F7FF 50%, #ECFDF5 100%)",
            }}
        >
            <Container maxWidth="md">
                <Paper
                    elevation={8}
                    sx={{
                        p: { xs: 4, md: 6 },
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(6px)",
                        position: "relative",
                    }}
                >
                    {/* User info */}
                    <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 1, alignItems: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            {user?.name ?? "Guest"}
                        </Typography>
                        <Chip label={user?.role ?? "None"} size="small" />
                    </Box>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        alignItems={{ xs: "center", md: "flex-start" }}
                    >
                        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                            <Typography component="h1" variant="h4" fontWeight={800} gutterBottom>
                                Keep Dishes Going <span aria-hidden>🍽️</span>
                            </Typography>
                            <Typography color="text.secondary">
                                Select a role to continue. Designed for quick onboarding and clear role-specific
                                flows.
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        sx={{ mt: 3 }}
                    >
                        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    height: "100%",
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        Owner
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                                        Manage listings, track orders, and keep the kitchen running.
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOwner}
                                        aria-label="Continue as Owner"
                                        size="large"
                                    >
                                        Continue as Owner
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>

                        <Box sx={{ width: { xs: "100%", md: "50%" } }}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 3,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    height: "100%",
                                    position: "relative",
                                    bgcolor: (theme) =>
                                        `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" fontWeight={600}>
                                        Customer
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                                        Order meals quickly and track delivery status. Coming soon.
                                    </Typography>
                                </Box>

                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disabled
                                        aria-disabled="true"
                                        aria-label="Customer login coming soon"
                                        size="large"
                                    >
                                        Coming Soon
                                    </Button>

                                    <Chip label="Beta" color="warning" size="small" />
                                </Stack>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ position: "absolute", top: 12, right: 12 }}
                                >
                                    Not available yet
                                </Typography>
                            </Paper>
                        </Box>
                    </Stack>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
                        By continuing you agree to the terms and privacy policy.
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
