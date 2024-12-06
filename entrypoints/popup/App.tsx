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
        <div className="min-w-[300px] bg-slate-50">
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-semibold text-slate-800 mb-4">
                    Job Apply Pro
                </h1>
                <LinkedInAutoApply />
                <button
                    onClick={() => {
                        console.log("Button clicked - inline");
                        openPersonalInfo();
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-md border border-slate-200 shadow-sm transition-colors duration-150 ease-in-out flex items-center justify-center gap-2"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    Edit Personal Info
                </button>
            </div>
        </div>
    );
}
