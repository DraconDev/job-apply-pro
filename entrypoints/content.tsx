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
        let autoApplyTimeoutId: number | null = null;

        const clearAutoApplyTimeout = () => {
            if (autoApplyTimeoutId !== null) {
                clearTimeout(autoApplyTimeoutId);
                autoApplyTimeoutId = null;
            }
        };

        // Create React root and render floating button
        const root = createRoot(container);

        // Check initial pause state and set button state accordingly
        if (linkedInHandler.isPaused) {
            chrome.runtime.sendMessage({
                type: "PAUSE_STATE_CHANGED",
                isPaused: true,
            });
        }

        const handleAutoApplyToggle = async (enabled: boolean) => {
            console.log("Auto-apply toggled:", enabled);

            if (enabled) {
                if (linkedInHandler.isValidJobPage()) {
                    const url = window.location.href;
                    console.log(
                        `Starting auto-apply on ${
                            url.includes("/jobs/") ? "search" : "individual job"
                        } page`
                    );

                    // Reset job index when starting new auto-apply session
                    if (url.includes("/jobs/")) {
                        linkedInHandler.resetJobIndex();
                    }

                    isAutoApplyEnabled = true;
                    linkedInHandler.unpause();
                    handleAutoApply().catch((error) => {
                        console.error("Error in auto-apply process:", error);
                        isAutoApplyEnabled = false;
                        linkedInHandler.pause();
                        clearAutoApplyTimeout();
                    });

                    return true;
                } else {
                    console.log(
                        "Not on a valid LinkedIn jobs page. Please navigate to a LinkedIn job posting or search page."
                    );
                    isAutoApplyEnabled = false;
                    linkedInHandler.pause();
                    clearAutoApplyTimeout();
                    return false;
                }
            } else {
                console.log("Pausing auto-apply");
                isAutoApplyEnabled = false;
                linkedInHandler.pause();
                clearAutoApplyTimeout();
                return true;
            }
        };

        const handleSkip = async () => {
            console.log("Skipping current application...");
            await linkedInHandler.skipCurrentApplication();
        };

        const handleStop = async () => {
            console.log("Stopping auto-apply...");
            await linkedInHandler.cancelApplication();
            isAutoApplyEnabled = false;
            linkedInHandler.pause();
            linkedInHandler.isApplying = false;
            linkedInHandler.currentStepIndex = 0;
            clearAutoApplyTimeout();
            // Reset the job index to ensure fresh start next time
            linkedInHandler.resetJobIndex();

            // First toggle off auto-apply
            await handleAutoApplyToggle(false);

            // Then reset the state to idle
            chrome.runtime
                .sendMessage({
                    type: "RESET_STATE",
                })
                .catch((error) => {
                    console.error(
                        "Failed to send state change message:",
                        error
                    );
                });
        };

        const handleTogglePause = () => {
            if (!linkedInHandler) return;
            linkedInHandler.togglePause();
        };

        const handleStartAutoApply = async () => {
            if (!linkedInHandler) return;

            // Start the auto-apply process
            linkedInHandler.unpause();
            const success = await linkedInHandler.autoApply();

            if (!success) {
                console.log("Auto-apply process failed or was stopped");
                linkedInHandler.pause();
            }
        };

        root.render(
            <FloatingButton
                onToggle={handleAutoApplyToggle}
                onSkip={handleSkip}
                onStop={handleStop}
            />
        );
        console.log("Rendered FloatingButton component");

        // Listen for messages from the extension
        chrome.runtime.onMessage.addListener(
            (message, sender, sendResponse) => {
                try {
                    switch (message.type) {
                        case "GET_JOB_DETAILS":
                            if (!linkedInHandler.isValidJobPage()) {
                                sendResponse({
                                    success: false,
                                    error: "Not a valid job page",
                                });
                                break;
                            }

                            const details = linkedInHandler.getJobDetails();
                            console.log("Job details:", details);
                            sendResponse({ success: true, details });
                            break;

                        default:
                            console.log("Unknown message type:", message.type);
                            sendResponse({
                                success: false,
                                error: "Unknown message type",
                            });
                    }
                } catch (error: unknown) {
                    console.error("Error handling message:", error);
                    let errorMessage = "An unknown error occurred";

                    if (error instanceof Error) {
                        errorMessage = error.message;
                    } else if (typeof error === "string") {
                        errorMessage = error;
                    }

                    sendResponse({
                        success: false,
                        error: errorMessage,
                    });
                }

                return true; // Keep the message channel open for async response
            }
        );

        async function handleAutoApply() {
            console.log(
                "handleAutoApply called, isAutoApplyEnabled:",
                isAutoApplyEnabled
            );

            if (!isAutoApplyEnabled || linkedInHandler.isPaused) {
                console.log("Auto-apply is disabled or paused");
                clearAutoApplyTimeout();
                return;
            }

            try {
                console.log("Starting auto-apply process...");
                const success = await linkedInHandler.autoApply();

                if (success) {
                    console.log("Successfully applied to job");
                } else {
                    console.log("Failed to apply to job or job was skipped");
                }

                if (!isAutoApplyEnabled) {
                    console.log(
                        "Auto-apply was disabled during job application, stopping"
                    );
                    linkedInHandler.pause();
                    return;
                }

                // Schedule next job processing if we're still enabled
                if (isAutoApplyEnabled) {
                    clearAutoApplyTimeout();
                    autoApplyTimeoutId = setTimeout(
                        handleAutoApply,
                        3000
                    ) as unknown as number;
                }
            } catch (error: unknown) {
                console.error("Error in auto-apply process:", error);
                const errorMessage =
                    error instanceof Error ? error.message : String(error);
                if (error instanceof Error) {
                    console.error("Error stack:", error.stack);
                }
                isAutoApplyEnabled = false;
                linkedInHandler.pause();
                clearAutoApplyTimeout();
            }
        }
    },
});
