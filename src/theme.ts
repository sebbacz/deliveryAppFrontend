import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: { main: "#2e7d32" },
        secondary: { main: "#e65100" },
        background: { default: "#f4f6f8", paper: "#ffffff" },
        success: { main: "#2e7d32" },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700 },
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { fontWeight: 500 },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: 12 },
            },
        },
    },
});
