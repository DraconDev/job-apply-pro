import React, { useEffect, useState } from "react";
import ApplicationMenu from "./ApplicationMenu";

interface FloatingButtonProps {
    onToggle: (enabled: boolean) => Promise<boolean>;
    onSkip?: () => Promise<void>;
    onStop?: () => Promise<void>;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
    onToggle,
    onSkip,
    onStop,
}) => {
    const [state, setState] = useState<"idle" | "running" | "paused">("idle");
    const [jobsApplied, setJobsApplied] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Load and watch for changes in jobs applied
    useEffect(() => {
        const loadJobsApplied = async () => {
            const result = await chrome.storage.sync.get(["jobsApplied"]);
            setJobsApplied(result.jobsApplied || 0);
        };

        // Load initial value
        loadJobsApplied();

        // Watch for changes
        const listener = (changes: {
            [key: string]: chrome.storage.StorageChange;
        }) => {
            if (changes.jobsApplied) {
                setJobsApplied(changes.jobsApplied.newValue || 0);
            }
        };

        chrome.storage.sync.onChanged.addListener(listener);
        return () => chrome.storage.sync.onChanged.removeListener(listener);
    }, []);

    const handleToggle = async () => {
        try {
            let success = false;

            switch (state) {
                case "idle":
                    // Start
                    success = await onToggle(true);
                    if (success) {
                        setState("running");
                        console.log(
                            "Started auto-apply, state changed to running"
                        );
                    } else {
                        console.log("Failed to start auto-apply");
                    }
                    break;
                case "running":
                    // Pause
                    success = await onToggle(false);
                    if (success) {
                        setState("paused");
                        console.log(
                            "Paused auto-apply, state changed to paused"
                        );
                    }
                    break;
                case "paused":
                    // Resume
                    success = await onToggle(true);
                    if (success) {
                        setState("running");
                        console.log(
                            "Resumed auto-apply, state changed to running"
                        );
                    }
                    break;
            }
        } catch (error) {
            console.error("Error in handleToggle:", error);
            setState("idle"); // Reset to idle on error
        }
    };

    const buttonConfig = {
        idle: {
            text: "Start",
            color: "bg-emerald-600 hover:bg-emerald-700 text-white",
            icon: (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </>
            ),
        },
        running: {
            text: "Pause",
            color: "bg-yellow-500 hover:bg-yellow-600 text-white",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            ),
        },
        paused: {
            text: "Resume",
            color: "bg-blue-600 hover:bg-blue-700 text-white",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
            ),
        },
    };

    return (
        <>
            <div className="fixed top-1/2 right-4 -translate-y-1/2 w-64 bg-gray-50 rounded-lg shadow-xl border-2 border-gray-300 p-4 z-[2147483647]">
                <div className="flex relative flex-col space-y-4">
                    <div className="flex flex-col space-y-2 p-4 bg-white rounded-lg shadow-lg">
                        <button
                            onClick={handleToggle}
                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${buttonConfig[state].color}`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                {buttonConfig[state].icon}
                            </svg>
                            {buttonConfig[state].text}
                        </button>

                        <div className="w-full flex flex-col space-y-2">
                            <button
                                onClick={async () => {
                                    if (!onSkip || (state !== "running" && state !== "paused")) return;
                                    try {
                                        await onSkip();
                                        console.log(
                                            "Successfully skipped current application"
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to skip application:",
                                            error
                                        );
                                    }
                                }}
                                disabled={state !== "running" && state !== "paused"}
                                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                    state === "running" || state === "paused"
                                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 5l7 7-7 7M5 5l7 7-7 7"
                                    />
                                </svg>
                                Skip
                            </button>

                            <button
                                onClick={async () => {
                                    if (!onStop || (state !== "running" && state !== "paused")) return;
                                    try {
                                        await onStop();
                                        setState("idle");
                                        console.log(
                                            "Successfully stopped auto-apply"
                                        );
                                    } catch (error) {
                                        console.error(
                                            "Failed to stop auto-apply:",
                                            error
                                        );
                                    }
                                }}
                                disabled={state !== "running" && state !== "paused"}
                                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                                    state === "running" || state === "paused"
                                        ? "bg-red-600 hover:bg-red-700 text-white"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Stop
                            </button>
                        </div>

                        <div className="text-sm text-gray-600 w-full text-center">
                            Jobs Applied: {jobsApplied}
                        </div>

                        <button
                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            History
                        </button>
                    </div>

                    {/* Donate button at bottom */}
                    <div className="flex justify-end">
                        <a
                            href="https://ko-fi.com/adamdracon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-1 items-center text-sm text-gray-600 transition-colors hover:text-gray-800"
                        >
                            Support
                            <svg
                                className="w-6 h-6 text-red-500 transition-transform transform scale-125 hover:text-red-600 hover:scale-150"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2147483647]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 flex flex-col space-y-4">
                        <h2 className="text-xl font-bold mb-4">History</h2>
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={() => {
                                    window.open(
                                        chrome.runtime.getURL(
                                            "form-info/index.html"
                                        ),
                                        "_blank"
                                    );
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                            >
                                View Form Info
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ApplicationMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
};

export default FloatingButton;
