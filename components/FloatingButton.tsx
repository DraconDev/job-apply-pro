import React, { useState, useEffect } from "react";
import ApplicationMenu from "./ApplicationMenu";

interface FloatingButtonProps {
    onToggle: (enabled: boolean) => Promise<boolean>;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onToggle }) => {
    const [state, setState] = useState<"idle" | "running" | "paused">("idle");
    const [jobsApplied, setJobsApplied] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleToggle = async () => {
        try {
            let success = false;
            
            switch (state) {
                case "idle":
                    // Start
                    success = await onToggle(true);
                    if (success) {
                        setState("running");
                        console.log("Started auto-apply, state changed to running");
                    } else {
                        console.log("Failed to start auto-apply");
                    }
                    break;
                case "running":
                    // Pause
                    success = await onToggle(false);
                    if (success) {
                        setState("paused");
                        console.log("Paused auto-apply, state changed to paused");
                    }
                    break;
                case "paused":
                    // Resume
                    success = await onToggle(true);
                    if (success) {
                        setState("running");
                        console.log("Resumed auto-apply, state changed to running");
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
            text: "Start Auto-Apply",
            color: "bg-green-600 hover:bg-green-700",
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
            text: "Click to Pause",
            color: "bg-yellow-600 hover:bg-yellow-700",
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
            text: "Click to Resume",
            color: "bg-blue-600 hover:bg-blue-700",
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
                    {/* Title */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">
                            Job Apply Pro
                        </h2>
                        <div className="mt-2 text-sm text-gray-600">
                            Jobs Applied: {jobsApplied}
                        </div>
                    </div>

                    {/* Main Button */}
                    <div className="flex-grow">
                        <button
                            className={`w-full px-4 py-3 rounded-md transition-colors duration-150 flex items-center justify-center gap-2 text-white ${buttonConfig[state].color}`}
                            onClick={handleToggle}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {buttonConfig[state].icon}
                            </svg>
                            {buttonConfig[state].text}
                        </button>
                    </div>

                    {/* History Button */}
                    <div>
                        <button
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-150 text-gray-700"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            View History
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

            <ApplicationMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </>
    );
};

export default FloatingButton;
