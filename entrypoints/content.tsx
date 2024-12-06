import { createRoot } from "react-dom/client";
import { defineContentScript } from "wxt/sandbox";
import FloatingButton from "../components/FloatingButton";
import { MessageHandler } from "../src/services/messageHandler";
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
        const messageHandler = new MessageHandler();
        let isAutoApplyEnabled = false;

        // Create React root and render floating button
        const root = createRoot(container);
        
        const handleAutoApplyToggle = async (enabled: boolean) => {
            console.log("Auto-apply toggled:", enabled);
            
            if (enabled) {
                if (linkedInHandler.isValidJobPage()) {
                    const url = window.location.href;
                    if (url.includes("/jobs/search/")) {
                        console.log("On search page, starting auto-apply for search results");
                    } else {
                        console.log("On individual job page, starting auto-apply");
                    }
                    isAutoApplyEnabled = true;
                    await handleAutoApply();
                    return true;
                } else {
                    console.log("Not on a valid LinkedIn jobs page. Please navigate to a LinkedIn job posting or search page.");
                    isAutoApplyEnabled = false;
                    return false;
                }
            } else {
                console.log("Stopping auto-apply");
                isAutoApplyEnabled = false;
                return true;
            }
        };

        root.render(<FloatingButton onToggle={handleAutoApplyToggle} />);
        console.log("Rendered FloatingButton component");

        // Listen for messages from the extension
        chrome.runtime.onMessage.addListener(
            async (message, sender, sendResponse) => {
                console.log("Content script received message:", message);
                
                try {
                    switch (message.type) {
                        case "GET_JOB_DETAILS":
                            console.log("Getting job details");
                            const details = linkedInHandler.getJobDetails();
                            console.log("Job details:", details);
                            sendResponse({ success: true, details });
                            break;
                        default:
                            console.log("Unknown message type:", message.type);
                            sendResponse({ success: false, error: "Unknown message type" });
                    }
                } catch (error: unknown) {
                    console.error("Error handling message:", error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    sendResponse({ success: false, error: errorMessage });
                }
                
                return true; // Keep the message channel open for async response
            }
        );

        async function handleAutoApply() {
            console.log("handleAutoApply called, isAutoApplyEnabled:", isAutoApplyEnabled);
            
            if (!isAutoApplyEnabled) {
                console.log("Auto-apply is disabled, returning early");
                return;
            }

            try {
                console.log("Starting auto-apply process...");
                console.log("Current URL:", window.location.href);

                if (linkedInHandler.isValidJobPage()) {
                    console.log("Valid job page confirmed, proceeding with auto-apply");
                    const success = await linkedInHandler.autoApply();
                    
                    if (success) {
                        console.log("Successfully applied to job");
                    } else {
                        console.log("Failed to apply to job, moving to next");
                    }

                    // Find and click the next button regardless of apply success
                    const nextButton = await linkedInHandler.findNextButton();
                    if (nextButton instanceof HTMLElement) {
                        console.log("Found next button, clicking and waiting 3 seconds");
                        nextButton.click();
                        setTimeout(handleAutoApply, 3000);
                    } else {
                        console.log("No next button found, stopping auto-apply");
                        isAutoApplyEnabled = false;
                    }
                } else {
                    console.log("Not a valid job page, stopping auto-apply");
                    isAutoApplyEnabled = false;
                }
            } catch (error: unknown) {
                console.error("Error in auto-apply process:", error);
                const errorMessage = error instanceof Error ? error.message : String(error);
                if (error instanceof Error) {
                    console.error("Error stack:", error.stack);
                }
                isAutoApplyEnabled = false;
            }
        }
    },
});
