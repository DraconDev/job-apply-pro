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
        <button
            onClick={handleClick}
            className={`p-2 text-blue-600 rounded-full transition-colors hover:text-blue-800 hover:bg-blue-50 ${className}`}
            title="Help"
        >
            <svg
                className="w-6 h-6"
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
        </button>
    );
};

export default HelpButton;
