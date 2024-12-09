export default function FilterButton() {
    const openFilterPage = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("filter.html") });
    };

    return (
        <button
            onClick={openFilterPage}
            className="w-full px-4 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm"
        >
            <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
            </svg>
            <span className="text-base">Filter Settings</span>
        </button>
    );
}
