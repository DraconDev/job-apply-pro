import React, { useEffect, useState } from "react";

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

    useEffect(() => {
        const loadJobsApplied = async () => {
            const result = await chrome.storage.sync.get(["jobsApplied"]);
            setJobsApplied(result.jobsApplied || 0);
        };

        loadJobsApplied();

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
                    success = await onToggle(false);
                    if (success) {
                        setState("paused");
                        console.log(
                            "Paused auto-apply, state changed to paused"
                        );
                    }
                    break;
                case "paused":
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
            setState("idle");
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
        <div className="fixed top-1/2 right-4 -translate-y-1/2 w-64 rounded-lg shadow-xl border-2 border-gray-300 p-4 z-[2147483647]">
            <div className="flex relative flex-col space-y-4">
                <div className="flex flex-col p-4 space-y-2 bg-white rounded-lg">
                    <button
                        onClick={handleToggle}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${buttonConfig[state].color}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2 w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {buttonConfig[state].icon}
                        </svg>
                        {buttonConfig[state].text}
                    </button>

                    <div className="flex flex-col space-y-2 w-full">
                        <button
                            onClick={async () => {
                                if (
                                    !onSkip ||
                                    (state !== "running" && state !== "paused")
                                )
                                    return;
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
                                className="mr-2 w-5 h-5"
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
                                if (
                                    !onStop ||
                                    (state !== "running" && state !== "paused")
                                )
                                    return;
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
                                className="mr-2 w-5 h-5"
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

                        <button
                            onClick={() =>
                                window.open(
                                    "https://ko-fi.com/adamdracon",
                                    "_blank"
                                )
                            }
                            className="flex justify-center items-center px-4 py-2 w-full font-medium text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600"
                        >
                            <svg
                                className="mr-2 w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            Donate
                        </button>
                    </div>

                    <div className="mt-2 w-full text-sm text-center text-gray-600">
                        Jobs Applied: {jobsApplied}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FloatingButton;
