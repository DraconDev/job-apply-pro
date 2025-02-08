import React from "react";

export default function AISettings() {
  const openAISettings = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("aisettings.html") });
  };

  return (
    <button
      onClick={openAISettings}
      className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm"
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
          d="M9 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM2 9h4a4 4 0 00-4 4v2h10v-2a4 4 0 00-4-4H2zm15-3a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM12 15h4a4 4 0 00-4 4v2h10v-2a4 4 0 00-4-4h-6z"
        />
      </svg>
      <span className="text-base">AI Settings</span>
    </button>
  );
}
