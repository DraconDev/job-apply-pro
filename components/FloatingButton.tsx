import {
    ApplicationState,
    LinkedInHandler,
} from "@/src/sites/linkedin/LinkedInHandler";
import React, { useEffect, useMemo, useState } from "react";

const FloatingButton: React.FC = () => {
    const [state, setState] = useState<ApplicationState>(ApplicationState.IDLE);
    const [jobsApplied, setJobsApplied] = useState(0);
    const [progress, setProgress] = useState(0);
    const linkedInHandler = useMemo(() => new LinkedInHandler(), []);

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
        const stateInterval = setInterval(() => {
            const currentState = linkedInHandler.applicationState;
            if (currentState !== state) {
                console.log("State changed:", {
                    from: state,
                    to: currentState,
                });
                setState(currentState);
            }
        }, 200);

        return () => clearInterval(stateInterval);
    }, [linkedInHandler, state]);

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

            if (state === ApplicationState.RUNNING) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        if (state === ApplicationState.RUNNING) {
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

    const handleSkip = async () => {
        console.log("Skipping current application...");
        await linkedInHandler.skipCurrentApplication();
    };

    const handleStop = async () => {
        console.log("Stopping auto-apply...");
        await linkedInHandler.stop();
        setState(ApplicationState.IDLE); // Immediately update UI state
    };

    const handlePause = () => {
        console.log(
            "Attempting to pause, current state:",
            linkedInHandler.applicationState
        );
        linkedInHandler.pause();
        setState(ApplicationState.PAUSED); // Immediately update local state
        console.log("After pause, state:", linkedInHandler.applicationState);
    };

    const handleUnpause = () => {
        console.log(
            "Attempting to unpause, current state:",
            linkedInHandler.applicationState
        );
        linkedInHandler.unpause();
        setState(ApplicationState.RUNNING); // Immediately update local state
        console.log("After unpause, state:", linkedInHandler.applicationState);
    };

    const buttonConfig = {
        [ApplicationState.IDLE]: {
            text: "Start",
            color: "bg-emerald-600 hover:bg-emerald-700 text-white",
            icon: (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                </>
            ),
            action: () => linkedInHandler.autoApply(),
        },
        [ApplicationState.RUNNING]: {
            text: "Pause",
            color: "bg-yellow-500 hover:bg-yellow-600 text-white",
            icon: (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6"
                    />
                </>
            ),
            action: handlePause,
        },
        [ApplicationState.PAUSED]: {
            text: "Resume",
            color: "bg-blue-600 hover:bg-blue-700 text-white",
            icon: (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                </>
            ),
            action: handleUnpause,
        },
    };

    return (
        <div className="fixed top-1/2 right-4 -translate-y-1/2 w-64 rounded-lg shadow-xl border-2 border-gray-300 p-4 z-[2147483647]">
            <div className="flex relative flex-col space-y-4">
                <div className="flex flex-col p-4 space-y-2 bg-white rounded-lg">
                    <div className="relative">
                        {state === ApplicationState.RUNNING && (
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
                            onClick={buttonConfig[state].action}
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
                        <button
                            className="flex items-center px-4 py-2 w-full font-medium text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
                            onClick={handleSkip}
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
                            <span className="flex-grow text-center">Skip</span>
                        </button>

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
                            <span className="flex-grow text-center">Stop</span>
                        </button>

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
