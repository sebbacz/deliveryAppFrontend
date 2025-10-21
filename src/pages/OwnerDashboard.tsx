import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";
import { getOwnerProfile } from "../services/ownerService";

interface Owner {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

const OwnerDashboard: React.FC = () => {
    const [owner, setOwner] = useState<Owner | null>(null);

    useEffect(() => {
        getOwnerProfile()
            .then(setOwner)
            .catch(console.error);
    }, []);

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Restaurant Management
                    </Typography>
                    <Button color="inherit" href="/">
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
                {owner ? (
                    <>
                        <Typography variant="h5">
                            Welcome, {owner.firstName} {owner.lastName} 👋
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Email: {owner.email}
                        </Typography>
                    </>
                ) : (
                    <Typography>Loading your profile...</Typography>
                )}
            </Container>
        </Box>
    );
};

export default OwnerDashboard;
