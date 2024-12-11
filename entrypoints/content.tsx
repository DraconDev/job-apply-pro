import { createRoot } from "react-dom/client";
import { defineContentScript } from "wxt/sandbox";
import FloatingButton from "../components/FloatingButton";
import { LinkedInHandler } from "../src/sites/linkedin/LinkedInHandler";
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

        // Initialize handlers
        const linkedInHandler = new LinkedInHandler();

        // Create React root and render floating button
        const root = createRoot(container);

        root.render(<FloatingButton />);
    },
});
