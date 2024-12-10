export default function FormsInfo() {
    const openFormInfo = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("form-info.html") });
    };

    return (
        <div className="space-y-3">
            {/* Edit Form Information Button */}
            <button
                onClick={openFormInfo}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm"
            >
                <svg
                    className="w-4 h-4 mr-2"
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
                <span className="text-base">Edit Form Information</span>
            </button>
        </div>
    );
}
