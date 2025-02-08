import React from "react";

interface HelpButtonProps {
    className?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ className = "" }) => {
    const handleClick = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("help.html"),
        });
    };

    return (
        <div className="flex flex-col space-y-3 border-t">
            <button
                onClick={handleClick}
                className="relative w-full px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
            >
                <svg
                    className="absolute w-4 h-4 left-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="flex-grow text-base text-center">Help</span>
            </button>
            <button
                onClick={() => {
                    window.open("https://ko-fi.com/adamdracon", "_blank");
                }}
                className="relative w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
            >
                <svg
                    className="absolute w-4 h-4 left-4"
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
                <span className="flex-grow text-base text-center">
                    <span>Donate</span>

                </span>
            </button>
        </div>
    );
};

export default HelpButton;
