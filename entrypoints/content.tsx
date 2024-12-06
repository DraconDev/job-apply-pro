import { createRoot } from "react-dom/client";
import { defineContentScript } from "wxt/sandbox";
import FloatingButton from "../components/FloatingButton";
import { MessageHandler } from "../src/services/messageHandler";
import "./content/style.css";

export default defineContentScript({
    // matches: ['*://*.linkedin.com/jobs/*'],
    matches: ["*://*/*"],
    main() {
        console.log("Job Search Assistant content script starting...");

        // Check if container already exists
        let container = document.getElementById("job-search-extension-root");
        if (container) {
            console.log("Container already exists, removing old one");
            container.remove();
        }

        // Initialize message handler
        const messageHandler = new MessageHandler();
        chrome.runtime.onMessage.addListener((message) => {
            messageHandler.handleMessage(message);
        });

        // Create container and inject React app
        container = document.createElement("div");
        container.id = "job-search-extension-root";
        document.body.appendChild(container);

        // Create React root and render the component
        const root = createRoot(container);
        root.render(<FloatingButton />);

        console.log("Job Search Assistant content script loaded successfully!");
    },
});
