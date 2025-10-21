import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    return (
        <AppBar
            position="static"
            color="primary"
            elevation={2}
            sx={{ backgroundColor: "#2e7d32" }}
        >
            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 600,
                        letterSpacing: 0.5,
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/")}
                >
                    KDG Marketplace
                </Typography>


                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button color="inherit" onClick={() => navigate("/")}>
                        Home
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/customer")}>
                        Customer
                    </Button>
                    <Button color="inherit" onClick={() => navigate("/owner/login")}>
                        Owner Login
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate("/owner/restaurant")}
                        sx={{
                            borderColor: "white",
                            "&:hover": { borderColor: "#90caf9", backgroundColor: "rgba(255,255,255,0.1)" },
                        }}
                    >
                        Create Restaurant
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
