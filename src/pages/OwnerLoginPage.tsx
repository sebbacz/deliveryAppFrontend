import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function OwnerLoginPage() {
    const navigate = useNavigate();

    // later keyloak
    const handleLogin = () => {

        navigate("/owner/restaurant/create");
    };

    return (
        <Box textAlign="center" mt={20}>
            <Typography variant="h4" gutterBottom>Owner Sign In</Typography>
            <Typography color="text.secondary" mb={3}>
                Sign in to access your restaurant management area.
            </Typography>
            <Button variant="contained" color="success" size="large" onClick={handleLogin}>
                Sign In with Keycloak
            </Button>
        </Box>
    );
}
