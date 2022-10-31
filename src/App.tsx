import { Container, ThemeProvider, createTheme, Box, responsiveFontSizes, Fade } from "@mui/material";

import ImageCompressor from "./components/ImageCompressor/ImageCompressor";
import Header from "./components/Header";
import Info from "./components/Info";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import ReloadPrompt from "./components/ReloadPrompt";

let theme = createTheme({
    typography: {
        allVariants: {
            fontFamily: "Ubuntu",
            color: "white",
        },
        h1: {
            fontWeight: 300,
        },
        h2: {
            fontSize: "49px",
            fontWeight: 400,
        },
        h3: {
            fontWeight: 400,
            fontSize: "35px",
        },
        h4: {
            fontWeight: 400,
            fontSize: "28px",
        },
    },
});

theme = responsiveFontSizes(theme);

function App() {
    return (
        <div className="App">
            <Fade in={true} timeout={{ enter: 500 }}>
                <div>
                    <ThemeProvider theme={theme}>
                        <Header />
                        <Container>
                            <Fade in={true} timeout={{ enter: 1000 }} appear={true}>
                                <div>
                                    <ImageCompressor />
                                </div>
                            </Fade>
                            <Fade in={true} timeout={{ enter: 1500 }}>
                                <div>
                                    <Box sx={{ marginTop: 5 }}>
                                        <Info />
                                    </Box>
                                    <Box sx={{ marginTop: 10 }}>
                                        <FAQ />
                                    </Box>
                                </div>
                            </Fade>
                        </Container>
                        <Fade in={true} timeout={{ enter: 2000 }}>
                            <div>
                                <Footer />
                            </div>
                        </Fade>
                    </ThemeProvider>
                </div>
            </Fade>
            <ReloadPrompt />
        </div>
    );
}

export default App;
