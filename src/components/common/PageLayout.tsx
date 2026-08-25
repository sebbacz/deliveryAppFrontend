// Wraps every page with the fixed Navbar
import type { PropsWithChildren } from "react";
import { Box, Toolbar } from "@mui/material";
import Navbar from "./Navbar";

export default function PageLayout({ children }: PropsWithChildren) {
    return (
        <Box
            sx={{
                minHeight: "100vh", //  full view  height
                bgcolor: "background.default",
                display: "flex", //  stack vertically
                flexDirection: "column",
            }}
        >
            <Navbar />
            <Toolbar />
            <Box
                component="main"
                sx={{
                    //MUI spacing values.
                    flex: 1, //  vertical space between Toolbar and bottom
                    py: { xs: 4, md: 6 }, // vertical padding:  xs: 4×8=32px, md: 6×8=48px
                    px: { xs: 2, md: 3 }, // horizontal padding: xs: 2×8=16px, md: 3×8=24px
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
