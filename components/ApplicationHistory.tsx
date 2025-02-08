export default function ApplicationHistory() {
    const openApplicationHistory = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("application-history.html"),
        });
    };

    return (
        <div className="space-y-3">
            {/* View Application History Button */}
            <button
                onClick={openApplicationHistory}
                className="relative w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span className="flex-grow text-base text-center">View Application History</span>
            </button>
        </div>
    );
}
