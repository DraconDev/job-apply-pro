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
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const loadJobsApplied = async () => {
            const result = await chrome.storage.sync.get(["jobsApplied"]);
            console.log("Loading jobs applied from storage:", result);
            setJobsApplied(result.jobsApplied || 0);
        };

        loadJobsApplied();

        const listener = (changes: {
            [key: string]: chrome.storage.StorageChange;
        }) => {
            if (changes.jobsApplied) {
                console.log("Jobs applied changed:", changes.jobsApplied);
                setJobsApplied(changes.jobsApplied.newValue || 0);
            }
        };

        chrome.storage.sync.onChanged.addListener(listener);
        return () => chrome.storage.sync.onChanged.removeListener(listener);
    }, []);

    useEffect(() => {
        const messageListener = (
            message: any,
            sender: chrome.runtime.MessageSender
        ) => {
            if (message.type === "PAUSE_STATE_CHANGED") {
                console.log("Received pause state change:", message.isPaused);
                setState(message.isPaused ? "paused" : "running");
            } else if (message.type === "RESET_STATE") {
                console.log("Resetting state to idle");
                setState("idle");
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, []);

    useEffect(() => {
        let animationFrame: number;
        let startTime: number | undefined;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const duration = 1000; // 1 second cycle for faster movement

            // Use sine wave for smooth back and forth motion
            // Math.sin output is -1 to 1, we map it to 0-70 range
            const progress =
                (Math.sin((elapsed * Math.PI) / duration) + 1) * 35;

            setProgress(progress);

            if (state === "running") {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        if (state === "running") {
            startTime = undefined;
            animationFrame = requestAnimationFrame(animate);
        } else {
            setProgress(0);
        }

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [state]);

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

    const handleStop = async () => {
        if (onStop) {
            setState("idle"); // Set state to idle immediately
            await onStop(); // Then handle the cleanup
        }
    };

    const buttonConfig = {
        idle: {
            text: "Start",
            color: "bg-emerald-600 hover:bg-emerald-700 text-white",
            icon: (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
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
                    d="M10 9v6m4-6v6m-7-3a9 9 0 1118 0 9 9 0 01-18 0z"
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
                    <div className="relative">
                        {state === "running" && (
                            <div className="overflow-hidden mb-2 w-full h-1 bg-gray-200 rounded-b-lg">
                                <div
                                    className="h-full bg-blue-600 transition-all duration-100 ease-linear"
                                    style={{
                                        width: "30%",
                                        marginLeft: `${progress}%`,
                                    }}
                                />
                            </div>
                        )}
                        <button
                            className={`w-full flex items-center px-4 py-2 rounded-lg text-white font-medium transition-colors ${buttonConfig[state].color}`}
                            onClick={handleToggle}
                        >
                            <div className="flex-shrink-0 w-6 h-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-full h-full"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    {buttonConfig[state].icon}
                                </svg>
                            </div>
                            <span className="flex-grow text-center">
                                {buttonConfig[state].text}
                            </span>
                        </button>
                    </div>

                    <div className="flex flex-col space-y-2 w-full">
                        {onSkip && (
                            <button
                                className="flex items-center px-4 py-2 w-full font-medium text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
                                onClick={onSkip}
                            >
                                <div className="flex-shrink-0 w-6 h-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full"
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
                                </div>
                                <span className="flex-grow text-center">
                                    Skip
                                </span>
                            </button>
                        )}

                        {onStop && (
                            <button
                                className="flex items-center px-4 py-2 w-full font-medium text-white bg-red-600 rounded-lg transition-colors hover:bg-red-700"
                                onClick={handleStop}
                            >
                                <div className="flex-shrink-0 w-6 h-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-full h-full"
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
                                </div>
                                <span className="flex-grow text-center">
                                    Stop
                                </span>
                            </button>
                        )}

                        <button
                            onClick={() =>
                                window.open(
                                    "https://ko-fi.com/adamdracon",
                                    "_blank"
                                )
                            }
                            className="flex items-center px-4 py-2 w-full font-medium text-white bg-purple-600 rounded-lg transition-colors hover:bg-purple-700"
                        >
                            <div className="flex-shrink-0 w-6 h-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-full h-full"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </div>
                            <span className="flex-grow text-center">
                                Donate
                            </span>
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
