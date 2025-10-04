
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Box,
    Paper,
    Card,
    CardContent,
    Stack,
    CssBaseline,
} from "@mui/material";
import { Restaurant, LocalDining, ShoppingBasket } from "@mui/icons-material";

export default function LandingPage() {
    return (
        <Box
            sx={{
                bgcolor: "#fafafa",
                minHeight: "100dvh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <CssBaseline />


            <AppBar position="static" sx={{ backgroundColor: "#2e7d32" }}>
                <Toolbar sx={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Keep Dishes Going
                    </Typography>
                    <Box>
                        <Button color="inherit">Home</Button>
                        <Button color="inherit">Restaurants</Button>
                        <Button color="inherit">About</Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ ml: 2, textTransform: "none" }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>


            <Box component="main" sx={{ flex: 1, display: "flex", flexDirection: "column" }}>

                <Container
                    maxWidth="lg"
                    sx={{
                        mt: 8,
                        mb: 10,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h2" fontWeight="bold" gutterBottom>
                        Keep Dishes Going 🍽️
                    </Typography>
                    <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                        text
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            backgroundColor: "#2e7d32",
                            ":hover": { backgroundColor: "#1b5e20" },
                        }}
                    >
                        Explore Restaurants
                    </Button>
                </Container>


                <Container maxWidth="lg">
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={4}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        <FeatureCard
                            icon={<Restaurant sx={{ fontSize: 60, color: "#2e7d32" }} />}
                            title="Manage Your Restaurant"
                            text="text"
                        />
                        <FeatureCard
                            icon={<LocalDining sx={{ fontSize: 60, color: "#2e7d32" }} />}
                            title="Dynamic Catalog"
                            text="text"
                        />
                        <FeatureCard
                            icon={<ShoppingBasket sx={{ fontSize: 60, color: "#2e7d32" }} />}
                            title="Seamless Ordering"
                            text="test"
                        />
                    </Stack>
                </Container>


                <Container maxWidth="lg" sx={{ mt: 12 }}>
                    <Paper
                        elevation={3}
                        sx={{ p: 6, borderRadius: 3, backgroundColor: "#e8f5e9" }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            gutterBottom
                            textAlign="center"
                        >
                            About Keep Dishes Going
                        </Typography>
                        <Typography variant="body1" color="text.secondary" textAlign="center">
                            text
                        </Typography>
                    </Paper>
                </Container>
            </Box>


            <Box
                sx={{
                    mt: 12,
                    py: 4,
                    textAlign: "center",
                    backgroundColor: "#2e7d32",
                    color: "white",
                }}
            >
                <Typography variant="body2">
                    © {new Date().getFullYear()} here footer
                </Typography>
            </Box>
        </Box>
    );
}


function FeatureCard({
                         icon,
                         title,
                         text,
                     }: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (
        <Card
            elevation={4}
            sx={{
                flex: 1,
                borderRadius: 3,
                textAlign: "center",
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            <CardContent>
                {icon}
                <Typography variant="h6" fontWeight="bold" mt={2}>
                    {title}
                </Typography>
                <Typography color="text.secondary" mt={1}>
                    {text}
                </Typography>
            </CardContent>
        </Card>
    );
}
