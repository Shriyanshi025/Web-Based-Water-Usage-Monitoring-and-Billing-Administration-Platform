import { createTheme } from "@mui/material/styles";

const theme = createTheme({

    palette: {

        primary: {
            main: "#1976d2"
        },

        secondary: {
            main: "#26a69a"
        },

        background: {
            default: "#f4f7fc"
        }

    },

    typography: {

        fontFamily: "Poppins, sans-serif",

        h3: {
            fontWeight: 700
        },

        h4: {
            fontWeight: 600
        },

        button: {
            textTransform: "none",
            fontWeight: 600
        }

    }

});

export default theme;