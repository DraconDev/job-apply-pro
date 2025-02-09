import { createRoot } from "react-dom/client";
import { defineContentScript } from "wxt/sandbox";
import FloatingButton from "../components/FloatingButton";
import LinkedInHandler from "@/src/sites/linkedin";
import { pause, unpause } from "@/src/sites/linkedin/state/applicationState";
import { autoApply } from "@/src/sites/linkedin/jobs/autoApply";

import "./content/style.css";

export default defineContentScript({
    matches: ["*://*.linkedin.com/jobs/*"],
    main() {
        console.log("Job Search Assistant content script starting...");
        console.log("Current URL:", window.location.href);

        // Check if container already exists
        let container = document.getElementById("job-search-extension-root");
        if (container) {
            console.log("Container already exists, removing old one");
            container.remove();
        }

        // Create container for the floating button
        container = document.createElement("div");
        container.id = "job-search-extension-root";
        document.body.appendChild(container);
        console.log("Created new container:", container.id);

        // Initialize LinkedIn handler
        if (!LinkedInHandler.isValidJobPage()) {
            console.log("Not on a valid LinkedIn job page");
            return;
        }

        // Create React root and render floating button
        const root = createRoot(container);
        root.render(<FloatingButton />);

        // Listen for messages from the popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log("Received message:", message);

            switch (message.type) {
                case 'START_AUTO_APPLY':
                    console.log("Starting auto apply process...");
                    autoApply().catch(console.error);
                    break;

                case 'TOGGLE_PAUSE':
                    if (message.isPaused) {
                        console.log("Pausing auto apply process...");
                        pause();
                    } else {
                        console.log("Resuming auto apply process...");
                        unpause();
                    }
                    break;

                case 'GET_JOB_DETAILS':
                    console.log("Getting job details...");
                    const details = LinkedInHandler.getJobDetails();
                    sendResponse(details);
                    break;
            }

            // Return true to indicate we'll send a response asynchronously
            return true;
        });
    },
});
