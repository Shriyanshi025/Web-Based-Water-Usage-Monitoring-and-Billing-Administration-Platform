import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Avatar,
} from "@mui/material";

function TopNavbar() {

    const user = JSON.parse(

        sessionStorage.getItem("user")

    );

    return (

        <AppBar
            position="fixed"
            sx={{
                zIndex: 1201,
                bgcolor: "white",
                color: "black",
            }}
            elevation={1}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: "bold",
                    }}
                >
                    Water Monitoring Dashboard
                </Typography>

                <Box
                    display="flex"
                    alignItems="center"
                    gap={2}
                >

                    <Typography>

                        {user?.fullName}

                    </Typography>

                    <Avatar>

                        {user?.fullName?.charAt(0)}

                    </Avatar>

                </Box>

            </Toolbar>

        </AppBar>

    );

}

export default TopNavbar;