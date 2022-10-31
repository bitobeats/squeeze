import { memo } from "react";

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Stack,
    createTheme,
    Theme,
    ThemeProvider,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

interface FAQItem {
    title: string;
    children: JSX.Element;
}

function FAQItem({ title, children }: FAQItem) {
    return (
        <Accordion elevation={0} sx={{ backgroundColor: "transparent", boxShadow: 0, "&:before": { display: "none" } }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: "white" }} />}>
                <Typography variant="h4">{title}</Typography>
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}

export default memo(function FAQ() {
    return (
        <ThemeProvider
            theme={(theme: Theme) =>
                createTheme({ ...theme, typography: { ...theme.typography, body1: { fontWeight: 300 } } })
            }>
            <Typography variant="h1" fontWeight={500}>
                FAQ
            </Typography>
            <Stack marginTop={2}>
                <FAQItem title="Squeeze?">
                    <Typography>
                        Squeeze is a web app inspired by Squoosh that compresses and optimizes images. It does so on the
                        browser, without requiring a network connection or capturing any data.
                    </Typography>
                </FAQItem>
                <FAQItem title="Why was it made?">
                    <Typography>
                        Squoosh is awesome. It has tons of options for comparing image compression methods/settings, it
                        offers live preview, works fast and reliably and in general has a very nice UX/UI.
                        <br />
                        <br />
                        It doesn’t allow us to process multiple images at once, though. And the multitude of options
                        made it a confusing tool to share with a team. I n our use cases, we realized we were using the
                        same compression settings 99% of the time, only changing the dimensions and the compression
                        quality. That’s why we made Squeeze: Squeeze supports multiple image processing at once. Squeeze
                        has very few settings - it only supports jpeg, and you can only set the compression quality
                        level, the dimensions and the naming of the image files."{" "}
                    </Typography>
                </FAQItem>
                <FAQItem title="How was it made?">
                    <Typography>
                        It’s built on React + TS + Vite.
                        <br />
                        It uses MUI for the UI and the following dependencies:
                    </Typography>
                </FAQItem>
                <FAQItem title="Who made it?">
                    <Typography>
                        This app was made by Carda Creations.
                        <br />
                        We, Carol (designer) and Vitor (programmer), created Squeeze as a useful tool for designers and
                        web developers to get their images ready for the web effortlessly.
                    </Typography>
                </FAQItem>
                <FAQItem title="How does it work?">
                    <Typography>
                        Squeeze uses Squoosh’s codecs to resize and encode images to jpeg, compressing them in the
                        process with MozJPEG.
                        <br />
                        Squeeze does all the processing in the browser. After the process is done, the files are
                        delivered either via zip or individually via Share API.
                    </Typography>
                </FAQItem>
                <FAQItem title="Is it safe?">
                    <Typography>
                        It is.
                        <br />
                        Squeeze doesn’t have a backend server. It’s hosted on GitHub pages and all the processing is
                        done in the browser (it doesn’t even require a network connection!). That means that all your
                        images never leave your browser, staying only in your hands from start to finish.
                        <br />
                        Actually, Squeeze is a web app that can be installed and used completely offline.
                    </Typography>
                </FAQItem>
                <FAQItem title="Is it free?">
                    <Typography>Yes</Typography>
                </FAQItem>
                <FAQItem title="Why is it free?">
                    <Typography>
                        We made Squeeze as a personal project.
                        <br />
                        As I can host it for free on GitHub pages, we decided to leave it as a free and open sourced web
                        app that people can use in a practical way and as studying material.
                    </Typography>
                </FAQItem>
                <FAQItem title="Where can I get help?">
                    <Typography>
                        Go to this GitHub page and open an issue. We’ll try to answer you as soon as we can =]
                    </Typography>
                </FAQItem>
                <FAQItem title="Can I be part of it?">
                    <>
                        <Typography>
                            Of course! Contributions are more than welcomed. Check out the repo at GitHub and share your
                            ideas.
                            <br />
                            <br />
                            Squeeze aims to be:
                        </Typography>

                        <ul style={{ listStyle: "none" }}>
                            <li>
                                <Typography>• Ultra simple to use</Typography>
                            </li>
                            <li>
                                <Typography>• Fast and reliable</Typography>
                            </li>
                            <li>
                                <Typography>• Safe</Typography>
                            </li>
                            <li>
                                <Typography>• "Client-side"</Typography>
                            </li>
                            <li>
                                <Typography>• Offline ready</Typography>
                            </li>
                            <li>
                                <Typography>• Accessible</Typography>
                            </li>
                        </ul>
                    </>
                </FAQItem>
            </Stack>
        </ThemeProvider>
    );
});
