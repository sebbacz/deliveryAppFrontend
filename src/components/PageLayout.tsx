import type { PropsWithChildren } from "react";
import { Box } from "@mui/material";
import Navbar from "./Navbar";

export default function PageLayout({ children }: PropsWithChildren) {
    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default", display: "flex", flexDirection: "column" }}>
            <Navbar />
            <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
                {children}
            </Box>
        </Box>
    );
}
