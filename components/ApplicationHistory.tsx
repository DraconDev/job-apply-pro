export default function ApplicationHistory() {
    const openPersonalInfo = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("personal-info.html"),
        });
    };

    const openFormInfo = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("form-info.html") });
    };

    const openApplicationHistory = () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL("application-history.html"),
        });
    };

    return (
        <div className="mt-4 space-y-3">
            {/* Edit Personal Information Button */}
            <button
                onClick={openPersonalInfo}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-md shadow-sm transition-colors duration-150 ease-in-out flex items-center justify-center gap-2"
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
                Edit Personal Information
            </button>

            {/* Edit Form Information Button */}
            <button
                onClick={openFormInfo}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-md shadow-sm transition-colors duration-150 ease-in-out flex items-center justify-center gap-2"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
                Edit Form Information
            </button>

            {/* View Application History Button */}
            <button
                onClick={openApplicationHistory}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 px-4 rounded-md shadow-sm transition-colors duration-150 ease-in-out flex items-center justify-center gap-2"
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                View Application History
            </button>
        </div>
    );
}
