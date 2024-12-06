import { useCallback } from "react";
import LinkedInAutoApply from "../../components/LinkedInAutoApply";
import "./App.css";

export default function App() {
    console.log("App rendered"); // Debug log

    const openPersonalInfo = useCallback(() => {
        console.log("Button clicked"); // Debug log
        try {
            chrome.windows.create(
                {
                    url: chrome.runtime.getURL("/personal-info.html"),
                    type: "popup",
                    width: 600,
                    height: 800,
                },
                (window) => {
                    if (chrome.runtime.lastError) {
                        console.error(
                            "Error creating window:",
                            chrome.runtime.lastError
                        );
                    } else {
                        console.log("Window created:", window);
                    }
                }
            );
        } catch (error) {
            console.error("Error in openPersonalInfo:", error);
        }
    }, []);

    return (
        <div className="min-w-[300px] p-4">
            <LinkedInAutoApply />
            <button
                onClick={() => {
                    console.log("Button clicked - inline"); // Debug log
                    openPersonalInfo();
                }}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded"
            >
                Edit Personal Info
            </button>
        </div>
    );
}
