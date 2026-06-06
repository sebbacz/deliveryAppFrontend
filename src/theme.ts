import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        primary: {
            main: "#2D5016",
            light: "#3E6B20",
            dark: "#1C3309",
            contrastText: "#FDFAF2",
        },
        secondary: {
            main: "#B85C2A",
            light: "#CE7A4A",
            dark: "#8C3F17",
            contrastText: "#FDFAF2",
        },
        background: {
            default: "#F5F0E8",
            paper: "#FDFAF2",
        },
        text: {
            primary: "#1C1712",
            secondary: "#6B5B47",
            disabled: "#A89480",
        },
        success: {
            main: "#356B2A",
            light: "#4A8E3C",
            dark: "#214417",
            contrastText: "#FDFAF2",
        },
        error: {
            main: "#B83220",
            light: "#D4503C",
            dark: "#8A1F10",
            contrastText: "#FDFAF2",
        },
        warning: {
            main: "#B85C2A",
            contrastText: "#FDFAF2",
        },
        info: {
            main: "#4A7A8A",
            contrastText: "#FDFAF2",
        },
        divider: "#DDD0BC",
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Karla", sans-serif',
        h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.5px" },
        h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.5px" },
        h3: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.5px" },
        h4: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, letterSpacing: "-0.25px" },
        h5: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
        h6: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 600 },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        button: { fontWeight: 600, letterSpacing: "0.02em" },
        overline: { fontFamily: '"Karla", sans-serif', letterSpacing: "0.12em" },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "none" },
                },
                contained: {
                    "&:hover": {
                        boxShadow: "0 2px 10px rgba(45, 80, 22, 0.22)",
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundImage: "none",
                },
                outlined: {
                    borderColor: "#DDD0BC",
                },
                elevation1: {
                    boxShadow: "0 2px 12px rgba(28, 23, 14, 0.07)",
                },
                elevation2: {
                    boxShadow: "0 4px 20px rgba(28, 23, 14, 0.09)",
                },
                elevation3: {
                    boxShadow: "0 6px 28px rgba(28, 23, 14, 0.11)",
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 8,
                    fontFamily: '"Karla", sans-serif',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: "none",
                    borderBottom: "1px solid #C8BC9E",
                    borderRadius: 0,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontFamily: '"Karla", sans-serif',
                },
            },
        },
        MuiToggleButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                    fontFamily: '"Karla", sans-serif',
                    borderColor: "#DDD0BC",
                    color: "#6B5B47",
                    "&.Mui-selected": {
                        backgroundColor: "#2D5016",
                        color: "#FDFAF2",
                        "&:hover": {
                            backgroundColor: "#3E6B20",
                        },
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: "#DDD0BC",
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 10,
                        "& fieldset": { borderColor: "#C8BC9E" },
                        "&:hover fieldset": { borderColor: "#2D5016" },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                outlined: {
                    borderRadius: 10,
                },
            },
        },
        MuiStepper: {
            styleOverrides: {
                root: {
                    "& .MuiStepIcon-root.Mui-completed": {
                        color: "#2D5016",
                    },
                    "& .MuiStepIcon-root.Mui-active": {
                        color: "#2D5016",
                    },
                },
            },
        },
    },
});
