// MUI theme: earthy green/amber palette
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1920, //  1920px as xl so 4K  get the xl layout
        },
    },
    palette: {
        primary: {
            main: "#2D5016",         // dark forest green
            light: "#3E6B20",
            dark: "#1C3309",
            contrastText: "#FDFAF2", //wgite  for readable text on green backgrounds
        },
        secondary: {
            main: "#B85C2A",         // warm
            light: "#CE7A4A",
            dark: "#8C3F17",
            contrastText: "#FDFAF2",
        },
        background: {
            default: "#F5F0E8", // warm parchment
            paper: "#FDFAF2",   // slightly lighter — card
        },
        text: {
            primary: "#1C1712",   //  black for body text
            secondary: "#6B5B47", //  brown for secondary/helper text
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
        borderRadius: 12, // default rounding
    },
    typography: {
        fontFamily: '"Karla", sans-serif',
        //  serif font
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
                    textTransform: "none", // prevents ALL CAPS
                    borderRadius: 10,
                    fontWeight: 600,
                    boxShadow: "none",     // flat by default
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
                    backgroundImage: "none", // removes the default MUI dark-mode gradient overlay
                },
                outlined: {
                    borderColor: "#DDD0BC",
                },
                elevation1: { boxShadow: "0 2px 12px rgba(28, 23, 14, 0.07)" },
                elevation2: { boxShadow: "0 4px 20px rgba(28, 23, 14, 0.09)" },
                elevation3: { boxShadow: "0 6px 28px rgba(28, 23, 14, 0.11)" },
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
                    borderBottom: "1px solid #C8BC9E", // subtle warm border instead of a drop shadow
                    borderRadius: 0, // AppBar should span full width with no rounding
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
                        backgroundColor: "#2D5016", // selected state uses primary green
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
                        "&:hover fieldset": { borderColor: "#2D5016" }, // green border on hover
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
                    // Override default blue step icons with the primary green
                    "& .MuiStepIcon-root.Mui-completed": { color: "#2D5016" },
                    "& .MuiStepIcon-root.Mui-active": { color: "#2D5016" },
                },
            },
        },
    },
});
