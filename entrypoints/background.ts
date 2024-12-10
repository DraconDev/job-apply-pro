import { defineBackground } from 'wxt/sandbox';

export default defineBackground(() => {
    console.log("Background script initialized", { id: browser.runtime.id });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Background received message:", message);
        
        // Handle different message types
        switch (message.action) {
            case "START_AUTO_APPLY":
            case "STOP_AUTO_APPLY":
            case "GET_JOB_DETAILS":
            case "skipToLastJob":
                // Forward message to active tab
                if (sender.tab?.id) {
                    chrome.tabs.sendMessage(sender.tab.id, message)
                        .catch(error => console.error("Error forwarding message:", error));
                }
                break;
        }

        // Always return true if we're using sendResponse asynchronously
        return true;
    });
});
