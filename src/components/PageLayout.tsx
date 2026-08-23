// Wraps every page with the fixed Navbar and a spacer Toolbar
import type { PropsWithChildren } from "react";
import { Box, Toolbar } from "@mui/material";
import Navbar from "./Navbar";

export default function PageLayout({ children }: PropsWithChildren) {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Navbar />
            <Toolbar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    py: { xs: 4, md: 6 },
                    px: { xs: 2, md: 3 },
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
